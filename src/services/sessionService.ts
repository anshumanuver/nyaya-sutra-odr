
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type SessionInsert = Database['public']['Tables']['case_sessions']['Insert'];
type SessionRow = Database['public']['Tables']['case_sessions']['Row'];

export interface SessionData {
  caseId: string;
  scheduledAt: Date;
  sessionType: 'video' | 'in-person';
  duration: number;
  location?: string;
}

export const generateMeetingLink = (): string => {
  const roomId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  return `https://meet.lovable.com/room/${roomId}`;
};

export const createSession = async (sessionData: SessionData): Promise<SessionRow> => {
  const insertData: SessionInsert = {
    case_id: sessionData.caseId,
    scheduled_at: sessionData.scheduledAt.toISOString(),
    session_type: sessionData.sessionType === 'video' ? 'mediation' : 'mediation', // Map to allowed values
    duration_minutes: sessionData.duration,
    location: sessionData.location,
    meeting_link: sessionData.sessionType === 'video' ? generateMeetingLink() : null,
    status: 'scheduled'
  };

  const { data, error } = await supabase
    .from('case_sessions')
    .insert(insertData)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getSessionsForCase = async (caseId: string): Promise<SessionRow[]> => {
  const { data, error } = await supabase
    .from('case_sessions')
    .select('*')
    .eq('case_id', caseId)
    .order('scheduled_at', { ascending: true });

  if (error) throw error;
  return data || [];
};

export const updateSession = async (sessionId: string, updates: Partial<SessionInsert>): Promise<SessionRow> => {
  const { data, error } = await supabase
    .from('case_sessions')
    .update(updates)
    .eq('id', sessionId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const cancelSession = async (sessionId: string): Promise<void> => {
  const { error } = await supabase
    .from('case_sessions')
    .update({ status: 'cancelled' })
    .eq('id', sessionId);

  if (error) throw error;
};

export const getAllUpcomingSessions = async (): Promise<SessionRow[]> => {
  const { data, error } = await supabase
    .from('case_sessions')
    .select('*')
    .gte('scheduled_at', new Date().toISOString())
    .in('status', ['scheduled', 'in_progress'])
    .order('scheduled_at', { ascending: true });

  if (error) throw error;
  return data || [];
};
