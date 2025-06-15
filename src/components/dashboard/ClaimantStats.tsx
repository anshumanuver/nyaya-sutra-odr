
import { Card, CardContent } from '@/components/ui/card';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  UserPlus,
  DollarSign,
  AlertCircle
} from 'lucide-react';

interface Case {
  id: string;
  status: string;
  amount_in_dispute: number | null;
  currency: string | null;
  respondent_id: string | null;
}

interface ClaimantStatsProps {
  cases: Case[];
}

const ClaimantStats = ({ cases }: ClaimantStatsProps) => {
  const activeCases = cases.filter(c => !['completed', 'closed'].includes(c.status));
  const resolvedCases = cases.filter(c => ['completed', 'closed'].includes(c.status));
  const casesAwaitingRespondent = cases.filter(c => !c.respondent_id);
  
  const totalDisputeAmount = cases.reduce((sum, case_item) => {
    if (case_item.amount_in_dispute && case_item.currency === 'INR') {
      return sum + Number(case_item.amount_in_dispute);
    }
    return sum;
  }, 0);

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString()}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Cases</p>
              <p className="text-2xl font-bold text-gray-900">{cases.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Cases</p>
              <p className="text-2xl font-bold text-gray-900">{activeCases.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Resolved</p>
              <p className="text-2xl font-bold text-gray-900">{resolvedCases.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <UserPlus className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Awaiting Respondent</p>
              <p className="text-2xl font-bold text-gray-900">{casesAwaitingRespondent.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Dispute Value</p>
              <p className="text-2xl font-bold text-gray-900">
                {totalDisputeAmount > 0 ? formatCurrency(totalDisputeAmount) : 'N/A'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClaimantStats;
