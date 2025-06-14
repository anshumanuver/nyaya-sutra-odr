
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, FileText, UserPlus } from 'lucide-react';

interface CaseCardProps {
  caseItem: any;
  onAssignMediator: (caseItem: any) => void;
}

const CaseCard = ({ caseItem, onAssignMediator }: CaseCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'filed': return 'bg-red-100 text-red-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'resolved': return 'bg-blue-100 text-blue-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (caseType: string) => {
    switch (caseType) {
      case 'commercial': return 'bg-red-100 text-red-800';
      case 'property': return 'bg-yellow-100 text-yellow-800';
      case 'consumer': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{caseItem.title}</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-2">
              <span>Case ID: {caseItem.case_number}</span>
              <Badge variant="outline">{caseItem.case_type}</Badge>
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge className={getPriorityColor(caseItem.case_type)}>
              {caseItem.case_type}
            </Badge>
            <Badge className={getStatusColor(caseItem.status)}>
              {caseItem.status}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Claimant</p>
              <p className="font-semibold">{caseItem.claimant_name}</p>
              <p className="text-xs text-gray-500">{caseItem.claimant_email}</p>
            </div>
            <div>
              <p className="text-gray-600">Respondent</p>
              <p className="font-semibold">{caseItem.respondent_name}</p>
              <p className="text-xs text-gray-500">{caseItem.respondent_email}</p>
            </div>
            <div>
              <p className="text-gray-600">Amount</p>
              <p className="font-semibold">
                {caseItem.amount_in_dispute 
                  ? `${caseItem.currency} ${Number(caseItem.amount_in_dispute).toLocaleString()}`
                  : 'Not specified'
                }
              </p>
            </div>
            <div>
              <p className="text-gray-600">Filed</p>
              <p className="font-semibold">{new Date(caseItem.created_at).toLocaleDateString()}</p>
            </div>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-700">{caseItem.description}</p>
          </div>
          
          <div className="flex gap-2 pt-4 border-t">
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Button>
            <Button 
              size="sm" 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => onAssignMediator(caseItem)}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Assign Mediator
            </Button>
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              Documents
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CaseCard;
