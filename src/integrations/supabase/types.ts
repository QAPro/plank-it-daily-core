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
      ab_test_assignments: {
        Row: {
          assigned_at: string | null
          assignment_hash: string
          feature_name: string
          id: string
          user_id: string
          variant: string
        }
        Insert: {
          assigned_at?: string | null
          assignment_hash: string
          feature_name: string
          id?: string
          user_id: string
          variant: string
        }
        Update: {
          assigned_at?: string | null
          assignment_hash?: string
          feature_name?: string
          id?: string
          user_id?: string
          variant?: string
        }
        Relationships: []
      }
      admin_settings: {
        Row: {
          description: string | null
          id: string
          is_public: boolean | null
          setting_key: string
          setting_value: Json
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          description?: string | null
          id?: string
          is_public?: boolean | null
          setting_key: string
          setting_value?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          description?: string | null
          id?: string
          is_public?: boolean | null
          setting_key?: string
          setting_value?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      analytics_insights: {
        Row: {
          action_required: boolean | null
          category: string | null
          description: string
          expires_at: string
          generated_at: string
          id: string
          insight_data: Json | null
          insight_type: string
          is_read: boolean | null
          priority_level: number | null
          relevance_score: number
          title: string
          user_id: string
        }
        Insert: {
          action_required?: boolean | null
          category?: string | null
          description: string
          expires_at?: string
          generated_at?: string
          id?: string
          insight_data?: Json | null
          insight_type: string
          is_read?: boolean | null
          priority_level?: number | null
          relevance_score?: number
          title: string
          user_id: string
        }
        Update: {
          action_required?: boolean | null
          category?: string | null
          description?: string
          expires_at?: string
          generated_at?: string
          id?: string
          insight_data?: Json | null
          insight_type?: string
          is_read?: boolean | null
          priority_level?: number | null
          relevance_score?: number
          title?: string
          user_id?: string
        }
        Relationships: []
      }
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
      event_challenges: {
        Row: {
          badge_reward: string | null
          challenge_description: string | null
          challenge_title: string
          challenge_type: string
          created_at: string
          difficulty_level: number | null
          event_id: string
          id: string
          is_active: boolean | null
          points_reward: number | null
          target_criteria: Json
        }
        Insert: {
          badge_reward?: string | null
          challenge_description?: string | null
          challenge_title: string
          challenge_type: string
          created_at?: string
          difficulty_level?: number | null
          event_id: string
          id?: string
          is_active?: boolean | null
          points_reward?: number | null
          target_criteria: Json
        }
        Update: {
          badge_reward?: string | null
          challenge_description?: string | null
          challenge_title?: string
          challenge_type?: string
          created_at?: string
          difficulty_level?: number | null
          event_id?: string
          id?: string
          is_active?: boolean | null
          points_reward?: number | null
          target_criteria?: Json
        }
        Relationships: [
          {
            foreignKeyName: "event_challenges_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "seasonal_events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_participants: {
        Row: {
          completion_date: string | null
          event_id: string
          final_score: number | null
          id: string
          is_completed: boolean | null
          joined_at: string
          progress_data: Json | null
          rank_position: number | null
          user_id: string
        }
        Insert: {
          completion_date?: string | null
          event_id: string
          final_score?: number | null
          id?: string
          is_completed?: boolean | null
          joined_at?: string
          progress_data?: Json | null
          rank_position?: number | null
          user_id: string
        }
        Update: {
          completion_date?: string | null
          event_id?: string
          final_score?: number | null
          id?: string
          is_completed?: boolean | null
          joined_at?: string
          progress_data?: Json | null
          rank_position?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_participants_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "seasonal_events"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_cohorts: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          rules: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          rules?: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          rules?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      feature_flags: {
        Row: {
          ab_test_config: Json | null
          cohort_rules: Json | null
          created_at: string
          created_by: string | null
          description: string | null
          feature_name: string
          id: string
          is_enabled: boolean
          rollout_end_date: string | null
          rollout_percentage: number | null
          rollout_start_date: string | null
          rollout_strategy: string | null
          target_audience: string | null
          updated_at: string
        }
        Insert: {
          ab_test_config?: Json | null
          cohort_rules?: Json | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          feature_name: string
          id?: string
          is_enabled?: boolean
          rollout_end_date?: string | null
          rollout_percentage?: number | null
          rollout_start_date?: string | null
          rollout_strategy?: string | null
          target_audience?: string | null
          updated_at?: string
        }
        Update: {
          ab_test_config?: Json | null
          cohort_rules?: Json | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          feature_name?: string
          id?: string
          is_enabled?: boolean
          rollout_end_date?: string | null
          rollout_percentage?: number | null
          rollout_start_date?: string | null
          rollout_strategy?: string | null
          target_audience?: string | null
          updated_at?: string
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
      fitness_leagues: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          league_type: string
          max_participants_per_division: number | null
          name: string
          ranking_algorithm: string | null
          season_duration_days: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          league_type?: string
          max_participants_per_division?: number | null
          name: string
          ranking_algorithm?: string | null
          season_duration_days?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          league_type?: string
          max_participants_per_division?: number | null
          name?: string
          ranking_algorithm?: string | null
          season_duration_days?: number | null
        }
        Relationships: []
      }
      league_divisions: {
        Row: {
          current_participants: number | null
          division_level: number
          division_name: string
          id: string
          league_id: string
          max_rating: number | null
          min_rating: number | null
          promotion_threshold: number | null
          relegation_threshold: number | null
        }
        Insert: {
          current_participants?: number | null
          division_level: number
          division_name: string
          id?: string
          league_id: string
          max_rating?: number | null
          min_rating?: number | null
          promotion_threshold?: number | null
          relegation_threshold?: number | null
        }
        Update: {
          current_participants?: number | null
          division_level?: number
          division_name?: string
          id?: string
          league_id?: string
          max_rating?: number | null
          min_rating?: number | null
          promotion_threshold?: number | null
          relegation_threshold?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "league_divisions_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "fitness_leagues"
            referencedColumns: ["id"]
          },
        ]
      }
      league_participants: {
        Row: {
          current_rating: number | null
          current_streak: number | null
          division_id: string
          id: string
          joined_at: string
          last_match_at: string | null
          league_id: string
          longest_streak: number | null
          matches_played: number | null
          matches_won: number | null
          peak_rating: number | null
          season_points: number | null
          user_id: string
        }
        Insert: {
          current_rating?: number | null
          current_streak?: number | null
          division_id: string
          id?: string
          joined_at?: string
          last_match_at?: string | null
          league_id: string
          longest_streak?: number | null
          matches_played?: number | null
          matches_won?: number | null
          peak_rating?: number | null
          season_points?: number | null
          user_id: string
        }
        Update: {
          current_rating?: number | null
          current_streak?: number | null
          division_id?: string
          id?: string
          joined_at?: string
          last_match_at?: string | null
          league_id?: string
          longest_streak?: number | null
          matches_played?: number | null
          matches_won?: number | null
          peak_rating?: number | null
          season_points?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "league_participants_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "league_divisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "league_participants_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "fitness_leagues"
            referencedColumns: ["id"]
          },
        ]
      }
      league_seasons: {
        Row: {
          created_at: string
          end_date: string
          id: string
          is_active: boolean | null
          league_id: string
          season_number: number
          season_rewards: Json | null
          start_date: string
          total_participants: number | null
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          is_active?: boolean | null
          league_id: string
          season_number: number
          season_rewards?: Json | null
          start_date: string
          total_participants?: number | null
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          is_active?: boolean | null
          league_id?: string
          season_number?: number
          season_rewards?: Json | null
          start_date?: string
          total_participants?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "league_seasons_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "fitness_leagues"
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
      ml_predictions: {
        Row: {
          confidence_score: number
          expires_at: string
          generated_at: string
          id: string
          input_data_hash: string | null
          is_active: boolean | null
          model_version: string | null
          prediction_data: Json
          prediction_type: string
          user_id: string
        }
        Insert: {
          confidence_score?: number
          expires_at?: string
          generated_at?: string
          id?: string
          input_data_hash?: string | null
          is_active?: boolean | null
          model_version?: string | null
          prediction_data: Json
          prediction_type: string
          user_id: string
        }
        Update: {
          confidence_score?: number
          expires_at?: string
          generated_at?: string
          id?: string
          input_data_hash?: string | null
          is_active?: boolean | null
          model_version?: string | null
          prediction_data?: Json
          prediction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      performance_benchmarks: {
        Row: {
          data_period: string | null
          exercise_id: string | null
          id: string
          last_updated: string
          metric_type: string
          percentile_data: Json
          sample_size: number
          user_segment: string
        }
        Insert: {
          data_period?: string | null
          exercise_id?: string | null
          id?: string
          last_updated?: string
          metric_type: string
          percentile_data: Json
          sample_size: number
          user_segment: string
        }
        Update: {
          data_period?: string | null
          exercise_id?: string | null
          id?: string
          last_updated?: string
          metric_type?: string
          percentile_data?: Json
          sample_size?: number
          user_segment?: string
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
      seasonal_events: {
        Row: {
          created_at: string
          created_by: string | null
          current_participants: number | null
          description: string | null
          end_date: string
          event_type: string
          id: string
          is_active: boolean | null
          max_participants: number | null
          participation_requirements: Json | null
          reward_data: Json | null
          start_date: string
          theme_data: Json | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          current_participants?: number | null
          description?: string | null
          end_date: string
          event_type?: string
          id?: string
          is_active?: boolean | null
          max_participants?: number | null
          participation_requirements?: Json | null
          reward_data?: Json | null
          start_date: string
          theme_data?: Json | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          current_participants?: number | null
          description?: string | null
          end_date?: string
          event_type?: string
          id?: string
          is_active?: boolean | null
          max_participants?: number | null
          participation_requirements?: Json | null
          reward_data?: Json | null
          start_date?: string
          theme_data?: Json | null
          title?: string
          updated_at?: string
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
      tournament_matches: {
        Row: {
          completed_at: string | null
          id: string
          match_data: Json | null
          match_number: number
          participant1_id: string | null
          participant2_id: string | null
          round_number: number
          scheduled_at: string | null
          status: string | null
          tournament_id: string
          winner_id: string | null
        }
        Insert: {
          completed_at?: string | null
          id?: string
          match_data?: Json | null
          match_number: number
          participant1_id?: string | null
          participant2_id?: string | null
          round_number: number
          scheduled_at?: string | null
          status?: string | null
          tournament_id: string
          winner_id?: string | null
        }
        Update: {
          completed_at?: string | null
          id?: string
          match_data?: Json | null
          match_number?: number
          participant1_id?: string | null
          participant2_id?: string | null
          round_number?: number
          scheduled_at?: string | null
          status?: string | null
          tournament_id?: string
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tournament_matches_participant1_id_fkey"
            columns: ["participant1_id"]
            isOneToOne: false
            referencedRelation: "tournament_participants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_matches_participant2_id_fkey"
            columns: ["participant2_id"]
            isOneToOne: false
            referencedRelation: "tournament_participants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_matches_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_matches_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "tournament_participants"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_participants: {
        Row: {
          current_round: number | null
          elimination_round: number | null
          id: string
          is_eliminated: boolean | null
          registered_at: string
          seed_position: number | null
          total_score: number | null
          tournament_id: string
          user_id: string
        }
        Insert: {
          current_round?: number | null
          elimination_round?: number | null
          id?: string
          is_eliminated?: boolean | null
          registered_at?: string
          seed_position?: number | null
          total_score?: number | null
          tournament_id: string
          user_id: string
        }
        Update: {
          current_round?: number | null
          elimination_round?: number | null
          id?: string
          is_eliminated?: boolean | null
          registered_at?: string
          seed_position?: number | null
          total_score?: number | null
          tournament_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournament_participants_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournaments: {
        Row: {
          bracket_size: number
          created_at: string
          created_by: string | null
          current_participants: number | null
          description: string | null
          entry_requirements: Json | null
          id: string
          max_participants: number | null
          prize_pool: Json | null
          registration_end: string
          registration_start: string
          status: string | null
          title: string
          tournament_end: string
          tournament_start: string
          tournament_type: string
          updated_at: string
        }
        Insert: {
          bracket_size: number
          created_at?: string
          created_by?: string | null
          current_participants?: number | null
          description?: string | null
          entry_requirements?: Json | null
          id?: string
          max_participants?: number | null
          prize_pool?: Json | null
          registration_end: string
          registration_start: string
          status?: string | null
          title: string
          tournament_end: string
          tournament_start: string
          tournament_type?: string
          updated_at?: string
        }
        Update: {
          bracket_size?: number
          created_at?: string
          created_by?: string | null
          current_participants?: number | null
          description?: string | null
          entry_requirements?: Json | null
          id?: string
          max_participants?: number | null
          prize_pool?: Json | null
          registration_end?: string
          registration_start?: string
          status?: string | null
          title?: string
          tournament_end?: string
          tournament_start?: string
          tournament_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      training_load_history: {
        Row: {
          actual_load: number | null
          created_at: string
          date: string
          id: string
          load_score: number | null
          notes: string | null
          planned_load: number | null
          recovery_score: number | null
          stress_indicators: Json | null
          user_id: string
        }
        Insert: {
          actual_load?: number | null
          created_at?: string
          date: string
          id?: string
          load_score?: number | null
          notes?: string | null
          planned_load?: number | null
          recovery_score?: number | null
          stress_indicators?: Json | null
          user_id: string
        }
        Update: {
          actual_load?: number | null
          created_at?: string
          date?: string
          id?: string
          load_score?: number | null
          notes?: string | null
          planned_load?: number | null
          recovery_score?: number | null
          stress_indicators?: Json | null
          user_id?: string
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
      user_cohort_memberships: {
        Row: {
          assigned_at: string | null
          cohort_id: string | null
          expires_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          cohort_id?: string | null
          expires_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          cohort_id?: string | null
          expires_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_cohort_memberships_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "feature_cohorts"
            referencedColumns: ["id"]
          },
        ]
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
      user_goals: {
        Row: {
          achievement_probability: number | null
          category: string | null
          completed_at: string | null
          created_at: string
          current_value: number | null
          description: string | null
          estimated_completion_date: string | null
          goal_type: string
          id: string
          is_active: boolean | null
          measurement_unit: string | null
          milestone_values: Json | null
          priority_level: number | null
          target_date: string
          target_value: number
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          achievement_probability?: number | null
          category?: string | null
          completed_at?: string | null
          created_at?: string
          current_value?: number | null
          description?: string | null
          estimated_completion_date?: string | null
          goal_type: string
          id?: string
          is_active?: boolean | null
          measurement_unit?: string | null
          milestone_values?: Json | null
          priority_level?: number | null
          target_date: string
          target_value: number
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          achievement_probability?: number | null
          category?: string | null
          completed_at?: string | null
          created_at?: string
          current_value?: number | null
          description?: string | null
          estimated_completion_date?: string | null
          goal_type?: string
          id?: string
          is_active?: boolean | null
          measurement_unit?: string | null
          milestone_values?: Json | null
          priority_level?: number | null
          target_date?: string
          target_value?: number
          title?: string
          updated_at?: string
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
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
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
      bootstrap_first_admin: {
        Args: { user_email: string }
        Returns: boolean
      }
      evaluate_user_cohort: {
        Args: { _cohort_rules: Json; _user_id: string }
        Returns: boolean
      }
      find_user_by_username_or_email: {
        Args: { identifier: string }
        Returns: {
          email: string
          full_name: string
          user_id: string
          username: string
        }[]
      }
      get_active_users_metrics: {
        Args: Record<PropertyKey, never>
        Returns: {
          metric_type: string
          metric_value: number
          period_label: string
        }[]
      }
      get_admin_activity_summary: {
        Args: { days_back?: number }
        Returns: {
          action_count: number
          action_type: string
          last_action_at: string
        }[]
      }
      get_feature_flag_analytics: {
        Args: Record<PropertyKey, never>
        Returns: {
          adoption_rate: number
          enabled_evaluations: number
          feature_name: string
          total_evaluations: number
          unique_users: number
        }[]
      }
      get_user_engagement_summary: {
        Args: Record<PropertyKey, never>
        Returns: {
          active_this_week: number
          active_today: number
          avg_session_duration: number
          avg_sessions_per_user: number
          total_sessions: number
          total_users: number
        }[]
      }
      get_user_feature_flag: {
        Args: { _feature_name: string; _user_id: string }
        Returns: Json
      }
      get_user_registration_trends: {
        Args: { days_back?: number }
        Returns: {
          cumulative_users: number
          date: string
          new_users: number
        }[]
      }
      get_workout_completion_analytics: {
        Args: { days_back?: number }
        Returns: {
          avg_duration: number
          completion_rate: number
          exercise_name: string
          popularity_rank: number
          total_attempts: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_challenge_participants: {
        Args: { challenge_id: string }
        Returns: undefined
      }
      is_admin: {
        Args: { _user_id?: string }
        Returns: boolean
      }
      refresh_user_cohort_memberships: {
        Args: { _user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
