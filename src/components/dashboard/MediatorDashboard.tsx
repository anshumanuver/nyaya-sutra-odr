
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Scale, 
  Clock, 
  Users, 
  Calendar,
  FileText,
  MessageSquare,
  Video,
  CheckCircle,
  AlertTriangle,
  Star
} from 'lucide-react';

const MediatorDashboard = () => {
  const [assignments] = useState([
    {
      id: 'ODR-2024-001',
      title: 'Contract Dispute - ABC Services',
      type: 'Commercial',
      mode: 'mediation',
      status: 'active',
      parties: ['ABC Corp', 'XYZ Ltd'],
      amount: '₹5,00,000',
      nextSession: '2024-01-15 10:00 AM',
      sessionType: 'video',
      priority: 'high'
    },
    {
      id: 'ODR-2024-002',
      title: 'Property Dispute - XYZ Colony', 
      type: 'Property',
      mode: 'arbitration',
      status: 'scheduled',
      parties: ['Sharma Family', 'Kumar Family'],
      amount: '₹25,00,000',
      nextSession: '2024-01-18 2:00 PM',
      sessionType: 'video',
      priority: 'medium'
    },
    {
      id: 'ODR-2024-003',
      title: 'Consumer Complaint - Tech Corp',
      type: 'Consumer',
      mode: 'mediation',
      status: 'pending_review',
      parties: ['Rajesh Gupta', 'Tech Corp'],
      amount: '₹50,000',
      nextSession: null,
      sessionType: 'chat',
      priority: 'low'
    }
  ]);

  const [profile] = useState({
    name: 'Adv. Priya Sharma',
    specialization: 'Commercial & Property Disputes',
    experience: '12 years',
    rating: 4.8,
    totalCases: 145,
    successRate: 92,
    certifications: ['Certified Mediator', 'Arbitrator - High Court Panel']
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'pending_review': return 'bg-yellow-100 text-yellow-800';
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
            <h1 className="text-3xl font-bold text-gray-900">Mediator Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage your assigned cases and sessions</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-sm">
              <Star className="h-4 w-4 mr-1" />
              {profile.rating} Rating
            </Badge>
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Scale className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Cases</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {assignments.filter(a => a.status === 'active').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Review</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {assignments.filter(a => a.status === 'pending_review').length}
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
                  <p className="text-sm font-medium text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{profile.successRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Cases</p>
                  <p className="text-2xl font-bold text-gray-900">{profile.totalCases}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="assignments" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>
          
          <TabsContent value="assignments" className="space-y-6">
            <div className="grid gap-6">
              {assignments.map((assignment) => (
                <Card key={assignment.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{assignment.title}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-2">
                          <span>Case ID: {assignment.id}</span>
                          <Badge variant="outline">{assignment.type}</Badge>
                          <Badge variant="outline" className="capitalize">{assignment.mode}</Badge>
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={getPriorityColor(assignment.priority)}>
                          {assignment.priority}
                        </Badge>
                        <Badge className={getStatusColor(assignment.status)}>
                          {assignment.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Parties</p>
                          <p className="font-semibold">{assignment.parties.join(' vs ')}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Amount</p>
                          <p className="font-semibold">{assignment.amount}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Next Session</p>
                          <p className="font-semibold">{assignment.nextSession || 'Not Scheduled'}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Session Type</p>
                          <p className="font-semibold capitalize">{assignment.sessionType}</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 pt-4 border-t">
                        <Button variant="outline" size="sm">
                          <FileText className="h-4 w-4 mr-2" />
                          Case Details
                        </Button>
                        <Button variant="outline" size="sm">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Messages
                        </Button>
                        <Button variant="outline" size="sm">
                          <Video className="h-4 w-4 mr-2" />
                          Start Session
                        </Button>
                        {assignment.status === 'pending_review' && (
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                            Review & Accept
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
                  <Video className="h-5 w-5 mr-2" />
                  Upcoming Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {assignments.filter(a => a.nextSession).map((assignment) => (
                    <div key={assignment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-semibold">{assignment.title}</h4>
                        <p className="text-sm text-gray-600">{assignment.nextSession}</p>
                        <p className="text-sm text-gray-600">{assignment.parties.join(' vs ')}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Chat
                        </Button>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          <Video className="h-4 w-4 mr-2" />
                          Join
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="calendar">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Session Calendar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Calendar Integration</h3>
                  <p className="text-gray-600 mb-4">Integrated calendar view for session management</p>
                  <Button>Sync Calendar</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="profile">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Professional Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-lg">{profile.name}</h4>
                    <p className="text-gray-600">{profile.specialization}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Experience</span>
                      <span className="font-semibold">{profile.experience}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rating</span>
                      <span className="font-semibold flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 mr-1" />
                        {profile.rating}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Success Rate</span>
                      <span className="font-semibold">{profile.successRate}%</span>
                    </div>
                  </div>
                  <div>
                    <h5 className="font-semibold mb-2">Certifications</h5>
                    <div className="space-y-1">
                      {profile.certifications.map((cert, index) => (
                        <Badge key={index} variant="outline" className="mr-2 mb-1">
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-2">
                        {profile.totalCases}
                      </div>
                      <p className="text-gray-600">Total Cases Handled</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        {profile.successRate}%
                      </div>
                      <p className="text-gray-600">Resolution Success Rate</p>
                    </div>
                    <Button className="w-full" variant="outline">
                      Update Profile
                    </Button>
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

export default MediatorDashboard;
