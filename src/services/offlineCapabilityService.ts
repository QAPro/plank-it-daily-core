import { supabase } from '@/integrations/supabase/client';

interface OfflineWorkoutSession {
  id: string;
  user_id: string;
  exercise_id: string;
  duration_seconds: number;
  completed_at: string;
  synced: boolean;
  created_offline: boolean;
}

interface OfflineWorkoutSettings {
  last_exercise_id: string;
  last_duration: number;
  preferred_exercises: string[];
  user_preferences: any;
  exercises_cache: any[];
  timestamp: number;
}

export class OfflineCapabilityService {
  private static readonly OFFLINE_SESSIONS_KEY = 'offline_workout_sessions';
  private static readonly OFFLINE_SETTINGS_KEY = 'offline_workout_settings';
  private static readonly EXERCISES_CACHE_KEY = 'exercises_cache';
  private static readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Caches essential workout data for offline use
   */
  static async cacheEssentialWorkoutData(userId: string): Promise<void> {
    try {
      // Get user preferences
      const { data: preferences } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      // Get exercises (cache all for offline access)
      const { data: exercises } = await supabase
        .from('exercises')
        .select('*')
        .order('difficulty_level', { ascending: true });

      // Get user's recent workout patterns
      const { data: recentSessions } = await supabase
        .from('user_sessions')
        .select('exercise_id, duration_seconds')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false })
        .limit(10);

      // Determine preferred exercises from recent usage
      const exerciseFrequency = new Map<string, number>();
      recentSessions?.forEach(session => {
        const count = exerciseFrequency.get(session.exercise_id) || 0;
        exerciseFrequency.set(session.exercise_id, count + 1);
      });

