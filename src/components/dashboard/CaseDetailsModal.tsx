
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, DollarSign, User, FileText, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface Case {
  id: string;
  case_number: string;
  title: string;
  case_type: string;
  status: string;
  amount_in_dispute: number | null;
  currency: string | null;
  created_at: string;
  updated_at: string | null;
  dispute_mode: string;
  description: string;
  case_code: string | null;
  respondent_id: string | null;
}

interface CaseDetailsModalProps {
  case_item: Case | null;
  isOpen: boolean;
  onClose: () => void;
}

const CaseDetailsModal = ({ case_item, isOpen, onClose }: CaseDetailsModalProps) => {
  if (!case_item) return null;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-blue-100 text-blue-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number | null, currency: string | null) => {
    if (!amount || !currency) return 'N/A';
    return currency === 'INR' ? `₹${amount.toLocaleString()}` : `${currency} ${amount.toLocaleString()}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{case_item.title}</span>
            <Badge className={getStatusColor(case_item.status)}>
              {case_item.status}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-6">
          {/* Case Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Case Overview</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Case Number</label>
                  <p className="text-lg font-semibold">{case_item.case_number}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Case Type</label>
                  <p className="text-lg">{case_item.case_type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Dispute Mode</label>
                  <p className="text-lg capitalize">{case_item.dispute_mode}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Amount in Dispute</label>
                  <p className="text-lg font-semibold">
                    {formatCurrency(case_item.amount_in_dispute, case_item.currency)}
                  </p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Description</label>
                <p className="mt-1 text-gray-800 leading-relaxed">{case_item.description}</p>
              </div>
            </CardContent>
          </Card>

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
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <div>
                    <p className="font-medium">Case Created</p>
                    <p className="text-sm text-gray-600">
                      {format(new Date(case_item.created_at), 'PPP')}
                    </p>
                  </div>
                </div>
                
                {case_item.updated_at && (
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    <div>
                      <p className="font-medium">Last Updated</p>
                      <p className="text-sm text-gray-600">
                        {format(new Date(case_item.updated_at), 'PPP')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Case Code */}
          {case_item.case_code && (
            <Card>
              <CardHeader>
                <CardTitle>Case Access Code</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">
                    Share this code with the respondent to join the case:
                  </p>
                  <p className="text-2xl font-mono font-bold text-blue-600">
                    {case_item.case_code}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CaseDetailsModal;
