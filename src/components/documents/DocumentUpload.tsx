
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, X, FileText, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface DocumentUploadProps {
  caseId: string;
  onUploadComplete: () => void;
}

const DocumentUpload = ({ caseId, onUploadComplete }: DocumentUploadProps) => {
  const [files, setFiles] = useState<FileList | null>(null);
  const [documentType, setDocumentType] = useState<string>('');
  const [isConfidential, setIsConfidential] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const documentTypes = [
    'evidence',
    'contract',
    'correspondence',
    'legal_document',
    'invoice',
    'receipt',
    'witness_statement',
    'expert_report',
    'other'
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(event.target.files);
  };

  const handleUpload = async () => {
    if (!files || files.length === 0 || !documentType || !user) {
      toast({
        title: "Missing Information",
        description: "Please select files and document type.",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${caseId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

        // Upload file to storage
        const { error: uploadError } = await supabase.storage
          .from('case-documents')
          .upload(fileName, file);

        if (uploadError) {
          throw uploadError;
        }

        // Create document record
        const { error: dbError } = await supabase
          .from('case_documents')
          .insert({
            case_id: caseId,
            file_name: file.name,
            file_path: fileName,
            file_type: file.type,
            file_size: file.size,
            document_type: documentType,
            is_confidential: isConfidential,
            uploaded_by: user.id
          });

        if (dbError) {
          throw dbError;
        }
      }

      toast({
        title: "Upload Successful",
        description: `${files.length} document(s) uploaded successfully.`
      });

      setFiles(null);
      setDocumentType('');
      setIsConfidential(false);
      onUploadComplete();
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload documents. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (index: number) => {
    if (files) {
      const dt = new DataTransfer();
      for (let i = 0; i < files.length; i++) {
        if (i !== index) {
          dt.items.add(files[i]);
        }
      }
      setFiles(dt.files);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Upload className="h-5 w-5 mr-2" />
          Upload Documents
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="file-upload">Select Files</Label>
          <Input
            id="file-upload"
            type="file"
            multiple
            onChange={handleFileSelect}
            className="mt-1"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
          />
          <p className="text-sm text-gray-500 mt-1">
            Supported formats: PDF, DOC, DOCX, JPG, PNG, TXT
          </p>
        </div>

        {files && files.length > 0 && (
          <div className="space-y-2">
            <Label>Selected Files:</Label>
            {Array.from(files).map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  <span className="text-sm">{file.name}</span>
                  <span className="text-xs text-gray-500 ml-2">
                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <div>
          <Label>Document Type</Label>
          <Select value={documentType} onValueChange={setDocumentType}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select document type" />
            </SelectTrigger>
            <SelectContent>
              {documentTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="confidential"
            checked={isConfidential}
            onChange={(e) => setIsConfidential(e.target.checked)}
            className="rounded"
          />
          <Label htmlFor="confidential" className="text-sm">
            Mark as confidential (restricted access)
          </Label>
        </div>

        <Button
          onClick={handleUpload}
          disabled={!files || files.length === 0 || !documentType || uploading}
          className="w-full"
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload Documents
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default DocumentUpload;
