
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Upload, FileText, AlertCircle, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

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

  const allowedFileTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/gif',
    'text/plain'
  ];

  const maxFileSize = 10 * 1024 * 1024; // 10MB

  const documentTypes = [
    { value: 'evidence', label: 'Evidence' },
    { value: 'contract', label: 'Contract' },
    { value: 'correspondence', label: 'Correspondence' },
    { value: 'receipt', label: 'Receipt/Invoice' },
    { value: 'legal_notice', label: 'Legal Notice' },
    { value: 'statement', label: 'Statement' },
    { value: 'agreement', label: 'Agreement' },
    { value: 'report', label: 'Report' },
    { value: 'other', label: 'Other' }
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!allowedFileTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload PDF, Word documents, images, or text files only.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size
    if (file.size > maxFileSize) {
      toast({
        title: "File Too Large",
        description: "Please upload files smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    console.log('Selected file:', file.name, file.type, file.size);
  };

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
      // Create unique filename with timestamp
      const timestamp = new Date().getTime();
      const fileExtension = selectedFile.name.split('.').pop();
      const fileName = `${caseId}/${timestamp}_${selectedFile.name}`;

      console.log('Uploading file:', fileName);

      // Upload file to Supabase storage with metadata
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('case-documents')
        .upload(fileName, selectedFile, {
          cacheControl: '3600',
          upsert: false,
          metadata: {
            caseId: caseId,
            documentType: documentType,
            uploadedBy: user.id,
            isConfidential: isConfidential.toString()
          }
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw uploadError;
      }

      console.log('File uploaded to storage:', uploadData);

      // Insert document record in database
      const { error: dbError } = await supabase
        .from('case_documents')
        .insert({
          case_id: caseId,
          file_name: selectedFile.name,
          file_path: fileName,
          file_type: selectedFile.type,
          file_size: selectedFile.size,
          document_type: documentType,
          uploaded_by: user.id,
          is_confidential: isConfidential,
          // Store description in a future metadata column if needed
        });

      if (dbError) {
        console.error('Database insert error:', dbError);
        // If database insert fails, cleanup the uploaded file
        await supabase.storage.from('case-documents').remove([fileName]);
        throw dbError;
      }

      console.log('Document record created in database');

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
        <div>
          <Label htmlFor="file-upload">Select File</Label>
          <Input
            id="file-upload"
            type="file"
            onChange={handleFileSelect}
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt"
            className="mt-1"
          />
          {selectedFile && (
            <div className="mt-2 p-2 bg-gray-50 rounded-md">
              <div className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4" />
                <span>{selectedFile.name}</span>
                <span className="text-gray-500">({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
              </div>
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="document-type">Document Type</Label>
          <Select value={documentType} onValueChange={setDocumentType}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select document type" />
            </SelectTrigger>
            <SelectContent>
              {documentTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="confidential" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Mark as Confidential
            </Label>
            <p className="text-sm text-gray-600">
              Restrict access to case parties and mediator only
            </p>
          </div>
          <Switch
            id="confidential"
            checked={isConfidential}
            onCheckedChange={setIsConfidential}
          />
        </div>

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
