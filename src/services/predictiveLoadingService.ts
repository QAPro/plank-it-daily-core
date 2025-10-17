import { supabase } from '@/integrations/supabase/client';

interface ExerciseUsagePattern {
  exercise_id: string;
  usage_count: number;
  last_used: string;
  avg_duration: number;
  time_of_day_preference: string;
  day_of_week_preference: number;
  success_rate: number;
}

interface PredictiveRecommendation {
  exercise_id: string;
  confidence: number;
  reason: string;
  suggested_duration: number;
  exercise_name?: string;
  difficulty_level?: number;
}

export class PredictiveLoadingService {
  private static readonly CACHE_KEY = 'predictive_exercises';
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Analyzes user behavior patterns to predict likely next exercises
   */
  static async analyzeUserPatterns(userId: string): Promise<ExerciseUsagePattern[]> {
    try {
      const { data: sessions, error } = await supabase
        .from('user_sessions')
        .select(`
          exercise_id,
          duration_seconds,
          completed_at,
          exercises (
            name,
            difficulty_level
          )
        `)
        .eq('user_id', userId)
        .gte('completed_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('completed_at', { ascending: false });

      if (error) throw error;

      const patterns = new Map<string, {
        usage_count: number;
        durations: number[];
        timestamps: Date[];
        successes: number;
      }>();

      // Analyze session patterns
      sessions?.forEach(session => {
        const exerciseId = session.exercise_id;
        const duration = session.duration_seconds || 0;
        const timestamp = new Date(session.completed_at);
        
        if (!patterns.has(exerciseId)) {
          patterns.set(exerciseId, {
            usage_count: 0,
            durations: [],
            timestamps: [],
            successes: 0
          });
        }

        const pattern = patterns.get(exerciseId)!;
        pattern.usage_count++;
        pattern.durations.push(duration);
        pattern.timestamps.push(timestamp);
        
        // Consider session successful if duration >= 30 seconds
        if (duration >= 30) {
          pattern.successes++;
        }
      });

      return Array.from(patterns.entries()).map(([exercise_id, data]) => {
        const avgDuration = data.durations.reduce((sum, d) => sum + d, 0) / data.durations.length;
        
        // Calculate time preferences
        const hours = data.timestamps.map(t => t.getHours());
        const days = data.timestamps.map(t => t.getDay());
        
        const timeOfDay = this.determineTimePreference(hours);
        const dayOfWeek = this.findMostCommonDay(days);
        
        return {
          exercise_id,
          usage_count: data.usage_count,
          last_used: Math.max(...data.timestamps.map(t => t.getTime())).toString(),
          avg_duration: Math.round(avgDuration),
          time_of_day_preference: timeOfDay,
          day_of_week_preference: dayOfWeek,
          success_rate: (data.successes / data.usage_count) * 100
        };
      }).sort((a, b) => b.usage_count - a.usage_count);
    } catch (error) {
      console.error('Error analyzing user patterns:', error);
      return [];
    }
  }

  /**
   * Predicts the most likely next exercises based on current context
   */
  static async predictNextExercises(
    userId: string, 
    currentTime: Date = new Date(),
    lastExerciseId?: string
  ): Promise<PredictiveRecommendation[]> {
    try {
      const patterns = await this.analyzeUserPatterns(userId);
      const currentHour = currentTime.getHours();
      const currentDay = currentTime.getDay();
      
      const recommendations: PredictiveRecommendation[] = [];

      // Get exercise details
      const { data: exercises } = await supabase
        .from('exercises')
        .select('id, name, difficulty_level');

      const exerciseMap = new Map(
        exercises?.map(e => [e.id, { name: e.name, difficulty: e.difficulty_level }]) || []
      );

      for (const pattern of patterns.slice(0, 5)) { // Top 5 most used exercises
        let confidence = 0;
        let reason = '';

        // Base confidence from usage frequency
        const maxUsage = Math.max(...patterns.map(p => p.usage_count));
        confidence += (pattern.usage_count / maxUsage) * 40;

        // Time-based confidence boost
        if (this.isTimeMatch(pattern.time_of_day_preference, currentHour)) {
          confidence += 25;
          reason += 'Preferred time match. ';
        }

        // Day-based confidence boost
        if (pattern.day_of_week_preference === currentDay) {
          confidence += 15;
          reason += 'Preferred day match. ';
        }

        // Recent usage boost
        const daysSinceLastUse = (Date.now() - parseInt(pattern.last_used)) / (24 * 60 * 60 * 1000);
        if (daysSinceLastUse <= 7) {
          confidence += 10;
          reason += 'Recently used. ';
        }

        // Success rate influence
        if (pattern.success_rate > 80) {
          confidence += 10;
          reason += 'High success rate. ';
        }

        // Avoid immediate repetition unless it's the only pattern
        if (lastExerciseId === pattern.exercise_id && patterns.length > 1) {
          confidence -= 20;
          reason += 'Variety encouraged. ';
        }

        const exerciseInfo = exerciseMap.get(pattern.exercise_id);
        
        recommendations.push({
          exercise_id: pattern.exercise_id,
          confidence: Math.round(Math.min(confidence, 100)),
          reason: reason.trim() || 'Based on usage history',
          suggested_duration: pattern.avg_duration,
          exercise_name: exerciseInfo?.name,
          difficulty_level: exerciseInfo?.difficulty
        });
      }

      return recommendations
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 3); // Return top 3 recommendations
        
    } catch (error) {
      console.error('Error predicting next exercises:', error);
      return [];
    }
  }

