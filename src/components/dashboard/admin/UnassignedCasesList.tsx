
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle, Filter, Search } from 'lucide-react';
import CaseCard from './CaseCard';

interface UnassignedCasesListProps {
  cases: any[];
  isLoading: boolean;
  onAssignMediator: (caseItem: any) => void;
}

const UnassignedCasesList = ({ cases, isLoading, onAssignMediator }: UnassignedCasesListProps) => {
  if (isLoading) {
    return <div className="text-center py-8">Loading cases...</div>;
  }

  if (cases.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">All Cases Assigned</h3>
          <p className="text-gray-600">There are no unassigned cases at the moment.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-64">
              <Input placeholder="Search cases..." className="w-full" />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline">
              <Search className="h-4 w-4 mr-2" />
              Advanced Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Cases List */}
      <div className="grid gap-6">
        {cases.map((caseItem) => (
          <CaseCard 
            key={caseItem.id} 
            caseItem={caseItem} 
            onAssignMediator={onAssignMediator}
          />
        ))}
      </div>
    </div>
  );
};

export default UnassignedCasesList;
