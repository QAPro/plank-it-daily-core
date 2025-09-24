
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface UserPreferences {
  workout_reminders: boolean;
  reminder_time: string;
  preferred_workout_duration: number;
  difficulty_preference: 'beginner' | 'intermediate' | 'advanced';
  sound_effects: boolean;
  haptic_feedback: boolean;
  theme_preference: 'light' | 'dark' | 'system';
  favorite_exercises: string[];
  avoided_exercises: string[];
  auto_progression: boolean;
  progression_sensitivity: number;
  weekly_goal: number;
  daily_sessions: number;
  // Enhanced timer V2 fields:
  timer_theme: string;
  timer_sound_pack: string;
  coaching_voice: string;
  breathing_guidance: boolean;
  form_reminders: boolean;
  adaptive_timing: boolean;
  background_music: boolean;
  music_volume: number;
  vibration_intensity: number;
  // Push notification preferences
  push_notifications_enabled?: boolean;
  notification_types?: {
    reminders?: boolean;
    achievements?: boolean;
    streaks?: boolean;
    milestones?: boolean;
    social?: boolean;
  };
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  notification_frequency?: 'minimal' | 'normal' | 'frequent';
  // Quick Start System
  last_exercise_id?: string;
  last_duration?: number;
  last_workout_timestamp?: string;
}

export const useUserPreferences = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPreferences = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching preferences:', error);
        return;
      }

      if (data) {
        setPreferences({
          workout_reminders: data.workout_reminders,
          reminder_time: data.reminder_time,
          preferred_workout_duration: data.preferred_workout_duration,
          difficulty_preference: data.difficulty_preference as 'beginner' | 'intermediate' | 'advanced',
          sound_effects: data.sound_effects,
          haptic_feedback: data.haptic_feedback,
          theme_preference: data.theme_preference as 'light' | 'dark' | 'system',
          favorite_exercises: data.favorite_exercises || [],
          avoided_exercises: data.avoided_exercises || [],
          auto_progression: data.auto_progression,
          progression_sensitivity: data.progression_sensitivity,
          weekly_goal: data.weekly_goal ?? 7,
          daily_sessions: (data as any).daily_sessions ?? 1,
          // Enhanced timer V2 fields with defaults if missing
          timer_theme: data.timer_theme ?? 'default',
          timer_sound_pack: data.timer_sound_pack ?? 'classic',
          coaching_voice: data.coaching_voice ?? 'encouraging',
          breathing_guidance: data.breathing_guidance ?? true,
          form_reminders: data.form_reminders ?? true,
          adaptive_timing: data.adaptive_timing ?? true,
          background_music: data.background_music ?? false,
          music_volume: Number(data.music_volume ?? 0.3),
          vibration_intensity: Number(data.vibration_intensity ?? 3),
          // Push notification fields with defaults
          push_notifications_enabled: data.push_notifications_enabled ?? true,
          notification_types: (data.notification_types as any) ?? {
            reminders: true,
            achievements: true,
            streaks: true,
            milestones: true,
            social: false
          },
          quiet_hours_start: data.quiet_hours_start ?? '22:00',
          quiet_hours_end: data.quiet_hours_end ?? '08:00',
          notification_frequency: (data.notification_frequency as 'minimal' | 'normal' | 'frequent') ?? 'normal',
          // Quick Start System (safely handle missing fields)
          last_exercise_id: (data as any).last_exercise_id || null,
          last_duration: (data as any).last_duration || null,
          last_workout_timestamp: (data as any).last_workout_timestamp || null
        });
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (updates: Partial<UserPreferences>, showToast: boolean = true) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_preferences')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('user_id', user.id);

      if (error) throw error;

      setPreferences(prev => prev ? { ...prev, ...updates } : null);
      
      if (showToast) {
        toast({
          title: "Preferences updated",
          description: "Your preferences have been saved successfully.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error updating preferences",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchPreferences();
  }, [user?.id]); // Use user?.id instead of user object to prevent reference changes

  return {
    preferences,
    loading,
    updatePreferences,
    refetch: fetchPreferences,
  };
};
