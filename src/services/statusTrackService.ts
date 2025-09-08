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
    
    // Map the data to ensure all required fields exist with defaults
    return (data || []).map(track => ({
      id: track.id,
      user_id: track.user_id,
      track_name: track.track_name,
      track_level: track.track_level,
      awarded_at: track.awarded_at || new Date().toISOString(),
      updated_at: track.updated_at,
      // Add defaults for new fields that might not exist yet
      experience_points: (track as any).experience_points || 0,
      level_progress: (track as any).level_progress || 0.0
    }));
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
      
      return {
        id: newTrack.id,
        user_id: newTrack.user_id,
        track_name: newTrack.track_name,
        track_level: newTrack.track_level,
        awarded_at: newTrack.awarded_at || new Date().toISOString(),
        updated_at: newTrack.updated_at,
        experience_points: finalXP,
        level_progress: this.calculateLevelProgress(1, finalXP)
      };
    }

    // Update existing track
    const currentXP = (existingTrack as any).experience_points || 0;
    const newXP = currentXP + finalXP;
    const newLevel = this.calculateLevel(newXP);
    const levelProgress = this.calculateLevelProgress(newLevel, newXP);

    const { data: updatedTrack, error } = await supabase
      .from('user_status_tracks')
      .update({
        track_level: newLevel,
        experience_points: newXP,
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

    return {
      id: updatedTrack.id,
      user_id: updatedTrack.user_id,
      track_name: updatedTrack.track_name,
      track_level: updatedTrack.track_level,
      awarded_at: updatedTrack.awarded_at || new Date().toISOString(),
      updated_at: updatedTrack.updated_at,
      experience_points: newXP,
      level_progress: levelProgress
    };
  }

  static async getAllLevelUnlocks(): Promise<LevelUnlock[]> {
    try {
      const { data, error } = await supabase
        .from('level_unlocks')
        .select('*')
        .eq('is_active', true)
        .order('track_name')
        .order('level_required');

      if (error) {
        console.warn('Level unlocks not available yet:', error);
        return [];
      }
      
      return (data || []).map(unlock => ({
        id: unlock.id,
        track_name: unlock.track_name,
        level_required: unlock.level_required,
        feature_name: unlock.feature_name,
        feature_type: unlock.feature_type as 'feature' | 'theme' | 'privilege' | 'reward',
        unlock_data: typeof unlock.unlock_data === 'object' ? unlock.unlock_data as Record<string, any> : {},
        is_active: unlock.is_active
      }));
    } catch (error) {
      console.warn('Level unlocks table not available yet:', error);
      return [];
    }
  }

  static async getUserUnlockedFeatures(userId: string): Promise<LevelUnlock[]> {
    try {
      const tracks = await this.getUserStatusTracks(userId);
      const allUnlocks = await this.getAllLevelUnlocks();

      return allUnlocks.filter(unlock => {
        const userTrack = tracks.find(t => t.track_name === unlock.track_name);
        return userTrack && userTrack.track_level >= unlock.level_required;
      });
    } catch (error) {
      console.warn('Error getting unlocked features:', error);
      return [];
    }
  }

  static async getFeaturedUsers(type: 'weekly' | 'monthly' | 'hall_of_fame'): Promise<FeaturedUser[]> {
    try {
      const { data, error } = await supabase
        .from('featured_users')
        .select('*')
        .eq('feature_type', type)
        .eq('is_active', true)
        .order('start_date', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(user => ({
        ...user,
        feature_type: user.feature_type as 'weekly' | 'monthly' | 'hall_of_fame',
        featured_data: user.featured_data as Record<string, any>
      }));
    } catch (error) {
      console.warn('Error getting featured users:', error);
      return [];
    }
  }

  // Automatic selection methods for featured users
  static async selectWeeklyFeaturedUsers(): Promise<void> {
    try {
      // Deactivate current weekly featured users
      await supabase
        .from('featured_users')
        .update({ is_active: false })
        .eq('feature_type', 'weekly')
        .eq('is_active', true);

      // Find users with significant achievements in the last week
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      // Get top performers from each track
      const topPerformers = await this.getTopPerformersThisWeek(weekAgo);
      
      // Create featured user entries
      for (const performer of topPerformers.slice(0, 3)) {
        const startDate = new Date().toISOString();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 7);

        await supabase
          .from('featured_users')
          .insert({
            user_id: performer.user_id,
            feature_type: 'weekly',
            featured_for: performer.achievement,
            featured_data: performer.data,
            start_date: startDate,
            end_date: endDate.toISOString(),
            is_active: true
          });
      }
    } catch (error) {
      console.error('Error selecting weekly featured users:', error);
    }
  }

  static async selectMonthlyFeaturedUsers(): Promise<void> {
    try {
      // Deactivate current monthly featured users
      await supabase
        .from('featured_users')
        .update({ is_active: false })
        .eq('feature_type', 'monthly')
        .eq('is_active', true);

      // Find users with exceptional progress in the last month
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);

      const topMonthlyPerformers = await this.getTopPerformersThisMonth(monthAgo);
      
      // Create featured user entries
      for (const performer of topMonthlyPerformers.slice(0, 5)) {
        const startDate = new Date().toISOString();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 30);

        await supabase
          .from('featured_users')
          .insert({
            user_id: performer.user_id,
            feature_type: 'monthly',
            featured_for: performer.achievement,
            featured_data: performer.data,
            start_date: startDate,
            end_date: endDate.toISOString(),
            is_active: true
          });
      }
    } catch (error) {
      console.error('Error selecting monthly featured users:', error);
    }
  }

  static async selectHallOfFameUsers(): Promise<void> {
    try {
      // Hall of Fame users are permanent, so we only add new ones
      // Find users who have achieved legendary status (level 10 in any track)
      const { data: legendaryUsers, error } = await supabase
        .from('user_status_tracks')
        .select('user_id, track_name, track_level, experience_points')
        .eq('track_level', 10);

      if (error) throw error;

      if (legendaryUsers) {
        for (const user of legendaryUsers) {
          // Check if already in hall of fame
          const { data: existing } = await supabase
            .from('featured_users')
            .select('id')
            .eq('user_id', user.user_id)
            .eq('feature_type', 'hall_of_fame')
            .single();

          if (!existing) {
            const trackMeta = TRACK_METADATA[user.track_name as TrackName];
            await supabase
              .from('featured_users')
              .insert({
                user_id: user.user_id,
                feature_type: 'hall_of_fame',
                featured_for: `${trackMeta?.displayName || user.track_name} Legend`,
                featured_data: {
                  track_name: user.track_name,
                  level: user.track_level,
                  experience_points: user.experience_points,
                  achievement_date: new Date().toISOString()
                },
                start_date: new Date().toISOString(),
                is_active: true
              });
          }
        }
      }
    } catch (error) {
      console.error('Error selecting hall of fame users:', error);
    }
  }

  private static async getTopPerformersThisWeek(weekAgo: Date): Promise<Array<{
    user_id: string;
    achievement: string;
    data: Record<string, any>;
  }>> {
    try {
      // Get users who leveled up this week
      const { data: recentLevelUps, error } = await supabase
        .from('user_status_tracks')
        .select('user_id, track_name, track_level, updated_at')
        .gte('updated_at', weekAgo.toISOString())
        .order('track_level', { ascending: false })
        .limit(10);

      if (error) throw error;

      const performers = (recentLevelUps || []).map(track => {
        const trackMeta = TRACK_METADATA[track.track_name as TrackName];
        return {
          user_id: track.user_id,
          achievement: `Reached Level ${track.track_level} in ${trackMeta?.displayName || track.track_name}`,
          data: {
            track_name: track.track_name,
            level: track.track_level,
            level_up_date: track.updated_at,
            type: 'level_up'
          }
        };
      });

      // Also get users with high XP gains this week
      const { data: highXPUsers, error: xpError } = await supabase
        .from('user_status_tracks')
        .select('user_id, track_name, experience_points, updated_at')
        .gte('updated_at', weekAgo.toISOString())
        .order('experience_points', { ascending: false })
        .limit(10);

      if (!xpError && highXPUsers) {
        const xpPerformers = highXPUsers.slice(0, 5).map(track => {
          const trackMeta = TRACK_METADATA[track.track_name as TrackName];
          return {
            user_id: track.user_id,
            achievement: `${track.experience_points} XP in ${trackMeta?.displayName || track.track_name}`,
            data: {
              track_name: track.track_name,
              level: 0, // Default level for XP-based achievements
              level_up_date: track.updated_at,
              experience_points: track.experience_points,
              period: 'this_week',
              type: 'high_xp'
            }
          };
        });
        performers.push(...xpPerformers);
      }

      // Remove duplicates by user_id and return top performers
      const uniquePerformers = performers.filter((performer, index, self) => 
        index === self.findIndex(p => p.user_id === performer.user_id)
      );

      return uniquePerformers.slice(0, 5);
    } catch (error) {
      console.error('Error getting top performers this week:', error);
      return [];
    }
  }

  private static async getTopPerformersThisMonth(monthAgo: Date): Promise<Array<{
    user_id: string;
    achievement: string;
    data: Record<string, any>;
  }>> {
    try {
      // Get users with most consistent progress this month
      const { data: consistentUsers, error } = await supabase
        .from('user_status_tracks')
        .select('user_id, track_name, experience_points, track_level, updated_at')
        .gte('updated_at', monthAgo.toISOString())
        .order('experience_points', { ascending: false })
        .limit(15);

      if (error) throw error;

      const performers = (consistentUsers || []).map(track => {
        const trackMeta = TRACK_METADATA[track.track_name as TrackName];
        return {
          user_id: track.user_id,
          achievement: `Outstanding ${trackMeta?.displayName || track.track_name} Progress`,
          data: {
            track_name: track.track_name,
            level: track.track_level,
            experience_points: track.experience_points,
            period: 'this_month',
            type: 'consistent_progress'
          }
        };
      });

      // Remove duplicates and return top performers
      const uniquePerformers = performers.filter((performer, index, self) => 
        index === self.findIndex(p => p.user_id === performer.user_id)
      );

      return uniquePerformers.slice(0, 8);
    } catch (error) {
      console.error('Error getting top performers this month:', error);
      return [];
    }
  }

  static async checkFeatureAccess(userId: string, featureName: string): Promise<boolean> {
    try {
      const unlockedFeatures = await this.getUserUnlockedFeatures(userId);
      return unlockedFeatures.some(unlock => unlock.feature_name === featureName);
    } catch (error) {
      console.warn('Error checking feature access:', error);
      return false;
    }
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
    
    while (xpNeeded <= totalXP && level < 10) {
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
    try {
      // Get newly unlocked features
      const allUnlocks = await this.getAllLevelUnlocks();
      const newUnlocks = allUnlocks.filter(unlock => 
        unlock.track_name === trackName &&
        unlock.level_required > oldLevel &&
        unlock.level_required <= newLevel
      );

      if (newUnlocks.length > 0) {
        // Record feature unlocks
        for (const unlock of newUnlocks) {
          try {
            await supabase
              .from('feature_unlocks')
              .insert({
                user_id: userId,
                feature_name: unlock.feature_name,
                unlock_level: unlock.level_required
              });
          } catch (error) {
            console.warn('Could not record feature unlock:', error);
          }
        }

        // Trigger level up notification
        console.log(`User ${userId} leveled up to ${newLevel} in ${trackName}! Unlocked:`, newUnlocks);
      }
    } catch (error) {
      console.warn('Error handling level up:', error);
    }
  }

  // Utility method to initialize all tracks for a new user
  static async initializeUserTracks(userId: string): Promise<StatusTrack[]> {
    const trackNames: TrackName[] = ['core_master', 'consistency_champion', 'endurance_expert', 'form_perfectionist', 'community_leader'];
    const results: StatusTrack[] = [];

    for (const trackName of trackNames) {
      try {
        // Check if track already exists
        const { data: existing } = await supabase
          .from('user_status_tracks')
          .select('*')
          .eq('user_id', userId)
          .eq('track_name', trackName)
          .single();

        if (!existing) {
          // Create new track
          const { data: newTrack, error } = await supabase
            .from('user_status_tracks')
            .insert({
              user_id: userId,
              track_name: trackName,
              track_level: 1,
              experience_points: 0,
              level_progress: 0.0
            })
            .select()
            .single();

          if (!error && newTrack) {
            results.push({
              id: newTrack.id,
              user_id: newTrack.user_id,
              track_name: newTrack.track_name,
              track_level: newTrack.track_level,
              awarded_at: newTrack.awarded_at || new Date().toISOString(),
              updated_at: newTrack.updated_at,
              experience_points: 0,
              level_progress: 0.0
            });
          }
        }
      } catch (error) {
        console.warn(`Error initializing track ${trackName}:`, error);
      }
    }

    return results;
  }
}