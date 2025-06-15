
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import RespondentDashboardHeader from './RespondentDashboardHeader';
import RespondentStats from './RespondentStats';
import RespondentCaseCard from './RespondentCaseCard';

interface CaseData {
  id: string;
  case_number: string;
  title: string;
  case_type: string;
  dispute_mode: string;
  amount_in_dispute: number | null;
  currency: string | null;
  status: string;
  description: string;
  created_at: string;
  claimant_id: string;
  claimant_name?: string;
  claimant_email?: string;
}

const RespondentDashboard = () => {
  const { user } = useAuth();

  const { data: cases, isLoading } = useQuery({
    queryKey: ['respondent-cases', user?.id],
    queryFn: async () => {
      if (!user) return [];

      // First get the cases for this respondent
      const { data: casesData, error: casesError } = await supabase
        .from('cases')
        .select('*')
        .eq('respondent_id', user.id)
        .order('created_at', { ascending: false });

      if (casesError) {
        console.error('Error fetching respondent cases:', casesError);
        throw casesError;
      }

      if (!casesData || casesData.length === 0) {
        return [];
      }

      // Get claimant profiles for all cases
      const claimantIds = casesData.map(c => c.claimant_id);
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .in('id', claimantIds);

      if (profilesError) {
        console.error('Error fetching claimant profiles:', profilesError);
      }

      // Combine cases with claimant information
      return casesData.map(caseItem => {
        const claimantProfile = profilesData?.find(p => p.id === caseItem.claimant_id);
        return {
          ...caseItem,
          claimant_name: claimantProfile 
            ? `${claimantProfile.first_name} ${claimantProfile.last_name}`
            : 'Unknown Claimant',
          claimant_email: claimantProfile?.email || 'Unknown Email'
        };
      });
    },
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const activeCases = cases?.filter(c => ['pending', 'mediation', 'arbitration'].includes(c.status)) || [];
  const completedCases = cases?.filter(c => ['completed', 'closed'].includes(c.status)) || [];

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <RespondentDashboardHeader />
        <RespondentStats cases={cases} />

        {cases?.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Cases Yet</h3>
              <p className="text-gray-600 mb-4">
                You haven't joined any cases yet. Use a case code to join a dispute resolution process.
              </p>
              <Button onClick={() => window.location.href = '/join-case'}>
                Join a Case
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="active" className="space-y-6">
            <TabsList>
              <TabsTrigger value="active">Active Cases ({activeCases.length})</TabsTrigger>
              <TabsTrigger value="completed">Completed Cases ({completedCases.length})</TabsTrigger>
              <TabsTrigger value="all">All Cases ({cases?.length || 0})</TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-4">
              {activeCases.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No active cases. All your cases have been completed or closed.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {activeCases.map((caseItem) => (
                    <RespondentCaseCard key={caseItem.id} caseItem={caseItem} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-4">
              {completedCases.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No completed cases yet.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {completedCases.map((caseItem) => (
                    <div key={caseItem.id} className="opacity-75 hover:opacity-100 transition-opacity">
                      <RespondentCaseCard caseItem={caseItem} />
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="all" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {cases?.map((caseItem) => (
                  <RespondentCaseCard key={caseItem.id} caseItem={caseItem} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default RespondentDashboard;
