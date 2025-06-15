
import { Button } from '@/components/ui/button';
import { Eye, Download, Settings, Trash2 } from 'lucide-react';

interface DocumentActionsProps {
  onView: () => void;
  onDownload: () => void;
  onSettings?: () => void;
  onDelete?: () => void;
  isDeleting: boolean;
  canModify: boolean;
}

const DocumentActions = ({ 
  onView, 
  onDownload, 
  onSettings, 
  onDelete, 
  isDeleting, 
  canModify 
}: DocumentActionsProps) => {
  return (
    <div className="flex items-center gap-2 ml-4">
      <Button
        variant="outline"
        size="sm"
        onClick={onView}
      >
        <Eye className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onDownload}
      >
        <Download className="h-4 w-4" />
      </Button>
      {canModify && onSettings && (
        <Button
          variant="outline"
          size="sm"
          onClick={onSettings}
        >
          <Settings className="h-4 w-4" />
        </Button>
      )}
      {canModify && onDelete && (
        <Button
          variant="outline"
          size="sm"
          onClick={onDelete}
          disabled={isDeleting}
          className="text-red-600 hover:text-red-700"
        >
          {isDeleting ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </Button>
      )}
    </div>
  );
};

export default DocumentActions;
