
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  BarChart3, 
  Users, 
  Scale, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  FileText,
  Settings,
  UserPlus,
  Filter,
  Search,
  Download,
  Eye
} from 'lucide-react';

const AdminDashboard = () => {
  const [cases] = useState([
    {
      id: 'ODR-2024-001',
      title: 'Contract Dispute - ABC Services',
      claimant: 'ABC Corp',
      respondent: 'XYZ Ltd',
      mediator: 'Adv. Priya Sharma',
      status: 'active',
      type: 'Commercial',
      amount: '₹5,00,000',
      filed: '2024-01-01',
      priority: 'high'
    },
    {
      id: 'ODR-2024-002',
      title: 'Property Dispute - XYZ Colony',
      claimant: 'Sharma Family',
      respondent: 'Kumar Family', 
      mediator: 'Arb. Rajesh Kumar',
      status: 'arbitration',
      type: 'Property',
      amount: '₹25,00,000',
      filed: '2023-12-15',
      priority: 'medium'
    },
    {
      id: 'ODR-2024-003',
      title: 'Consumer Complaint - Tech Corp',
      claimant: 'Rajesh Gupta',
      respondent: 'Tech Corp',
      mediator: 'Unassigned',
      status: 'pending_assignment',
      type: 'Consumer',
      amount: '₹50,000',
      filed: '2024-01-10',
      priority: 'high'
    }
  ]);

  const [neutrals] = useState([
    {
      id: 1,
      name: 'Adv. Priya Sharma',
      specialization: 'Commercial & Property',
      experience: '12 years',
      rating: 4.8,
      activeCases: 3,
      status: 'available'
    },
    {
      id: 2,
      name: 'Arb. Rajesh Kumar',
      specialization: 'Property & Family',
      experience: '15 years',
      rating: 4.6,
      activeCases: 2,
      status: 'busy'
    },
    {
      id: 3,
      name: 'Adv. Meera Patel',
      specialization: 'Consumer & Civil',
      experience: '8 years',
      rating: 4.9,
      activeCases: 1,
      status: 'available'
    }
  ]);

  const [stats] = useState({
    totalCases: 156,
    activeCases: 45,
    resolvedCases: 111,
    avgResolutionTime: 42,
    totalNeutrals: 25,
    availableNeutrals: 18,
    pendingAssignments: 8,
    monthlyResolutions: 23
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_assignment': return 'bg-red-100 text-red-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'arbitration': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
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
            <p className="text-gray-600 mt-1">Platform management and oversight</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Cases</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalCases}</p>
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
                  <p className="text-2xl font-bold text-gray-900">{stats.activeCases}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Resolved Cases</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.resolvedCases}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Assignments</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingAssignments}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="cases" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="cases">Case Management</TabsTrigger>
            <TabsTrigger value="neutrals">Neutral Panel</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>
          
          <TabsContent value="cases" className="space-y-6">
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

            {/* Cases List */}
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
                      <div className="flex gap-2">
                        <Badge className={getPriorityColor(case_item.priority)}>
                          {case_item.priority}
                        </Badge>
                        <Badge className={getStatusColor(case_item.status)}>
                          {case_item.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Claimant</p>
                          <p className="font-semibold">{case_item.claimant}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Respondent</p>
                          <p className="font-semibold">{case_item.respondent}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Mediator</p>
                          <p className="font-semibold">{case_item.mediator}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Amount</p>
                          <p className="font-semibold">{case_item.amount}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Filed</p>
                          <p className="font-semibold">{case_item.filed}</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 pt-4 border-t">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        {case_item.status === 'pending_assignment' && (
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                            <UserPlus className="h-4 w-4 mr-2" />
                            Assign Mediator
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          <FileText className="h-4 w-4 mr-2" />
                          Documents
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="neutrals" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Neutral Panel Management</h2>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Neutral
              </Button>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {neutrals.map((neutral) => (
                <Card key={neutral.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{neutral.name}</CardTitle>
                        <CardDescription>{neutral.specialization}</CardDescription>
                      </div>
                      <Badge variant={neutral.status === 'available' ? 'default' : 'secondary'}>
                        {neutral.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Experience</p>
                          <p className="font-semibold">{neutral.experience}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Rating</p>
                          <p className="font-semibold">⭐ {neutral.rating}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Active Cases</p>
                          <p className="font-semibold">{neutral.activeCases}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Status</p>
                          <p className="font-semibold capitalize">{neutral.status}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-3 border-t">
                        <Button variant="outline" size="sm">
                          View Profile
                        </Button>
                        <Button variant="outline" size="sm">
                          Assign Case
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Resolution Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Average Resolution Time</span>
                      <span className="font-bold text-2xl">{stats.avgResolutionTime} days</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Monthly Resolutions</span>
                      <span className="font-bold text-2xl">{stats.monthlyResolutions}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Success Rate</span>
                      <span className="font-bold text-2xl">89%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Platform Usage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Users</span>
                      <span className="font-bold text-2xl">1,234</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Active Users</span>
                      <span className="font-bold text-2xl">456</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">New Registrations</span>
                      <span className="font-bold text-2xl">23</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="system" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>System Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="h-4 w-4 mr-2" />
                    Platform Settings
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    User Management
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Document Templates
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Scale className="h-4 w-4 mr-2" />
                    Compliance Settings
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>System Health</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">System Status</span>
                      <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Database</span>
                      <Badge className="bg-green-100 text-green-800">Connected</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Payment Gateway</span>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Video Service</span>
                      <Badge className="bg-green-100 text-green-800">Online</Badge>
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
