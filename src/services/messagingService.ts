
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

export type Message = Database['public']['Tables']['case_messages']['Row'];

export const getMessagesForCase = async (caseId: string): Promise<Message[]> => {
  const { data, error } = await supabase
    .from('case_messages')
    .select('*')
    .eq('case_id', caseId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }

  return data;
};

export const sendMessage = async ({ caseId, senderId, content }: { caseId: string; senderId: string; content: string }) => {
  const { data, error } = await supabase
    .from('case_messages')
    .insert([
      { case_id: caseId, sender_id: senderId, content, message_type: 'text' }
    ])
    .select();

  if (error) {
    console.error('Error sending message:', error);
    throw error;
  }

  return data;
};
