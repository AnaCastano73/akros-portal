
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { ChatMessage, ChatRoom, ChatContact } from '@/types/chat';

interface ChatContextType {
  activeChat: ChatRoom | ChatContact | null;
  setActiveChat: (chat: ChatRoom | ChatContact | null) => void;
  messages: ChatMessage[];
  sendMessage: (content: string, roomId?: string, recipientId?: string) => Promise<void>;
  markAsRead: (messageId: string) => Promise<void>;
  isLoading: boolean;
  rooms: ChatRoom[];
  createRoom: (name: string, memberIds: string[]) => Promise<ChatRoom | null>;
  joinRoom: (roomId: string) => Promise<void>;
  contacts: ChatContact[];
  refreshChatData: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType | null>(null);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [activeChat, setActiveChat] = useState<ChatRoom | ChatContact | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [contacts, setContacts] = useState<ChatContact[]>([]);

  // Load user's chats and rooms on login
  useEffect(() => {
    if (user) {
      refreshChatData();
      subscribeToMessages();
    }
    
    return () => {
      if (user) {
        unsubscribeFromMessages();
      }
    };
  }, [user]);

  // Load messages when active chat changes
  useEffect(() => {
    if (activeChat) {
      loadMessages();
    } else {
      setMessages([]);
    }
  }, [activeChat]);

  const refreshChatData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      // Load rooms
      const { data: roomsData, error: roomsError } = await supabase
        .from('chat_rooms')
        .select(`
          *,
          chat_room_members!inner(user_id)
        `)
        .eq('chat_room_members.user_id', user.id);
        
      if (roomsError) throw roomsError;
      
      // Load contacts (other users the current user has chatted with)
      const { data: messagesData, error: messagesError } = await supabase
        .from('chat_messages')
        .select('*')
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .is('room_id', null)
        .order('created_at', { ascending: false });
        
      if (messagesError) throw messagesError;
      
      // Extract unique user IDs from direct messages
      const contactIds = new Set<string>();
      messagesData.forEach(msg => {
        if (msg.sender_id !== user.id) contactIds.add(msg.sender_id);
        if (msg.recipient_id && msg.recipient_id !== user.id) contactIds.add(msg.recipient_id);
      });
      
      // For a real app, we would fetch user details from a users or profiles table
      // For now, we'll use mock data
      const mockContacts: ChatContact[] = Array.from(contactIds).map(id => ({
        id,
        name: `User ${id.substring(0, 5)}`,
        avatar: '/placeholder.svg',
        online: Math.random() > 0.5,
        unread_count: Math.floor(Math.random() * 5)
      }));
      
      setRooms(roomsData || []);
      setContacts(mockContacts);
    } catch (error) {
      console.error('Error loading chat data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load chat data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async () => {
    if (!user || !activeChat) return;
    
    setIsLoading(true);
    
    try {
      let query = supabase
        .from('chat_messages')
        .select('*')
        .order('created_at', { ascending: true });
        
      if ('room_id' in activeChat && activeChat.id) {
        // Room chat
        query = query.eq('room_id', activeChat.id);
      } else {
        // Direct message
        query = query
          .or(`and(sender_id.eq.${user.id},recipient_id.eq.${activeChat.id}),and(sender_id.eq.${activeChat.id},recipient_id.eq.${user.id})`)
          .is('room_id', null);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      setMessages(data || []);
      
      // Mark messages as read
      const unreadMessages = data?.filter(msg => 
        !msg.read && msg.recipient_id === user.id
      ) || [];
      
      unreadMessages.forEach(msg => markAsRead(msg.id));
      
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to load messages',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (content: string, roomId?: string, recipientId?: string) => {
    if (!user) return;
    if (!content.trim()) return;
    
    try {
      const newMessage: Partial<ChatMessage> = {
        sender_id: user.id,
        content,
        read: false,
      };
      
      if (roomId) {
        newMessage.room_id = roomId;
      } else if (recipientId) {
        newMessage.recipient_id = recipientId;
      } else if (activeChat) {
        if ('room_id' in activeChat) {
          newMessage.room_id = activeChat.id;
        } else {
          newMessage.recipient_id = activeChat.id;
        }
      } else {
        throw new Error('No recipient specified for message');
      }
      
      const { error } = await supabase
        .from('chat_messages')
        .insert(newMessage);
        
      if (error) throw error;
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    }
  };

  const markAsRead = async (messageId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('chat_messages')
        .update({ read: true })
        .eq('id', messageId)
        .eq('recipient_id', user.id);
        
      if (error) throw error;
      
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const createRoom = async (name: string, memberIds: string[]): Promise<ChatRoom | null> => {
    if (!user) return null;
    
    try {
      // First create the room
      const { data: roomData, error: roomError } = await supabase
        .from('chat_rooms')
        .insert({
          name,
          created_by: user.id
        })
        .select()
        .single();
        
      if (roomError) throw roomError;
      
      // Add all members to the room
      const allMembers = [...memberIds, user.id];
      const memberInserts = allMembers.map(memberId => ({
        room_id: roomData.id,
        user_id: memberId
      }));
      
      const { error: membersError } = await supabase
        .from('chat_room_members')
        .insert(memberInserts);
        
      if (membersError) throw membersError;
      
      toast({
        title: 'Success',
        description: `Chat room "${name}" created`
      });
      
      await refreshChatData();
      return roomData;
      
    } catch (error) {
      console.error('Error creating room:', error);
      toast({
        title: 'Error',
        description: 'Failed to create chat room',
        variant: 'destructive',
      });
      return null;
    }
  };

  const joinRoom = async (roomId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('chat_room_members')
        .insert({
          room_id: roomId,
          user_id: user.id
        });
        
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Joined chat room'
      });
      
      await refreshChatData();
      
    } catch (error) {
      console.error('Error joining room:', error);
      toast({
        title: 'Error',
        description: 'Failed to join chat room',
        variant: 'destructive',
      });
    }
  };

  const subscribeToMessages = () => {
    if (!user) return;
    
    const channel = supabase
      .channel('chat-messages')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'chat_messages',
          filter: `recipient_id=eq.${user.id}`
        }, 
        payload => {
          // Handle new message for the current user
          if (payload.new) {
            // Add message to current chat if it belongs there
            const newMessage = payload.new as ChatMessage;
            
            // Check if message belongs to active chat
            if (activeChat) {
              if ('room_id' in activeChat && activeChat.id === newMessage.room_id) {
                setMessages(prev => [...prev, newMessage]);
              } else if (activeChat.id === newMessage.sender_id) {
                setMessages(prev => [...prev, newMessage]);
                markAsRead(newMessage.id);
              }
            }
            
            // Create notification for new message
            createNotification(newMessage);
          }
        }
      )
      .subscribe();
      
    return channel;
  };
  
  const unsubscribeFromMessages = () => {
    supabase.removeChannel('chat-messages');
  };
  
  const createNotification = async (message: ChatMessage) => {
    if (!user) return;
    
    try {
      let senderName = 'Someone';
      // In a real app, we would fetch the sender's name from a users or profiles table
      
      const notification = {
        user_id: user.id,
        type: 'message' as const,
        title: 'New Message',
        content: `${senderName}: ${message.content.substring(0, 50)}${message.content.length > 50 ? '...' : ''}`,
        link: '/chat', // We'll implement the chat page later
        read: false
      };
      
      await supabase
        .from('notifications')
        .insert(notification);
        
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        activeChat,
        setActiveChat,
        messages,
        sendMessage,
        markAsRead,
        isLoading,
        rooms,
        createRoom,
        joinRoom,
        contacts,
        refreshChatData
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
