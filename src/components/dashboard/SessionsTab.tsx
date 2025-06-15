
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Plus, Clock, Video } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SessionsTab = () => {
  const navigate = useNavigate();

  // Placeholder data - will be replaced with real data later
  const upcomingSessions = [
    {
      id: '1',
      caseTitle: 'Contract Dispute - ABC Corp',
      scheduledDate: '2024-06-16',
      scheduledTime: '10:00 AM',
      type: 'Mediation Session',
      status: 'confirmed'
    },
    {
      id: '2',
      caseTitle: 'Payment Dispute - XYZ Ltd',
      scheduledDate: '2024-06-18',
      scheduledTime: '2:00 PM',
      type: 'Initial Conference',
      status: 'pending'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Upcoming Sessions</h2>
          <p className="text-gray-600">Manage your scheduled mediation sessions</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Schedule Session
        </Button>
      </div>

      {upcomingSessions.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Upcoming Sessions</h3>
            <p className="text-gray-600 mb-6">Schedule your first mediation session to get started</p>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Schedule Session
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {upcomingSessions.map((session) => (
            <Card key={session.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {session.caseTitle}
                    </h3>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{session.scheduledDate}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{session.scheduledTime}</span>
                      </div>
                      <div>
                        <span className="font-medium">{session.type}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button variant="outline" size="sm">
                      <Calendar className="h-4 w-4 mr-2" />
                      Reschedule
                    </Button>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      <Video className="h-4 w-4 mr-2" />
                      Join Session
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SessionsTab;
