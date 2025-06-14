import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Download, 
  Eye, 
  Trash2, 
  Calendar,
  User,
  FileIcon,
  ImageIcon,
  FileTextIcon
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface DocumentListProps {
  caseId: string;
  refreshTrigger: number;
}

interface CaseDocument {
  id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  document_type: string;
  uploaded_by: string;
  is_confidential: boolean;
  created_at: string;
  uploader_name?: string;
}

const DocumentList = ({ caseId, refreshTrigger }: DocumentListProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: documents = [], isLoading, refetch } = useQuery({
    queryKey: ['case-documents', caseId, refreshTrigger],
    queryFn: async () => {
      console.log('Fetching documents for case:', caseId);

      // First get the documents
      const { data: documentsData, error: documentsError } = await supabase
        .from('case_documents')
        .select('*')
        .eq('case_id', caseId)
        .order('created_at', { ascending: false });

      if (documentsError) {
        console.error('Error fetching documents:', documentsError);
        throw documentsError;
      }

      console.log('Documents fetched:', documentsData);

      if (!documentsData || documentsData.length === 0) {
        return [];
      }

      // Get uploader profiles
      const uploaderIds = [...new Set(documentsData.map(d => d.uploaded_by))];
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', uploaderIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      }

      // Combine documents with uploader information
      return documentsData.map(doc => ({
        ...doc,
        uploader_name: profilesData?.find(p => p.id === doc.uploaded_by)
          ? `${profilesData.find(p => p.id === doc.uploaded_by)?.first_name} ${profilesData.find(p => p.id === doc.uploaded_by)?.last_name}`
          : 'Unknown User'
      }));
    },
    enabled: !!caseId,
  });

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <ImageIcon className="h-5 w-5 text-blue-600" />;
    } else if (fileType.includes('pdf')) {
      return <FileTextIcon className="h-5 w-5 text-red-600" />;
    } else {
      return <FileIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

  const downloadDocument = async (documentItem: CaseDocument) => {
    try {
      console.log('Downloading document:', documentItem.file_path);

      const { data, error } = await supabase.storage
        .from('case-documents')
        .download(documentItem.file_path);

      if (error) {
        console.error('Download error:', error);
        throw error;
      }

      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = documentItem.file_name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      toast({
        title: "Download Started",
        description: `Downloading ${documentItem.file_name}`,
      });
    } catch (error: any) {
      console.error('Error downloading document:', error);
      toast({
        title: "Download Failed",
        description: error.message || "Failed to download document.",
        variant: "destructive",
      });
    }
  };

  const deleteDocument = async (documentItem: CaseDocument) => {
    if (!user || documentItem.uploaded_by !== user.id) {
      toast({
        title: "Permission Denied",
        description: "You can only delete documents you uploaded.",
        variant: "destructive",
      });
      return;
    }

    setDeletingId(documentItem.id);

    try {
      console.log('Deleting document:', documentItem.id);

      // Delete from database first
      const { error: dbError } = await supabase
        .from('case_documents')
        .delete()
        .eq('id', documentItem.id);

      if (dbError) {
        console.error('Database delete error:', dbError);
        throw dbError;
      }

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('case-documents')
        .remove([documentItem.file_path]);

      if (storageError) {
        console.error('Storage delete error:', storageError);
        // Don't throw here as the db record is already deleted
      }

      toast({
        title: "Document Deleted",
        description: `${documentItem.file_name} has been deleted.`,
      });

      refetch();
    } catch (error: any) {
      console.error('Error deleting document:', error);
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete document.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading documents...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Case Documents
        </CardTitle>
        <CardDescription>
          {documents.length} document{documents.length !== 1 ? 's' : ''} uploaded
        </CardDescription>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Documents Yet</h3>
            <p className="text-gray-600">Upload documents using the "Upload New" tab</p>
          </div>
        ) : (
          <div className="space-y-4">
            {documents.map((documentItem) => (
              <div key={documentItem.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {getFileIcon(documentItem.file_type)}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 truncate">{documentItem.file_name}</h4>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                        <Badge variant="outline" className="capitalize">
                          {documentItem.document_type.replace('_', ' ')}
                        </Badge>
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {documentItem.uploader_name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(documentItem.created_at)}
                        </span>
                        <span>{formatFileSize(documentItem.file_size)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadDocument(documentItem)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    {user && documentItem.uploaded_by === user.id && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteDocument(documentItem)}
                        disabled={deletingId === documentItem.id}
                        className="text-red-600 hover:text-red-700"
                      >
                        {deletingId === documentItem.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
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
