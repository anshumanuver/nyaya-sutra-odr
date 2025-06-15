
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type CaseRow = Database['public']['Tables']['cases']['Row'];
type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type SessionRow = Database['public']['Tables']['case_sessions']['Row'];

export type CaseWithParticipantsAndSessions = CaseRow & {
  claimant: ProfileRow;
  respondent: ProfileRow;
  case_sessions: SessionRow[];
};

export const getAssignedCasesForMediator = async (mediatorId: string): Promise<CaseWithParticipantsAndSessions[]> => {
  const { data, error } = await supabase
    .from('cases')
    .select(`
      *,
      claimant:claimant_id (*),
      respondent:respondent_id (*),
      case_sessions (*)
    `)
    .eq('mediator_id', mediatorId);

  if (error) {
    console.error('Error fetching assigned cases:', error);
    throw error;
  }

  return data as unknown as CaseWithParticipantsAndSessions[];
};
