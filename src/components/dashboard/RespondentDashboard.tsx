
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  FileText, 
  Calendar, 
  MessageSquare, 
  Clock, 
  AlertCircle,
  CheckCircle,
  Scale,
  User
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();

  const { data: cases, isLoading, refetch } = useQuery({
    queryKey: ['respondent-cases', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('cases')
        .select(`
          id,
          case_number,
          title,
          case_type,
          dispute_mode,
          amount_in_dispute,
          currency,
          status,
          description,
          created_at,
          claimant_id,
          profiles!cases_claimant_id_fkey(first_name, last_name, email)
        `)
        .eq('respondent_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching respondent cases:', error);
        throw error;
      }

      return data.map(caseItem => ({
        ...caseItem,
        claimant_name: caseItem.profiles 
          ? `${caseItem.profiles.first_name} ${caseItem.profiles.last_name}`
          : 'Unknown Claimant',
        claimant_email: caseItem.profiles?.email || 'Unknown Email'
      }));
    },
    enabled: !!user,
  });

  const formatCurrency = (amount: number | null, currency: string | null) => {
    if (!amount) return 'Not specified';
    const currencySymbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '₹';
    return `${currencySymbol}${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'mediation': return 'bg-blue-100 text-blue-800';
      case 'arbitration': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-orange-100 text-orange-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'mediation': return <Scale className="h-4 w-4" />;
      case 'arbitration': return <Scale className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'closed': return <AlertCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Respondent Dashboard</h1>
          <p className="text-gray-600">Manage your dispute resolution cases as a respondent</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Cases</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{cases?.length || 0}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active Cases</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{activeCases.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{completedCases.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {cases?.filter(c => 
                  new Date(c.created_at).getMonth() === new Date().getMonth()
                ).length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

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
                    <Card key={caseItem.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg mb-1">{caseItem.title}</CardTitle>
                            <CardDescription className="font-mono text-sm">
                              {caseItem.case_number}
                            </CardDescription>
                          </div>
                          <Badge className={`${getStatusColor(caseItem.status)} flex items-center gap-1`}>
                            {getStatusIcon(caseItem.status)}
                            {caseItem.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">Type:</span>
                            <p className="capitalize">{caseItem.case_type}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Mode:</span>
                            <p className="capitalize">{caseItem.dispute_mode}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Amount:</span>
                            <p>{formatCurrency(caseItem.amount_in_dispute, caseItem.currency)}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Filed:</span>
                            <p>{formatDate(caseItem.created_at)}</p>
                          </div>
                        </div>
                        
                        <div className="border-t pt-4">
                          <div className="flex items-center gap-2 mb-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="font-medium text-gray-700">Claimant:</span>
                          </div>
                          <p className="text-sm">{caseItem.claimant_name}</p>
                          <p className="text-sm text-gray-600">{caseItem.claimant_email}</p>
                        </div>

                        <div className="flex gap-2 pt-4 border-t">
                          <Button variant="outline" size="sm" className="flex-1">
                            <FileText className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Messages
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1">
                            <Calendar className="h-4 w-4 mr-2" />
                            Sessions
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
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
                    <Card key={caseItem.id} className="opacity-75 hover:opacity-100 transition-opacity">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg mb-1">{caseItem.title}</CardTitle>
                            <CardDescription className="font-mono text-sm">
                              {caseItem.case_number}
                            </CardDescription>
                          </div>
                          <Badge className={`${getStatusColor(caseItem.status)} flex items-center gap-1`}>
                            {getStatusIcon(caseItem.status)}
                            {caseItem.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">Type:</span>
                            <p className="capitalize">{caseItem.case_type}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Amount:</span>
                            <p>{formatCurrency(caseItem.amount_in_dispute, caseItem.currency)}</p>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 pt-4 border-t">
                          <Button variant="outline" size="sm" className="flex-1">
                            <FileText className="h-4 w-4 mr-2" />
                            View Archive
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="all" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {cases?.map((caseItem) => (
                  <Card key={caseItem.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg mb-1">{caseItem.title}</CardTitle>
                          <CardDescription className="font-mono text-sm">
                            {caseItem.case_number}
                          </CardDescription>
                        </div>
                        <Badge className={`${getStatusColor(caseItem.status)} flex items-center gap-1`}>
                          {getStatusIcon(caseItem.status)}
                          {caseItem.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Type:</span>
                          <p className="capitalize">{caseItem.case_type}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Amount:</span>
                          <p>{formatCurrency(caseItem.amount_in_dispute, caseItem.currency)}</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 pt-4 border-t">
                        <Button variant="outline" size="sm" className="flex-1">
                          <FileText className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
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
