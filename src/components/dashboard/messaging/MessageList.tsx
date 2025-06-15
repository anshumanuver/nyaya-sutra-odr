
import React, { useRef, useEffect } from 'react';
import { Message } from '@/services/messagingService';
import MessageBubble from './MessageBubble';
import { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Participants = { [key: string]: Profile };


interface MessageListProps {
  messages: Message[];
  userId: string;
  participants: Participants;
}

const MessageList = ({ messages, userId, participants }: MessageListProps) => {
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 p-4 space-y-4 overflow-y-auto">
      {messages.length === 0 ? (
        <div className="text-center text-gray-500">No messages yet. Start the conversation!</div>
      ) : (
        messages.map(message => (
          <MessageBubble
            key={message.id}
            message={message}
            isOwnMessage={message.sender_id === userId}
            senderProfile={participants[message.sender_id]}
          />
        ))
      )}
      <div ref={endOfMessagesRef} />
    </div>
  );
};

export default MessageList;
