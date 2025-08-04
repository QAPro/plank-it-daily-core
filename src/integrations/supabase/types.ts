export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      plank_exercises: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          difficulty_level: number
          equipment_needed: string[] | null
          estimated_calories_per_minute: number | null
          id: string
          image_url: string | null
          instructions: string[] | null
          is_beginner_friendly: boolean | null
          name: string
          primary_muscles: string[] | null
          tags: string[] | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          difficulty_level: number
          equipment_needed?: string[] | null
          estimated_calories_per_minute?: number | null
          id?: string
          image_url?: string | null
          instructions?: string[] | null
          is_beginner_friendly?: boolean | null
          name: string
          primary_muscles?: string[] | null
          tags?: string[] | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          difficulty_level?: number
          equipment_needed?: string[] | null
          estimated_calories_per_minute?: number | null
          id?: string
          image_url?: string | null
          instructions?: string[] | null
          is_beginner_friendly?: boolean | null
          name?: string
          primary_muscles?: string[] | null
          tags?: string[] | null
        }
        Relationships: []
      }
      user_achievement_progress: {
        Row: {
          achievement_id: string
          created_at: string | null
          current_progress: number | null
          id: string
          last_updated: string | null
          progress_data: Json | null
          target_progress: number
          user_id: string
        }
        Insert: {
          achievement_id: string
          created_at?: string | null
          current_progress?: number | null
          id?: string
          last_updated?: string | null
          progress_data?: Json | null
          target_progress: number
          user_id: string
        }
        Update: {
          achievement_id?: string
          created_at?: string | null
          current_progress?: number | null
          id?: string
          last_updated?: string | null
          progress_data?: Json | null
          target_progress?: number
          user_id?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_name: string
          achievement_type: string
          category: string | null
          description: string | null
          earned_at: string | null
          id: string
          metadata: Json | null
          points: number | null
          rarity: string | null
          user_id: string
        }
        Insert: {
          achievement_name: string
          achievement_type: string
          category?: string | null
          description?: string | null
          earned_at?: string | null
          id?: string
          metadata?: Json | null
          points?: number | null
          rarity?: string | null
          user_id: string
        }
        Update: {
          achievement_name?: string
          achievement_type?: string
          category?: string | null
          description?: string | null
          earned_at?: string | null
          id?: string
          metadata?: Json | null
          points?: number | null
          rarity?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_assessments: {
        Row: {
          assessment_type: string
          created_at: string | null
          difficulty_rating: number | null
          duration_seconds: number
          id: string
          notes: string | null
          user_id: string
        }
        Insert: {
          assessment_type?: string
          created_at?: string | null
          difficulty_rating?: number | null
          duration_seconds: number
          id?: string
          notes?: string | null
          user_id: string
        }
        Update: {
          assessment_type?: string
          created_at?: string | null
          difficulty_rating?: number | null
          duration_seconds?: number
          id?: string
          notes?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_exercise_performance: {
        Row: {
          average_duration_seconds: number
          best_duration_seconds: number
          created_at: string
          difficulty_rating: number | null
          exercise_id: string
          id: string
          last_session_at: string | null
          success_rate: number | null
          total_sessions: number
          updated_at: string
          user_id: string
        }
        Insert: {
          average_duration_seconds?: number
          best_duration_seconds?: number
          created_at?: string
          difficulty_rating?: number | null
          exercise_id: string
          id?: string
          last_session_at?: string | null
          success_rate?: number | null
          total_sessions?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          average_duration_seconds?: number
          best_duration_seconds?: number
          created_at?: string
          difficulty_rating?: number | null
          exercise_id?: string
          id?: string
          last_session_at?: string | null
          success_rate?: number | null
          total_sessions?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_exercise_recommendations: {
        Row: {
          confidence_score: number
          created_at: string
          exercise_id: string
          expires_at: string
          id: string
          reasoning: string | null
          recommendation_type: string
          user_id: string
        }
        Insert: {
          confidence_score?: number
          created_at?: string
          exercise_id: string
          expires_at?: string
          id?: string
          reasoning?: string | null
          recommendation_type: string
          user_id: string
        }
        Update: {
          confidence_score?: number
          created_at?: string
          exercise_id?: string
          expires_at?: string
          id?: string
          reasoning?: string | null
          recommendation_type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_monthly_stats: {
        Row: {
          created_at: string | null
          exercises_tried: number | null
          id: string
          improvement_percentage: number | null
          month_start: string
          personal_bests: number | null
          sessions_count: number | null
          total_duration: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          exercises_tried?: number | null
          id?: string
          improvement_percentage?: number | null
          month_start: string
          personal_bests?: number | null
          sessions_count?: number | null
          total_duration?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          exercises_tried?: number | null
          id?: string
          improvement_percentage?: number | null
          month_start?: string
          personal_bests?: number | null
          sessions_count?: number | null
          total_duration?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_onboarding: {
        Row: {
          completed_at: string | null
          created_at: string | null
          experience_level: string | null
          fitness_level: number | null
          goals: string[] | null
          id: string
          preferred_duration: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          experience_level?: string | null
          fitness_level?: number | null
          goals?: string[] | null
          id?: string
          preferred_duration?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          experience_level?: string | null
          fitness_level?: number | null
          goals?: string[] | null
          id?: string
          preferred_duration?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          auto_progression: boolean | null
          avoided_exercises: string[] | null
          created_at: string | null
          difficulty_preference: string | null
          favorite_exercises: string[] | null
          haptic_feedback: boolean | null
          id: string
          preferred_workout_duration: number | null
          progression_sensitivity: number | null
          reminder_time: string | null
          sound_effects: boolean | null
          theme_preference: string | null
          updated_at: string | null
          user_id: string
          workout_reminders: boolean | null
        }
        Insert: {
          auto_progression?: boolean | null
          avoided_exercises?: string[] | null
          created_at?: string | null
          difficulty_preference?: string | null
          favorite_exercises?: string[] | null
          haptic_feedback?: boolean | null
          id?: string
          preferred_workout_duration?: number | null
          progression_sensitivity?: number | null
          reminder_time?: string | null
          sound_effects?: boolean | null
          theme_preference?: string | null
          updated_at?: string | null
          user_id: string
          workout_reminders?: boolean | null
        }
        Update: {
          auto_progression?: boolean | null
          avoided_exercises?: string[] | null
          created_at?: string | null
          difficulty_preference?: string | null
          favorite_exercises?: string[] | null
          haptic_feedback?: boolean | null
          id?: string
          preferred_workout_duration?: number | null
          progression_sensitivity?: number | null
          reminder_time?: string | null
          sound_effects?: boolean | null
          theme_preference?: string | null
          updated_at?: string | null
          user_id?: string
          workout_reminders?: boolean | null
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          completed_at: string | null
          duration_seconds: number
          exercise_id: string | null
          id: string
          notes: string | null
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          duration_seconds: number
          exercise_id?: string | null
          id?: string
          notes?: string | null
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          duration_seconds?: number
          exercise_id?: string | null
          id?: string
          notes?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "plank_exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_streaks: {
        Row: {
          current_streak: number | null
          id: string
          last_workout_date: string | null
          longest_streak: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          current_streak?: number | null
          id?: string
          last_workout_date?: string | null
          longest_streak?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          current_streak?: number | null
          id?: string
          last_workout_date?: string | null
          longest_streak?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_streaks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_weekly_stats: {
        Row: {
          average_duration: number | null
          created_at: string | null
          days_active: number | null
          id: string
          sessions_count: number | null
          total_duration: number | null
          updated_at: string | null
          user_id: string
          week_start: string
        }
        Insert: {
          average_duration?: number | null
          created_at?: string | null
          days_active?: number | null
          id?: string
          sessions_count?: number | null
          total_duration?: number | null
          updated_at?: string | null
          user_id: string
          week_start: string
        }
        Update: {
          average_duration?: number | null
          created_at?: string | null
          days_active?: number | null
          id?: string
          sessions_count?: number | null
          total_duration?: number | null
          updated_at?: string | null
          user_id?: string
          week_start?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      find_user_by_username_or_email: {
        Args: { identifier: string }
        Returns: {
          user_id: string
          email: string
          username: string
          full_name: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
