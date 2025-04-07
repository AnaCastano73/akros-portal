
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { ChatMessage, ChatContact } from '@/types/chat';

interface ChatContextType {
  activeChat: ChatContact | null;
  setActiveChat: (chat: ChatContact | null) => void;
  messages: ChatMessage[];
  sendMessage: (content: string, recipientId: string) => Promise<void>;
  markAsRead: (messageId: string) => Promise<void>;
  isLoading: boolean;
  contacts: ChatContact[];
  refreshChatData: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType | null>(null);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [activeChat, setActiveChat] = useState<ChatContact | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [contacts, setContacts] = useState<ChatContact[]>([]);

  // Load user's contacts on login
  useEffect(() => {
    if (user) {
      refreshChatData();
      const channel = subscribeToMessages();
      
      return () => {
        if (channel) {
          supabase.removeChannel(channel);
        }
      };
    }
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
      // Load contacts based on user role
      if (user.role === 'admin') {
        // Admins can see all users who have sent messages
        const { data: messagesData, error: messagesError } = await supabase
          .from('chat_messages')
          .select('*')
          .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
          .is('room_id', null)
          .order('created_at', { ascending: false });
          
        if (messagesError) throw messagesError;
        
        // Extract unique user IDs from direct messages (excluding admins)
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
        
        setContacts(mockContacts);
      } else {
        // Non-admin users only see "Akros Advisory" (represented by an admin)
        // In a real app, you would query for users with admin role
        const akrosAdvisory: ChatContact = {
          id: '4', // Admin user ID
          name: 'Akros Advisory',
          avatar: '/placeholder.svg',
          online: true,
          unread_count: 0
        };
        
        setContacts([akrosAdvisory]);
      }
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
      // Direct message only (no rooms)
      const query = supabase
        .from('chat_messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},recipient_id.eq.${activeChat.id}),and(sender_id.eq.${activeChat.id},recipient_id.eq.${user.id})`)
        .is('room_id', null)
        .order('created_at', { ascending: true });
      
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

  const sendMessage = async (content: string, recipientId: string) => {
    if (!user) return;
    if (!content.trim()) return;
    
    try {
      const newMessage = {
        sender_id: user.id,
        content, 
        read: false,
        recipient_id: recipientId,
        room_id: null
      };
      
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

  const subscribeToMessages = () => {
    if (!user) return null;
    
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
            const newMessage = payload.new as unknown as ChatMessage;
            
            // Check if message belongs to active chat
            if (activeChat && activeChat.id === newMessage.sender_id) {
              setMessages(prev => [...prev, newMessage]);
              markAsRead(newMessage.id);
            }
            
            // Create notification for new message
            createNotification(newMessage);
          }
        }
      )
      .subscribe();
      
    return channel;
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
