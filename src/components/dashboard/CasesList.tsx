
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CaseCard from './CaseCard';

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

interface CasesListProps {
  cases: Case[];
  onViewDetails: (caseItem: Case) => void;
  onViewDocuments: (caseItem: Case) => void;
}

const CasesList = ({ cases, onViewDetails, onViewDocuments }: CasesListProps) => {
  const navigate = useNavigate();

  if (cases.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Cases Filed Yet</h3>
          <p className="text-gray-600 mb-6">File your first dispute case to get started with online resolution</p>
          <Button onClick={() => navigate('/case/new')} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            File Your First Case
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6">
      {cases.map((case_item) => (
        <CaseCard
          key={case_item.id}
          case_item={case_item}
          onViewDetails={onViewDetails}
          onViewDocuments={onViewDocuments}
        />
      ))}
    </div>
  );
};

export default CasesList;
