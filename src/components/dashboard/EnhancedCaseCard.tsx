
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, FileText, Eye, DollarSign, Clock, User } from 'lucide-react';
import { formatDistance } from 'date-fns';
import CaseActionsMenu from './CaseActionsMenu';

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
  mediator_id: string | null;
  claimant?: any;
  respondent?: any;
  mediator?: any;
}

interface EnhancedCaseCardProps {
  case_item: Case;
  onViewDetails: (caseItem: Case) => void;
  onViewDocuments: (caseItem: Case) => void;
  onAssignMediator?: (caseItem: Case) => void;
  onScheduleSession?: (caseItem: Case) => void;
  onSendMessage?: (caseItem: Case) => void;
  showParticipants?: boolean;
}

const EnhancedCaseCard = ({ 
  case_item, 
  onViewDetails, 
  onViewDocuments,
  onAssignMediator,
  onScheduleSession,
  onSendMessage,
  showParticipants = false
}: EnhancedCaseCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'filed': return 'bg-yellow-100 text-yellow-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-orange-100 text-orange-800';
      case 'resolved': return 'bg-blue-100 text-blue-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (caseType: string) => {
    switch (caseType.toLowerCase()) {
      case 'commercial': return 'bg-red-100 text-red-800';
      case 'property': return 'bg-yellow-100 text-yellow-800';
      case 'consumer': return 'bg-green-100 text-green-800';
      case 'employment': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number | null, currency: string | null) => {
    if (!amount || !currency) return 'N/A';
    return currency === 'INR' ? `₹${amount.toLocaleString()}` : `${currency} ${amount.toLocaleString()}`;
  };

  const getParticipantName = (participant: any) => {
    if (!participant) return 'Not assigned';
    return `${participant.first_name} ${participant.last_name}`;
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex items-start justify-between">
              <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">
                {case_item.title}
              </CardTitle>
              <CaseActionsMenu
                caseItem={case_item}
                onViewDetails={onViewDetails}
                onViewDocuments={onViewDocuments}
                onAssignMediator={onAssignMediator}
                onScheduleSession={onScheduleSession}
                onSendMessage={onSendMessage}
              />
            </div>
            <p className="text-sm text-gray-600">Case #{case_item.case_number}</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Badge className={getStatusColor(case_item.status)}>
            {case_item.status}
          </Badge>
          <Badge className={getPriorityColor(case_item.case_type)}>
            {case_item.case_type}
          </Badge>
          <Badge variant="outline" className="capitalize">
            {case_item.dispute_mode}
          </Badge>
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
            <span className="text-gray-600">Filed:</span>
            <span className="font-medium">
              {formatDistance(new Date(case_item.created_at), new Date(), { addSuffix: true })}
            </span>
          </div>
        </div>

        {showParticipants && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm border-t pt-4">
            <div>
              <div className="flex items-center space-x-1 mb-1">
                <User className="h-3 w-3 text-gray-500" />
                <span className="text-gray-600 text-xs">Claimant</span>
              </div>
              <p className="font-medium text-sm">{getParticipantName(case_item.claimant)}</p>
            </div>
            <div>
              <div className="flex items-center space-x-1 mb-1">
                <User className="h-3 w-3 text-gray-500" />
                <span className="text-gray-600 text-xs">Respondent</span>
              </div>
              <p className="font-medium text-sm">{getParticipantName(case_item.respondent)}</p>
            </div>
            <div>
              <div className="flex items-center space-x-1 mb-1">
                <User className="h-3 w-3 text-gray-500" />
                <span className="text-gray-600 text-xs">Mediator</span>
              </div>
              <p className="font-medium text-sm">{getParticipantName(case_item.mediator)}</p>
            </div>
          </div>
        )}
        
        <div className="text-sm text-gray-600 line-clamp-2 border-t pt-4">
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

export default EnhancedCaseCard;
