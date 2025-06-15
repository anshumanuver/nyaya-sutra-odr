
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

export const useDocumentOperations = () => {
  const { toast } = useToast();

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

  const deleteDocument = async (documentItem: CaseDocument, userId: string, onSuccess: () => void) => {
    if (documentItem.uploaded_by !== userId) {
      toast({
        title: "Permission Denied",
        description: "You can only delete documents you uploaded.",
        variant: "destructive",
      });
      return;
    }

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

      onSuccess();
    } catch (error: any) {
      console.error('Error deleting document:', error);
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete document.",
        variant: "destructive",
      });
    }
  };

  return { downloadDocument, deleteDocument };
};
