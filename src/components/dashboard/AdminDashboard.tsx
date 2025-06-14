
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  AlertTriangle,
  CheckCircle,
  FileText,
  UserPlus,
  Filter,
  Search,
  Eye,
  Clock,
  Users
} from 'lucide-react';

const AdminDashboard = () => {
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [selectedMediatorId, setSelectedMediatorId] = useState<string>('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  // Assign mediator mutation
  const assignMediatorMutation = useMutation({
    mutationFn: async ({ caseId, mediatorId }: { caseId: string, mediatorId: string }) => {
      const { error } = await supabase
        .from('cases')
        .update({ 
          mediator_id: mediatorId,
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', caseId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Mediator Assigned",
        description: "The mediator has been successfully assigned to the case.",
      });
      queryClient.invalidateQueries({ queryKey: ['unassigned-cases'] });
      setSelectedCase(null);
      setSelectedMediatorId('');
    },
    onError: (error) => {
      toast({
        title: "Assignment Failed",
        description: "Failed to assign mediator. Please try again.",
        variant: "destructive"
      });
      console.error('Error assigning mediator:', error);
    },
  });

  const handleAssignMediator = () => {
    if (selectedCase && selectedMediatorId) {
      assignMediatorMutation.mutate({
        caseId: selectedCase.id,
        mediatorId: selectedMediatorId
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'filed': return 'bg-red-100 text-red-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'resolved': return 'bg-blue-100 text-blue-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (caseType: string) => {
    switch (caseType) {
      case 'commercial': return 'bg-red-100 text-red-800';
      case 'property': return 'bg-yellow-100 text-yellow-800';
      case 'consumer': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Unassigned Cases</p>
                  <p className="text-2xl font-bold text-gray-900">{unassignedCases.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Available Mediators</p>
                  <p className="text-2xl font-bold text-gray-900">{mediators.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Assignment</p>
                  <p className="text-2xl font-bold text-gray-900">{unassignedCases.filter(c => !c.respondent_id).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Ready for Mediation</p>
                  <p className="text-2xl font-bold text-gray-900">{unassignedCases.filter(c => c.respondent_id).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="unassigned" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="unassigned">Unassigned Cases</TabsTrigger>
            <TabsTrigger value="mediators">Mediators</TabsTrigger>
            <TabsTrigger value="overview">System Overview</TabsTrigger>
          </TabsList>
          
          <TabsContent value="unassigned" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex-1 min-w-64">
                    <Input placeholder="Search cases..." className="w-full" />
                  </div>
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <Button variant="outline">
                    <Search className="h-4 w-4 mr-2" />
                    Advanced Search
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Unassigned Cases List */}
            <div className="grid gap-6">
              {casesLoading ? (
                <div className="text-center py-8">Loading cases...</div>
              ) : unassignedCases.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">All Cases Assigned</h3>
                    <p className="text-gray-600">There are no unassigned cases at the moment.</p>
                  </CardContent>
                </Card>
              ) : (
                unassignedCases.map((caseItem) => (
                  <Card key={caseItem.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl">{caseItem.title}</CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-2">
                            <span>Case ID: {caseItem.case_number}</span>
                            <Badge variant="outline">{caseItem.case_type}</Badge>
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Badge className={getPriorityColor(caseItem.case_type)}>
                            {caseItem.case_type}
                          </Badge>
                          <Badge className={getStatusColor(caseItem.status)}>
                            {caseItem.status}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Claimant</p>
                            <p className="font-semibold">{caseItem.claimant_name}</p>
                            <p className="text-xs text-gray-500">{caseItem.claimant_email}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Respondent</p>
                            <p className="font-semibold">{caseItem.respondent_name}</p>
                            <p className="text-xs text-gray-500">{caseItem.respondent_email}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Amount</p>
                            <p className="font-semibold">
                              {caseItem.amount_in_dispute 
                                ? `${caseItem.currency} ${Number(caseItem.amount_in_dispute).toLocaleString()}`
                                : 'Not specified'
                              }
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Filed</p>
                            <p className="font-semibold">{new Date(caseItem.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-700">{caseItem.description}</p>
                        </div>
                        
                        <div className="flex gap-2 pt-4 border-t">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                size="sm" 
                                className="bg-blue-600 hover:bg-blue-700"
                                onClick={() => setSelectedCase(caseItem)}
                              >
                                <UserPlus className="h-4 w-4 mr-2" />
                                Assign Mediator
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Assign Mediator to Case</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <h4 className="font-semibold">{selectedCase?.title}</h4>
                                  <p className="text-sm text-gray-600">Case ID: {selectedCase?.case_number}</p>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium mb-2">Select Mediator</label>
                                  <Select value={selectedMediatorId} onValueChange={setSelectedMediatorId}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Choose a mediator" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {mediators.map((mediator) => (
                                        <SelectItem key={mediator.id} value={mediator.id}>
                                          {mediator.first_name} {mediator.last_name} ({mediator.email})
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="flex gap-2 pt-4">
                                  <Button 
                                    onClick={handleAssignMediator}
                                    disabled={!selectedMediatorId || assignMediatorMutation.isPending}
                                    className="flex-1"
                                  >
                                    {assignMediatorMutation.isPending ? 'Assigning...' : 'Assign Mediator'}
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button variant="outline" size="sm">
                            <FileText className="h-4 w-4 mr-2" />
                            Documents
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="mediators" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Mediator Panel</h2>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Mediator
              </Button>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mediators.map((mediator) => (
                <Card key={mediator.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{mediator.first_name} {mediator.last_name}</CardTitle>
                        <CardDescription>{mediator.email}</CardDescription>
                      </div>
                      <Badge variant="default">Available</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex gap-2 pt-3 border-t">
                        <Button variant="outline" size="sm">
                          View Profile
                        </Button>
                        <Button variant="outline" size="sm">
                          View Cases
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>System Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Platform Status</span>
                      <Badge className="bg-green-100 text-green-800">Operational</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Database</span>
                      <Badge className="bg-green-100 text-green-800">Connected</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Authentication</span>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span>New cases filed today</span>
                      <span className="font-semibold">3</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cases assigned today</span>
                      <span className="font-semibold">2</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Active mediations</span>
                      <span className="font-semibold">7</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
