
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileText } from 'lucide-react';

interface DocumentListHeaderProps {
  documentCount: number;
}

const DocumentListHeader = ({ documentCount }: DocumentListHeaderProps) => {
  return (
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <FileText className="h-5 w-5" />
        Case Documents
      </CardTitle>
      <CardDescription>
        {documentCount} document{documentCount !== 1 ? 's' : ''} uploaded
      </CardDescription>
    </CardHeader>
  );
};

export default DocumentListHeader;
