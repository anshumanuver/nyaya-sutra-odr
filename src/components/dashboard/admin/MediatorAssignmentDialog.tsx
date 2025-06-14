
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface MediatorAssignmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCase: any;
  mediators: any[];
}

const MediatorAssignmentDialog = ({ isOpen, onClose, selectedCase, mediators }: MediatorAssignmentDialogProps) => {
  const [selectedMediatorId, setSelectedMediatorId] = useState<string>('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const assignMediatorMutation = useMutation({
    mutationFn: async ({ caseId, mediatorId }: { caseId: string, mediatorId: string }) => {
      const { error } = await supabase
        .from('cases')
        .update({ 
          mediator_id: mediatorId,
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', caseId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Mediator Assigned",
        description: "The mediator has been successfully assigned to the case.",
      });
      queryClient.invalidateQueries({ queryKey: ['unassigned-cases'] });
      setSelectedMediatorId('');
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Assignment Failed",
        description: "Failed to assign mediator. Please try again.",
        variant: "destructive"
      });
      console.error('Error assigning mediator:', error);
    },
  });

  const handleAssignMediator = () => {
    if (selectedCase && selectedMediatorId) {
      assignMediatorMutation.mutate({
        caseId: selectedCase.id,
        mediatorId: selectedMediatorId
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Mediator to Case</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold">{selectedCase?.title}</h4>
            <p className="text-sm text-gray-600">Case ID: {selectedCase?.case_number}</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Select Mediator</label>
            <Select value={selectedMediatorId} onValueChange={setSelectedMediatorId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a mediator" />
              </SelectTrigger>
              <SelectContent>
                {mediators.map((mediator) => (
                  <SelectItem key={mediator.id} value={mediator.id}>
                    {mediator.first_name} {mediator.last_name} ({mediator.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2 pt-4">
            <Button 
              onClick={handleAssignMediator}
              disabled={!selectedMediatorId || assignMediatorMutation.isPending}
              className="flex-1"
            >
              {assignMediatorMutation.isPending ? 'Assigning...' : 'Assign Mediator'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MediatorAssignmentDialog;
