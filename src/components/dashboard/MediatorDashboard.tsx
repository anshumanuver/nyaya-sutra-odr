import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, FileText, MessageSquare, Users, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getAssignedCasesForMediator } from '@/services/caseService';
import CasesOverview from './CasesOverview';
import SessionsTab from './SessionsTab';
import DocumentsTab from './DocumentsTab';
import { Card, CardContent } from '@/components/ui/card';

const MediatorDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('cases');
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);

  // Fetch assigned cases for the mediator
  const { data: assignedCases = [], isLoading, error } = useQuery({
    queryKey: ['mediator-cases', user?.id],
    queryFn: () => getAssignedCasesForMediator(user!.id),
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
          <p>Loading your assigned cases...</p>
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
            <p className="text-gray-600">We couldn't load your assigned cases. Please try again later.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mediator Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage your assigned cases and sessions</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="cases" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Assigned Cases</span>
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
              userRole="mediator" 
              onSelectCase={handleSelectCase} 
              cases={assignedCases}
              isLoading={false}
              error={null}
            />
          </TabsContent>

          <TabsContent value="sessions" className="space-y-6">
            <SessionsTab />
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <DocumentsTab 
              cases={assignedCases}
              selectedCaseId={selectedCaseId}
              onSelectCase={setSelectedCaseId}
            />
          </TabsContent>

          <TabsContent value="messages" className="space-y-6">
            <div className="text-center py-12">
              <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Messages Coming Soon</h3>
              <p className="text-gray-600">Direct messaging with case participants will be available soon.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MediatorDashboard;
