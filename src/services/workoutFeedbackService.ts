import { supabase } from '@/integrations/supabase/client';
import type { WorkoutFeedback } from '@/components/feedback/WorkoutFeedback';

export interface StoredWorkoutFeedback extends WorkoutFeedback {
  id: string;
  user_id: string;
  session_id: string;
  created_at: string;
}

export interface FeedbackInsights {
  moodTrends: {
    recent_mood: string;
    mood_improvement: boolean;
    best_performing_days: string[];
  };
  energyPatterns: {
    most_energizing_time: string;
    energy_trend: 'improving' | 'stable' | 'declining';
  };
  difficultyAdjustments: {
    recommended_adjustment: 'increase' | 'maintain' | 'decrease';
    reason: string;
  };
}

export interface RestDayData {
  id: string;
  user_id: string;
  rest_date: string;
  rest_activities: string[];
  created_at: string;
}

export class WorkoutFeedbackService {
  /**
   * Store workout feedback after a session
   */
  static async storeFeedback(
    userId: string, 
    sessionId: string, 
    feedback: WorkoutFeedback
  ): Promise<void> {
    try {
      // Store feedback in the notes field for now (simplified approach)
      const feedbackNote = `Mood: ${feedback.mood}, Energy: ${feedback.energy}, Difficulty: ${feedback.difficulty_felt}${feedback.notes ? `, Notes: ${feedback.notes}` : ''}`;
      
      const { error } = await supabase
        .from('user_sessions')
        .update({
          notes: feedbackNote
        })
        .eq('id', sessionId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error storing workout feedback:', error);
        throw error;
      }

      console.log('Workout feedback stored successfully');
    } catch (error) {
      console.error('Failed to store workout feedback:', error);
      throw error;
    }
  }

