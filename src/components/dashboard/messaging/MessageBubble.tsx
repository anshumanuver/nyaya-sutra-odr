
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Message } from '@/services/messagingService';
import { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
  senderProfile?: Profile;
}

const MessageBubble = ({ message, isOwnMessage, senderProfile }: MessageBubbleProps) => {
  const senderName = senderProfile
    ? `${senderProfile.first_name} ${senderProfile.last_name}`
    : 'Unknown User';
  
  const senderRole = senderProfile ? senderProfile.role : 'User';

  return (
    <div className={cn('flex items-end gap-2', isOwnMessage ? 'justify-end' : 'justify-start')}>
      <div className={cn(
        'rounded-lg px-3 py-2 max-w-sm',
        isOwnMessage ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-900'
      )}>
        {!isOwnMessage && (
          <p className="text-xs font-semibold text-gray-600 capitalize">{senderName} ({senderRole})</p>
        )}
        <p className="text-sm">{message.content}</p>
        <p className="text-xs text-right opacity-75 mt-1">
          {message.created_at ? format(new Date(message.created_at), 'p') : ''}
        </p>
      </div>
    </div>
  );
};

export default MessageBubble;
