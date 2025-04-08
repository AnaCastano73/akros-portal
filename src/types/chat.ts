
export interface ChatMessage {
  id: string;
  sender_id: string;
  recipient_id?: string;
  room_id?: string;
  content: string;
  read: boolean;
  created_at: string;
  sender_name?: string; // For display purposes
  sender_avatar?: string; // For display purposes
}

export interface ChatContact {
  id: string;
  name: string;
  avatar?: string;
  online?: boolean;
  last_active?: string;
  unread_count?: number;
  role?: string; // Added to identify role of contact
  email?: string; // Added for identification
}
