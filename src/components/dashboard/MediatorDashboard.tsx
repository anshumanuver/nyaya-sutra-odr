
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { getAssignedCasesForMediator, CaseWithParticipantsAndSessions } from '@/services/caseService';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { List, LayoutGrid } from 'lucide-react';

import AssignmentCard from './mediator/AssignmentCard';
import CaseProgressTracker from './mediator/CaseProgressTracker';
import SessionManager from './mediator/SessionManager';
import SessionCalendar from './mediator/SessionCalendar';
import MessagingPane from './messaging/MessagingPane';

type CaseWithParticipants = CaseWithParticipantsAndSessions;

const MediatorDashboard = () => {
  const { user, profile } = useAuth();
  const [viewMode, setViewMode] = useState('list');
  
  const { data: assignedCases = [], isLoading } = useQuery<CaseWithParticipants[]>({
    queryKey: ['assignedCases', user?.id],
    queryFn: () => getAssignedCasesForMediator(user!.id),
    enabled: !!user?.id
  });

  // Transform case data to match component expectations
  const transformCaseToAssignment = (caseData: any) => ({
    id: caseData.id,
    title: caseData.title,
    type: caseData.case_type,
    mode: caseData.dispute_mode,
    priority: 'medium', // Default priority since it's not in the database
    parties: [
      `${caseData.claimant?.first_name} ${caseData.claimant?.last_name}`,
      `${caseData.respondent?.first_name} ${caseData.respondent?.last_name}`
    ],
    amount: `₹${caseData.amount_in_dispute?.toLocaleString() || '0'}`,
    assignedAt: caseData.created_at
  });

  const transformCaseToCaseItem = (caseData: any) => ({
    id: caseData.id,
    title: caseData.title,
    status: caseData.status,
    parties: [
      `${caseData.claimant?.first_name} ${caseData.claimant?.last_name}`,
      `${caseData.respondent?.first_name} ${caseData.respondent?.last_name}`
    ],
    amount: `₹${caseData.amount_in_dispute?.toLocaleString() || '0'}`,
    createdAt: caseData.created_at
  });

  const handleAcceptAssignment = (assignmentId: string) => {
    console.log('Accepting assignment:', assignmentId);
    // TODO: Implement assignment acceptance
  };

  const handleDeclineAssignment = (assignmentId: string) => {
    console.log('Declining assignment:', assignmentId);
    // TODO: Implement assignment decline
  };

  const handleStatusUpdate = (caseId: string, newStatus: string) => {
    console.log('Updating case status:', caseId, newStatus);
    // TODO: Implement status update
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>My Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <SessionCalendar sessions={assignedCases.flatMap(c => c.case_sessions || [])} />
        </CardContent>
      </Card>
      
      <Tabs defaultValue="assignments">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="assignments">Case Assignments</TabsTrigger>
            <TabsTrigger value="active_cases">Active Cases</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('list')}>
              <List className="h-4 w-4" />
            </Button>
            <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('grid')}>
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <TabsContent value="assignments">
          {assignedCases.length === 0 ? (
            <div className="text-center py-12">
              <p>No new case assignments at this time.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
              {assignedCases.map((caseData) => {
                  const participants: any = {};
                  if (caseData.claimant) participants[caseData.claimant.id] = caseData.claimant;
                  if (caseData.respondent) participants[caseData.respondent.id] = caseData.respondent;
                  if (profile) participants[profile.id] = profile;

                  return (
                    <div key={caseData.id} className="space-y-4">
                      <AssignmentCard 
                        assignment={transformCaseToAssignment(caseData)}
                        onAccept={handleAcceptAssignment}
                        onDecline={handleDeclineAssignment}
                      />
                      <CaseProgressTracker 
                        caseItem={transformCaseToCaseItem(caseData)}
                        onStatusUpdate={handleStatusUpdate}
                      />
                       {user && profile && (
                        <MessagingPane 
                          caseId={caseData.id} 
                          userId={user.id} 
                          participants={participants} 
                        />
                      )}
                    </div>
                  );
              })}
            </div>
          )}
        </TabsContent>
        <TabsContent value="active_cases">
          {assignedCases.length === 0 ? (
             <div className="text-center py-12">
               <p>No active cases.</p>
             </div>
          ) : (
            <div className="space-y-6 mt-4">
              {assignedCases.map((caseData) => (
                <Card key={caseData.id}>
                  <CardHeader>
                    <CardTitle>{caseData.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <SessionManager caseId={caseData.id} />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MediatorDashboard;
