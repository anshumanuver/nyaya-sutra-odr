
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, FileText, Eye, DollarSign, Clock } from 'lucide-react';
import { formatDistance } from 'date-fns';

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

interface CaseCardProps {
  case_item: Case;
  onViewDetails: (caseItem: Case) => void;
  onViewDocuments: (caseItem: Case) => void;
}

const CaseCard = ({ case_item, onViewDetails, onViewDocuments }: CaseCardProps) => {
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
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold text-gray-900">
              {case_item.title}
            </CardTitle>
            <p className="text-sm text-gray-600">Case #{case_item.case_number}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge className={getStatusColor(case_item.status)}>
              {case_item.status}
            </Badge>
            <Badge variant="outline">
              {case_item.case_type}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4 text-gray-500" />
            <span className="text-gray-600">Amount:</span>
            <span className="font-medium">
              {formatCurrency(case_item.amount_in_dispute, case_item.currency)}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-gray-600">Created:</span>
            <span className="font-medium">
              {formatDistance(new Date(case_item.created_at), new Date(), { addSuffix: true })}
            </span>
          </div>
        </div>
        
        <div className="text-sm">
          <span className="text-gray-600">Mode:</span>
          <span className="ml-2 font-medium capitalize">{case_item.dispute_mode}</span>
        </div>
        
        <div className="text-sm text-gray-600 line-clamp-2">
          {case_item.description}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onViewDetails(case_item)}
            className="flex items-center space-x-1"
          >
            <Eye className="h-4 w-4" />
            <span>View Details</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onViewDocuments(case_item)}
            className="flex items-center space-x-1"
          >
            <FileText className="h-4 w-4" />
            <span>Documents</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CaseCard;