      const preferredExercises = Array.from(exerciseFrequency.entries())
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([id]) => id);

      const offlineSettings: OfflineWorkoutSettings = {
        last_exercise_id: preferences?.last_exercise_id || '',
        last_duration: preferences?.last_duration || 30,
        preferred_exercises: preferredExercises,
        user_preferences: preferences,
        exercises_cache: exercises || [],
        timestamp: Date.now()
      };

      localStorage.setItem(this.OFFLINE_SETTINGS_KEY, JSON.stringify(offlineSettings));
      localStorage.setItem(this.EXERCISES_CACHE_KEY, JSON.stringify({
        exercises: exercises || [],
        timestamp: Date.now()
      }));

      console.log('[Offline] Cached essential workout data for offline use');
    } catch (error) {
      console.error('[Offline] Error caching workout data:', error);
    }
  }

  /**
   * Gets cached workout settings for offline quick-start
   */
  static getOfflineWorkoutSettings(): OfflineWorkoutSettings | null {
    try {
      const cached = localStorage.getItem(this.OFFLINE_SETTINGS_KEY);
      if (!cached) return null;

      const settings = JSON.parse(cached);
      
      // Check if cache is still valid
      if (Date.now() - settings.timestamp > this.CACHE_DURATION) {
        localStorage.removeItem(this.OFFLINE_SETTINGS_KEY);
        return null;
      }

      return settings;
    } catch (error) {
      console.error('[Offline] Error retrieving offline settings:', error);
      return null;
    }
  }

  /**
   * Gets cached exercises for offline use
   */
  static getCachedExercises(): any[] {
    try {
      const cached = localStorage.getItem(this.EXERCISES_CACHE_KEY);
      if (!cached) return [];

      const data = JSON.parse(cached);
      
      // Check if cache is still valid
      if (Date.now() - data.timestamp > this.CACHE_DURATION) {
        localStorage.removeItem(this.EXERCISES_CACHE_KEY);
        return [];
      }

      return data.exercises || [];
    } catch (error) {
      console.error('[Offline] Error retrieving cached exercises:', error);
      return [];
    }
  }

  /**
   * Saves a workout session while offline
   */
  static async saveOfflineWorkoutSession(
    userId: string,
    exerciseId: string,
    durationSeconds: number
  ): Promise<string> {
    try {
      const sessionId = `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const offlineSession: OfflineWorkoutSession = {
        id: sessionId,
        user_id: userId,
        exercise_id: exerciseId,
        duration_seconds: durationSeconds,
        completed_at: new Date().toISOString(),
        synced: false,
        created_offline: true
      };

      // Get existing offline sessions
      const existing = this.getOfflineSessions();
      existing.push(offlineSession);
      
      localStorage.setItem(this.OFFLINE_SESSIONS_KEY, JSON.stringify(existing));

      console.log('[Offline] Saved workout session offline:', sessionId);

      // Try to sync immediately if online
      if (navigator.onLine) {
        this.syncOfflineSessionsToServer();
      }

      return sessionId;
    } catch (error) {
      console.error('[Offline] Error saving offline session:', error);
      throw error;
    }
  }

  /**
   * Gets all pending offline sessions
   */
  static getOfflineSessions(): OfflineWorkoutSession[] {
    try {
      const stored = localStorage.getItem(this.OFFLINE_SESSIONS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('[Offline] Error retrieving offline sessions:', error);
      return [];
    }
  }

  /**
   * Syncs offline sessions to the server
   */
  static async syncOfflineSessionsToServer(): Promise<{ synced: number; failed: number }> {
    const sessions = this.getOfflineSessions();
    const unsynced = sessions.filter(s => !s.synced);
    
    if (unsynced.length === 0) {
      return { synced: 0, failed: 0 };
    }

    let syncedCount = 0;
    let failedCount = 0;

    console.log(`[Offline] Syncing ${unsynced.length} offline sessions...`);

    for (const session of unsynced) {
      try {
        // Insert to server
        const { error } = await supabase
          .from('user_sessions')
          .insert({
            user_id: session.user_id,
            exercise_id: session.exercise_id,
            duration_seconds: session.duration_seconds,
            completed_at: session.completed_at
          });

        if (error) {
          console.error('[Offline] Failed to sync session:', session.id, error);
          failedCount++;
        } else {
          // Mark as synced
          session.synced = true;
          syncedCount++;
          console.log('[Offline] Successfully synced session:', session.id);
        }
      } catch (error) {
        console.error('[Offline] Error syncing session:', session.id, error);
        failedCount++;
      }
    }

    // Update local storage with sync status
    localStorage.setItem(this.OFFLINE_SESSIONS_KEY, JSON.stringify(sessions));

    // Remove fully synced sessions after successful sync
    if (syncedCount > 0) {
      const remaining = sessions.filter(s => !s.synced);
      localStorage.setItem(this.OFFLINE_SESSIONS_KEY, JSON.stringify(remaining));
    }

    console.log(`[Offline] Sync complete: ${syncedCount} synced, ${failedCount} failed`);
    
    return { synced: syncedCount, failed: failedCount };
  }

  /**
   * Checks if quick-start is available offline
   */
  static isQuickStartAvailableOffline(): boolean {
    const settings = this.getOfflineWorkoutSettings();
    const exercises = this.getCachedExercises();
    
    return !!(settings && exercises.length > 0 && settings.last_exercise_id);
  }

  /**
   * Gets quick-start data for offline use
   */
  static getOfflineQuickStartData(): {
    exercise: any;
    duration: number;
    settings: OfflineWorkoutSettings;
  } | null {
    try {
      const settings = this.getOfflineWorkoutSettings();
      const exercises = this.getCachedExercises();
      
      if (!settings || !exercises.length || !settings.last_exercise_id) {
        return null;
      }

      const exercise = exercises.find(e => e.id === settings.last_exercise_id);
      
      if (!exercise) {
        // Fallback to first preferred exercise or first available
        const fallbackExerciseId = settings.preferred_exercises[0] || exercises[0]?.id;
        const fallbackExercise = exercises.find(e => e.id === fallbackExerciseId);
        
        if (fallbackExercise) {
          return {
            exercise: fallbackExercise,
            duration: settings.last_duration,
            settings
          };
        }
        
        return null;
      }

      return {
        exercise,
        duration: settings.last_duration,
        settings
      };
    } catch (error) {
      console.error('[Offline] Error getting quick-start data:', error);
      return null;
    }
  }

  /**
   * Updates offline cache after a workout
   */
  static updateOfflineCacheAfterWorkout(
    exerciseId: string, 
    duration: number
  ): void {
    try {
      const settings = this.getOfflineWorkoutSettings();
      if (settings) {
        settings.last_exercise_id = exerciseId;
        settings.last_duration = duration;
        settings.timestamp = Date.now();
        
        localStorage.setItem(this.OFFLINE_SETTINGS_KEY, JSON.stringify(settings));
      }
    } catch (error) {
      console.error('[Offline] Error updating cache after workout:', error);
    }
  }

  /**
   * Clears all offline data
   */
  static clearOfflineCache(): void {
    try {
      localStorage.removeItem(this.OFFLINE_SESSIONS_KEY);
      localStorage.removeItem(this.OFFLINE_SETTINGS_KEY);
      localStorage.removeItem(this.EXERCISES_CACHE_KEY);
      console.log('[Offline] Cleared all offline cache');
    } catch (error) {
      console.error('[Offline] Error clearing offline cache:', error);
    }
  }

  /**
   * Gets offline capability status
   */
  static getOfflineStatus(): {
    isOnline: boolean;
    hasCachedData: boolean;
    pendingSessions: number;
    quickStartAvailable: boolean;
  } {
    return {
      isOnline: navigator.onLine,
      hasCachedData: this.getCachedExercises().length > 0,
      pendingSessions: this.getOfflineSessions().filter(s => !s.synced).length,
      quickStartAvailable: this.isQuickStartAvailableOffline()
    };
  }
}

export default OfflineCapabilityService;