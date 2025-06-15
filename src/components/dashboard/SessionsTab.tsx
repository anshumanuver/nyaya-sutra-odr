
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';

const SessionsTab = () => {
  return (
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
  );
};

export default SessionsTab;
