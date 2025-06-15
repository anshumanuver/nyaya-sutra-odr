
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Eye, 
  Download, 
  X, 
  FileText, 
  ImageIcon, 
  FileIcon 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DocumentViewerProps {
  document: {
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
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

const DocumentViewer = ({ document: documentData, isOpen, onClose }: DocumentViewerProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const handleViewDocument = async () => {
    if (!documentData) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.storage
        .from('case-documents')
        .createSignedUrl(documentData.file_path, 3600); // 1 hour expiry

      if (error) throw error;

      setFileUrl(data.signedUrl);
    } catch (error: any) {
      console.error('Error creating signed URL:', error);
      toast({
        title: "View Failed",
        description: "Failed to load document for viewing.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadDocument = async () => {
    if (!documentData) return;

    try {
      const { data, error } = await supabase.storage
        .from('case-documents')
        .download(documentData.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = documentData.file_name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      toast({
        title: "Download Started",
        description: `Downloading ${documentData.file_name}`,
      });
    } catch (error: any) {
      console.error('Error downloading document:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download document.",
        variant: "destructive",
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <ImageIcon className="h-8 w-8 text-blue-600" />;
    } else if (fileType.includes('pdf')) {
      return <FileText className="h-8 w-8 text-red-600" />;
    } else {
      return <FileIcon className="h-8 w-8 text-gray-600" />;
    }
  };

  const canPreview = documentData?.file_type.startsWith('image/') || documentData?.file_type.includes('pdf');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {documentData && getFileIcon(documentData.file_type)}
            {documentData?.file_name}
          </DialogTitle>
        </DialogHeader>
        
        {documentData && (
          <div className="space-y-4">
            {/* Document Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Type:</span>
                  <Badge variant="outline" className="ml-2 capitalize">
                    {documentData.document_type.replace('_', ' ')}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium">Size:</span>
                  <span className="ml-2">{formatFileSize(documentData.file_size)}</span>
                </div>
                <div>
                  <span className="font-medium">Uploaded by:</span>
                  <span className="ml-2">{documentData.uploader_name}</span>
                </div>
                <div>
                  <span className="font-medium">Date:</span>
                  <span className="ml-2">
                    {new Date(documentData.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {canPreview && (
                <Button 
                  onClick={handleViewDocument}
                  disabled={isLoading}
                  variant="outline"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {isLoading ? 'Loading...' : 'View'}
                </Button>
              )}
              <Button onClick={downloadDocument}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>

            {/* Document Preview */}
            {fileUrl && (
              <div className="border rounded-lg p-4">
                {documentData.file_type.startsWith('image/') ? (
                  <img 
                    src={fileUrl} 
                    alt={documentData.file_name}
                    className="max-w-full h-auto rounded"
                  />
                ) : documentData.file_type.includes('pdf') ? (
                  <iframe
                    src={fileUrl}
                    className="w-full h-96 border rounded"
                    title={documentData.file_name}
                  />
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Preview not available for this file type
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DocumentViewer;
