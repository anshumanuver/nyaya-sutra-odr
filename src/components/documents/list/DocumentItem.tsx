
import { Badge } from '@/components/ui/badge';
import { Shield } from 'lucide-react';
import DocumentFileIcon from './DocumentFileIcon';
import DocumentMetadata from './DocumentMetadata';
import DocumentActions from './DocumentActions';

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

interface DocumentItemProps {
  document: CaseDocument;
  onView: () => void;
  onDownload: () => void;
  onSettings?: () => void;
  onDelete?: () => void;
  isDeleting: boolean;
  canModify: boolean;
}

const DocumentItem = ({
  document,
  onView,
  onDownload,
  onSettings,
  onDelete,
  isDeleting,
  canModify
}: DocumentItemProps) => {
  return (
    <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <DocumentFileIcon fileType={document.file_type} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-gray-900 truncate">{document.file_name}</h4>
              {document.is_confidential && (
                <Badge variant="secondary" className="text-xs">
                  <Shield className="h-3 w-3 mr-1" />
                  Confidential
                </Badge>
              )}
            </div>
            <DocumentMetadata
              documentType={document.document_type}
              uploaderName={document.uploader_name}
              createdAt={document.created_at}
              fileSize={document.file_size}
            />
          </div>
        </div>
        <DocumentActions
          onView={onView}
          onDownload={onDownload}
          onSettings={onSettings}
          onDelete={onDelete}
          isDeleting={isDeleting}
          canModify={canModify}
        />
      </div>
    </div>
  );
};

export default DocumentItem;
