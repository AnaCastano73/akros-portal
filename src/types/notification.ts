
export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  content: string;
  link?: string;
  read: boolean;
  created_at: string;
}

export type NotificationType = 
  | 'message' 
  | 'mention' 
  | 'document_update' 
  | 'status_change'
  | 'system';

export interface NotificationPreferences {
  id: string;
  user_id: string;
  new_messages: boolean;
  mentions: boolean;
  document_updates: boolean;
  status_changes: boolean;
  browser_notifications: boolean;
  push_notifications: boolean;
  email_notifications: boolean;
  created_at: string;
  updated_at: string;
}
