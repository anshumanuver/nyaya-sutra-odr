
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Shield } from 'lucide-react';

interface ConfidentialityToggleProps {
  isConfidential: boolean;
  onChange: (checked: boolean) => void;
}

const ConfidentialityToggle = ({ isConfidential, onChange }: ConfidentialityToggleProps) => {
  return (
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
        onCheckedChange={onChange}
      />
    </div>
  );
};

export default ConfidentialityToggle;
