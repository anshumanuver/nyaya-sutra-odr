
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, FileText, MessageSquare } from 'lucide-react';
import ClaimantDashboardHeader from './ClaimantDashboardHeader';
import ClaimantStats from './ClaimantStats';
import CasesOverview from './CasesOverview';
import SessionsTab from './SessionsTab';
import DocumentsTab from './DocumentsTab';

const ClaimantDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('cases');

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <ClaimantDashboardHeader />
        <ClaimantStats />

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
            <CasesOverview userRole="claimant" />
          </TabsContent>

          <TabsContent value="sessions" className="space-y-6">
            <SessionsTab />
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <DocumentsTab />
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
