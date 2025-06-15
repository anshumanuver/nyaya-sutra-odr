
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Shield, Users, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DocumentAccessControlProps {
  document: {
    id: string;
    file_name: string;
    is_confidential: boolean;
    document_type: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const DocumentAccessControl = ({ document, isOpen, onClose, onUpdate }: DocumentAccessControlProps) => {
  const [isConfidential, setIsConfidential] = useState(document?.is_confidential || false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const handleUpdateAccess = async () => {
    if (!document) return;

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('case_documents')
        .update({ is_confidential: isConfidential })
        .eq('id', document.id);

      if (error) throw error;

      toast({
        title: "Access Updated",
        description: `Document access level has been updated.`,
      });

      onUpdate();
      onClose();
    } catch (error: any) {
      console.error('Error updating document access:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update document access level.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Document Access Control
          </DialogTitle>
        </DialogHeader>
        
        {document && (
          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">{document.file_name}</h4>
              <Badge variant="outline" className="capitalize">
                {document.document_type.replace('_', ' ')}
              </Badge>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="confidential" className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Confidential Document
                  </Label>
                  <p className="text-sm text-gray-600">
                    Only case parties and assigned mediator can access
                  </p>
                </div>
                <Switch
                  id="confidential"
                  checked={isConfidential}
                  onCheckedChange={setIsConfidential}
                />
              </div>

              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 text-blue-800 text-sm font-medium mb-1">
                  <Users className="h-4 w-4" />
                  Access Level
                </div>
                <p className="text-blue-700 text-sm">
                  {isConfidential 
                    ? "Restricted to case parties and mediator only"
                    : "Accessible to all case participants"
                  }
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={handleUpdateAccess}
                disabled={isUpdating || isConfidential === document.is_confidential}
                className="flex-1"
              >
                {isUpdating ? 'Updating...' : 'Update Access'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DocumentAccessControl;
