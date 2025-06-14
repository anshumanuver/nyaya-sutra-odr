
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Download, 
  Eye, 
  Trash2, 
  Lock, 
  User,
  Calendar,
  HardDrive
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Document {
  id: string;
  file_name: string;
  file_path: string;
  file_type: string | null;
  file_size: number | null;
  document_type: string;
  is_confidential: boolean | null;
  uploaded_by: string;
  created_at: string;
  uploader_name?: string;
}

interface DocumentListProps {
  caseId: string;
  refreshTrigger?: number;
}

const DocumentList = ({ caseId, refreshTrigger }: DocumentListProps) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: documents = [], isLoading, refetch } = useQuery({
    queryKey: ['case-documents', caseId, refreshTrigger],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('case_documents')
        .select(`
          *,
          profiles!case_documents_uploaded_by_fkey(first_name, last_name)
        `)
        .eq('case_id', caseId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching documents:', error);
        throw error;
      }

      return data.map(doc => ({
        ...doc,
        uploader_name: doc.profiles 
          ? `${doc.profiles.first_name} ${doc.profiles.last_name}`.trim()
          : 'Unknown User'
      })) as Document[];
    },
    enabled: !!caseId,
  });

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown';
    const mb = bytes / 1024 / 1024;
    return `${mb.toFixed(2)} MB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDownload = async (document: Document) => {
    try {
      const { data, error } = await supabase.storage
        .from('case-documents')
        .download(document.file_path);

      if (error) {
        throw error;
      }

      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = document.file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Download Started",
        description: `Downloading ${document.file_name}`
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download document. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (document: Document) => {
    if (!user || document.uploaded_by !== user.id) {
      toast({
        title: "Unauthorized",
        description: "You can only delete documents you uploaded.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('case-documents')
        .remove([document.file_path]);

      if (storageError) {
        throw storageError;
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('case_documents')
        .delete()
        .eq('id', document.id);

      if (dbError) {
        throw dbError;
      }

      toast({
        title: "Document Deleted",
        description: `${document.file_name} has been deleted successfully.`
      });

      refetch();
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete document. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getDocumentTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      evidence: 'bg-blue-100 text-blue-800',
      contract: 'bg-green-100 text-green-800',
      correspondence: 'bg-yellow-100 text-yellow-800',
      legal_document: 'bg-purple-100 text-purple-800',
      invoice: 'bg-orange-100 text-orange-800',
      receipt: 'bg-pink-100 text-pink-800',
      witness_statement: 'bg-indigo-100 text-indigo-800',
      expert_report: 'bg-teal-100 text-teal-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[type] || colors.other;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading documents...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          Case Documents ({documents.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No documents uploaded yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((document) => (
              <div key={document.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{document.file_name}</span>
                      {document.is_confidential && (
                        <Lock className="h-4 w-4 text-red-500" title="Confidential" />
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <Badge className={getDocumentTypeColor(document.document_type)}>
                        {document.document_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <HardDrive className="h-3 w-3" />
                        {formatFileSize(document.file_size)}
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {document.uploader_name}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(document.created_at)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(document)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    {user && document.uploaded_by === user.id && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(document)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentList;
