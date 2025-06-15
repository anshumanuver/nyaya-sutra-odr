
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, FileText, MessageSquare, Users } from 'lucide-react';
import RespondentDashboardHeader from './RespondentDashboardHeader';
import RespondentStats from './RespondentStats';
import CasesOverview from './CasesOverview';
import SessionsTab from './SessionsTab';
import DocumentsTab from './DocumentsTab';

const RespondentDashboard = () => {
  const [activeTab, setActiveTab] = useState('cases');

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <RespondentDashboardHeader />
        <RespondentStats />

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Case Management</h2>
          <p className="text-gray-600">Review and respond to cases you're involved in</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="cases" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
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
            <CasesOverview userRole="respondent" />
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

export default RespondentDashboard;
