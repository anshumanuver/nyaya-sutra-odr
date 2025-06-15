
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DocumentVault from '@/components/documents/DocumentVault';

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

interface DocumentsTabProps {
  cases: Case[];
  selectedCaseId: string | null;
  onSelectCase: (caseId: string) => void;
}

const DocumentsTab = ({ cases, selectedCaseId, onSelectCase }: DocumentsTabProps) => {
  const navigate = useNavigate();

  if (selectedCaseId) {
    return <DocumentVault caseId={selectedCaseId} />;
  }

  if (cases.length > 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Document Vault
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Case</h3>
            <p className="text-gray-600 mb-6">Choose a case from the "My Cases" tab to view and manage its documents</p>
            <div className="space-y-2">
              {cases.map((case_item) => (
                <Button
                  key={case_item.id}
                  variant="outline"
                  onClick={() => onSelectCase(case_item.id)}
                  className="w-full justify-start"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  {case_item.title} ({case_item.case_number})
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          Document Vault
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Cases Yet</h3>
          <p className="text-gray-600 mb-4">File a case first to start uploading documents</p>
          <Button onClick={() => navigate('/case/new')}>
            <Plus className="h-4 w-4 mr-2" />
            File New Case
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentsTab;
