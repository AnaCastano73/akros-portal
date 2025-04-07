
import { useEffect } from 'react';
import { ChatProvider } from '@/contexts/ChatContext';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { ChatPanel } from '@/components/chat/ChatPanel';

const Chat = () => {
  useEffect(() => {
    document.title = 'Chat - Healthwise Advisory Hub';
  }, []);

  return (
    <ChatProvider>
      <div className="h-[calc(100vh-16rem)] min-h-[400px] flex flex-col space-y-4">
        <h1 className="text-3xl font-bold tracking-tight font-heading">Messages</h1>
        <div className="flex-1 flex overflow-hidden border rounded-lg">
          <div className="w-80 border-r">
            <ChatSidebar />
          </div>
          <div className="flex-1">
            <ChatPanel />
          </div>
        </div>
      </div>
    </ChatProvider>
  );
};

export default Chat;
