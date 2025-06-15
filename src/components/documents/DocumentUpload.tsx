
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import FileInput from './upload/FileInput';
import DocumentTypeSelect from './upload/DocumentTypeSelect';
import ConfidentialityToggle from './upload/ConfidentialityToggle';
import { uploadDocument } from './upload/UploadService';

interface DocumentUploadProps {
  caseId: string;
  onUploadComplete: () => void;
}

const DocumentUpload = ({ caseId, onUploadComplete }: DocumentUploadProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState('');
  const [description, setDescription] = useState('');
  const [isConfidential, setIsConfidential] = useState(false);

  const handleUpload = async () => {
    if (!selectedFile || !documentType || !user) {
      toast({
        title: "Missing Information",
        description: "Please select a file and document type.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      await uploadDocument({
        file: selectedFile,
        caseId,
        documentType,
        isConfidential,
        userId: user.id
      });

      toast({
        title: "Document Uploaded",
        description: `${selectedFile.name} has been uploaded successfully.`,
      });

      // Reset form
      setSelectedFile(null);
      setDocumentType('');
      setDescription('');
      setIsConfidential(false);
      
      // Clear file input
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      onUploadComplete();
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Document
        </CardTitle>
        <CardDescription>
          Upload supporting documents for this case. Maximum file size: 10MB.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FileInput 
          onFileSelect={setSelectedFile}
          selectedFile={selectedFile}
        />

        <DocumentTypeSelect 
          value={documentType}
          onChange={setDocumentType}
        />

        <ConfidentialityToggle 
          isConfidential={isConfidential}
          onChange={setIsConfidential}
        />

        <div>
          <Label htmlFor="description">Description (Optional)</Label>
          <Textarea
            id="description"
            placeholder="Brief description of the document"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1"
            rows={3}
          />
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
          <div className="flex items-center gap-2 text-yellow-800 text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>Supported formats: PDF, Word documents, images (JPG, PNG, GIF), and text files</span>
          </div>
        </div>

        <Button 
          onClick={handleUpload}
          disabled={!selectedFile || !documentType || isUploading}
          className="w-full"
        >
          {isUploading ? 'Uploading...' : 'Upload Document'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default DocumentUpload;
