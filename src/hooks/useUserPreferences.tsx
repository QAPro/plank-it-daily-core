
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
}

export const useUserPreferences = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPreferences = async () => {
    if (!user) return;

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
        });
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (updates: Partial<UserPreferences>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_preferences')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('user_id', user.id);

      if (error) throw error;

      setPreferences(prev => prev ? { ...prev, ...updates } : null);
      
      toast({
        title: "Preferences updated",
        description: "Your preferences have been saved successfully.",
      });
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
  }, [user]);

  return {
    preferences,
    loading,
    updatePreferences,
    refetch: fetchPreferences,
  };
};
