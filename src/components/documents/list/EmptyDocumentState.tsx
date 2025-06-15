
import { FileText } from 'lucide-react';

const EmptyDocumentState = () => {
  return (
    <div className="text-center py-8">
      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Documents Yet</h3>
      <p className="text-gray-600">Upload documents using the "Upload New" tab</p>
    </div>
  );
};

export default EmptyDocumentState;
