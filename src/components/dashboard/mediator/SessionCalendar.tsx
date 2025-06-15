
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Clock, MapPin, Video } from 'lucide-react';
import { format, isSameDay } from 'date-fns';
import { getSessionsForCase } from '@/services/sessionService';
import { Database } from '@/integrations/supabase/types';

type SessionRow = Database['public']['Tables']['case_sessions']['Row'];

interface SessionCalendarProps {
  caseId: string;
}

const SessionCalendar = ({ caseId }: SessionCalendarProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['case-sessions', caseId],
    queryFn: () => getSessionsForCase(caseId),
  });

  const sessionsOnSelectedDate = selectedDate
    ? sessions.filter(session => 
        isSameDay(new Date(session.scheduled_at), selectedDate)
      )
    : [];

  const getSessionDates = (): Date[] => {
    return sessions.map(session => new Date(session.scheduled_at));
  };

  const hasSessionOnDate = (date: Date): boolean => {
    return sessions.some(session => 
      isSameDay(new Date(session.scheduled_at), date)
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading calendar...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CalendarIcon className="h-5 w-5 mr-2" />
          Session Calendar
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
              modifiers={{
                hasSession: (date) => hasSessionOnDate(date)
              }}
              modifiersStyles={{
                hasSession: {
                  backgroundColor: '#dbeafe',
                  color: '#1d4ed8',
                  fontWeight: 'bold'
                }
              }}
            />
            <div className="mt-2 text-xs text-gray-500">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
                <span>Days with scheduled sessions</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">
              {selectedDate ? format(selectedDate, 'EEEE, MMMM d, yyyy') : 'Select a date'}
            </h3>
            
            {sessionsOnSelectedDate.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CalendarIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No sessions scheduled for this date</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sessionsOnSelectedDate.map((session) => (
                  <SessionPreview key={session.id} session={session} />
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface SessionPreviewProps {
  session: SessionRow;
}

const SessionPreview = ({ session }: SessionPreviewProps) => {
  const sessionDate = new Date(session.scheduled_at);

  return (
    <div className="border rounded-lg p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {session.meeting_link ? (
            <Video className="h-4 w-4 text-blue-600" />
          ) : (
            <MapPin className="h-4 w-4 text-green-600" />
          )}
          <span className="font-medium text-sm">
            {session.meeting_link ? 'Video Call' : 'In-Person'}
          </span>
        </div>
        <Badge variant="outline" className="text-xs">
          {session.status}
        </Badge>
      </div>

      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <Clock className="h-3 w-3" />
        <span>{format(sessionDate, 'p')} ({session.duration_minutes} min)</span>
      </div>

      {session.location && (
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <MapPin className="h-3 w-3" />
          <span className="truncate">{session.location}</span>
        </div>
      )}
    </div>
  );
};

export default SessionCalendar;
