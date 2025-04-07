
import { forwardRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ChatMessage as ChatMessageType } from '@/types/chat';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface ChatMessageProps {
  message: ChatMessageType;
}

export const ChatMessage = forwardRef<HTMLDivElement, ChatMessageProps>(
  ({ message }, ref) => {
    const { user } = useAuth();
    const isOwn = message.sender_id === user?.id;
    
    // Format timestamp
    const formattedTime = format(
      new Date(message.created_at),
      'h:mm a'
    );
    
    const formattedDate = format(
      new Date(message.created_at),
      'MMM d, yyyy'
    );

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-end space-x-2 mb-4",
          isOwn ? "flex-row-reverse space-x-reverse" : ""
        )}
      >
        {!isOwn && (
          <Avatar className="h-8 w-8">
            <AvatarImage src={message.sender_avatar || '/placeholder.svg'} alt="Avatar" />
            <AvatarFallback>
              {message.sender_name?.substring(0, 2).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
        )}
        
        <div className={cn(
          "max-w-[70%]",
          isOwn ? "items-end" : "items-start"
        )}>
          <div className={cn(
            "rounded-lg px-4 py-2 break-words",
            isOwn 
              ? "bg-brand-500 text-white" 
              : "bg-muted"
          )}>
            {message.content}
          </div>
          <div className={cn(
            "text-xs text-muted-foreground mt-1",
            isOwn ? "text-right" : "text-left"
          )}>
            {formattedTime} • {formattedDate}
          </div>
        </div>
      </div>
    );
  }
);

ChatMessage.displayName = "ChatMessage";
