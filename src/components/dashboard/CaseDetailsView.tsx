
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, DollarSign, User, FileText, Clock, Edit, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface CaseDetailsViewProps {
  caseId: string;
  onClose: () => void;
}

const CaseDetailsView = ({ caseId, onClose }: CaseDetailsViewProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');

  // Fetch case details with participant information
  const { data: caseDetails, isLoading } = useQuery({
    queryKey: ['case-details', caseId],
    queryFn: async () => {
      const { data: caseData, error: caseError } = await supabase
        .from('cases')
        .select('*')
        .eq('id', caseId)
        .single();

      if (caseError) throw caseError;

      // Get participant details
      const userIds = [
        caseData.claimant_id,
        caseData.respondent_id,
        caseData.mediator_id
      ].filter(Boolean);

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, role')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      const claimant = profiles?.find(p => p.id === caseData.claimant_id);
      const respondent = profiles?.find(p => p.id === caseData.respondent_id);
      const mediator = profiles?.find(p => p.id === caseData.mediator_id);

      return {
        ...caseData,
        claimant,
        respondent,
        mediator
      };
    },
  });

  // Update case status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ status, note }: { status: string; note: string }) => {
      const { error } = await supabase
        .from('cases')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', caseId);

      if (error) throw error;

      // Log status change if note provided
      if (note) {
        await supabase
          .from('case_messages')
          .insert({
            case_id: caseId,
            sender_id: user!.id,
            content: `Status updated to "${status}": ${note}`,
            message_type: 'system',
            recipient_ids: [caseDetails?.claimant_id, caseDetails?.respondent_id, caseDetails?.mediator_id].filter(Boolean)
          });
      }
    },
    onSuccess: () => {
      toast({
        title: "Status Updated",
        description: "Case status has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['case-details', caseId] });
      setIsStatusDialogOpen(false);
      setNewStatus('');
      setStatusNote('');
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: "Failed to update case status. Please try again.",
        variant: "destructive"
      });
      console.error('Error updating status:', error);
    },
  });

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'filed': return 'bg-yellow-100 text-yellow-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-orange-100 text-orange-800';
      case 'resolved': return 'bg-blue-100 text-blue-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number | null, currency: string | null) => {
    if (!amount || !currency) return 'Not specified';
    return currency === 'INR' ? `₹${amount.toLocaleString()}` : `${currency} ${amount.toLocaleString()}`;
  };

  const canUpdateStatus = user?.role === 'admin' || user?.role === 'mediator';

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span>Loading case details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!caseDetails) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md">
          <h3 className="text-lg font-semibold mb-4">Case Not Found</h3>
          <p className="text-gray-600 mb-4">The requested case could not be found.</p>
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{caseDetails.title}</h2>
            <p className="text-gray-600">Case #{caseDetails.case_number}</p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge className={getStatusColor(caseDetails.status)}>
              {caseDetails.status}
            </Badge>
            {canUpdateStatus && (
              <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Update Status
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Update Case Status</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">New Status</label>
                      <Select value={newStatus} onValueChange={setNewStatus}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select new status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="filed">Filed</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Status Update Note (Optional)</label>
                      <Textarea
                        value={statusNote}
                        onChange={(e) => setStatusNote(e.target.value)}
                        placeholder="Add a note about this status change..."
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => updateStatusMutation.mutate({ status: newStatus, note: statusNote })}
                        disabled={!newStatus || updateStatusMutation.isPending}
                        className="flex-1"
                      >
                        {updateStatusMutation.isPending ? 'Updating...' : 'Update Status'}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setIsStatusDialogOpen(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
            <Button variant="outline" onClick={onClose}>Close</Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Case Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Case Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Case Type</label>
                    <p className="font-semibold capitalize">{caseDetails.case_type}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Dispute Mode</label>
                    <p className="font-semibold capitalize">{caseDetails.dispute_mode}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Amount in Dispute</label>
                    <p className="font-semibold">
                      {formatCurrency(caseDetails.amount_in_dispute, caseDetails.currency)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Case Code</label>
                    <p className="font-mono font-semibold">{caseDetails.case_code || 'N/A'}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Description</label>
                  <p className="mt-1 text-gray-800 leading-relaxed">{caseDetails.description}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Participants</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Claimant</label>
                  <div className="mt-1">
                    <p className="font-semibold">
                      {caseDetails.claimant ? 
                        `${caseDetails.claimant.first_name} ${caseDetails.claimant.last_name}` : 
                        'Unknown'
                      }
                    </p>
                    <p className="text-sm text-gray-600">{caseDetails.claimant?.email}</p>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Respondent</label>
                  <div className="mt-1">
                    {caseDetails.respondent ? (
                      <>
                        <p className="font-semibold">
                          {`${caseDetails.respondent.first_name} ${caseDetails.respondent.last_name}`}
                        </p>
                        <p className="text-sm text-gray-600">{caseDetails.respondent.email}</p>
                      </>
                    ) : (
                      <p className="text-sm text-orange-600">Not yet joined</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Mediator</label>
                  <div className="mt-1">
                    {caseDetails.mediator ? (
                      <>
                        <p className="font-semibold">
                          {`${caseDetails.mediator.first_name} ${caseDetails.mediator.last_name}`}
                        </p>
                        <p className="text-sm text-gray-600">{caseDetails.mediator.email}</p>
                      </>
                    ) : (
                      <p className="text-sm text-orange-600">Not yet assigned</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Timeline</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium">Case Filed</p>
                    <p className="text-sm text-gray-600">
                      {format(new Date(caseDetails.created_at), 'PPP')} at {format(new Date(caseDetails.created_at), 'p')}
                    </p>
                    <p className="text-sm text-gray-500">Case was filed by {caseDetails.claimant?.first_name} {caseDetails.claimant?.last_name}</p>
                  </div>
                </div>
                
                {caseDetails.updated_at && caseDetails.updated_at !== caseDetails.created_at && (
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium">Last Updated</p>
                      <p className="text-sm text-gray-600">
                        {format(new Date(caseDetails.updated_at), 'PPP')} at {format(new Date(caseDetails.updated_at), 'p')}
                      </p>
                      <p className="text-sm text-gray-500">Case status: {caseDetails.status}</p>
                    </div>
                  </div>
                )}

                {caseDetails.resolved_at && (
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium">Case Resolved</p>
                      <p className="text-sm text-gray-600">
                        {format(new Date(caseDetails.resolved_at), 'PPP')} at {format(new Date(caseDetails.resolved_at), 'p')}
                      </p>
                      {caseDetails.resolution_type && (
                        <p className="text-sm text-gray-500">Resolution type: {caseDetails.resolution_type}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CaseDetailsView;