  /**
   * Get recent workout feedback for a user
   */
  static async getRecentFeedback(userId: string, limit: number = 10): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .select('id, completed_at, notes, duration_seconds')
        .eq('user_id', userId)
        .not('notes', 'is', null)
        .order('completed_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching workout feedback:', error);
        return [];
      }

      // Parse feedback from notes field
      return data?.filter(session => 
        session.notes && session.notes.includes('Mood:')
      ).map(session => ({
        ...session,
        parsed_feedback: this.parseFeedbackFromNotes(session.notes || '')
      })) || [];
    } catch (error) {
      console.error('Failed to fetch workout feedback:', error);
      return [];
    }
  }

  /**
   * Generate insights from workout feedback
   */
  static async generateFeedbackInsights(userId: string): Promise<FeedbackInsights | null> {
    try {
      const recentFeedback = await this.getRecentFeedback(userId, 20);
      
      if (recentFeedback.length < 3) {
        return null; // Need at least 3 sessions for meaningful insights
      }

        // Analyze mood trends
        const moods = recentFeedback.map(s => s.parsed_feedback?.mood).filter(Boolean);
        const recentMoods = moods.slice(0, 5);
        const moodImprovement = this.analyzeMoodTrend(recentMoods);

        // Analyze energy patterns
        const energyData = recentFeedback.map(s => ({
          energy: s.parsed_feedback?.energy,
          hour: new Date(s.completed_at).getHours()
        })).filter(d => d.energy);

        const bestEnergyTime = this.findBestEnergyTime(energyData);

        // Analyze difficulty adjustments
        const difficulties = recentFeedback.map(s => s.parsed_feedback?.difficulty_felt).filter(Boolean);
        const difficultyRecommendation = this.analyzeDifficultyPattern(difficulties);

      return {
        moodTrends: {
          recent_mood: recentMoods[0] || 'unknown',
          mood_improvement: moodImprovement,
          best_performing_days: [] // Would need more complex analysis
        },
        energyPatterns: {
          most_energizing_time: bestEnergyTime,
          energy_trend: 'stable' // Simplified for now
        },
        difficultyAdjustments: difficultyRecommendation
      };
    } catch (error) {
      console.error('Failed to generate feedback insights:', error);
      return null;
    }
  }

  /**
   * Log a rest day
   */
  static async logRestDay(userId: string, activities: string[] = []): Promise<void> {
    try {
      // For now, we'll create a simple session entry to track rest days
      const today = new Date().toISOString();
      
      // Get a default exercise for rest day logging
      const { data: exercises } = await supabase.from('exercises').select('id').limit(1).single();
      const exerciseId = exercises?.id || 'default-exercise-id';
      
      const { error } = await supabase
        .from('user_sessions')
        .insert({
          user_id: userId,
          exercise_id: exerciseId,
          duration_seconds: 0,
          completed_at: today,
          notes: `Rest Day - Activities: ${activities.join(', ') || 'General rest'}`
        });

      if (error) {
        console.error('Error logging rest day:', error);
        throw error;
      }

      console.log('Rest day logged successfully');
    } catch (error) {
      console.error('Failed to log rest day:', error);
      throw error;
    }
  }

  /**
   * Get last rest day for a user
   */
  static async getLastRestDay(userId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .select('completed_at')
        .eq('user_id', userId)
        .like('notes', 'Rest Day%')
        .order('completed_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) {
        return null;
      }

      return data.completed_at?.split('T')[0] || null;
    } catch (error) {
      console.error('Failed to get last rest day:', error);
      return null;
    }
  }

  // Private helper methods
  private static parseFeedbackFromNotes(notes: string): any {
    const feedback: any = {};
    
    // Parse mood
    const moodMatch = notes.match(/Mood:\s*(\w+)/);
    if (moodMatch) feedback.mood = moodMatch[1];
    
    // Parse energy
    const energyMatch = notes.match(/Energy:\s*(\w+)/);
    if (energyMatch) feedback.energy = energyMatch[1];
    
    // Parse difficulty
    const difficultyMatch = notes.match(/Difficulty:\s*([\w_]+)/);
    if (difficultyMatch) feedback.difficulty_felt = difficultyMatch[1];
    
    // Parse additional notes
    const notesMatch = notes.match(/Notes:\s*(.+)$/);
    if (notesMatch) feedback.notes = notesMatch[1];
    
    return feedback;
  }

  private static analyzeMoodTrend(moods: string[]): boolean {
    const moodValues = moods.map(mood => {
      switch (mood) {
        case 'great': return 5;
        case 'good': return 4;
        case 'okay': return 3;
        case 'tough': return 2;
        case 'struggled': return 1;
        default: return 3;
      }
    });

    if (moodValues.length < 2) return false;

    const recent = moodValues.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
    const older = moodValues.slice(3).reduce((a, b) => a + b, 0) / Math.max(moodValues.slice(3).length, 1);

    return recent > older;
  }

  private static findBestEnergyTime(energyData: any[]): string {
    const hourCounts = energyData.reduce((acc, d) => {
      if (d.energy === 'energized') {
        acc[d.hour] = (acc[d.hour] || 0) + 1;
      }
      return acc;
    }, {} as Record<number, number>);

    const bestHour = Object.entries(hourCounts).reduce((best, [hour, count]) => 
      (count as number) > best.count ? { hour: parseInt(hour), count: count as number } : best, 
      { hour: 9, count: 0 }
    ).hour;

    if (bestHour < 12) return 'morning';
    if (bestHour < 17) return 'afternoon';
    return 'evening';
  }

  private static analyzeDifficultyPattern(difficulties: string[]): FeedbackInsights['difficultyAdjustments'] {
    const recentDifficulties = difficulties.slice(0, 5);
    const easyCount = recentDifficulties.filter(d => d === 'easy').length;
    const challengingCount = recentDifficulties.filter(d => d === 'challenging').length;

    if (easyCount >= 3) {
      return {
        recommended_adjustment: 'increase',
        reason: 'Your recent workouts have felt too easy. Ready to level up!'
      };
    }

    if (challengingCount >= 3) {
      return {
        recommended_adjustment: 'decrease',
        reason: 'Your workouts have been quite challenging. Consider easing up a bit.'
      };
    }

    return {
      recommended_adjustment: 'maintain',
      reason: 'Your current difficulty level seems to be working well for you.'
    };
  }
}

export const workoutFeedbackService = new WorkoutFeedbackService();