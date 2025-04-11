
import { createClient } from '@supabase/supabase-js';

// Define a type for the custom Supabase client with typed tables
interface Database {
  public: {
    Tables: {
      chat_messages: {
        Row: {
          id: string;
          content: string;
          sender_id: string;
          room_id: string;
          created_at: string;
          read: boolean;
          recipient_id: string;
        };
      };
      chat_room_members: {
        Row: {
          id: string;
          room_id: string;
          user_id: string;
          joined_at: string;
        };
      };
      chat_rooms: {
        Row: {
          id: string;
          name: string;
          created_by: string;
          created_at: string;
        };
      };
      companies: {
        Row: {
          id: string;
          name: string;
          logo_url: string | null;
          primary_color: string | null;
          secondary_color: string | null;
          accent_color: string | null;
          domain: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      company_branding: {
        Row: {
          id: string;
          company_id: string;
          logo_url: string | null;
          favicon_url: string | null;
          primary_color: string | null;
          secondary_color: string | null;
          accent_color: string | null;
          background_color: string | null;
          text_color: string | null;
          company_name: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      course_enrollments: {
        Row: {
          id: string;
          user_id: string;
          course_id: string;
          enrolled_at: string;
          completed: boolean;
          last_accessed: string;
        };
      };
      courses: {
        Row: {
          id: string;
          title: string;
          description: string;
          image_url: string;
          tags: string[];
          published: boolean;
          created_at: string;
          updated_at: string;
          created_by: string;
        };
      };
      course_modules: {
        Row: {
          id: string;
          course_id: string;
          title: string;
          description: string;
          order_index: number;
          created_at: string;
        };
      };
      course_lessons: {
        Row: {
          id: string;
          module_id: string;
          title: string;
          content: string;
          order_index: number;
          duration: number;
          created_at: string;
        };
      };
      documents: {
        Row: {
          id: string;
          name: string;
          url: string;
          type: string;
          size: number;
          uploaded_by: string;
          uploaded_at: string;
          category: string;
          visible_to: string[];
          reviewed: boolean;
          version: number;
          tags: string[];
          metadata: any;
          company_id: string | null;
        };
      };
      lesson_progress: {
        Row: {
          id: string;
          user_id: string;
          lesson_id: string;
          completed: boolean;
          completed_at: string;
          created_at: string;
        };
      };
      notification_preferences: {
        Row: {
          id: string;
          user_id: string;
          email_notifications: boolean;
          browser_notifications: boolean;
          push_notifications: boolean;
          new_messages: boolean;
          document_updates: boolean;
          status_changes: boolean;
          mentions: boolean;
          created_at: string;
          updated_at: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          content: string;
          link: string;
          read: boolean;
          created_at: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string;
          avatar: string;
          created_at: string;
          company_id: string | null;
        };
      };
      user_roles: {
        Row: {
          id: string;
          user_id: string;
          role: string;
          created_at: string;
        };
      };
    };
  };
}

// Create the typed Supabase client
// Use hardcoded values from client.ts instead of relying on import.meta.env which might not be available during rendering
const SUPABASE_URL = "https://gxkdlylqmwwlhyyqlwfm.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4a2RseWxxbXd3bGh5eXFsd2ZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwNTk5NzIsImV4cCI6MjA1OTYzNTk3Mn0.179J82KbfECLxuFrbjr-7pE8c8Cw3iSglsKTtq2Ox74";

export const supabaseTyped = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
