
import { useState } from 'react';
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
  Eye
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ClaimantDashboard = () => {
  const navigate = useNavigate();
  const [cases] = useState([
    {
      id: 'ODR-2024-001',
      title: 'Contract Dispute - ABC Services',
      type: 'Commercial',
      status: 'mediation',
      progress: 60,
      amount: '₹5,00,000',
      mediator: 'Adv. Priya Sharma',
      nextSession: '2024-01-15 10:00 AM',
      created: '2024-01-01'
    },
    {
      id: 'ODR-2024-002', 
      title: 'Property Dispute - XYZ Colony',
      type: 'Property',
      status: 'arbitration',
      progress: 80,
      amount: '₹25,00,000',
      mediator: 'Arb. Rajesh Kumar',
      nextSession: '2024-01-18 2:00 PM',
      created: '2023-12-15'
    },
    {
      id: 'ODR-2024-003',
      title: 'Consumer Complaint - Tech Corp',
      type: 'Consumer',
      status: 'completed',
      progress: 100,
      amount: '₹50,000',
      mediator: 'Adv. Meera Patel',
      result: 'Settled - ₹35,000',
      created: '2023-11-20'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'mediation': return 'bg-blue-100 text-blue-800';
      case 'arbitration': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'mediation': return <Users className="h-4 w-4" />;
      case 'arbitration': return <AlertCircle className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

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
                  <p className="text-2xl font-bold text-gray-900">
                    {cases.filter(c => c.status !== 'completed').length}
                  </p>
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
                  <p className="text-2xl font-bold text-gray-900">
                    {cases.filter(c => c.status === 'completed').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertCircle className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Action</p>
                  <p className="text-2xl font-bold text-gray-900">1</p>
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
            <div className="grid gap-6">
              {cases.map((case_item) => (
                <Card key={case_item.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{case_item.title}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-2">
                          <span>Case ID: {case_item.id}</span>
                          <Badge variant="outline">{case_item.type}</Badge>
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
                        <span>{case_item.progress}%</span>
                      </div>
                      <Progress value={case_item.progress} className="w-full" />
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Amount</p>
                          <p className="font-semibold">{case_item.amount}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Assigned</p>
                          <p className="font-semibold">{case_item.mediator}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Next Session</p>
                          <p className="font-semibold">
                            {case_item.nextSession || case_item.result || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Filed</p>
                          <p className="font-semibold">{case_item.created}</p>
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
                        {case_item.status === 'completed' && (
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Download Result
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
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
                <div className="space-y-4">
                  {cases.filter(c => c.nextSession).map((case_item) => (
                    <div key={case_item.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-semibold">{case_item.title}</h4>
                        <p className="text-sm text-gray-600">{case_item.nextSession}</p>
                        <p className="text-sm text-gray-600">with {case_item.mediator}</p>
                      </div>
                      <Button variant="outline">Join Session</Button>
                    </div>
                  ))}
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
