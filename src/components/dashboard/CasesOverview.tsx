
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';
import EnhancedCaseCard from './EnhancedCaseCard';
import CaseDetailsView from './CaseDetailsView';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CasesOverviewProps {
  userRole: 'claimant' | 'respondent' | 'mediator' | 'admin';
  onSelectCase?: (caseId: string) => void;
  onAssignMediator?: (caseItem: any) => void;
}

const CasesOverview = ({ userRole, onSelectCase, onAssignMediator }: CasesOverviewProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);

  const { data: cases = [], isLoading, error } = useQuery({
    queryKey: ['cases', userRole, user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      let query = supabase.from('cases').select(`
        *,
        claimant:claimant_id (first_name, last_name, email),
        respondent:respondent_id (first_name, last_name, email),
        mediator:mediator_id (first_name, last_name, email)
      `);

      // Filter based on user role
      switch (userRole) {
        case 'claimant':
          query = query.eq('claimant_id', user.id);
          break;
        case 'respondent':
          query = query.eq('respondent_id', user.id);
          break;
        case 'mediator':
          query = query.eq('mediator_id', user.id);
          break;
        case 'admin':
          // Admin sees all cases, no filter needed
          break;
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const handleViewDetails = (caseItem: any) => {
    setSelectedCaseId(caseItem.id);
  };

  const handleViewDocuments = (caseItem: any) => {
    onSelectCase?.(caseItem.id);
  };

  const handleCloseDetails = () => {
    setSelectedCaseId(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading cases...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-red-600 mb-4">Error loading cases</div>
          <p className="text-gray-600">Please try refreshing the page</p>
        </CardContent>
      </Card>
    );
  }

  if (cases.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {userRole === 'claimant' && 'No Cases Filed Yet'}
            {userRole === 'respondent' && 'No Cases to Respond To'}
            {userRole === 'mediator' && 'No Cases Assigned'}
            {userRole === 'admin' && 'No Cases in System'}
          </h3>
          <p className="text-gray-600 mb-6">
            {userRole === 'claimant' && 'File your first dispute case to get started with online resolution'}
            {userRole === 'respondent' && 'No cases have been assigned to you yet'}
            {userRole === 'mediator' && 'You have no assigned cases at the moment'}
            {userRole === 'admin' && 'No cases have been filed in the system yet'}
          </p>
          {userRole === 'claimant' && (
            <Button onClick={() => navigate('/case/new')} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              File Your First Case
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid gap-6">
        {cases.map((caseItem) => (
          <EnhancedCaseCard
            key={caseItem.id}
            case_item={caseItem}
            onViewDetails={handleViewDetails}
            onViewDocuments={handleViewDocuments}
            onAssignMediator={onAssignMediator}
            showParticipants={userRole === 'admin'}
          />
        ))}
      </div>

      {selectedCaseId && (
        <CaseDetailsView
          caseId={selectedCaseId}
          onClose={handleCloseDetails}
        />
      )}
    </>
  );
};

export default CasesOverview;
