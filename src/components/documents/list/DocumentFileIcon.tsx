
import { ImageIcon, FileTextIcon, FileIcon } from 'lucide-react';

interface DocumentFileIconProps {
  fileType: string;
}

const DocumentFileIcon = ({ fileType }: DocumentFileIconProps) => {
  if (fileType.startsWith('image/')) {
    return <ImageIcon className="h-5 w-5 text-blue-600" />;
  } else if (fileType.includes('pdf')) {
    return <FileTextIcon className="h-5 w-5 text-red-600" />;
  } else {
    return <FileIcon className="h-5 w-5 text-gray-600" />;
  }
};

export default DocumentFileIcon;
