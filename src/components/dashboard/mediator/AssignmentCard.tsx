
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, IndianRupee, AlertTriangle } from 'lucide-react';

interface AssignmentCardProps {
  assignment: any;
  onAccept: (assignmentId: string) => void;
  onDecline: (assignmentId: string) => void;
}

const AssignmentCard = ({ assignment, onAccept, onDecline }: AssignmentCardProps) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{assignment.title}</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-2">
              <span>Case ID: {assignment.id}</span>
              <Badge variant="outline">{assignment.type}</Badge>
              <Badge variant="outline" className="capitalize">{assignment.mode}</Badge>
            </CardDescription>
          </div>
          <Badge className={getPriorityColor(assignment.priority)}>
            {assignment.priority}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-500" />
              <span>{assignment.parties.join(' vs ')}</span>
            </div>
            <div className="flex items-center gap-2">
              <IndianRupee className="h-4 w-4 text-gray-500" />
              <span>{assignment.amount}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>Assigned: {new Date(assignment.assignedAt).toLocaleDateString()}</span>
          </div>
          
          <div className="flex gap-2 pt-4 border-t">
            <Button 
              size="sm" 
              className="bg-green-600 hover:bg-green-700"
              onClick={() => onAccept(assignment.id)}
            >
              Accept Assignment
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onDecline(assignment.id)}
            >
              Decline
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AssignmentCard;
