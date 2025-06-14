import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  Users, 
  Calendar,
  MessageSquare,
  Download,
  Eye,
  Loader2,
  UserPlus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import CaseCodeCard from '@/components/case/CaseCodeCard';

interface Case {
  id: string;
  case_number: string;
  title: string;
  case_type: string;
  status: string;
  amount_in_dispute: number | null;
  currency: string | null;
  created_at: string;
  updated_at: string | null;
  dispute_mode: string;
  description: string;
  case_code: string | null;
  respondent_id: string | null;
}

const ClaimantDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: cases = [], isLoading, error } = useQuery({
    queryKey: ['claimant-cases', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('No user ID');
      
      const { data, error } = await supabase
        .from('cases')
        .select('*')
        .eq('claimant_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching cases:', error);
        throw error;
      }

      return data as Case[];
    },
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (error) {
      toast({
        title: "Error Loading Cases",
        description: "Failed to load your cases. Please try refreshing the page.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'filed': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'mediation': return 'bg-purple-100 text-purple-800';
      case 'arbitration': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'filed': return <FileText className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'mediation': return <Users className="h-4 w-4" />;
      case 'arbitration': return <AlertCircle className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'closed': return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusProgress = (status: string) => {
    switch (status) {
      case 'filed': return 20;
      case 'pending': return 30;
      case 'mediation': return 60;
      case 'arbitration': return 80;
      case 'completed': return 100;
      case 'closed': return 100;
      default: return 0;
    }
  };

  const formatCurrency = (amount: number | null, currency: string | null) => {
    if (!amount) return 'N/A';
    const currencySymbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '₹';
    return `${currencySymbol}${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const activeCases = cases.filter(c => !['completed', 'closed'].includes(c.status));
  const resolvedCases = cases.filter(c => ['completed', 'closed'].includes(c.status));
  const casesAwaitingRespondent = cases.filter(c => !c.respondent_id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading your cases...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Claimant Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage your dispute resolution cases</p>
          </div>
          <Button onClick={() => navigate('/case/new')} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            File New Case
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Cases</p>
                  <p className="text-2xl font-bold text-gray-900">{cases.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Cases</p>
                  <p className="text-2xl font-bold text-gray-900">{activeCases.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Resolved</p>
                  <p className="text-2xl font-bold text-gray-900">{resolvedCases.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <UserPlus className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Awaiting Respondent</p>
                  <p className="text-2xl font-bold text-gray-900">{casesAwaitingRespondent.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="cases" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="cases">My Cases</TabsTrigger>
            <TabsTrigger value="sessions">Upcoming Sessions</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>
          
          <TabsContent value="cases" className="space-y-6">
            {cases.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Cases Filed Yet</h3>
                  <p className="text-gray-600 mb-6">File your first dispute case to get started with online resolution</p>
                  <Button onClick={() => navigate('/case/new')} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    File Your First Case
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {cases.map((case_item) => (
                  <div key={case_item.id} className="space-y-4">
                    <Card className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-xl">{case_item.title}</CardTitle>
                            <CardDescription className="flex items-center gap-2 mt-2">
                              <span>Case ID: {case_item.case_number}</span>
                              <Badge variant="outline" className="capitalize">{case_item.case_type}</Badge>
                            </CardDescription>
                          </div>
                          <Badge className={getStatusColor(case_item.status)}>
                            {getStatusIcon(case_item.status)}
                            <span className="ml-1 capitalize">{case_item.status}</span>
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{getStatusProgress(case_item.status)}%</span>
                          </div>
                          <Progress value={getStatusProgress(case_item.status)} className="w-full" />
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">Amount</p>
                              <p className="font-semibold">
                                {formatCurrency(case_item.amount_in_dispute, case_item.currency)}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600">Resolution Method</p>
                              <p className="font-semibold capitalize">{case_item.dispute_mode}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Respondent</p>
                              <p className="font-semibold">
                                {case_item.respondent_id ? 'Joined' : 'Waiting to join'}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600">Filed</p>
                              <p className="font-semibold">{formatDate(case_item.created_at)}</p>
                            </div>
                          </div>
                          
                          <div className="flex gap-2 pt-4 border-t">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                            <Button variant="outline" size="sm">
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Messages
                            </Button>
                            <Button variant="outline" size="sm">
                              <FileText className="h-4 w-4 mr-2" />
                              Documents
                            </Button>
                            {['completed', 'closed'].includes(case_item.status) && (
                              <Button variant="outline" size="sm">
                                <Download className="h-4 w-4 mr-2" />
                                Download Result
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    {/* Show case code card if no respondent has joined */}
                    {!case_item.respondent_id && case_item.case_code && (
                      <CaseCodeCard 
                        caseCode={case_item.case_code}
                        caseNumber={case_item.case_number}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="sessions">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Upcoming Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Scheduled Sessions</h3>
                  <p className="text-gray-600">Sessions will appear here once scheduled by mediators or arbitrators</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Document Vault
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Documents Yet</h3>
                  <p className="text-gray-600 mb-4">Upload case documents and evidence here</p>
                  <Button>Upload Documents</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ClaimantDashboard;
