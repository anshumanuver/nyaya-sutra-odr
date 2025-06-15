
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
  console.log('🔍 Fetching cases for mediator:', mediatorId);
  
  // First, get the cases assigned to this mediator
  const { data: cases, error: casesError } = await supabase
    .from('cases')
    .select('*')
    .eq('mediator_id', mediatorId);

  if (casesError) {
    console.error('❌ Error fetching cases:', casesError);
    throw casesError;
  }

  if (!cases || cases.length === 0) {
    console.log('📋 No cases found for mediator');
    return [];
  }

  // Get all unique participant IDs
  const claimantIds = cases.map(c => c.claimant_id).filter(Boolean);
  const respondentIds = cases.map(c => c.respondent_id).filter(Boolean);
  const allParticipantIds = [...new Set([...claimantIds, ...respondentIds])];

  // Fetch all participants in one query
  const { data: participants, error: participantsError } = await supabase
    .from('profiles')
    .select('*')
    .in('id', allParticipantIds);

  if (participantsError) {
    console.error('❌ Error fetching participants:', participantsError);
    throw participantsError;
  }

  // Fetch all case sessions for these cases
  const caseIds = cases.map(c => c.id);
  const { data: sessions, error: sessionsError } = await supabase
    .from('case_sessions')
    .select('*')
    .in('case_id', caseIds);

  if (sessionsError) {
    console.error('❌ Error fetching sessions:', sessionsError);
    throw sessionsError;
  }

  // Create participant lookup map
  const participantMap = new Map();
  participants?.forEach(participant => {
    participantMap.set(participant.id, participant);
  });

  // Create sessions lookup map
  const sessionsMap = new Map();
  sessions?.forEach(session => {
    if (!sessionsMap.has(session.case_id)) {
      sessionsMap.set(session.case_id, []);
    }
    sessionsMap.get(session.case_id).push(session);
  });

  // Combine the data
  const result = cases.map(caseItem => ({
    ...caseItem,
    claimant: participantMap.get(caseItem.claimant_id) || null,
    respondent: participantMap.get(caseItem.respondent_id) || null,
    case_sessions: sessionsMap.get(caseItem.id) || []
  }));

  console.log('✅ Successfully fetched', result.length, 'cases with participants and sessions');
  return result as CaseWithParticipantsAndSessions[];
};
