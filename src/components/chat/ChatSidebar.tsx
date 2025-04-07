
import { useState, useEffect } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { useAuth } from '@/contexts/AuthContext';
import { ChatContact } from '@/types/chat';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Search, User } from 'lucide-react';

export const ChatSidebar = () => {
  const { contacts, activeChat, setActiveChat, refreshChatData } = useChat();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter contacts based on search term
  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  useEffect(() => {
    refreshChatData();
  }, []);
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  const isChatActive = (chat: ChatContact) => {
    return activeChat && activeChat.id === chat.id;
  };
  
  const handleChatSelect = (chat: ChatContact) => {
    setActiveChat(chat);
  };
  
  // If user is client, auto-select Akros Advisory if available
  useEffect(() => {
    if (user?.role === 'client' && contacts.length > 0 && !activeChat) {
      // Assuming the first contact for clients is always Akros Advisory
      setActiveChat(contacts[0]);
    }
  }, [contacts, user]);
  
  return (
    <div className="flex flex-col h-full border-r">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Messages</h2>
        </div>
        
        {user?.role !== 'client' && (
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        )}
      </div>
      
      <div className="flex-1 pt-2">
        <ScrollArea className="h-[calc(100vh-220px)]">
          <div className="space-y-1 px-2">
            {filteredContacts.map(contact => (
              <Button
                key={contact.id}
                variant={isChatActive(contact) ? "secondary" : "ghost"}
                className="w-full justify-start items-center h-16 px-2"
                onClick={() => handleChatSelect(contact)}
              >
                <div className="flex items-center w-full space-x-2 relative">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={contact.avatar} alt={contact.name} />
                    <AvatarFallback>{getInitials(contact.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium truncate">{contact.name}</p>
                      {contact.unread_count ? (
                        <Badge className="ml-auto">{contact.unread_count}</Badge>
                      ) : null}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {contact.online ? 'Online' : 'Offline'}
                    </p>
                  </div>
                  {contact.online && (
                    <span className="absolute w-2.5 h-2.5 bg-green-500 rounded-full top-0 left-8 border border-background"></span>
                  )}
                </div>
              </Button>
            ))}
            {filteredContacts.length === 0 && (
              <div className="p-4 text-center text-muted-foreground">
                No contacts found
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
