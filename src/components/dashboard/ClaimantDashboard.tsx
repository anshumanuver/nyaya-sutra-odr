import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, FileText, MessageSquare, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import ClaimantDashboardHeader from './ClaimantDashboardHeader';
import ClaimantStats from './ClaimantStats';
import CasesOverview from './CasesOverview';
import SessionsTab from './SessionsTab';
import DocumentsTab from './DocumentsTab';
import { Card, CardContent } from '@/components/ui/card';

const ClaimantDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('cases');
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);

  // Fetch cases for the current claimant
  const { data: cases = [], isLoading, error } = useQuery({
    queryKey: ['claimant-cases', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('cases')
        .select('*')
        .eq('claimant_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const handleSelectCase = (caseId: string) => {
    setSelectedCaseId(caseId);
    setActiveTab('documents');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <Card className="w-full max-w-lg">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Dashboard</h3>
            <p className="text-gray-600">We couldn't load your case data. Please try again later.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <ClaimantDashboardHeader />
        <ClaimantStats cases={cases} />

        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Case Management</h2>
            <p className="text-gray-600">Manage your dispute resolution cases</p>
          </div>
          <Button 
            onClick={() => navigate('/case/new')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            File New Case
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="cases" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>My Cases</span>
            </TabsTrigger>
            <TabsTrigger value="sessions" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Sessions</span>
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Documents</span>
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4" />
              <span>Messages</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cases" className="space-y-6">
            <CasesOverview 
              userRole="claimant" 
              onSelectCase={handleSelectCase} 
              cases={cases}
              isLoading={false}
              error={null}
            />
          </TabsContent>

          <TabsContent value="sessions" className="space-y-6">
            <SessionsTab />
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <DocumentsTab 
              cases={cases}
              selectedCaseId={selectedCaseId}
              onSelectCase={setSelectedCaseId}
            />
          </TabsContent>

          <TabsContent value="messages" className="space-y-6">
            <div className="text-center py-12">
              <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Messages Coming Soon</h3>
              <p className="text-gray-600">Direct messaging with mediators and other parties will be available soon.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ClaimantDashboard;
