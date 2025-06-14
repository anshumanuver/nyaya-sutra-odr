
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, Clock, AlertCircle, FileText } from 'lucide-react';

interface CaseProgressTrackerProps {
  caseItem: any;
  onStatusUpdate: (caseId: string, newStatus: string) => void;
}

const CaseProgressTracker = ({ caseItem, onStatusUpdate }: CaseProgressTrackerProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'in_mediation': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Clock className="h-4 w-4" />;
      case 'in_mediation': return <AlertCircle className="h-4 w-4" />;
      case 'resolved': return <CheckCircle className="h-4 w-4" />;
      case 'closed': return <FileText className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'in_mediation', label: 'In Mediation' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'closed', label: 'Closed' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Case Progress</span>
          <Badge className={getStatusColor(caseItem.status)}>
            {getStatusIcon(caseItem.status)}
            <span className="ml-1 capitalize">{caseItem.status.replace('_', ' ')}</span>
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h4 className="font-semibold">{caseItem.title}</h4>
          <p className="text-sm text-gray-600">Case ID: {caseItem.id}</p>
          <p className="text-sm text-gray-600">
            Parties: {caseItem.parties.join(' vs ')}
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Update Status</label>
          <Select 
            value={caseItem.status} 
            onValueChange={(newStatus) => onStatusUpdate(caseItem.id, newStatus)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="pt-4 border-t">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Created:</span>
              <p className="font-semibold">
                {new Date(caseItem.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <span className="text-gray-600">Amount:</span>
              <p className="font-semibold">{caseItem.amount}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CaseProgressTracker;