  /**
   * Preloads likely exercises and caches them
   */
  static async preloadLikelyExercises(userId: string): Promise<void> {
    try {
      const predictions = await this.predictNextExercises(userId);
      
      if (predictions.length > 0) {
        // Cache predictions
        const cacheData = {
          predictions,
          timestamp: Date.now(),
          userId
        };
        
        localStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheData));
        
        // Preload exercise details for likely candidates
        const exerciseIds = predictions.map(p => p.exercise_id);
        
        const { data: exerciseDetails } = await supabase
          .from('exercises')
          .select('*')
          .in('id', exerciseIds);
        
        // Cache exercise details
        if (exerciseDetails) {
          localStorage.setItem(
            `${this.CACHE_KEY}_details`, 
            JSON.stringify({
              exercises: exerciseDetails,
              timestamp: Date.now()
            })
          );
        }
      }
    } catch (error) {
      console.error('Error preloading exercises:', error);
    }
  }

  /**
   * Gets cached predictions or fetches new ones
   */
  static async getCachedPredictions(userId: string): Promise<PredictiveRecommendation[]> {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      
      if (cached) {
        const data = JSON.parse(cached);
        
        // Check if cache is still valid and for the right user
        if (
          data.userId === userId && 
          Date.now() - data.timestamp < this.CACHE_DURATION
        ) {
          return data.predictions;
        }
      }
      
      // Cache is invalid, fetch new predictions
      return await this.predictNextExercises(userId);
    } catch (error) {
      console.error('Error getting cached predictions:', error);
      return [];
    }
  }

  /**
   * Updates user patterns after a workout session
   */
  static async updatePatternsAfterWorkout(
    userId: string, 
    exerciseId: string, 
    duration: number,
    timestamp: Date = new Date()
  ): Promise<void> {
    try {
      // Clear cache to force refresh on next prediction
      localStorage.removeItem(this.CACHE_KEY);
      localStorage.removeItem(`${this.CACHE_KEY}_details`);
      
      // Immediately update predictions in background
      setTimeout(() => {
        this.preloadLikelyExercises(userId);
      }, 1000);
      
    } catch (error) {
      console.error('Error updating patterns after workout:', error);
    }
  }

  private static determineTimePreference(hours: number[]): string {
    const timeRanges = {
      morning: [5, 6, 7, 8, 9, 10, 11],
      afternoon: [12, 13, 14, 15, 16, 17],
      evening: [18, 19, 20, 21, 22],
      night: [23, 0, 1, 2, 3, 4]
    };

    const counts = { morning: 0, afternoon: 0, evening: 0, night: 0 };

    hours.forEach(hour => {
      for (const [period, range] of Object.entries(timeRanges)) {
        if (range.includes(hour)) {
          counts[period as keyof typeof counts]++;
          break;
        }
      }
    });

    return Object.entries(counts).reduce((a, b) => 
      counts[a[0] as keyof typeof counts] > counts[b[0] as keyof typeof counts] ? a : b
    )[0];
  }

  private static findMostCommonDay(days: number[]): number {
    const counts = new Map<number, number>();
    
    days.forEach(day => {
      counts.set(day, (counts.get(day) || 0) + 1);
    });

    let maxCount = 0;
    let mostCommonDay = 0;
    
    for (const [day, count] of counts) {
      if (count > maxCount) {
        maxCount = count;
        mostCommonDay = day;
      }
    }

    return mostCommonDay;
  }

  private static isTimeMatch(preference: string, currentHour: number): boolean {
    const timeRanges = {
      morning: [5, 11],
      afternoon: [12, 17], 
      evening: [18, 22],
      night: [23, 4]
    };

    const range = timeRanges[preference as keyof typeof timeRanges];
    if (!range) return false;

    if (preference === 'night') {
      return currentHour >= 23 || currentHour <= 4;
    }

    return currentHour >= range[0] && currentHour <= range[1];
  }
}

export default PredictiveLoadingService;