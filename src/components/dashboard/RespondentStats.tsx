
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CaseData {
  id: string;
  status: string;
  created_at: string;
}

interface RespondentStatsProps {
  cases: CaseData[] | undefined;
}

const RespondentStats = ({ cases }: RespondentStatsProps) => {
  const activeCases = cases?.filter(c => ['pending', 'mediation', 'arbitration'].includes(c.status)) || [];
  const completedCases = cases?.filter(c => ['completed', 'closed'].includes(c.status)) || [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Total Cases</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{cases?.length || 0}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Active Cases</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{activeCases.length}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{completedCases.length}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">This Month</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">
            {cases?.filter(c => 
              new Date(c.created_at).getMonth() === new Date().getMonth()
            ).length || 0}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RespondentStats;
