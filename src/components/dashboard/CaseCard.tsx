
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  Users, 
  MessageSquare,
  Download,
  Eye
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import CaseCodeCard from '@/components/case/CaseCodeCard';

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
  const { toast } = useToast();

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'filed': return <FileText className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'mediation': return <Users className="h-4 w-4" />;
      case 'arbitration': return <AlertCircle className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'closed': return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusProgress = (status: string) => {
    switch (status) {
      case 'filed': return 20;
      case 'pending': return 30;
      case 'mediation': return 60;
      case 'arbitration': return 80;
      case 'completed': return 100;
      case 'closed': return 100;
      default: return 0;
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
      month: 'short',
      day: 'numeric'
    });
  };

  const openMessages = (caseItem: Case) => {
    toast({
      title: "Messages",
      description: `Opening messages for ${caseItem.case_number}`,
    });
    // TODO: Navigate to messages page when implemented
  };

  const downloadCaseResult = (caseItem: Case) => {
    toast({
      title: "Download Started",
      description: `Downloading case result for ${caseItem.case_number}`,
    });
    // TODO: Implement actual download functionality
  };

  return (
    <div className="space-y-4">
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">{case_item.title}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-2">
                <span>Case ID: {case_item.case_number}</span>
                <Badge variant="outline" className="capitalize">{case_item.case_type}</Badge>
              </CardDescription>
            </div>
            <Badge className={getStatusColor(case_item.status)}>
              {getStatusIcon(case_item.status)}
              <span className="ml-1 capitalize">{case_item.status}</span>
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{getStatusProgress(case_item.status)}%</span>
            </div>
            <Progress value={getStatusProgress(case_item.status)} className="w-full" />
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Amount</p>
                <p className="font-semibold">
                  {formatCurrency(case_item.amount_in_dispute, case_item.currency)}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Resolution Method</p>
                <p className="font-semibold capitalize">{case_item.dispute_mode}</p>
              </div>
              <div>
                <p className="text-gray-600">Respondent</p>
                <p className="font-semibold">
                  {case_item.respondent_id ? 'Joined' : 'Waiting to join'}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Filed</p>
                <p className="font-semibold">{formatDate(case_item.created_at)}</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 pt-4 border-t">
              <Button variant="outline" size="sm" onClick={() => onViewDetails(case_item)}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Button>
              <Button variant="outline" size="sm" onClick={() => openMessages(case_item)}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Messages
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onViewDocuments(case_item)}
              >
                <FileText className="h-4 w-4 mr-2" />
                Documents
              </Button>
              {['completed', 'closed'].includes(case_item.status) && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => downloadCaseResult(case_item)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Result
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Show case code card if no respondent has joined */}
      {!case_item.respondent_id && case_item.case_code && (
        <CaseCodeCard 
          caseCode={case_item.case_code}
          caseNumber={case_item.case_number}
        />
      )}
    </div>
  );
};

export default CaseCard;
