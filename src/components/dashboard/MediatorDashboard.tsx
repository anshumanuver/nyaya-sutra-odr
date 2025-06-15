
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Calendar, FileText, Clock } from 'lucide-react';
import AssignmentCard from './mediator/AssignmentCard';
import CaseProgressTracker from './mediator/CaseProgressTracker';
import SessionScheduler from './mediator/SessionScheduler';
import SessionManager from './mediator/SessionManager';
import SessionCalendar from './mediator/SessionCalendar';

const MediatorDashboard = () => {
  const { user } = useAuth();

  const { data: assignedCases = [], isLoading } = useQuery({
    queryKey: ['mediator-cases', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('cases')
        .select(`
          *,
          claimant:profiles!cases_claimant_id_fkey(first_name, last_name, email),
          respondent:profiles!cases_respondent_id_fkey(first_name, last_name, email)
        `)
        .eq('mediator_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
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

  const activeCases = assignedCases.filter(c => c.status === 'in_progress');
  const pendingCases = assignedCases.filter(c => c.status === 'accepted');
  const resolvedCases = assignedCases.filter(c => c.status === 'resolved');

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cases</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assignedCases.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{activeCases.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Cases</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingCases.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved Cases</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{resolvedCases.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="cases" className="space-y-4">
        <TabsList>
          <TabsTrigger value="cases">Cases</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
        </TabsList>

        <TabsContent value="cases" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {assignedCases.map((caseData) => (
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
              </div>
            ))}
          </div>
          
          {assignedCases.length === 0 && (
            <Card>
              <CardContent className="py-8">
                <div className="text-center">
                  <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Cases Assigned</h3>
                  <p className="text-gray-600">You don't have any cases assigned yet.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          {assignedCases.length > 0 ? (
            <div className="space-y-6">
              {assignedCases.map((caseData) => (
                <div key={caseData.id} className="space-y-4">
                  <div className="border-b pb-2">
                    <h3 className="text-lg font-semibold">{caseData.title}</h3>
                    <p className="text-sm text-gray-600">Case #{caseData.case_number}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <SessionScheduler caseId={caseData.id} />
                    <SessionManager caseId={caseData.id} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8">
                <div className="text-center">
                  <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Cases for Sessions</h3>
                  <p className="text-gray-600">You need assigned cases to schedule sessions.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          {assignedCases.length > 0 ? (
            <div className="space-y-6">
              {assignedCases.map((caseData) => (
                <div key={caseData.id} className="space-y-4">
                  <div className="border-b pb-2">
                    <h3 className="text-lg font-semibold">{caseData.title}</h3>
                    <p className="text-sm text-gray-600">Case #{caseData.case_number}</p>
                  </div>
                  
                  <SessionCalendar caseId={caseData.id} />
                </div>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8">
                <div className="text-center">
                  <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Cases for Calendar</h3>
                  <p className="text-gray-600">You need assigned cases to view the calendar.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MediatorDashboard;
