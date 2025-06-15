
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText } from 'lucide-react';
import { validateFile, formatFileSize } from './FileValidator';
import { useToast } from '@/hooks/use-toast';

interface FileInputProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
}

const FileInput = ({ onFileSelect, selectedFile }: FileInputProps) => {
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validation = validateFile(file);
    
    if (!validation.isValid) {
      toast({
        title: "Invalid File",
        description: validation.error,
        variant: "destructive",
      });
      return;
    }

    onFileSelect(file);
    console.log('Selected file:', file.name, file.type, file.size);
  };

  return (
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
            <span className="text-gray-500">({formatFileSize(selectedFile.size)})</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileInput;
