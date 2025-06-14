
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import AdminStats from './admin/AdminStats';
import UnassignedCasesList from './admin/UnassignedCasesList';
import MediatorAssignmentDialog from './admin/MediatorAssignmentDialog';
import MediatorsList from './admin/MediatorsList';
import SystemOverview from './admin/SystemOverview';

const AdminDashboard = () => {
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch unassigned cases
  const { data: unassignedCases = [], isLoading: casesLoading } = useQuery({
    queryKey: ['unassigned-cases'],
    queryFn: async () => {
      const { data: casesData, error: casesError } = await supabase
        .from('cases')
        .select('*')
        .is('mediator_id', null)
        .order('created_at', { ascending: false });

      if (casesError) {
        console.error('Error fetching unassigned cases:', casesError);
        throw casesError;
      }

      if (!casesData || casesData.length === 0) {
        return [];
      }

      // Get profiles for claimants and respondents
      const userIds = [...new Set([
        ...casesData.map(c => c.claimant_id),
        ...casesData.filter(c => c.respondent_id).map(c => c.respondent_id)
      ])];

      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .in('id', userIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      }

      return casesData.map(caseItem => {
        const claimantProfile = profilesData?.find(p => p.id === caseItem.claimant_id);
        const respondentProfile = profilesData?.find(p => p.id === caseItem.respondent_id);
        
        return {
          ...caseItem,
          claimant_name: claimantProfile 
            ? `${claimantProfile.first_name} ${claimantProfile.last_name}`
            : 'Unknown Claimant',
          claimant_email: claimantProfile?.email || 'Unknown Email',
          respondent_name: respondentProfile 
            ? `${respondentProfile.first_name} ${respondentProfile.last_name}`
            : 'Not Assigned',
          respondent_email: respondentProfile?.email || 'N/A'
        };
      });
    },
  });

  // Fetch available mediators
  const { data: mediators = [] } = useQuery({
    queryKey: ['available-mediators'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .eq('role', 'mediator');

      if (error) {
        console.error('Error fetching mediators:', error);
        throw error;
      }

      return data || [];
    },
  });

  const handleAssignMediator = (caseItem: any) => {
    setSelectedCase(caseItem);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedCase(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Case assignment and platform management</p>
          </div>
        </div>

        {/* Stats Overview */}
        <AdminStats
          unassignedCasesCount={unassignedCases.length}
          mediatorsCount={mediators.length}
          pendingAssignmentCount={unassignedCases.filter(c => !c.respondent_id).length}
          readyForMediationCount={unassignedCases.filter(c => c.respondent_id).length}
        />

        {/* Main Content */}
        <Tabs defaultValue="unassigned" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="unassigned">Unassigned Cases</TabsTrigger>
            <TabsTrigger value="mediators">Mediators</TabsTrigger>
            <TabsTrigger value="overview">System Overview</TabsTrigger>
          </TabsList>
          
          <TabsContent value="unassigned" className="space-y-6">
            <UnassignedCasesList
              cases={unassignedCases}
              isLoading={casesLoading}
              onAssignMediator={handleAssignMediator}
            />
          </TabsContent>
          
          <TabsContent value="mediators" className="space-y-6">
            <MediatorsList mediators={mediators} />
          </TabsContent>
          
          <TabsContent value="overview" className="space-y-6">
            <SystemOverview />
          </TabsContent>
        </Tabs>

        {/* Mediator Assignment Dialog */}
        <MediatorAssignmentDialog
          isOpen={isDialogOpen}
          onClose={handleCloseDialog}
          selectedCase={selectedCase}
          mediators={mediators}
        />
      </div>
    </div>
  );
};

export default AdminDashboard;
