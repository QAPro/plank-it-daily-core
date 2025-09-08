import { supabase } from '@/integrations/supabase/client';

export interface StatusTrack {
  id: string;
  user_id: string;
  track_name: string;
  track_level: number;
  experience_points: number;
  level_progress: number;
  awarded_at: string;
  updated_at: string;
}

export interface LevelUnlock {
  id: string;
  track_name: string;
  level_required: number;
  feature_name: string;
  feature_type: 'feature' | 'theme' | 'privilege' | 'reward';
  unlock_data: Record<string, any>;
  is_active: boolean;
}

export interface FeaturedUser {
  id: string;
  user_id: string;
  feature_type: 'weekly' | 'monthly' | 'hall_of_fame';
  featured_for: string;
  featured_data: Record<string, any>;
  start_date: string;
  end_date?: string;
  is_active: boolean;
}

export type TrackName = 
  | 'core_master'
  | 'consistency_champion' 
  | 'endurance_expert'
  | 'form_perfectionist'
  | 'community_leader';

export const TRACK_METADATA: Record<TrackName, {
  displayName: string;
  description: string;
  color: string;
  icon: string;
  maxLevel: number;
}> = {
  core_master: {
    displayName: 'Core Master',
    description: 'Master of core strength and plank variations',
    color: 'hsl(var(--chart-1))',
    icon: '💪',
    maxLevel: 10
  },
  consistency_champion: {
    displayName: 'Consistency Champion', 
    description: 'Dedicated to daily workout habits',
    color: 'hsl(var(--chart-2))',
    icon: '🔥',
    maxLevel: 10
  },
  endurance_expert: {
    displayName: 'Endurance Expert',
    description: 'Master of long-duration workouts',
    color: 'hsl(var(--chart-3))', 
    icon: '⚡',
    maxLevel: 10
  },
  form_perfectionist: {
    displayName: 'Form Perfectionist',
    description: 'Focused on perfect exercise technique',
    color: 'hsl(var(--chart-4))',
    icon: '🎯',
    maxLevel: 10
  },
  community_leader: {
    displayName: 'Community Leader',
    description: 'Active community contributor and leader',
    color: 'hsl(var(--chart-5))',
    icon: '👑',
    maxLevel: 10
  }
};

