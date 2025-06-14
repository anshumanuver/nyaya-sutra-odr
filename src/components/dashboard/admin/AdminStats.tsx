
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, CheckCircle, Clock, Users } from 'lucide-react';

interface AdminStatsProps {
  unassignedCasesCount: number;
  mediatorsCount: number;
  pendingAssignmentCount: number;
  readyForMediationCount: number;
}

const AdminStats = ({ 
  unassignedCasesCount, 
  mediatorsCount, 
  pendingAssignmentCount, 
  readyForMediationCount 
}: AdminStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Unassigned Cases</p>
              <p className="text-2xl font-bold text-gray-900">{unassignedCasesCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Available Mediators</p>
              <p className="text-2xl font-bold text-gray-900">{mediatorsCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Assignment</p>
              <p className="text-2xl font-bold text-gray-900">{pendingAssignmentCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Ready for Mediation</p>
              <p className="text-2xl font-bold text-gray-900">{readyForMediationCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminStats;
