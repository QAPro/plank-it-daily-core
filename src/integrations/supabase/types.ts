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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      challenge_participants: {
        Row: {
          challenge_id: string
          completed: boolean | null
          completed_at: string | null
          id: string
          joined_at: string | null
          progress_data: Json | null
          user_id: string
        }
        Insert: {
          challenge_id: string
          completed?: boolean | null
          completed_at?: string | null
          id?: string
          joined_at?: string | null
          progress_data?: Json | null
          user_id: string
        }
        Update: {
          challenge_id?: string
          completed?: boolean | null
          completed_at?: string | null
          id?: string
          joined_at?: string | null
          progress_data?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_participants_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "community_challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      coaching_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_active: boolean | null
          message_type: string
          trigger_condition: Json | null
          user_id: string | null
          voice_variant: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          message_type: string
          trigger_condition?: Json | null
          user_id?: string | null
          voice_variant?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          message_type?: string
          trigger_condition?: Json | null
          user_id?: string | null
          voice_variant?: string | null
        }
        Relationships: []
      }
      community_challenges: {
        Row: {
          challenge_type: string
          created_at: string | null
          created_by: string
          description: string | null
          end_date: string
          id: string
          is_public: boolean | null
          participant_count: number | null
          start_date: string
          target_data: Json
          template_id: string | null
          title: string
        }
        Insert: {
          challenge_type?: string
          created_at?: string | null
          created_by: string
          description?: string | null
          end_date: string
          id?: string
          is_public?: boolean | null
          participant_count?: number | null
          start_date: string
          target_data?: Json
          template_id?: string | null
          title: string
        }
        Update: {
          challenge_type?: string
          created_at?: string | null
          created_by?: string
          description?: string | null
          end_date?: string
          id?: string
          is_public?: boolean | null
          participant_count?: number | null
          start_date?: string
          target_data?: Json
          template_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_challenges_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "share_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_workout_exercises: {
        Row: {
          created_at: string
          custom_workout_id: string
          duration_seconds: number
          exercise_id: string
          id: string
          order_index: number
          rest_after_seconds: number
        }
        Insert: {
          created_at?: string
          custom_workout_id: string
          duration_seconds: number
          exercise_id: string
          id?: string
          order_index: number
          rest_after_seconds?: number
        }
        Update: {
          created_at?: string
          custom_workout_id?: string
          duration_seconds?: number
          exercise_id?: string
          id?: string
          order_index?: number
          rest_after_seconds?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_custom_workout_exercises_exercise"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "plank_exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_custom_workout_exercises_workout"
            columns: ["custom_workout_id"]
            isOneToOne: false
            referencedRelation: "custom_workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_workouts: {
        Row: {
          created_at: string
          description: string | null
          difficulty_level: number
          id: string
          is_public: boolean
          name: string
          total_duration: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          difficulty_level?: number
          id?: string
          is_public?: boolean
          name: string
          total_duration?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          difficulty_level?: number
          id?: string
          is_public?: boolean
          name?: string
          total_duration?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      feature_unlocks: {
        Row: {
          feature_name: string
          id: string
          unlock_level: number
          unlocked_at: string | null
          user_id: string
        }
        Insert: {
          feature_name: string
          id?: string
          unlock_level: number
          unlocked_at?: string | null
          user_id: string
        }
        Update: {
          feature_name?: string
          id?: string
          unlock_level?: number
          unlocked_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feature_unlocks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      level_unlocks: {
        Row: {
          category: string
          feature_description: string
          feature_name: string
          icon: string
          level: number
        }
        Insert: {
          category: string
          feature_description: string
          feature_name: string
          icon: string
          level: number
        }
        Update: {
          category?: string
          feature_description?: string
          feature_name?: string
          icon?: string
          level?: number
        }
        Relationships: []
      }
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
      share_analytics: {
        Row: {
          content_type: string
          engagement_data: Json | null
          id: string
          platform: string
          shared_at: string | null
          template_id: string | null
          user_id: string
        }
        Insert: {
          content_type: string
          engagement_data?: Json | null
          id?: string
          platform: string
          shared_at?: string | null
          template_id?: string | null
          user_id: string
        }
        Update: {
          content_type?: string
          engagement_data?: Json | null
          id?: string
          platform?: string
          shared_at?: string | null
          template_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "share_analytics_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "share_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      share_templates: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          is_public: boolean | null
          name: string
          template_data: Json
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          template_data?: Json
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          template_data?: Json
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      timer_sessions_detailed: {
        Row: {
          breathing_guidance_used: boolean | null
          coaching_enabled: boolean | null
          completion_rate: number
          created_at: string
          duration_seconds: number
          exercise_id: string | null
          id: string
          performance_metrics: Json | null
          target_duration: number
          theme_used: string | null
          user_feedback: Json | null
          user_id: string
        }
        Insert: {
          breathing_guidance_used?: boolean | null
          coaching_enabled?: boolean | null
          completion_rate?: number
          created_at?: string
          duration_seconds: number
          exercise_id?: string | null
          id?: string
          performance_metrics?: Json | null
          target_duration: number
          theme_used?: string | null
          user_feedback?: Json | null
          user_id: string
        }
        Update: {
          breathing_guidance_used?: boolean | null
          coaching_enabled?: boolean | null
          completion_rate?: number
          created_at?: string
          duration_seconds?: number
          exercise_id?: string | null
          id?: string
          performance_metrics?: Json | null
          target_duration?: number
          theme_used?: string | null
          user_feedback?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      timer_themes: {
        Row: {
          color_scheme: Json
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_featured: boolean | null
          is_public: boolean | null
          name: string
          updated_at: string
          visual_effects: Json
        }
        Insert: {
          color_scheme?: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_featured?: boolean | null
          is_public?: boolean | null
          name: string
          updated_at?: string
          visual_effects?: Json
        }
        Update: {
          color_scheme?: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_featured?: boolean | null
          is_public?: boolean | null
          name?: string
          updated_at?: string
          visual_effects?: Json
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
          adaptive_timing: boolean | null
          auto_progression: boolean | null
          avoided_exercises: string[] | null
          background_music: boolean | null
          breathing_guidance: boolean | null
          coaching_voice: string | null
          created_at: string | null
          difficulty_preference: string | null
          favorite_exercises: string[] | null
          form_reminders: boolean | null
          haptic_feedback: boolean | null
          id: string
          music_volume: number | null
          preferred_workout_duration: number | null
          progression_sensitivity: number | null
          reminder_time: string | null
          sound_effects: boolean | null
          theme_preference: string | null
          timer_sound_pack: string | null
          timer_theme: string | null
          updated_at: string | null
          user_id: string
          vibration_intensity: number | null
          workout_reminders: boolean | null
        }
        Insert: {
          adaptive_timing?: boolean | null
          auto_progression?: boolean | null
          avoided_exercises?: string[] | null
          background_music?: boolean | null
          breathing_guidance?: boolean | null
          coaching_voice?: string | null
          created_at?: string | null
          difficulty_preference?: string | null
          favorite_exercises?: string[] | null
          form_reminders?: boolean | null
          haptic_feedback?: boolean | null
          id?: string
          music_volume?: number | null
          preferred_workout_duration?: number | null
          progression_sensitivity?: number | null
          reminder_time?: string | null
          sound_effects?: boolean | null
          theme_preference?: string | null
          timer_sound_pack?: string | null
          timer_theme?: string | null
          updated_at?: string | null
          user_id: string
          vibration_intensity?: number | null
          workout_reminders?: boolean | null
        }
        Update: {
          adaptive_timing?: boolean | null
          auto_progression?: boolean | null
          avoided_exercises?: string[] | null
          background_music?: boolean | null
          breathing_guidance?: boolean | null
          coaching_voice?: string | null
          created_at?: string | null
          difficulty_preference?: string | null
          favorite_exercises?: string[] | null
          form_reminders?: boolean | null
          haptic_feedback?: boolean | null
          id?: string
          music_volume?: number | null
          preferred_workout_duration?: number | null
          progression_sensitivity?: number | null
          reminder_time?: string | null
          sound_effects?: boolean | null
          theme_preference?: string | null
          timer_sound_pack?: string | null
          timer_theme?: string | null
          updated_at?: string | null
          user_id?: string
          vibration_intensity?: number | null
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
          current_level: number | null
          email: string
          full_name: string | null
          id: string
          subscription_tier: string
          total_xp: number | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          current_level?: number | null
          email: string
          full_name?: string | null
          id: string
          subscription_tier?: string
          total_xp?: number | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          current_level?: number | null
          email?: string
          full_name?: string | null
          id?: string
          subscription_tier?: string
          total_xp?: number | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      workout_ratings: {
        Row: {
          created_at: string
          custom_workout_id: string | null
          id: string
          rating: number
          review: string | null
          template_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          custom_workout_id?: string | null
          id?: string
          rating: number
          review?: string | null
          template_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          custom_workout_id?: string | null
          id?: string
          rating?: number
          review?: string | null
          template_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_workout_ratings_template"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "workout_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_workout_ratings_workout"
            columns: ["custom_workout_id"]
            isOneToOne: false
            referencedRelation: "custom_workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_templates: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          description: string | null
          difficulty_level: number
          id: string
          is_featured: boolean | null
          name: string
          rating_average: number | null
          rating_count: number | null
          updated_at: string
          workout_data: Json
        }
        Insert: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          difficulty_level?: number
          id?: string
          is_featured?: boolean | null
          name: string
          rating_average?: number | null
          rating_count?: number | null
          updated_at?: string
          workout_data?: Json
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          difficulty_level?: number
          id?: string
          is_featured?: boolean | null
          name?: string
          rating_average?: number | null
          rating_count?: number | null
          updated_at?: string
          workout_data?: Json
        }
        Relationships: []
      }
      xp_transactions: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          id: string
          source: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          id?: string
          source: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          id?: string
          source?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "xp_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      find_user_by_username_or_email: {
        Args: { identifier: string }
        Returns: {
          email: string
          full_name: string
          user_id: string
          username: string
        }[]
      }
      increment_challenge_participants: {
        Args: { challenge_id: string }
        Returns: undefined
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