export class StatusTrackService {
  static async getUserStatusTracks(userId: string): Promise<StatusTrack[]> {
    const { data, error } = await supabase
      .from('user_status_tracks')
      .select('*')
      .eq('user_id', userId)
      .order('track_level', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async updateTrackProgress(
    userId: string,
    trackName: TrackName,
    experienceGained: number,
    activityType: string
  ): Promise<StatusTrack> {
    // Calculate XP based on activity type
    const xpMultiplier = this.getXPMultiplier(trackName, activityType);
    const finalXP = Math.floor(experienceGained * xpMultiplier);

    // Get or create track record
    let { data: existingTrack } = await supabase
      .from('user_status_tracks')
      .select('*')
      .eq('user_id', userId)
      .eq('track_name', trackName)
      .single();

    if (!existingTrack) {
      // Create new track record
      const { data: newTrack, error } = await supabase
        .from('user_status_tracks')
        .insert({
          user_id: userId,
          track_name: trackName,
          track_level: 1,
          experience_points: finalXP,
          level_progress: this.calculateLevelProgress(1, finalXP)
        })
        .select()
        .single();

      if (error) throw error;
      return newTrack;
    }

    // Update existing track
    const newXP = existingTrack.experience_points + finalXP;
    const newLevel = this.calculateLevel(newXP);
    const levelProgress = this.calculateLevelProgress(newLevel, newXP);

    const { data: updatedTrack, error } = await supabase
      .from('user_status_tracks')
      .update({
        experience_points: newXP,
        track_level: newLevel,
        level_progress: levelProgress,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingTrack.id)
      .select()
      .single();

    if (error) throw error;

    // Check for level up and unlock new features
    if (newLevel > existingTrack.track_level) {
      await this.handleLevelUp(userId, trackName, existingTrack.track_level, newLevel);
    }

    return updatedTrack;
  }

  static async getAllLevelUnlocks(): Promise<LevelUnlock[]> {
    const { data, error } = await supabase
      .from('level_unlocks')
      .select('*')
      .eq('is_active', true)
      .order('track_name')
      .order('level_required');

    if (error) throw error;
    return data || [];
  }

  static async getUserUnlockedFeatures(userId: string): Promise<LevelUnlock[]> {
    const tracks = await this.getUserStatusTracks(userId);
    const allUnlocks = await this.getAllLevelUnlocks();

    return allUnlocks.filter(unlock => {
      const userTrack = tracks.find(t => t.track_name === unlock.track_name);
      return userTrack && userTrack.track_level >= unlock.level_required;
    });
  }

  static async getFeaturedUsers(type: 'weekly' | 'monthly' | 'hall_of_fame'): Promise<FeaturedUser[]> {
    const { data, error } = await supabase
      .from('featured_users')
      .select('*')
      .eq('feature_type', type)
      .eq('is_active', true)
      .order('start_date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async checkFeatureAccess(userId: string, featureName: string): Promise<boolean> {
    const unlockedFeatures = await this.getUserUnlockedFeatures(userId);
    return unlockedFeatures.some(unlock => unlock.feature_name === featureName);
  }

  private static getXPMultiplier(trackName: TrackName, activityType: string): number {
    const multipliers: Record<TrackName, Record<string, number>> = {
      core_master: {
        'plank_session': 1.5,
        'core_workout': 2.0,
        'plank_variation': 1.2,
        'default': 1.0
      },
      consistency_champion: {
        'daily_streak': 2.0,
        'weekly_goal': 1.5,
        'session_complete': 1.0,
        'default': 1.0
      },
      endurance_expert: {
        'long_session': 2.0, // 5+ minutes
        'duration_milestone': 1.8,
        'endurance_challenge': 2.5,
        'default': 1.0
      },
      form_perfectionist: {
        'perfect_form': 2.0,
        'technique_improvement': 1.5,
        'form_assessment': 1.2,
        'default': 1.0
      },
      community_leader: {
        'social_interaction': 1.5,
        'challenge_creation': 2.0,
        'mentoring': 2.5,
        'community_help': 1.8,
        'default': 1.0
      }
    };

    return multipliers[trackName]?.[activityType] || multipliers[trackName]?.default || 1.0;
  }

  private static calculateLevel(totalXP: number): number {
    // Progressive XP requirements: Level N needs N * 100 XP
    let level = 1;
    let xpNeeded = 0;
    
    while (xpNeeded <= totalXP) {
      level++;
      xpNeeded += level * 100; // Each level needs more XP
    }
    
    return Math.min(level - 1, 10); // Cap at level 10
  }

  private static calculateLevelProgress(currentLevel: number, totalXP: number): number {
    if (currentLevel >= 10) return 100;

    const xpForCurrentLevel = this.getXPRequiredForLevel(currentLevel);
    const xpForNextLevel = this.getXPRequiredForLevel(currentLevel + 1);
    const xpInCurrentLevel = totalXP - xpForCurrentLevel;
    const xpNeededForNext = xpForNextLevel - xpForCurrentLevel;
    
    return Math.min((xpInCurrentLevel / xpNeededForNext) * 100, 100);
  }

  private static getXPRequiredForLevel(level: number): number {
    let totalXP = 0;
    for (let i = 2; i <= level; i++) {
      totalXP += i * 100;
    }
    return totalXP;
  }

  private static async handleLevelUp(
    userId: string,
    trackName: TrackName,
    oldLevel: number,
    newLevel: number
  ): Promise<void> {
    // Get newly unlocked features
    const { data: newUnlocks } = await supabase
      .from('level_unlocks')
      .select('*')
      .eq('track_name', trackName)
      .gt('level_required', oldLevel)
      .lte('level_required', newLevel);

    if (newUnlocks && newUnlocks.length > 0) {
      // Record feature unlocks
      for (const unlock of newUnlocks) {
        await supabase
          .from('feature_unlocks')
          .insert({
            user_id: userId,
            feature_name: unlock.feature_name,
            unlock_level: unlock.level_required
          });
      }

      // Trigger level up notification
      // This could integrate with the existing notification system
      console.log(`User ${userId} leveled up to ${newLevel} in ${trackName}! Unlocked:`, newUnlocks);
    }
  }
}