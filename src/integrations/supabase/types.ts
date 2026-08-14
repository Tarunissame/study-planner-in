export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      chapters: {
        Row: {
          archived: boolean
          created_at: string
          id: string
          name: string
          position: number
          status: Database["public"]["Enums"]["topic_status"]
          subject_id: string
          user_id: string
        }
        Insert: {
          archived?: boolean
          created_at?: string
          id?: string
          name: string
          position?: number
          status?: Database["public"]["Enums"]["topic_status"]
          subject_id: string
          user_id: string
        }
        Update: {
          archived?: boolean
          created_at?: string
          id?: string
          name?: string
          position?: number
          status?: Database["public"]["Enums"]["topic_status"]
          subject_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chapters_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_notes: {
        Row: {
          content: string
          created_at: string
          date: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string
          created_at?: string
          date: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          date?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_tasks: {
        Row: {
          block_index: number
          completed_quantity: number
          created_at: string
          date: string
          id: string
          label: string
          position: number
          r360_item_id: string | null
          status: Database["public"]["Enums"]["topic_status"]
          target_quantity: number
          task_type: Database["public"]["Enums"]["task_type"]
          topic_id: string | null
          user_id: string
        }
        Insert: {
          block_index?: number
          completed_quantity?: number
          created_at?: string
          date: string
          id?: string
          label: string
          position?: number
          r360_item_id?: string | null
          status?: Database["public"]["Enums"]["topic_status"]
          target_quantity?: number
          task_type?: Database["public"]["Enums"]["task_type"]
          topic_id?: string | null
          user_id: string
        }
        Update: {
          block_index?: number
          completed_quantity?: number
          created_at?: string
          date?: string
          id?: string
          label?: string
          position?: number
          r360_item_id?: string | null
          status?: Database["public"]["Enums"]["topic_status"]
          target_quantity?: number
          task_type?: Database["public"]["Enums"]["task_type"]
          topic_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_tasks_r360_item_id_fkey"
            columns: ["r360_item_id"]
            isOneToOne: false
            referencedRelation: "r360_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_tasks_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          board: string | null
          class: string | null
          created_at: string
          default_lecture_target: number
          default_question_blocks: number
          default_questions_per_block: number
          exam: string | null
          name: string
          onboarded: boolean
          stream: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          board?: string | null
          class?: string | null
          created_at?: string
          default_lecture_target?: number
          default_question_blocks?: number
          default_questions_per_block?: number
          exam?: string | null
          name?: string
          onboarded?: boolean
          stream?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          board?: string | null
          class?: string | null
          created_at?: string
          default_lecture_target?: number
          default_question_blocks?: number
          default_questions_per_block?: number
          exam?: string | null
          name?: string
          onboarded?: boolean
          stream?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      r360_items: {
        Row: {
          block_count: number
          created_at: string
          id: string
          kind: string
          label: string
          per_block: number
          position: number
          unit: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          block_count?: number
          created_at?: string
          id?: string
          kind?: string
          label: string
          per_block?: number
          position?: number
          unit?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          block_count?: number
          created_at?: string
          id?: string
          kind?: string
          label?: string
          per_block?: number
          position?: number
          unit?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      revision_items: {
        Row: {
          completed_at: string | null
          created_at: string
          due_date: string
          id: string
          revision_number: number
          status: Database["public"]["Enums"]["revision_status"]
          topic_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          due_date: string
          id?: string
          revision_number: number
          status?: Database["public"]["Enums"]["revision_status"]
          topic_id: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          due_date?: string
          id?: string
          revision_number?: number
          status?: Database["public"]["Enums"]["revision_status"]
          topic_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "revision_items_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      study_logs: {
        Row: {
          chapter_id: string | null
          created_at: string
          date: string
          id: string
          lecture_name: string | null
          lecture_number: number
          subject_id: string | null
          topic_id: string | null
          topic_name: string
          user_id: string
        }
        Insert: {
          chapter_id?: string | null
          created_at?: string
          date: string
          id?: string
          lecture_name?: string | null
          lecture_number?: number
          subject_id?: string | null
          topic_id?: string | null
          topic_name?: string
          user_id: string
        }
        Update: {
          chapter_id?: string | null
          created_at?: string
          date?: string
          id?: string
          lecture_name?: string | null
          lecture_number?: number
          subject_id?: string | null
          topic_id?: string | null
          topic_name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_logs_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "study_logs_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "study_logs_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          archived: boolean
          color: string | null
          created_at: string
          id: string
          name: string
          position: number
          user_id: string
        }
        Insert: {
          archived?: boolean
          color?: string | null
          created_at?: string
          id?: string
          name: string
          position?: number
          user_id: string
        }
        Update: {
          archived?: boolean
          color?: string | null
          created_at?: string
          id?: string
          name?: string
          position?: number
          user_id?: string
        }
        Relationships: []
      }
      topics: {
        Row: {
          archived: boolean
          chapter_id: string | null
          completed_at: string | null
          created_at: string
          id: string
          name: string
          position: number
          status: Database["public"]["Enums"]["topic_status"]
          subject_id: string
          user_id: string
        }
        Insert: {
          archived?: boolean
          chapter_id?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          name: string
          position?: number
          status?: Database["public"]["Enums"]["topic_status"]
          subject_id: string
          user_id: string
        }
        Update: {
          archived?: boolean
          chapter_id?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          name?: string
          position?: number
          status?: Database["public"]["Enums"]["topic_status"]
          subject_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "topics_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "topics_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      tracker_column_scopes: {
        Row: {
          chapter_id: string | null
          created_at: string
          id: string
          subject_id: string | null
          topic_id: string | null
          tracker_column_id: string
          user_id: string
        }
        Insert: {
          chapter_id?: string | null
          created_at?: string
          id?: string
          subject_id?: string | null
          topic_id?: string | null
          tracker_column_id: string
          user_id: string
        }
        Update: {
          chapter_id?: string | null
          created_at?: string
          id?: string
          subject_id?: string | null
          topic_id?: string | null
          tracker_column_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tracker_column_scopes_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tracker_column_scopes_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tracker_column_scopes_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tracker_column_scopes_tracker_column_id_fkey"
            columns: ["tracker_column_id"]
            isOneToOne: false
            referencedRelation: "tracker_columns"
            referencedColumns: ["id"]
          },
        ]
      }
      tracker_columns: {
        Row: {
          created_at: string
          id: string
          name: string
          target: number | null
          type: string
          unit: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          target?: number | null
          type?: string
          unit?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          target?: number | null
          type?: string
          unit?: string | null
          user_id?: string
        }
        Relationships: []
      }
      tracking_cells: {
        Row: {
          chapter_id: string
          created_at: string
          id: string
          resource_id: string
          status: Database["public"]["Enums"]["topic_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          chapter_id: string
          created_at?: string
          id?: string
          resource_id: string
          status?: Database["public"]["Enums"]["topic_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          chapter_id?: string
          created_at?: string
          id?: string
          resource_id?: string
          status?: Database["public"]["Enums"]["topic_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tracking_cells_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tracking_cells_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "tracking_resources"
            referencedColumns: ["id"]
          },
        ]
      }
      tracking_resources: {
        Row: {
          created_at: string
          id: string
          name: string
          position: number
          starred: boolean
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          position?: number
          starred?: boolean
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          position?: number
          starred?: boolean
          user_id?: string
        }
        Relationships: []
      }
      waitlist_signups: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      revision_status: "pending" | "completed" | "skipped"
      task_type: "lecture" | "question_block" | "revision" | "custom"
      topic_status: "blank" | "in_progress" | "completed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      revision_status: ["pending", "completed", "skipped"],
      task_type: ["lecture", "question_block", "revision", "custom"],
      topic_status: ["blank", "in_progress", "completed"],
    },
  },
} as const
