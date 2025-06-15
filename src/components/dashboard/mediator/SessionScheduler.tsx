
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Clock, Video, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { createSession, SessionData } from '@/services/sessionService';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface SessionSchedulerProps {
  caseId: string;
  onSchedule?: (sessionData: any) => void;
}

const SessionScheduler = ({ caseId, onSchedule }: SessionSchedulerProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState('');
  const [sessionType, setSessionType] = useState<'video' | 'in-person' | ''>('');
  const [duration, setDuration] = useState('120');
  const [location, setLocation] = useState('');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createSessionMutation = useMutation({
    mutationFn: createSession,
    onSuccess: (data) => {
      toast({
        title: "Session Scheduled",
        description: `Session scheduled for ${format(new Date(data.scheduled_at), 'PPP')} at ${format(new Date(data.scheduled_at), 'p')}`,
      });
      
      // Reset form
      setSelectedDate(undefined);
      setSelectedTime('');
      setSessionType('');
      setDuration('120');
      setLocation('');
      
      // Invalidate queries to refresh session lists
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['case-sessions', caseId] });
      
      if (onSchedule) {
        onSchedule(data);
      }
    },
    onError: (error) => {
      console.error('Failed to schedule session:', error);
      toast({
        title: "Error",
        description: "Failed to schedule session. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSchedule = () => {
    if (!selectedDate || !selectedTime || !sessionType) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (sessionType === 'in-person' && !location) {
      toast({
        title: "Missing Location",
        description: "Please specify a location for in-person sessions.",
        variant: "destructive",
      });
      return;
    }

    const sessionData: SessionData = {
      caseId,
      scheduledAt: new Date(`${format(selectedDate, 'yyyy-MM-dd')}T${selectedTime}`),
      sessionType,
      duration: parseInt(duration),
      location: sessionType === 'in-person' ? location : undefined,
    };

    createSessionMutation.mutate(sessionData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CalendarIcon className="h-5 w-5 mr-2" />
          Schedule Session
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div>
            <Label>Time</Label>
            <Input
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label>Session Type</Label>
          <Select value={sessionType} onValueChange={(value) => setSessionType(value as 'video' | 'in-person')}>
            <SelectTrigger>
              <SelectValue placeholder="Select session type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="video">
                <div className="flex items-center">
                  <Video className="h-4 w-4 mr-2" />
                  Video Conference
                </div>
              </SelectItem>
              <SelectItem value="in-person">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  In Person
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Duration (minutes)</Label>
          <Select value={duration} onValueChange={setDuration}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="60">1 hour</SelectItem>
              <SelectItem value="90">1.5 hours</SelectItem>
              <SelectItem value="120">2 hours</SelectItem>
              <SelectItem value="180">3 hours</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {sessionType === 'in-person' && (
          <div>
            <Label>Location</Label>
            <Input
              placeholder="Enter meeting location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
        )}

        <Button 
          onClick={handleSchedule} 
          className="w-full"
          disabled={!selectedDate || !selectedTime || !sessionType || createSessionMutation.isPending}
        >
          <Clock className="h-4 w-4 mr-2" />
          {createSessionMutation.isPending ? 'Scheduling...' : 'Schedule Session'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SessionScheduler;
