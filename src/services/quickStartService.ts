import { supabase } from '@/integrations/supabase/client';

export interface QuickStartData {
  exerciseId: string;
  duration: number;
  exerciseName: string;
  difficulty: string;
  timestamp: string;
}

export class QuickStartService {
  static async getLastWorkout(userId: string): Promise<QuickStartData | null> {
    try {
      // First get the most recent session
      const { data: sessionData, error: sessionError } = await supabase
        .from('user_sessions')
        .select('exercise_id, duration_seconds, completed_at')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false })
        .limit(1)
        .single();

      if (sessionError || !sessionData) {
        return null;
      }

      // Then get exercise details separately
      const { data: exerciseData, error: exerciseError } = await supabase
        .from('exercises')
        .select('id, name, difficulty_level')
        .eq('id', sessionData.exercise_id)
        .single();

      if (exerciseError || !exerciseData) {
        return {
          exerciseId: sessionData.exercise_id,
          duration: sessionData.duration_seconds,
          exerciseName: 'Unknown Exercise',
          difficulty: 'beginner',
          timestamp: sessionData.completed_at
        };
      }

      return {
        exerciseId: sessionData.exercise_id,
        duration: sessionData.duration_seconds,
        exerciseName: exerciseData.name,
        difficulty: String(exerciseData.difficulty_level) || 'beginner',
        timestamp: sessionData.completed_at
      };
    } catch (error) {
      console.error('Error fetching last workout:', error);
      return null;
    }
  }

  static async updateLastWorkout(userId: string, exerciseId: string, duration: number): Promise<void> {
    try {
      // Try to update, but handle gracefully if fields don't exist yet
      const updates: any = {};
      if (typeof (window as any).supabaseHasQuickStartFields !== 'undefined') {
        updates.last_exercise_id = exerciseId;
        updates.last_duration = duration;
        updates.last_workout_timestamp = new Date().toISOString();
      }

      // Only attempt update if we have fields to update
      if (Object.keys(updates).length > 0) {
        await supabase
          .from('user_preferences')
          .update(updates)
          .eq('user_id', userId);
      }
    } catch (error) {
      console.error('Error updating last workout (fields may not exist yet):', error);
    }
  }

  static isRecent(timestamp: string): boolean {
    const lastWorkout = new Date(timestamp);
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - lastWorkout.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff <= 7; // Consider workouts from last 7 days as "recent"
  }
}