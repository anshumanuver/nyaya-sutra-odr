
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar, 
  DollarSign, 
  User, 
  FileText, 
  Clock,
  Scale,
  MapPin
} from 'lucide-react';

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
    switch (status) {
      case 'filed': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'mediation': return 'bg-purple-100 text-purple-800';
      case 'arbitration': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number | null, currency: string | null) => {
    if (!amount) return 'N/A';
    const currencySymbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '₹';
    return `${currencySymbol}${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{case_item.title}</span>
            <Badge className={getStatusColor(case_item.status)}>
              <span className="capitalize">{case_item.status}</span>
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Case ID: {case_item.case_number}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Case Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Case Type</p>
                  <Badge variant="outline" className="capitalize">
                    {case_item.case_type.replace('_', ' ')}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Dispute Mode</p>
                  <Badge variant="outline" className="capitalize">
                    {case_item.dispute_mode}
                  </Badge>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Description</p>
                <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                  {case_item.description}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Financial Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Financial Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-gray-600">Amount in Dispute:</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatCurrency(case_item.amount_in_dispute, case_item.currency)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Parties Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5" />
                Parties
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-md">
                <span className="font-medium text-blue-900">Claimant (You)</span>
                <Badge className="bg-blue-100 text-blue-800">Active</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <span className="font-medium text-gray-700">Respondent</span>
                <Badge variant={case_item.respondent_id ? "default" : "secondary"}>
                  {case_item.respondent_id ? 'Joined' : 'Not Joined'}
                </Badge>
              </div>
              {case_item.case_code && !case_item.respondent_id && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-800">
                    <strong>Case Code:</strong> {case_item.case_code}
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    Share this code with the respondent to join the case
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Case Filed</p>
                  <p className="text-sm text-gray-600">{formatDate(case_item.created_at)}</p>
                </div>
              </div>
              {case_item.updated_at && (
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Last Updated</p>
                    <p className="text-sm text-gray-600">{formatDate(case_item.updated_at)}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CaseDetailsModal;
