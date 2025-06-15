
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Video, Edit, Trash2, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { getSessionsForCase, cancelSession } from '@/services/sessionService';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type SessionRow = Database['public']['Tables']['case_sessions']['Row'];

interface SessionManagerProps {
  caseId: string;
}

const SessionManager = ({ caseId }: SessionManagerProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['case-sessions', caseId],
    queryFn: () => getSessionsForCase(caseId),
  });

  const cancelSessionMutation = useMutation({
    mutationFn: cancelSession,
    onSuccess: () => {
      toast({
        title: "Session Cancelled",
        description: "The session has been cancelled successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['case-sessions', caseId] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to cancel session. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleCancelSession = (sessionId: string) => {
    if (confirm('Are you sure you want to cancel this session?')) {
      cancelSessionMutation.mutate(sessionId);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading sessions...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          Scheduled Sessions
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sessions.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Sessions Scheduled</h3>
            <p className="text-gray-600">Schedule your first session using the form above</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <SessionCard 
                key={session.id} 
                session={session} 
                onCancel={handleCancelSession}
                isLoading={cancelSessionMutation.isPending}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface SessionCardProps {
  session: SessionRow;
  onCancel: (sessionId: string) => void;
  isLoading: boolean;
}

const SessionCard = ({ session, onCancel, isLoading }: SessionCardProps) => {
  const sessionDate = new Date(session.scheduled_at);
  const isUpcoming = sessionDate > new Date();
  const canCancel = session.status === 'scheduled' && isUpcoming;

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {session.meeting_link ? (
            <Video className="h-4 w-4 text-blue-600" />
          ) : (
            <MapPin className="h-4 w-4 text-green-600" />
          )}
          <span className="font-medium">
            {session.meeting_link ? 'Video Conference' : 'In-Person Meeting'}
          </span>
        </div>
        <Badge className={getStatusColor(session.status)}>
          {session.status.replace('_', ' ').toUpperCase()}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span>{format(sessionDate, 'PPP')}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-gray-500" />
          <span>{format(sessionDate, 'p')} ({session.duration_minutes} min)</span>
        </div>
      </div>

      {session.location && (
        <div className="flex items-center space-x-2 text-sm">
          <MapPin className="h-4 w-4 text-gray-500" />
          <span>{session.location}</span>
        </div>
      )}

      {session.notes && (
        <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
          <strong>Notes:</strong> {session.notes}
        </div>
      )}

      <div className="flex justify-between items-center pt-2 border-t">
        <div className="flex space-x-2">
          {session.meeting_link && (
            <Button variant="outline" size="sm" asChild>
              <a href={session.meeting_link} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-1" />
                Join Meeting
              </a>
            </Button>
          )}
        </div>
        
        <div className="flex space-x-2">
          {canCancel && (
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => onCancel(session.id)}
              disabled={isLoading}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Cancel
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SessionManager;
