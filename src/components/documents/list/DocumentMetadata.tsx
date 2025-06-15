
import { Badge } from '@/components/ui/badge';
import { User, Calendar } from 'lucide-react';

interface DocumentMetadataProps {
  documentType: string;
  uploaderName?: string;
  createdAt: string;
  fileSize: number;
}

const DocumentMetadata = ({ documentType, uploaderName, createdAt, fileSize }: DocumentMetadataProps) => {
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

  return (
    <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
      <Badge variant="outline" className="capitalize">
        {documentType.replace('_', ' ')}
      </Badge>
      <span className="flex items-center gap-1">
        <User className="h-3 w-3" />
        {uploaderName}
      </span>
      <span className="flex items-center gap-1">
        <Calendar className="h-3 w-3" />
        {formatDate(createdAt)}
      </span>
      <span>{formatFileSize(fileSize)}</span>
    </div>
  );
};

export default DocumentMetadata;
