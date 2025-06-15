
import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getMessagesForCase, sendMessage, Message } from '@/services/messagingService';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Participants = { [key: string]: Profile };

interface MessagingPaneProps {
  caseId: string;
  userId: string;
  participants: Participants;
}

const MessagingPane = ({ caseId, userId, participants }: MessagingPaneProps) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const queryKey = ['messages', caseId];

  const { data: messages = [], isLoading: isLoadingMessages } = useQuery({
    queryKey,
    queryFn: () => getMessagesForCase(caseId),
  });

  const { mutate: doSendMessage, isPending: isSendingMessage } = useMutation({
    mutationFn: (content: string) => sendMessage({ caseId, senderId: userId, content }),
    onSuccess: () => {
      // Real-time update will refresh the list
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  });

  useEffect(() => {
    const channel = supabase
      .channel(`case-messages-${caseId}`)
      .on<Message>(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'case_messages', filter: `case_id=eq.${caseId}` },
        (payload) => {
          queryClient.setQueryData(queryKey, (oldData: Message[] | undefined) => {
            const newData = oldData ? [...oldData, payload.new as Message] : [payload.new as Message];
            return newData;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [caseId, queryClient, queryKey]);

  return (
    <Card className="flex flex-col h-[500px]">
      <CardHeader>
        <CardTitle className="flex items-center"><MessageSquare className="h-5 w-5 mr-2" /> Messaging</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        {isLoadingMessages ? (
           <div className="flex-1 flex items-center justify-center">Loading messages...</div>
        ) : (
          <MessageList messages={messages} userId={userId} participants={participants} />
        )}
        <MessageInput onSendMessage={doSendMessage} isLoading={isSendingMessage} />
      </CardContent>
    </Card>
  );
};

export default MessagingPane;
