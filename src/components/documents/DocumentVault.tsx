
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DocumentUpload from './DocumentUpload';
import DocumentList from './DocumentList';

interface DocumentVaultProps {
  caseId: string;
}

const DocumentVault = ({ caseId }: DocumentVaultProps) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUploadComplete = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="documents" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="documents">All Documents</TabsTrigger>
          <TabsTrigger value="upload">Upload New</TabsTrigger>
        </TabsList>
        
        <TabsContent value="documents" className="space-y-4">
          <DocumentList 
            caseId={caseId} 
            refreshTrigger={refreshTrigger}
          />
        </TabsContent>
        
        <TabsContent value="upload" className="space-y-4">
          <DocumentUpload 
            caseId={caseId}
            onUploadComplete={handleUploadComplete}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DocumentVault;
