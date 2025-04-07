
import { useState, useEffect } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { ChatRoom, ChatContact } from '@/types/chat';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Search, Users, User } from 'lucide-react';
import { CreateRoomDialog } from './CreateRoomDialog';

export const ChatSidebar = () => {
  const { rooms, contacts, activeChat, setActiveChat, refreshChatData } = useChat();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
  
  // Filter rooms and contacts based on search term
  const filteredRooms = rooms.filter(room => 
    room.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
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
  
  const isChatActive = (chat: ChatRoom | ChatContact) => {
    return activeChat && activeChat.id === chat.id;
  };
  
  const handleChatSelect = (chat: ChatRoom | ChatContact) => {
    setActiveChat(chat);
  };
  
  return (
    <div className="flex flex-col h-full border-r">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Messages</h2>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsCreateRoomOpen(true)}
          >
            <PlusCircle className="h-5 w-5" />
          </Button>
        </div>
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
      </div>
      
      <Tabs defaultValue="direct" className="flex-1 flex flex-col">
        <TabsList className="grid grid-cols-2 mx-4 my-2">
          <TabsTrigger value="direct">
            <User className="mr-2 h-4 w-4" />
            Direct
          </TabsTrigger>
          <TabsTrigger value="rooms">
            <Users className="mr-2 h-4 w-4" />
            Rooms
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="direct" className="flex-1 pt-2">
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
        </TabsContent>
        
        <TabsContent value="rooms" className="flex-1 pt-2">
          <ScrollArea className="h-[calc(100vh-220px)]">
            <div className="space-y-1 px-2">
              {filteredRooms.map(room => (
                <Button
                  key={room.id}
                  variant={isChatActive(room) ? "secondary" : "ghost"}
                  className="w-full justify-start items-center h-16 px-2"
                  onClick={() => handleChatSelect(room)}
                >
                  <div className="flex items-center w-full space-x-2">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{getInitials(room.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium truncate">{room.name}</p>
                        {room.last_message && !room.last_message.read ? (
                          <Badge className="ml-auto">New</Badge>
                        ) : null}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {room.members?.length || 0} members
                      </p>
                    </div>
                  </div>
                </Button>
              ))}
              {filteredRooms.length === 0 && (
                <div className="p-4 text-center text-muted-foreground">
                  No rooms found
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
      
      <CreateRoomDialog
        isOpen={isCreateRoomOpen}
        onClose={() => setIsCreateRoomOpen(false)}
      />
    </div>
  );
};
