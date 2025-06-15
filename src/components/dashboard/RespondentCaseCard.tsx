
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Calendar, 
  MessageSquare, 
  Clock, 
  AlertCircle,
  CheckCircle,
  Scale,
  User
} from 'lucide-react';

interface CaseData {
  id: string;
  case_number: string;
  title: string;
  case_type: string;
  dispute_mode: string;
  amount_in_dispute: number | null;
  currency: string | null;
  status: string;
  description: string;
  created_at: string;
  claimant_id: string;
  claimant_name?: string;
  claimant_email?: string;
}

interface RespondentCaseCardProps {
  caseItem: CaseData;
}

const RespondentCaseCard = ({ caseItem }: RespondentCaseCardProps) => {
  const formatCurrency = (amount: number | null, currency: string | null) => {
    if (!amount) return 'Not specified';
    const currencySymbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '₹';
    return `${currencySymbol}${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'mediation': return 'bg-blue-100 text-blue-800';
      case 'arbitration': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-orange-100 text-orange-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'mediation': return <Scale className="h-4 w-4" />;
      case 'arbitration': return <Scale className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'closed': return <AlertCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg mb-1">{caseItem.title}</CardTitle>
            <CardDescription className="font-mono text-sm">
              {caseItem.case_number}
            </CardDescription>
          </div>
          <Badge className={`${getStatusColor(caseItem.status)} flex items-center gap-1`}>
            {getStatusIcon(caseItem.status)}
            {caseItem.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Type:</span>
            <p className="capitalize">{caseItem.case_type}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Mode:</span>
            <p className="capitalize">{caseItem.dispute_mode}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Amount:</span>
            <p>{formatCurrency(caseItem.amount_in_dispute, caseItem.currency)}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Filed:</span>
            <p>{formatDate(caseItem.created_at)}</p>
          </div>
        </div>
        
        <div className="border-t pt-4">
          <div className="flex items-center gap-2 mb-2">
            <User className="h-4 w-4 text-gray-500" />
            <span className="font-medium text-gray-700">Claimant:</span>
          </div>
          <p className="text-sm">{caseItem.claimant_name}</p>
          <p className="text-sm text-gray-600">{caseItem.claimant_email}</p>
        </div>

        <div className="flex gap-2 pt-4 border-t">
          <Button variant="outline" size="sm" className="flex-1">
            <FileText className="h-4 w-4 mr-2" />
            View Details
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <MessageSquare className="h-4 w-4 mr-2" />
            Messages
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <Calendar className="h-4 w-4 mr-2" />
            Sessions
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RespondentCaseCard;
