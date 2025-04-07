
import { useState, useRef, useEffect } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { useAuth } from '@/contexts/AuthContext';
import { ChatMessage } from './ChatMessage';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Info } from 'lucide-react';

export const ChatPanel = () => {
  const { activeChat, messages, sendMessage, isLoading } = useChat();
  const { user } = useAuth();
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeChat) return;
    
    sendMessage(messageInput, activeChat.id);
    setMessageInput('');
  };
  
  if (!activeChat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-muted/20">
        <div className="max-w-md space-y-4">
          <Info className="h-12 w-12 mx-auto text-muted-foreground" />
          <h3 className="text-xl font-medium">No chat selected</h3>
          <p className="text-muted-foreground">
            {user?.role === 'client' 
              ? 'Start messaging with Akros Advisory' 
              : 'Select a contact from the sidebar to start messaging'}
          </p>
        </div>
      </div>
    );
  }
  
  const chatName = activeChat.name || 'Unknown';
  
  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Chat header */}
      <div className="p-4 border-b flex items-center">
        <Avatar className="h-10 w-10 mr-3">
          <AvatarImage src={activeChat.avatar} alt={chatName} />
          <AvatarFallback>
            {chatName.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="font-medium">{chatName}</h3>
          <p className="text-xs text-muted-foreground">
            {activeChat.online ? 'Online' : 'Offline'}
          </p>
        </div>
      </div>
      
      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        {isLoading ? (
          <div className="flex justify-center p-4">
            <div className="animate-spin h-6 w-6 border-t-2 border-brand-500 rounded-full"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <Info className="h-10 w-10 mb-2 text-muted-foreground" />
            <h3 className="text-lg font-medium">No messages yet</h3>
            <p className="text-muted-foreground text-sm">
              Start the conversation by sending a message
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map(message => (
              <ChatMessage key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>
      
      {/* Message input */}
      <div className="p-4 border-t">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <Input
            placeholder="Type a message..."
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={!messageInput.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};
