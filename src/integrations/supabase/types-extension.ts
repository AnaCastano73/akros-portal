
import { Json, Database } from './types';

// Extended Database interface that includes our new tables
export interface ExtendedDatabase extends Database {
  public: {
    Tables: Database['public']['Tables'] & {
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
          reviewed: boolean | null;
          version: number | null;
          tags: string[] | null;
          metadata: Json | null;
        };
        Insert: {
          id?: string;
          name: string;
          url: string;
          type: string;
          size: number;
          uploaded_by: string;
          uploaded_at?: string;
          category: string;
          visible_to: string[];
          reviewed?: boolean | null;
          version?: number | null;
          tags?: string[] | null;
          metadata?: Json | null;
        };
        Update: {
          id?: string;
          name?: string;
          url?: string;
          type?: string;
          size?: number;
          uploaded_by?: string;
          uploaded_at?: string;
          category?: string;
          visible_to?: string[];
          reviewed?: boolean | null;
          version?: number | null;
          tags?: string[] | null;
          metadata?: Json | null;
        };
      };
      courses: {
        Row: {
          id: string;
          title: string;
          description: string;
          image_url: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
          tags: string[] | null;
          published: boolean | null;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          image_url?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
          tags?: string[] | null;
          published?: boolean | null;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          image_url?: string | null;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
          tags?: string[] | null;
          published?: boolean | null;
        };
      };
      course_modules: {
        Row: {
          id: string;
          course_id: string;
          title: string;
          description: string | null;
          order_index: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          title: string;
          description?: string | null;
          order_index: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          course_id?: string;
          title?: string;
          description?: string | null;
          order_index?: number;
          created_at?: string;
        };
      };
      course_lessons: {
        Row: {
          id: string;
          module_id: string;
          title: string;
          content: string;
          order_index: number;
          duration: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          module_id: string;
          title: string;
          content: string;
          order_index: number;
          duration?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          module_id?: string;
          title?: string;
          content?: string;
          order_index?: number;
          duration?: number | null;
          created_at?: string;
        };
      };
      course_enrollments: {
        Row: {
          id: string;
          course_id: string;
          user_id: string;
          enrolled_at: string;
          completed: boolean | null;
          last_accessed: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          user_id: string;
          enrolled_at?: string;
          completed?: boolean | null;
          last_accessed?: string;
        };
        Update: {
          id?: string;
          course_id?: string;
          user_id?: string;
          enrolled_at?: string;
          completed?: boolean | null;
          last_accessed?: string;
        };
      };
      lesson_progress: {
        Row: {
          id: string;
          lesson_id: string;
          user_id: string;
          completed: boolean | null;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          lesson_id: string;
          user_id: string;
          completed?: boolean | null;
          completed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          lesson_id?: string;
          user_id?: string;
          completed?: boolean | null;
          completed_at?: string | null;
          created_at?: string;
        };
      };
    };
    Views: Database['public']['Views'];
    Functions: Database['public']['Functions'];
    Enums: Database['public']['Enums'];
    CompositeTypes: Database['public']['CompositeTypes'];
  };
}

// Create client with extended types
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://gxkdlylqmwwlhyyqlwfm.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4a2RseWxxbXd3bGh5eXFsd2ZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwNTk5NzIsImV4cCI6MjA1OTYzNTk3Mn0.179J82KbfECLxuFrbjr-7pE8c8Cw3iSglsKTtq2Ox74";

export const supabaseTyped = createClient<ExtendedDatabase>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);
