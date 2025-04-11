export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          read: boolean | null
          recipient_id: string | null
          room_id: string | null
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          read?: boolean | null
          recipient_id?: string | null
          room_id?: string | null
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          read?: boolean | null
          recipient_id?: string | null
          room_id?: string | null
          sender_id?: string
        }
        Relationships: []
      }
      chat_room_members: {
        Row: {
          id: string
          joined_at: string
          room_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          room_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          room_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_room_members_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_rooms: {
        Row: {
          created_at: string
          created_by: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      companies: {
        Row: {
          accent_color: string | null
          created_at: string
          domain: string | null
          id: string
          logo_url: string | null
          name: string
          primary_color: string | null
          secondary_color: string | null
          updated_at: string
        }
        Insert: {
          accent_color?: string | null
          created_at?: string
          domain?: string | null
          id?: string
          logo_url?: string | null
          name: string
          primary_color?: string | null
          secondary_color?: string | null
          updated_at?: string
        }
        Update: {
          accent_color?: string | null
          created_at?: string
          domain?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          primary_color?: string | null
          secondary_color?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      company_branding: {
        Row: {
          accent_color: string | null
          background_color: string | null
          company_id: string
          company_name: string | null
          created_at: string
          favicon_url: string | null
          id: string
          logo_url: string | null
          primary_color: string | null
          secondary_color: string | null
          text_color: string | null
          updated_at: string
        }
        Insert: {
          accent_color?: string | null
          background_color?: string | null
          company_id: string
          company_name?: string | null
          created_at?: string
          favicon_url?: string | null
          id?: string
          logo_url?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          text_color?: string | null
          updated_at?: string
        }
        Update: {
          accent_color?: string | null
          background_color?: string | null
          company_id?: string
          company_name?: string | null
          created_at?: string
          favicon_url?: string | null
          id?: string
          logo_url?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          text_color?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_branding_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      course_enrollments: {
        Row: {
          completed: boolean | null
          course_id: string
          enrolled_at: string
          id: string
          last_accessed: string
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          course_id: string
          enrolled_at?: string
          id?: string
          last_accessed?: string
          user_id: string
        }
        Update: {
          completed?: boolean | null
          course_id?: string
          enrolled_at?: string
          id?: string
          last_accessed?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_lessons: {
        Row: {
          content: string
          created_at: string
          duration: number | null
          id: string
          module_id: string
          order_index: number
          title: string
        }
        Insert: {
          content: string
          created_at?: string
          duration?: number | null
          id?: string
          module_id: string
          order_index: number
          title: string
        }
        Update: {
          content?: string
          created_at?: string
          duration?: number | null
          id?: string
          module_id?: string
          order_index?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "course_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      course_modules: {
        Row: {
          course_id: string
          created_at: string
          description: string | null
          id: string
          order_index: number
          title: string
        }
        Insert: {
          course_id: string
          created_at?: string
          description?: string | null
          id?: string
          order_index: number
          title: string
        }
        Update: {
          course_id?: string
          created_at?: string
          description?: string | null
          id?: string
          order_index?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          created_at: string
          created_by: string
          description: string
          id: string
          image_url: string | null
          published: boolean | null
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description: string
          id?: string
          image_url?: string | null
          published?: boolean | null
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string
          id?: string
          image_url?: string | null
          published?: boolean | null
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          category: string
          company_id: string | null
          id: string
          metadata: Json | null
          name: string
          reviewed: boolean | null
          size: number
          tags: string[] | null
          type: string
          uploaded_at: string
          uploaded_by: string
          url: string
          version: number | null
          visible_to: string[]
        }
        Insert: {
          category: string
          company_id?: string | null
          id?: string
          metadata?: Json | null
          name: string
          reviewed?: boolean | null
          size: number
          tags?: string[] | null
          type: string
          uploaded_at?: string
          uploaded_by: string
          url: string
          version?: number | null
          visible_to: string[]
        }
        Update: {
          category?: string
          company_id?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          reviewed?: boolean | null
          size?: number
          tags?: string[] | null
          type?: string
          uploaded_at?: string
          uploaded_by?: string
          url?: string
          version?: number | null
          visible_to?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "documents_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_progress: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          created_at: string
          id: string
          lesson_id: string
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          id?: string
          lesson_id: string
          user_id: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          id?: string
          lesson_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "course_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          browser_notifications: boolean | null
          created_at: string
          document_updates: boolean | null
          email_notifications: boolean | null
          id: string
          mentions: boolean | null
          new_messages: boolean | null
          push_notifications: boolean | null
          status_changes: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          browser_notifications?: boolean | null
          created_at?: string
          document_updates?: boolean | null
          email_notifications?: boolean | null
          id?: string
          mentions?: boolean | null
          new_messages?: boolean | null
          push_notifications?: boolean | null
          status_changes?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          browser_notifications?: boolean | null
          created_at?: string
          document_updates?: boolean | null
          email_notifications?: boolean | null
          id?: string
          mentions?: boolean | null
          new_messages?: boolean | null
          push_notifications?: boolean | null
          status_changes?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          content: string
          created_at: string
          id: string
          link: string | null
          read: boolean | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          link?: string | null
          read?: boolean | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          link?: string | null
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar: string | null
          company_id: string | null
          created_at: string
          email: string
          id: string
          name: string | null
        }
        Insert: {
          avatar?: string | null
          company_id?: string | null
          created_at?: string
          email: string
          id: string
          name?: string | null
        }
        Update: {
          avatar?: string | null
          company_id?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_primary_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["user_role"]
        }
        Returns: boolean
      }
      user_belongs_to_company: {
        Args: { user_id: string; company_id: string }
        Returns: boolean
      }
    }
    Enums: {
      user_role: "client" | "expert" | "employee" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      user_role: ["client", "expert", "employee", "admin"],
    },
  },
} as const
