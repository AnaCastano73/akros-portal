
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

export interface ChatRoom {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
  members?: ChatRoomMember[];
  last_message?: ChatMessage;
}

export interface ChatRoomMember {
  id: string;
  room_id: string;
  user_id: string;
  joined_at: string;
  user_name?: string; // For display purposes
  user_avatar?: string; // For display purposes
}

export interface ChatContact {
  id: string;
  name: string;
  avatar?: string;
  online?: boolean;
  last_active?: string;
  unread_count?: number;
}
