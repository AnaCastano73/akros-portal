import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
// Use type-only import to avoid conflict with global Notification
import type { Notification, NotificationPreferences, NotificationType } from '@/types/notification';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  preferences: NotificationPreferences | null;
  updatePreferences: (preferences: Partial<NotificationPreferences>) => Promise<void>;
  requestNotificationPermission: () => Promise<boolean>;
  showBrowserNotification: (title: string, options?: NotificationOptions) => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | null>(null);
  const unreadCount = notifications.filter(n => !n.read).length;

  // Check if the browser supports notifications
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(window.Notification.permission);
    }
  }, []);

  // Load notifications and preferences when user logs in
  useEffect(() => {
    if (user) {
      loadNotifications();
      loadPreferences();
      const channel = subscribeToNotifications();
      
      return () => {
        if (channel) {
          supabase.removeChannel(channel);
        }
      };
    } else {
      setNotifications([]);
      setPreferences(null);
    }
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;
    
    try {
      // Check if user.id is a valid UUID before querying
      if (!isValidUUID(user.id)) {
        console.log('Invalid user ID format for notifications query');
        return;
      }
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
        
      if (error) {
        // Log the error but don't show a toast to the user
        console.error('Error loading notifications:', error);
        return;
      }
      
      // Fix type error by ensuring data conforms to NotificationType
      const typedData = data?.map(notification => ({
        ...notification,
        type: notification.type as NotificationType
      })) || [];
      
      setNotifications(typedData);
      
    } catch (error) {
      // Log the error but don't show a toast to the user
      console.error('Error in notifications processing:', error);
    }
  };

  const loadPreferences = async () => {
    if (!user) return;
    
    try {
      // Check if user.id is a valid UUID before querying
      if (!isValidUUID(user.id)) {
        console.log('Invalid user ID format for preferences query');
        return;
      }
      
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle(); // Use maybeSingle instead of single to avoid error if no preferences exist
        
      if (error) {
        if (error.code === 'PGRST116') {
          // No preference record found, create default preferences
          await createDefaultPreferences();
        } else {
          // Log the error but don't show a toast to the user
          console.error('Error loading notification preferences:', error);
        }
      } else if (data) {
        setPreferences(data);
      } else {
        // No data found, create default preferences
        await createDefaultPreferences();
      }
      
    } catch (error) {
      console.error('Error in preferences processing:', error);
    }
  };

  // Helper function to validate UUID format
  const isValidUUID = (id: string): boolean => {
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidPattern.test(id);
  };

  const createDefaultPreferences = async () => {
    if (!user) return;
    
    const defaultPrefs = {
      user_id: user.id,
      new_messages: true,
      mentions: true,
      document_updates: true,
      status_changes: true,
      browser_notifications: true,
      push_notifications: true,
      email_notifications: false
    };
    
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .insert(defaultPrefs)
        .select()
        .single();
        
      if (error) {
        console.error('Error creating default preferences:', error);
        return;
      }
      
      setPreferences(data);
      
    } catch (error) {
      console.error('Error in createDefaultPreferences:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user || notifications.length === 0) return;
    
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);
        
      if (error) throw error;
      
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      );
      
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const updatePreferences = async (newPrefs: Partial<NotificationPreferences>) => {
    if (!user || !preferences) return;
    
    try {
      const updatedPrefs = {
        ...newPrefs,
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('notification_preferences')
        .update(updatedPrefs)
        .eq('id', preferences.id)
        .select()
        .single();
        
      if (error) throw error;
      
      setPreferences(data);
      
      toast({
        title: 'Success',
        description: 'Notification preferences updated'
      });
      
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      toast({
        title: 'Error',
        description: 'Failed to update notification preferences',
        variant: 'destructive',
      });
    }
  };

  const requestNotificationPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      toast({
        title: 'Error',
        description: 'This browser does not support desktop notifications',
        variant: 'destructive',
      });
      return false;
    }
    
    if (Notification.permission === 'granted') {
      setNotificationPermission('granted');
      return true;
    }
    
    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      return permission === 'granted';
    }
    
    return false;
  };

  const showBrowserNotification = (title: string, options?: NotificationOptions) => {
    if (!('Notification' in window) || notificationPermission !== 'granted') {
      return;
    }
    
    try {
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        ...options
      });
      
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
      
    } catch (error) {
      console.error('Error showing browser notification:', error);
    }
  };

  const subscribeToNotifications = () => {
    if (!user) return null;
    
    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        }, 
        payload => {
          if (payload.new) {
            const newNotification = payload.new as unknown as Notification;
            
            // Add new notification to state
            setNotifications(prev => [
              {
                ...newNotification,
                type: newNotification.type as NotificationType
              }, 
              ...prev
            ]);
            
            // Show browser notification if enabled
            if (preferences?.browser_notifications && notificationPermission === 'granted') {
              showBrowserNotification(newNotification.title, {
                body: newNotification.content,
                tag: newNotification.id
              });
            }
            
            // Show toast notification
            toast({
              title: newNotification.title,
              description: newNotification.content,
            });
          }
        }
      )
      .subscribe();
      
    return channel;
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        preferences,
        updatePreferences,
        requestNotificationPermission,
        showBrowserNotification
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
