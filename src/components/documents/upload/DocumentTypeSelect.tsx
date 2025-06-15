
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { documentTypes } from './DocumentTypeData';

interface DocumentTypeSelectProps {
  value: string;
  onChange: (value: string) => void;
}

const DocumentTypeSelect = ({ value, onChange }: DocumentTypeSelectProps) => {
  return (
    <div>
      <Label htmlFor="document-type">Document Type</Label>
      <Select value={value} onValueChange={onChange}>
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
  );
};

export default DocumentTypeSelect;
