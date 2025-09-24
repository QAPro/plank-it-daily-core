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
    PostgrestVersion: "13.0.5"
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
      activity_comments: {
        Row: {
          activity_id: string
          content: string
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          activity_id: string
          content: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          activity_id?: string
          content?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_comments_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "friend_activities"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_audit_log: {
        Row: {
          action_details: Json | null
          action_type: string
          admin_user_id: string | null
          affected_count: number | null
          created_at: string | null
          id: string
          reason: string | null
          target_user_id: string | null
        }
        Insert: {
          action_details?: Json | null
          action_type: string
          admin_user_id?: string | null
          affected_count?: number | null
          created_at?: string | null
          id?: string
          reason?: string | null
          target_user_id?: string | null
        }
        Update: {
          action_details?: Json | null
          action_type?: string
          admin_user_id?: string | null
          affected_count?: number | null
          created_at?: string | null
          id?: string
          reason?: string | null
          target_user_id?: string | null
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
      admin_user_notes: {
        Row: {
          content: string
          created_at: string
          created_by: string
          id: string
          is_important: boolean
          note_type: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by: string
          id?: string
          is_important?: boolean
          note_type?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string
          id?: string
          is_important?: boolean
          note_type?: string
          title?: string
          updated_at?: string
          user_id?: string
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
      avatar_options: {
        Row: {
          category: string
          created_at: string
          display_order: number
          id: string
          image_url: string
          is_active: boolean
          name: string
        }
        Insert: {
          category?: string
          created_at?: string
          display_order?: number
          id?: string
          image_url: string
          is_active?: boolean
          name: string
        }
        Update: {
          category?: string
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string
          is_active?: boolean
          name?: string
        }
        Relationships: []
      }
      billing_transactions: {
        Row: {
          amount_cents: number
          created_at: string
          currency: string
          description: string | null
          id: string
          status: string
          stripe_payment_intent_id: string | null
          subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          status?: string
          stripe_payment_intent_id?: string | null
          subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          status?: string
          stripe_payment_intent_id?: string | null
          subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_transactions_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      bulk_operations: {
        Row: {
          affected_user_ids: string[] | null
          completed_at: string | null
          created_at: string | null
          error_details: Json | null
          id: string
          initiated_by: string | null
          operation_data: Json | null
          operation_type: string
          progress_count: number | null
          status: string | null
          target_criteria: Json | null
          total_count: number | null
        }
        Insert: {
          affected_user_ids?: string[] | null
          completed_at?: string | null
          created_at?: string | null
          error_details?: Json | null
          id?: string
          initiated_by?: string | null
          operation_data?: Json | null
          operation_type: string
          progress_count?: number | null
          status?: string | null
          target_criteria?: Json | null
          total_count?: number | null
        }
        Update: {
          affected_user_ids?: string[] | null
          completed_at?: string | null
          created_at?: string | null
          error_details?: Json | null
          id?: string
          initiated_by?: string | null
          operation_data?: Json | null
          operation_type?: string
          progress_count?: number | null
          status?: string | null
          target_criteria?: Json | null
          total_count?: number | null
        }
        Relationships: []
      }
      certifications: {
        Row: {
          approved_at: string | null
          certification_data: Json | null
          certification_level: string
          created_at: string
          evidence_urls: string[] | null
          exercise_id: string
          expires_at: string | null
          id: string
          status: string
          user_id: string
          validation_type: string
          validator_id: string | null
        }
        Insert: {
          approved_at?: string | null
          certification_data?: Json | null
          certification_level?: string
          created_at?: string
          evidence_urls?: string[] | null
          exercise_id: string
          expires_at?: string | null
          id?: string
          status?: string
          user_id: string
          validation_type?: string
          validator_id?: string | null
        }
        Update: {
          approved_at?: string | null
          certification_data?: Json | null
          certification_level?: string
          created_at?: string
          evidence_urls?: string[] | null
          exercise_id?: string
          expires_at?: string | null
          id?: string
          status?: string
          user_id?: string
          validation_type?: string
          validator_id?: string | null
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
      community_challenge_participants: {
        Row: {
          challenge_id: string
          completed_at: string | null
          completion_percentage: number | null
          id: string
          joined_at: string
          participation_status: string
          progress_data: Json | null
          user_id: string
        }
        Insert: {
          challenge_id: string
          completed_at?: string | null
          completion_percentage?: number | null
          id?: string
          joined_at?: string
          participation_status?: string
          progress_data?: Json | null
          user_id: string
        }
        Update: {
          challenge_id?: string
          completed_at?: string | null
          completion_percentage?: number | null
          id?: string
          joined_at?: string
          participation_status?: string
          progress_data?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_challenge_participants_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "community_success_challenges"
            referencedColumns: ["id"]
          },
        ]
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
      community_success_challenges: {
        Row: {
          challenge_description: string
          challenge_rules: Json
          challenge_title: string
          challenge_type: string
          created_at: string
          creator_id: string
          current_participants: number | null
          end_date: string
          id: string
          is_public: boolean | null
          max_participants: number | null
          reward_type: string | null
          start_date: string
          success_criteria: Json
          updated_at: string
        }
        Insert: {
          challenge_description: string
          challenge_rules?: Json
          challenge_title: string
          challenge_type?: string
          created_at?: string
          creator_id: string
          current_participants?: number | null
          end_date: string
          id?: string
          is_public?: boolean | null
          max_participants?: number | null
          reward_type?: string | null
          start_date: string
          success_criteria?: Json
          updated_at?: string
        }
        Update: {
          challenge_description?: string
          challenge_rules?: Json
          challenge_title?: string
          challenge_type?: string
          created_at?: string
          creator_id?: string
          current_participants?: number | null
          end_date?: string
          id?: string
          is_public?: boolean | null
          max_participants?: number | null
          reward_type?: string | null
          start_date?: string
          success_criteria?: Json
          updated_at?: string
        }
        Relationships: []
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
      data_export_requests: {
        Row: {
          complexity_score: number
          created_at: string
          data_interconnection_count: number
          estimated_completion_hours: number
          expires_at: string
          export_type: string
          id: string
          status: string
          user_id: string
          warning_acknowledged: boolean
        }
        Insert: {
          complexity_score?: number
          created_at?: string
          data_interconnection_count?: number
          estimated_completion_hours?: number
          expires_at?: string
          export_type: string
          id?: string
          status?: string
          user_id: string
          warning_acknowledged?: boolean
        }
        Update: {
          complexity_score?: number
          created_at?: string
          data_interconnection_count?: number
          estimated_completion_hours?: number
          expires_at?: string
          export_type?: string
          id?: string
          status?: string
          user_id?: string
          warning_acknowledged?: boolean
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
      exclusive_features: {
        Row: {
          created_at: string
          current_users: number | null
          feature_name: string
          feature_type: string
          id: string
          invitation_requirements: Json
          is_active: boolean
          max_users: number | null
          prestige_value: number
          scarcity_multiplier: number
        }
        Insert: {
          created_at?: string
          current_users?: number | null
          feature_name: string
          feature_type: string
          id?: string
          invitation_requirements?: Json
          is_active?: boolean
          max_users?: number | null
          prestige_value?: number
          scarcity_multiplier?: number
        }
        Update: {
          created_at?: string
          current_users?: number | null
          feature_name?: string
          feature_type?: string
          id?: string
          invitation_requirements?: Json
          is_active?: boolean
          max_users?: number | null
          prestige_value?: number
          scarcity_multiplier?: number
        }
        Relationships: []
      }
      exercise_families: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number
          family_key: string
          family_name: string
          icon_name: string | null
          id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number
          family_key: string
          family_name: string
          icon_name?: string | null
          id?: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number
          family_key?: string
          family_name?: string
          icon_name?: string | null
          id?: string
        }
        Relationships: []
      }
      exercise_masteries: {
        Row: {
          best_performance: Json | null
          consistency_score: number | null
          created_at: string
          exercise_id: string
          id: string
          last_practice_at: string | null
          mastery_level: number
          mastery_unlocked_at: string | null
          progression_score: number | null
          technique_score: number | null
          total_sessions: number
          updated_at: string
          user_id: string
          validation_data: Json | null
        }
        Insert: {
          best_performance?: Json | null
          consistency_score?: number | null
          created_at?: string
          exercise_id: string
          id?: string
          last_practice_at?: string | null
          mastery_level?: number
          mastery_unlocked_at?: string | null
          progression_score?: number | null
          technique_score?: number | null
          total_sessions?: number
          updated_at?: string
          user_id: string
          validation_data?: Json | null
        }
        Update: {
          best_performance?: Json | null
          consistency_score?: number | null
          created_at?: string
          exercise_id?: string
          id?: string
          last_practice_at?: string | null
          mastery_level?: number
          mastery_unlocked_at?: string | null
          progression_score?: number | null
          technique_score?: number | null
          total_sessions?: number
          updated_at?: string
          user_id?: string
          validation_data?: Json | null
        }
        Relationships: []
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
      featured_users: {
        Row: {
          created_at: string
          end_date: string | null
          feature_type: string
          featured_data: Json
          featured_for: string
          id: string
          is_active: boolean
          start_date: string
          user_id: string
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          feature_type?: string
          featured_data?: Json
          featured_for: string
          id?: string
          is_active?: boolean
          start_date?: string
          user_id: string
        }
        Update: {
          created_at?: string
          end_date?: string | null
          feature_type?: string
          featured_data?: Json
          featured_for?: string
          id?: string
          is_active?: boolean
          start_date?: string
          user_id?: string
        }
        Relationships: []
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
      friction_point_logs: {
        Row: {
          created_at: string
          friction_data: Json | null
          friction_location: string
          friction_type: string
          id: string
          impact_score: number | null
          resolution_method: string | null
          session_id: string | null
          time_to_resolve_seconds: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          friction_data?: Json | null
          friction_location: string
          friction_type: string
          id?: string
          impact_score?: number | null
          resolution_method?: string | null
          session_id?: string | null
          time_to_resolve_seconds?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          friction_data?: Json | null
          friction_location?: string
          friction_type?: string
          id?: string
          impact_score?: number | null
          resolution_method?: string | null
          session_id?: string | null
          time_to_resolve_seconds?: number | null
          user_id?: string
        }
        Relationships: []
      }
      friend_activities: {
        Row: {
          activity_data: Json
          activity_type: string
          created_at: string
          id: string
          shares_count: number
          updated_at: string
          user_id: string
          visibility: string
        }
        Insert: {
          activity_data?: Json
          activity_type: string
          created_at?: string
          id?: string
          shares_count?: number
          updated_at?: string
          user_id: string
          visibility?: string
        }
        Update: {
          activity_data?: Json
          activity_type?: string
          created_at?: string
          id?: string
          shares_count?: number
          updated_at?: string
          user_id?: string
          visibility?: string
        }
        Relationships: []
      }
      friend_reactions: {
        Row: {
          activity_id: string
          created_at: string
          id: string
          reaction_type: string
          user_id: string
        }
        Insert: {
          activity_id: string
          created_at?: string
          id?: string
          reaction_type: string
          user_id: string
        }
        Update: {
          activity_id?: string
          created_at?: string
          id?: string
          reaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "friend_reactions_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "friend_activities"
            referencedColumns: ["id"]
          },
        ]
      }
      friends: {
        Row: {
          created_at: string
          friend_id: string
          id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          friend_id: string
          id?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          friend_id?: string
          id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      hook_cycle_events: {
        Row: {
          action_duration_seconds: number | null
          action_taken: boolean | null
          action_type: string | null
          created_at: string
          cycle_completed_at: string | null
          cycle_start_at: string
          cycle_success_score: number | null
          id: string
          investment_actions: Json | null
          reward_data: Json | null
          reward_given: string | null
          trigger_data: Json | null
          trigger_type: string
          user_id: string
        }
        Insert: {
          action_duration_seconds?: number | null
          action_taken?: boolean | null
          action_type?: string | null
          created_at?: string
          cycle_completed_at?: string | null
          cycle_start_at?: string
          cycle_success_score?: number | null
          id?: string
          investment_actions?: Json | null
          reward_data?: Json | null
          reward_given?: string | null
          trigger_data?: Json | null
          trigger_type: string
          user_id: string
        }
        Update: {
          action_duration_seconds?: number | null
          action_taken?: boolean | null
          action_type?: string | null
          created_at?: string
          cycle_completed_at?: string | null
          cycle_start_at?: string
          cycle_success_score?: number | null
          id?: string
          investment_actions?: Json | null
          reward_data?: Json | null
          reward_given?: string | null
          trigger_data?: Json | null
          trigger_type?: string
          user_id?: string
        }
        Relationships: []
      }
      investment_streaks: {
        Row: {
          created_at: string
          current_multiplier: number
          id: string
          last_activity_date: string
          max_multiplier_achieved: number
          streak_type: string
          total_investment_value: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_multiplier?: number
          id?: string
          last_activity_date?: string
          max_multiplier_achieved?: number
          streak_type: string
          total_investment_value?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_multiplier?: number
          id?: string
          last_activity_date?: string
          max_multiplier_achieved?: number
          streak_type?: string
          total_investment_value?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      leadership_candidates: {
        Row: {
          candidate_type: string
          created_at: string
          id: string
          qualification_data: Json
          qualification_date: string
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          candidate_type: string
          created_at?: string
          id?: string
          qualification_data?: Json
          qualification_date?: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          candidate_type?: string
          created_at?: string
          id?: string
          qualification_data?: Json
          qualification_date?: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string
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
          created_at: string
          feature_name: string
          feature_type: string
          id: string
          is_active: boolean
          level_required: number
          track_name: string
          unlock_data: Json
        }
        Insert: {
          created_at?: string
          feature_name: string
          feature_type?: string
          id?: string
          is_active?: boolean
          level_required: number
          track_name: string
          unlock_data?: Json
        }
        Update: {
          created_at?: string
          feature_name?: string
          feature_type?: string
          id?: string
          is_active?: boolean
          level_required?: number
          track_name?: string
          unlock_data?: Json
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
      notification_interactions: {
        Row: {
          action: string
          category: string | null
          clicked_at: string
          data: Json | null
          id: string
          notification_type: string
          user_id: string
        }
        Insert: {
          action: string
          category?: string | null
          clicked_at?: string
          data?: Json | null
          id?: string
          notification_type: string
          user_id: string
        }
        Update: {
          action?: string
          category?: string | null
          clicked_at?: string
          data?: Json | null
          id?: string
          notification_type?: string
          user_id?: string
        }
        Relationships: []
      }
      notification_logs: {
        Row: {
          body: string
          data: Json | null
          delivery_status: string | null
          error_message: string | null
          experiment_key: string | null
          id: string
          notification_type: string
          sender_user_id: string | null
          sent_at: string | null
          slot: string | null
          title: string
          user_id: string
          variant_key: string | null
        }
        Insert: {
          body: string
          data?: Json | null
          delivery_status?: string | null
          error_message?: string | null
          experiment_key?: string | null
          id?: string
          notification_type: string
          sender_user_id?: string | null
          sent_at?: string | null
          slot?: string | null
          title: string
          user_id: string
          variant_key?: string | null
        }
        Update: {
          body?: string
          data?: Json | null
          delivery_status?: string | null
          error_message?: string | null
          experiment_key?: string | null
          id?: string
          notification_type?: string
          sender_user_id?: string | null
          sent_at?: string | null
          slot?: string | null
          title?: string
          user_id?: string
          variant_key?: string | null
        }
        Relationships: []
      }
      notification_message_variants: {
        Row: {
          body_template: string | null
          category: string
          content: Json
          created_at: string
          created_by: string | null
          experiment_key: string | null
          id: string
          is_active: boolean
          slot: string | null
          title_template: string | null
          updated_at: string
          variant_key: string
          weight: number | null
        }
        Insert: {
          body_template?: string | null
          category: string
          content: Json
          created_at?: string
          created_by?: string | null
          experiment_key?: string | null
          id?: string
          is_active?: boolean
          slot?: string | null
          title_template?: string | null
          updated_at?: string
          variant_key: string
          weight?: number | null
        }
        Update: {
          body_template?: string | null
          category?: string
          content?: Json
          created_at?: string
          created_by?: string | null
          experiment_key?: string | null
          id?: string
          is_active?: boolean
          slot?: string | null
          title_template?: string | null
          updated_at?: string
          variant_key?: string
          weight?: number | null
        }
        Relationships: []
      }
      optimization_experiments: {
        Row: {
          created_at: string
          created_by: string | null
          end_date: string | null
          experiment_name: string
          experiment_type: string
          id: string
          is_active: boolean | null
          results: Json | null
          start_date: string
          target_metric: string
          variant_a_config: Json
          variant_b_config: Json
          winner_variant: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          end_date?: string | null
          experiment_name: string
          experiment_type: string
          id?: string
          is_active?: boolean | null
          results?: Json | null
          start_date?: string
          target_metric: string
          variant_a_config?: Json
          variant_b_config?: Json
          winner_variant?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          end_date?: string | null
          experiment_name?: string
          experiment_type?: string
          id?: string
          is_active?: boolean | null
          results?: Json | null
          start_date?: string
          target_metric?: string
          variant_a_config?: Json
          variant_b_config?: Json
          winner_variant?: string | null
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
      push_subscriptions: {
        Row: {
          auth_key: string
          created_at: string | null
          endpoint: string
          id: string
          is_active: boolean | null
          p256dh_key: string
          updated_at: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          auth_key: string
          created_at?: string | null
          endpoint: string
          id?: string
          is_active?: boolean | null
          p256dh_key: string
          updated_at?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          auth_key?: string
          created_at?: string | null
          endpoint?: string
          id?: string
          is_active?: boolean | null
          p256dh_key?: string
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      reputation_events: {
        Row: {
          actor_id: string
          created_at: string
          domain: string | null
          event_type: string
          id: string
          note: string | null
          points: number
          user_id: string
        }
        Insert: {
          actor_id: string
          created_at?: string
          domain?: string | null
          event_type: string
          id?: string
          note?: string | null
          points?: number
          user_id: string
        }
        Update: {
          actor_id?: string
          created_at?: string
          domain?: string | null
          event_type?: string
          id?: string
          note?: string | null
          points?: number
          user_id?: string
        }
        Relationships: []
      }
      seasonal_certifications: {
        Row: {
          certification_name: string
          created_at: string
          current_holders: number | null
          end_date: string
          expiry_date: string
          id: string
          maintenance_requirement: Json
          max_holders: number | null
          prestige_value: number
          season_period: string
          season_year: number
          start_date: string
        }
        Insert: {
          certification_name: string
          created_at?: string
          current_holders?: number | null
          end_date: string
          expiry_date: string
          id?: string
          maintenance_requirement?: Json
          max_holders?: number | null
          prestige_value?: number
          season_period: string
          season_year: number
          start_date: string
        }
        Update: {
          certification_name?: string
          created_at?: string
          current_holders?: number | null
          end_date?: string
          expiry_date?: string
          id?: string
          maintenance_requirement?: Json
          max_holders?: number | null
          prestige_value?: number
          season_period?: string
          season_year?: number
          start_date?: string
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
      skill_requirements: {
        Row: {
          created_at: string
          exercise_id: string
          id: string
          required_exercise_id: string
          required_mastery_level: number
          requirement_type: string
          unlock_data: Json | null
        }
        Insert: {
          created_at?: string
          exercise_id: string
          id?: string
          required_exercise_id: string
          required_mastery_level?: number
          requirement_type?: string
          unlock_data?: Json | null
        }
        Update: {
          created_at?: string
          exercise_id?: string
          id?: string
          required_exercise_id?: string
          required_mastery_level?: number
          requirement_type?: string
          unlock_data?: Json | null
        }
        Relationships: []
      }
      special_permissions: {
        Row: {
          created_at: string
          expires_at: string | null
          granted_by: string | null
          id: string
          is_active: boolean
          permission_type: string
          reason: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          granted_by?: string | null
          id?: string
          is_active?: boolean
          permission_type: string
          reason?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          granted_by?: string | null
          id?: string
          is_active?: boolean
          permission_type?: string
          reason?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          billing_interval: string
          created_at: string
          description: string | null
          features: Json | null
          id: string
          is_active: boolean | null
          is_popular: boolean
          name: string
          price_cents: number
          sort_order: number
          stripe_price_id: string | null
          updated_at: string
        }
        Insert: {
          billing_interval?: string
          created_at?: string
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          is_popular?: boolean
          name: string
          price_cents?: number
          sort_order?: number
          stripe_price_id?: string | null
          updated_at?: string
        }
        Update: {
          billing_interval?: string
          created_at?: string
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          is_popular?: boolean
          name?: string
          price_cents?: number
          sort_order?: number
          stripe_price_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean
          canceled_at: string | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan_id: string
          status: string
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id: string
          status?: string
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id?: string
          status?: string
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      success_story_comments: {
        Row: {
          comment_text: string
          created_at: string
          id: string
          is_encouragement: boolean | null
          story_id: string
          user_id: string
        }
        Insert: {
          comment_text: string
          created_at?: string
          id?: string
          is_encouragement?: boolean | null
          story_id: string
          user_id: string
        }
        Update: {
          comment_text?: string
          created_at?: string
          id?: string
          is_encouragement?: boolean | null
          story_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "success_story_comments_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "user_success_stories"
            referencedColumns: ["id"]
          },
        ]
      }
      success_story_reactions: {
        Row: {
          created_at: string
          id: string
          reaction_type: string
          story_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          reaction_type?: string
          story_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          reaction_type?: string
          story_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "success_story_reactions_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "user_success_stories"
            referencedColumns: ["id"]
          },
        ]
      }
      technique_validations: {
        Row: {
          created_at: string
          exercise_id: string
          form_feedback: string | null
          id: string
          improvement_suggestions: string | null
          technique_rating: number
          user_id: string
          validation_video_url: string | null
          validator_id: string
        }
        Insert: {
          created_at?: string
          exercise_id: string
          form_feedback?: string | null
          id?: string
          improvement_suggestions?: string | null
          technique_rating: number
          user_id: string
          validation_video_url?: string | null
          validator_id: string
        }
        Update: {
          created_at?: string
          exercise_id?: string
          form_feedback?: string | null
          id?: string
          improvement_suggestions?: string | null
          technique_rating?: number
          user_id?: string
          validation_video_url?: string | null
          validator_id?: string
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
      trigger_effectiveness_logs: {
        Row: {
          created_at: string
          day_of_week: number
          effectiveness_score: number | null
          id: string
          notification_id: string | null
          response_action: string | null
          response_delay_seconds: number | null
          response_timestamp: string | null
          time_of_day: number
          trigger_content: string | null
          trigger_timestamp: string
          trigger_type: string
          user_context: Json | null
          user_id: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          effectiveness_score?: number | null
          id?: string
          notification_id?: string | null
          response_action?: string | null
          response_delay_seconds?: number | null
          response_timestamp?: string | null
          time_of_day: number
          trigger_content?: string | null
          trigger_timestamp?: string
          trigger_type: string
          user_context?: Json | null
          user_id: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          effectiveness_score?: number | null
          id?: string
          notification_id?: string | null
          response_action?: string | null
          response_delay_seconds?: number | null
          response_timestamp?: string | null
          time_of_day?: number
          trigger_content?: string | null
          trigger_timestamp?: string
          trigger_type?: string
          user_context?: Json | null
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
      user_data_access_audit: {
        Row: {
          access_reason: string | null
          access_type: string
          accessed_fields: string[]
          accessing_user_id: string
          created_at: string | null
          id: string
          ip_address: unknown | null
          target_user_id: string
          user_agent: string | null
        }
        Insert: {
          access_reason?: string | null
          access_type: string
          accessed_fields: string[]
          accessing_user_id: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          target_user_id: string
          user_agent?: string | null
        }
        Update: {
          access_reason?: string | null
          access_type?: string
          accessed_fields?: string[]
          accessing_user_id?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          target_user_id?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      user_data_access_log: {
        Row: {
          access_reason: string | null
          access_type: string
          accessed_fields: string[]
          accessing_user_id: string
          created_at: string | null
          id: string
          target_user_id: string
        }
        Insert: {
          access_reason?: string | null
          access_type: string
          accessed_fields: string[]
          accessing_user_id: string
          created_at?: string | null
          id?: string
          target_user_id: string
        }
        Update: {
          access_reason?: string | null
          access_type?: string
          accessed_fields?: string[]
          accessing_user_id?: string
          created_at?: string | null
          id?: string
          target_user_id?: string
        }
        Relationships: []
      }
      user_exclusive_access: {
        Row: {
          access_level: string
          created_at: string
          feature_id: string
          granted_at: string
          id: string
          investment_value: number
          invited_by: string | null
          user_id: string
        }
        Insert: {
          access_level?: string
          created_at?: string
          feature_id: string
          granted_at?: string
          id?: string
          investment_value?: number
          invited_by?: string | null
          user_id: string
        }
        Update: {
          access_level?: string
          created_at?: string
          feature_id?: string
          granted_at?: string
          id?: string
          investment_value?: number
          invited_by?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_exclusive_access_feature_id_fkey"
            columns: ["feature_id"]
            isOneToOne: false
            referencedRelation: "exclusive_features"
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
      user_feature_overrides: {
        Row: {
          created_at: string
          expires_at: string | null
          feature_name: string
          granted_by: string | null
          id: string
          is_enabled: boolean
          reason: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          feature_name: string
          granted_by?: string | null
          id?: string
          is_enabled?: boolean
          reason?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          feature_name?: string
          granted_by?: string | null
          id?: string
          is_enabled?: boolean
          reason?: string | null
          updated_at?: string
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
      user_investment_weaving: {
        Row: {
          composite_score: number
          created_at: string
          id: string
          interdependency_factor: number
          last_calculated_at: string
          mastery_weight: number
          social_weight: number
          status_weight: number
          updated_at: string
          user_id: string
        }
        Insert: {
          composite_score?: number
          created_at?: string
          id?: string
          interdependency_factor?: number
          last_calculated_at?: string
          mastery_weight?: number
          social_weight?: number
          status_weight?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          composite_score?: number
          created_at?: string
          id?: string
          interdependency_factor?: number
          last_calculated_at?: string
          mastery_weight?: number
          social_weight?: number
          status_weight?: number
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
      user_notification_schedules: {
        Row: {
          created_at: string | null
          enabled: boolean
          id: string
          send_time: string
          slot: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          enabled?: boolean
          id?: string
          send_time?: string
          slot: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          enabled?: boolean
          id?: string
          send_time?: string
          slot?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_notification_variant_assignments: {
        Row: {
          assigned_at: string
          assignment_hash: string | null
          category: string
          id: string
          slot: string | null
          user_id: string
          variant_id: string
        }
        Insert: {
          assigned_at?: string
          assignment_hash?: string | null
          category: string
          id?: string
          slot?: string | null
          user_id: string
          variant_id: string
        }
        Update: {
          assigned_at?: string
          assignment_hash?: string | null
          category?: string
          id?: string
          slot?: string | null
          user_id?: string
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_notification_variant_assignments_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "notification_message_variants"
            referencedColumns: ["id"]
          },
        ]
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
      user_overrides: {
        Row: {
          created_at: string
          expires_at: string | null
          granted_by: string | null
          id: string
          is_active: boolean
          override_data: Json
          override_type: string
          reason: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          granted_by?: string | null
          id?: string
          is_active?: boolean
          override_data?: Json
          override_type: string
          reason?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          granted_by?: string | null
          id?: string
          is_active?: boolean
          override_data?: Json
          override_type?: string
          reason?: string | null
          updated_at?: string
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
          last_duration: number | null
          last_exercise_id: string | null
          last_workout_timestamp: string | null
          music_auto_start: string | null
          music_volume: number | null
          notification_frequency: string | null
          notification_types: Json | null
          preferred_music_genre: string | null
          preferred_workout_duration: number | null
          progression_sensitivity: number | null
          push_notifications_enabled: boolean | null
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          reminder_time: string | null
          sound_effects: boolean | null
          theme_preference: string | null
          time_zone: string | null
          timer_sound_pack: string | null
          timer_theme: string | null
          updated_at: string | null
          user_id: string
          vibration_intensity: number | null
          weekly_goal: number
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
          last_duration?: number | null
          last_exercise_id?: string | null
          last_workout_timestamp?: string | null
          music_auto_start?: string | null
          music_volume?: number | null
          notification_frequency?: string | null
          notification_types?: Json | null
          preferred_music_genre?: string | null
          preferred_workout_duration?: number | null
          progression_sensitivity?: number | null
          push_notifications_enabled?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          reminder_time?: string | null
          sound_effects?: boolean | null
          theme_preference?: string | null
          time_zone?: string | null
          timer_sound_pack?: string | null
          timer_theme?: string | null
          updated_at?: string | null
          user_id: string
          vibration_intensity?: number | null
          weekly_goal?: number
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
          last_duration?: number | null
          last_exercise_id?: string | null
          last_workout_timestamp?: string | null
          music_auto_start?: string | null
          music_volume?: number | null
          notification_frequency?: string | null
          notification_types?: Json | null
          preferred_music_genre?: string | null
          preferred_workout_duration?: number | null
          progression_sensitivity?: number | null
          push_notifications_enabled?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          reminder_time?: string | null
          sound_effects?: boolean | null
          theme_preference?: string | null
          time_zone?: string | null
          timer_sound_pack?: string | null
          timer_theme?: string | null
          updated_at?: string | null
          user_id?: string
          vibration_intensity?: number | null
          weekly_goal?: number
          workout_reminders?: boolean | null
        }
        Relationships: []
      }
      user_reminder_slots: {
        Row: {
          created_at: string
          enabled: boolean
          id: string
          reminder_time: string
          slot: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          id?: string
          reminder_time: string
          slot: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          id?: string
          reminder_time?: string
          slot?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_reputation: {
        Row: {
          domain: string
          expertise_score: number
          id: string
          karma_score: number
          last_updated: string
          total_contributions: number
          total_upvotes: number
          user_id: string
        }
        Insert: {
          domain: string
          expertise_score?: number
          id?: string
          karma_score?: number
          last_updated?: string
          total_contributions?: number
          total_upvotes?: number
          user_id: string
        }
        Update: {
          domain?: string
          expertise_score?: number
          id?: string
          karma_score?: number
          last_updated?: string
          total_contributions?: number
          total_upvotes?: number
          user_id?: string
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
      user_seasonal_certifications: {
        Row: {
          certification_id: string
          created_at: string
          earned_at: string
          expires_at: string
          id: string
          is_expired: boolean
          maintenance_score: number
          updated_at: string
          user_id: string
        }
        Insert: {
          certification_id: string
          created_at?: string
          earned_at?: string
          expires_at: string
          id?: string
          is_expired?: boolean
          maintenance_score?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          certification_id?: string
          created_at?: string
          earned_at?: string
          expires_at?: string
          id?: string
          is_expired?: boolean
          maintenance_score?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_seasonal_certifications_certification_id_fkey"
            columns: ["certification_id"]
            isOneToOne: false
            referencedRelation: "seasonal_certifications"
            referencedColumns: ["id"]
          },
        ]
      }
      user_segments: {
        Row: {
          created_at: string
          created_by: string | null
          criteria: Json
          description: string | null
          id: string
          is_system_segment: boolean | null
          last_refreshed_at: string | null
          name: string
          updated_at: string
          user_count: number | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          criteria?: Json
          description?: string | null
          id?: string
          is_system_segment?: boolean | null
          last_refreshed_at?: string | null
          name: string
          updated_at?: string
          user_count?: number | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          criteria?: Json
          description?: string | null
          id?: string
          is_system_segment?: boolean | null
          last_refreshed_at?: string | null
          name?: string
          updated_at?: string
          user_count?: number | null
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
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          duration_seconds: number
          exercise_id?: string | null
          id?: string
          notes?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          duration_seconds?: number
          exercise_id?: string | null
          id?: string
          notes?: string | null
          user_agent?: string | null
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
      user_status_tracks: {
        Row: {
          awarded_at: string | null
          experience_points: number
          id: string
          level_progress: number
          track_level: number
          track_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          awarded_at?: string | null
          experience_points?: number
          id?: string
          level_progress?: number
          track_level?: number
          track_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          awarded_at?: string | null
          experience_points?: number
          id?: string
          level_progress?: number
          track_level?: number
          track_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      user_success_correlations: {
        Row: {
          confidence_level: number | null
          correlation_key: string
          correlation_type: string
          created_at: string
          id: string
          last_updated: string
          sample_size: number
          success_rate: number
          user_id: string
        }
        Insert: {
          confidence_level?: number | null
          correlation_key: string
          correlation_type: string
          created_at?: string
          id?: string
          last_updated?: string
          sample_size?: number
          success_rate?: number
          user_id: string
        }
        Update: {
          confidence_level?: number | null
          correlation_key?: string
          correlation_type?: string
          created_at?: string
          id?: string
          last_updated?: string
          sample_size?: number
          success_rate?: number
          user_id?: string
        }
        Relationships: []
      }
      user_success_stories: {
        Row: {
          comments_count: number | null
          created_at: string
          id: string
          is_featured: boolean | null
          is_public: boolean | null
          likes_count: number | null
          shares_count: number | null
          story_content: string
          story_title: string
          story_type: string
          transformation_data: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          comments_count?: number | null
          created_at?: string
          id?: string
          is_featured?: boolean | null
          is_public?: boolean | null
          likes_count?: number | null
          shares_count?: number | null
          story_content: string
          story_title: string
          story_type?: string
          transformation_data?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          comments_count?: number | null
          created_at?: string
          id?: string
          is_featured?: boolean | null
          is_public?: boolean | null
          likes_count?: number | null
          shares_count?: number | null
          story_content?: string
          story_title?: string
          story_type?: string
          transformation_data?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_victory_photos: {
        Row: {
          celebration_notes: string | null
          celebration_timestamp: string
          created_at: string
          id: string
          is_public: boolean | null
          milestone_achieved: string | null
          photo_url: string
          stats_overlay: Json | null
          user_id: string
          victory_title: string
        }
        Insert: {
          celebration_notes?: string | null
          celebration_timestamp?: string
          created_at?: string
          id?: string
          is_public?: boolean | null
          milestone_achieved?: string | null
          photo_url: string
          stats_overlay?: Json | null
          user_id: string
          victory_title: string
        }
        Update: {
          celebration_notes?: string | null
          celebration_timestamp?: string
          created_at?: string
          id?: string
          is_public?: boolean | null
          milestone_achieved?: string | null
          photo_url?: string
          stats_overlay?: Json | null
          user_id?: string
          victory_title?: string
        }
        Relationships: []
      }
      user_victory_playlists: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_default: boolean | null
          playlist_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean | null
          playlist_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean | null
          playlist_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
          email_change_sent_at: string | null
          full_name: string | null
          id: string
          pending_new_email: string | null
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
          email_change_sent_at?: string | null
          full_name?: string | null
          id: string
          pending_new_email?: string | null
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
          email_change_sent_at?: string | null
          full_name?: string | null
          id?: string
          pending_new_email?: string | null
          subscription_tier?: string
          total_xp?: number | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      victory_partner_checkins: {
        Row: {
          checkin_type: string
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          partnership_id: string
          receiver_id: string
          sender_id: string
          workout_data: Json | null
        }
        Insert: {
          checkin_type?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          message: string
          partnership_id: string
          receiver_id: string
          sender_id: string
          workout_data?: Json | null
        }
        Update: {
          checkin_type?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          partnership_id?: string
          receiver_id?: string
          sender_id?: string
          workout_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "victory_partner_checkins_partnership_id_fkey"
            columns: ["partnership_id"]
            isOneToOne: false
            referencedRelation: "victory_partnerships"
            referencedColumns: ["id"]
          },
        ]
      }
      victory_partnerships: {
        Row: {
          check_in_frequency: string | null
          created_at: string
          id: string
          motivation_style: string | null
          partner1_id: string
          partner2_id: string
          partnership_end_date: string | null
          partnership_start_date: string | null
          partnership_status: string
          shared_goals: Json | null
          updated_at: string
        }
        Insert: {
          check_in_frequency?: string | null
          created_at?: string
          id?: string
          motivation_style?: string | null
          partner1_id: string
          partner2_id: string
          partnership_end_date?: string | null
          partnership_start_date?: string | null
          partnership_status?: string
          shared_goals?: Json | null
          updated_at?: string
        }
        Update: {
          check_in_frequency?: string | null
          created_at?: string
          id?: string
          motivation_style?: string | null
          partner1_id?: string
          partner2_id?: string
          partnership_end_date?: string | null
          partnership_start_date?: string | null
          partnership_status?: string
          shared_goals?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      victory_playlist_songs: {
        Row: {
          artist_name: string
          created_at: string
          duration_seconds: number | null
          energy_level: number | null
          id: string
          playlist_id: string
          song_title: string
          sort_order: number | null
          victory_moment_tag: string | null
        }
        Insert: {
          artist_name: string
          created_at?: string
          duration_seconds?: number | null
          energy_level?: number | null
          id?: string
          playlist_id: string
          song_title: string
          sort_order?: number | null
          victory_moment_tag?: string | null
        }
        Update: {
          artist_name?: string
          created_at?: string
          duration_seconds?: number | null
          energy_level?: number | null
          id?: string
          playlist_id?: string
          song_title?: string
          sort_order?: number | null
          victory_moment_tag?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "victory_playlist_songs_playlist_id_fkey"
            columns: ["playlist_id"]
            isOneToOne: false
            referencedRelation: "user_victory_playlists"
            referencedColumns: ["id"]
          },
        ]
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
      workout_victory_logs: {
        Row: {
          breakthrough_achieved: boolean | null
          created_at: string
          energy_after: number | null
          energy_before: number | null
          growth_insights: string | null
          id: string
          power_moments: string[] | null
          session_id: string
          todays_win: string | null
          user_id: string
          victory_level: number | null
          victory_notes: string | null
        }
        Insert: {
          breakthrough_achieved?: boolean | null
          created_at?: string
          energy_after?: number | null
          energy_before?: number | null
          growth_insights?: string | null
          id?: string
          power_moments?: string[] | null
          session_id: string
          todays_win?: string | null
          user_id: string
          victory_level?: number | null
          victory_notes?: string | null
        }
        Update: {
          breakthrough_achieved?: boolean | null
          created_at?: string
          energy_after?: number | null
          energy_before?: number | null
          growth_insights?: string | null
          id?: string
          power_moments?: string[] | null
          session_id?: string
          todays_win?: string | null
          user_id?: string
          victory_level?: number | null
          victory_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_victory_logs_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "user_sessions"
            referencedColumns: ["id"]
          },
        ]
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
      user_push_subscription_status: {
        Row: {
          created_at: string | null
          endpoint: string | null
          id: string | null
          is_active: boolean | null
          updated_at: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          endpoint?: string | null
          id?: string | null
          is_active?: boolean | null
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          endpoint?: string | null
          id?: string | null
          is_active?: boolean | null
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      admin_bulk_change_tier: {
        Args: { _new_tier: string; _reason?: string; _user_ids: string[] }
        Returns: number
      }
      admin_change_user_tier: {
        Args: { _new_tier: string; _reason?: string; _target_user_id: string }
        Returns: boolean
      }
      admin_get_subscription_analytics: {
        Args: Record<PropertyKey, never>
        Returns: {
          active_subscriptions: number
          churn_rate: number
          mrr: number
          period_end: string
          period_start: string
          plan_id: string
          plan_name: string
        }[]
      }
      admin_get_user_ids_by_engagement_status: {
        Args: { _status: string }
        Returns: {
          user_id: string
        }[]
      }
      admin_get_user_summary: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          current_level: number
          last_active: string
          subscription_tier: string
          total_xp: number
          user_id: string
          username: string
        }[]
      }
      admin_grant_lifetime_access: {
        Args: {
          _expires_at?: string
          _override_data?: Json
          _reason?: string
          _user_id: string
        }
        Returns: {
          created_at: string
          expires_at: string | null
          granted_by: string | null
          id: string
          is_active: boolean
          override_data: Json
          override_type: string
          reason: string | null
          updated_at: string
          user_id: string
        }
      }
      admin_revoke_lifetime_access: {
        Args: { _override_id: string; _reason?: string }
        Returns: boolean
      }
      assign_role: {
        Args: {
          _reason?: string
          _role: Database["public"]["Enums"]["app_role"]
          _target_user_id: string
        }
        Returns: boolean
      }
      bootstrap_first_admin: {
        Args: { user_email: string }
        Returns: boolean
      }
      calculate_composite_investment_score: {
        Args: {
          _mastery_weight?: number
          _social_weight?: number
          _status_weight?: number
          _user_id: string
        }
        Returns: number
      }
      calculate_mastery_score: {
        Args: {
          consistency_score: number
          progression_score: number
          technique_score: number
        }
        Returns: number
      }
      can_modify_user_roles: {
        Args: { _admin_id: string; _target_user_id: string }
        Returns: boolean
      }
      detect_leadership_candidates: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      does_username_exist: {
        Args: { target_username: string }
        Returns: boolean
      }
      evaluate_user_cohort: {
        Args: { _cohort_rules: Json; _user_id: string }
        Returns: boolean
      }
      find_user_by_username_or_email: {
        Args: { identifier: string }
        Returns: {
          user_id: string
          username: string
        }[]
      }
      find_user_by_username_secure: {
        Args: { search_username: string }
        Returns: {
          avatar_url: string
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
      get_admin_user_summary: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          current_level: number
          subscription_tier: string
          total_xp: number
          user_id: string
          username: string
        }[]
      }
      get_all_user_roles: {
        Args: { _user_id: string }
        Returns: {
          expires_at: string
          granted_at: string
          granted_by: string
          is_active: boolean
          role_name: string
          role_type: string
        }[]
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_device_platform_analytics: {
        Args: { days_back?: number }
        Returns: {
          avg_session_duration: number
          bounce_rate: number
          device_category: string
          platform_type: string
          session_count: number
          user_count: number
        }[]
      }
      get_exercise_family: {
        Args: { difficulty_level: number; exercise_category: string }
        Returns: string
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
      get_onboarding_analytics: {
        Args: { days_back?: number }
        Returns: {
          avg_time_to_complete: number
          completed_users: number
          completion_rate: number
          drop_off_rate: number
          step_name: string
          total_users: number
        }[]
      }
      get_subscription_health_score: {
        Args: { target_user_id: string }
        Returns: {
          health_score: number
          recommendations: Json
          risk_factors: Json
        }[]
      }
      get_user_active_subscription: {
        Args: { _user_id: string }
        Returns: {
          current_period_end: string
          effective_price: number
          is_custom_pricing: boolean
          plan_name: string
          status: string
          subscription_id: string
        }[]
      }
      get_user_billing_history: {
        Args: { limit_count?: number; target_user_id: string }
        Returns: {
          amount_cents: number
          created_at: string
          currency: string
          description: string
          status: string
          stripe_payment_intent_id: string
          transaction_id: string
        }[]
      }
      get_user_display_info: {
        Args: { target_user_id: string }
        Returns: {
          avatar_url: string
          current_level: number
          user_id: string
          username: string
        }[]
      }
      get_user_engagement_metrics: {
        Args: Record<PropertyKey, never>
        Returns: {
          avg_session_duration: number
          engagement_score: number
          engagement_status: string
          last_activity_date: string
          total_sessions: number
          user_id: string
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
      get_user_feature_overrides: {
        Args: { _user_id: string }
        Returns: {
          created_at: string
          expires_at: string
          feature_name: string
          granted_by: string
          id: string
          is_enabled: boolean
          reason: string
          user_id: string
        }[]
      }
      get_user_lifetime_overrides: {
        Args: { _user_id: string }
        Returns: {
          created_at: string
          expires_at: string | null
          granted_by: string | null
          id: string
          is_active: boolean
          override_data: Json
          override_type: string
          reason: string | null
          updated_at: string
          user_id: string
        }[]
      }
      get_user_push_subscription_count: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_user_registration_trends: {
        Args: { days_back?: number }
        Returns: {
          cumulative_users: number
          date: string
          new_users: number
        }[]
      }
      get_user_retention_cohorts: {
        Args: { months_back?: number }
        Returns: {
          cohort_month: string
          cohort_size: number
          week_1_retention: number
          week_12_retention: number
          week_2_retention: number
          week_4_retention: number
          week_8_retention: number
        }[]
      }
      get_user_role_level: {
        Args: { _user_id?: string }
        Returns: number
      }
      get_user_subscription_timeline: {
        Args: { target_user_id: string }
        Returns: {
          amount_cents: number
          event_date: string
          event_description: string
          event_type: string
          plan_name: string
          status: string
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
      grant_admin_role: {
        Args: { _reason?: string; _target_user_id: string }
        Returns: boolean
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
      is_admin_with_audit: {
        Args: { _user_id?: string }
        Returns: boolean
      }
      is_superadmin: {
        Args: { _user_id?: string }
        Returns: boolean
      }
      is_user_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      notify_via_edge_function: {
        Args: { p_payload: Json }
        Returns: undefined
      }
      promote_leadership_candidate: {
        Args: { _admin_id: string; _candidate_id: string; _notes?: string }
        Returns: boolean
      }
      refresh_user_cohort_memberships: {
        Args: { _user_id: string }
        Returns: undefined
      }
      refresh_user_engagement_metrics: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      revoke_admin_role: {
        Args: { _reason?: string; _target_user_id: string }
        Returns: boolean
      }
      revoke_role: {
        Args: {
          _reason?: string
          _role: Database["public"]["Enums"]["app_role"]
          _target_user_id: string
        }
        Returns: boolean
      }
      safe_user_lookup: {
        Args: { search_term: string }
        Returns: {
          avatar_url: string
          user_id: string
          username: string
        }[]
      }
      set_user_feature_override: {
        Args: {
          _expires_at?: string
          _feature_name: string
          _is_enabled: boolean
          _reason?: string
          _user_id: string
        }
        Returns: {
          created_at: string
          expires_at: string | null
          feature_name: string
          granted_by: string | null
          id: string
          is_enabled: boolean
          reason: string | null
          updated_at: string
          user_id: string
        }
      }
      should_refresh_achievement_progress: {
        Args: {
          p_achievement_id: string
          p_last_session_at?: string
          p_user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "moderator"
        | "user"
        | "superadmin"
        | "beta_tester"
        | "support_agent"
        | "content_creator"
        | "subscriber"
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
      app_role: [
        "admin",
        "moderator",
        "user",
        "superadmin",
        "beta_tester",
        "support_agent",
        "content_creator",
        "subscriber",
      ],
    },
  },
} as const
