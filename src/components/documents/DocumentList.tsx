
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import DocumentViewer from './DocumentViewer';
import DocumentAccessControl from './DocumentAccessControl';
import DocumentListHeader from './list/DocumentListHeader';
import EmptyDocumentState from './list/EmptyDocumentState';
import DocumentItem from './list/DocumentItem';
import LoadingState from './list/LoadingState';
import { useDocumentOperations } from './list/DocumentOperations';

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
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [viewerDocument, setViewerDocument] = useState<CaseDocument | null>(null);
  const [accessControlDocument, setAccessControlDocument] = useState<CaseDocument | null>(null);
  const { downloadDocument, deleteDocument } = useDocumentOperations();

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

  const handleDeleteDocument = async (documentItem: CaseDocument) => {
    if (!user) return;
    
    setDeletingId(documentItem.id);
    await deleteDocument(documentItem, user.id, () => {
      refetch();
      setDeletingId(null);
    });
    setDeletingId(null);
  };

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <>
      <Card>
        <DocumentListHeader documentCount={documents.length} />
        <CardContent>
          {documents.length === 0 ? (
            <EmptyDocumentState />
          ) : (
            <div className="space-y-4">
              {documents.map((documentItem) => (
                <DocumentItem
                  key={documentItem.id}
                  document={documentItem}
                  onView={() => setViewerDocument(documentItem)}
                  onDownload={() => downloadDocument(documentItem)}
                  onSettings={user && documentItem.uploaded_by === user.id ? () => setAccessControlDocument(documentItem) : undefined}
                  onDelete={user && documentItem.uploaded_by === user.id ? () => handleDeleteDocument(documentItem) : undefined}
                  isDeleting={deletingId === documentItem.id}
                  canModify={user ? documentItem.uploaded_by === user.id : false}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <DocumentViewer 
        document={viewerDocument}
        isOpen={!!viewerDocument}
        onClose={() => setViewerDocument(null)}
      />

      <DocumentAccessControl 
        document={accessControlDocument}
        isOpen={!!accessControlDocument}
        onClose={() => setAccessControlDocument(null)}
        onUpdate={() => {
          refetch();
          setAccessControlDocument(null);
        }}
      />
    </>
  );
};

export default DocumentList;
