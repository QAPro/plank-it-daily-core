
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type Exercise = Tables<'plank_exercises'>;
type UserPreferences = Tables<'user_preferences'>;
type ExercisePerformance = Tables<'user_exercise_performance'>;
type UserStreak = Tables<'user_streaks'>;
type UserSession = Tables<'user_sessions'>;

interface RecommendationContext {
  preferences: UserPreferences;
  performance: ExercisePerformance[];
  exercises: Exercise[];
  streak: UserStreak | null;
  recentSessions: UserSession[];
  currentTime: Date;
}

interface SmartRecommendation {
  exercise_id: string;
  recommendation_type: string;
  confidence_score: number;
  reasoning: string;
  optimal_duration?: number;
  rest_recommendation?: boolean;
}

export class SmartRecommendationsService {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  async generateSmartRecommendations(): Promise<SmartRecommendation[]> {
    const context = await this.gatherUserContext();
    const recommendations: SmartRecommendation[] = [];

    // Check if user should take a rest day
    if (this.shouldRecommendRest(context)) {
      return [{
        exercise_id: 'rest',
        recommendation_type: 'rest_day',
        confidence_score: 0.9,
        reasoning: 'Your body needs recovery time. Take a rest day to avoid overtraining.',
        rest_recommendation: true
      }];
    }

    // Generate different types of recommendations
    recommendations.push(...this.getProgressiveRecommendations(context));
    recommendations.push(...this.getVarietyRecommendations(context));
    recommendations.push(...this.getOptimalTimingRecommendations(context));
    recommendations.push(...this.getEngagementRecommendations(context));
    recommendations.push(...this.getRecoveryRecommendations(context));

    // Sort by confidence score and return top recommendations
    return recommendations
      .sort((a, b) => b.confidence_score - a.confidence_score)
      .slice(0, 8);
  }

  private async gatherUserContext(): Promise<RecommendationContext> {
    const [prefsResult, performanceResult, exercisesResult, streakResult, sessionsResult] = await Promise.all([
      supabase.from('user_preferences').select('*').eq('user_id', this.userId).single(),
      supabase.from('user_exercise_performance').select('*').eq('user_id', this.userId),
      supabase.from('plank_exercises').select('*').order('difficulty_level'),
      supabase.from('user_streaks').select('*').eq('user_id', this.userId).single(),
      supabase.from('user_sessions').select('*').eq('user_id', this.userId).order('completed_at', { ascending: false }).limit(14)
    ]);

    return {
      preferences: prefsResult.data as UserPreferences,
      performance: performanceResult.data as ExercisePerformance[],
      exercises: exercisesResult.data as Exercise[],
      streak: streakResult.data as UserStreak,
      recentSessions: sessionsResult.data as UserSession[],
      currentTime: new Date()
    };
  }

  private shouldRecommendRest(context: RecommendationContext): boolean {
    const { recentSessions, currentTime } = context;
    
    // Check for consecutive days of intense workouts
    const last3Days = recentSessions.filter(session => {
      const sessionDate = new Date(session.completed_at || '');
      const daysDiff = (currentTime.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff <= 3;
    });

    // Recommend rest if user has worked out intensely for 3+ consecutive days
    if (last3Days.length >= 3) {
      const intenseSessions = last3Days.filter(session => session.duration_seconds > 300); // 5+ minutes
      return intenseSessions.length >= 2;
    }

    return false;
  }

  private getProgressiveRecommendations(context: RecommendationContext): SmartRecommendation[] {
    const { performance, exercises, preferences } = context;
    const recommendations: SmartRecommendation[] = [];

    performance.forEach(perf => {
      if (perf.success_rate > 0.8 && perf.total_sessions >= 3) {
        const currentExercise = exercises.find(e => e.id === perf.exercise_id);
        if (!currentExercise) return;

        const nextLevelExercises = exercises.filter(e => 
          e.difficulty_level === currentExercise.difficulty_level + 1 &&
          !preferences.avoided_exercises?.includes(e.id)
        );

        nextLevelExercises.forEach(exercise => {
          recommendations.push({
            exercise_id: exercise.id,
            recommendation_type: 'progressive_challenge',
            confidence_score: 0.85 + (perf.success_rate - 0.8) * 0.15,
            reasoning: `You've mastered ${currentExercise.name}! Ready for the next level.`,
            optimal_duration: Math.min(perf.best_duration_seconds * 1.2, 600)
          });
        });
      }
    });

    return recommendations;
  }

  private getVarietyRecommendations(context: RecommendationContext): SmartRecommendation[] {
    const { exercises, recentSessions, preferences, performance } = context;
    const recommendations: SmartRecommendation[] = [];

    // Get exercises not done recently
    const recentExerciseIds = new Set(recentSessions.slice(0, 7).map(s => s.exercise_id));
    const performanceMap = new Map(performance.map(p => [p.exercise_id, p]));

    const varietyExercises = exercises.filter(exercise => {
      const isRecent = recentExerciseIds.has(exercise.id);
      const isAvoided = preferences.avoided_exercises?.includes(exercise.id);
      const isAppropriateLevel = exercise.difficulty_level <= this.getUserMaxDifficulty(preferences);
      
      return !isRecent && !isAvoided && isAppropriateLevel;
    });

    varietyExercises.slice(0, 3).forEach(exercise => {
      const hasPerformance = performanceMap.has(exercise.id);
      recommendations.push({
        exercise_id: exercise.id,
        recommendation_type: 'variety_boost',
        confidence_score: hasPerformance ? 0.7 : 0.6,
        reasoning: 'Add some variety to your routine with this exercise.',
        optimal_duration: this.getOptimalDuration(exercise, preferences)
      });
    });

    return recommendations;
  }

  private getOptimalTimingRecommendations(context: RecommendationContext): SmartRecommendation[] {
    const { preferences, exercises, currentTime } = context;
    const recommendations: SmartRecommendation[] = [];

    const currentHour = currentTime.getHours();
    const preferredHour = parseInt(preferences.reminder_time.split(':')[0]);
    
    // If it's near the user's preferred time, boost confidence
    const timeDiff = Math.abs(currentHour - preferredHour);
    const timeBoost = timeDiff <= 2 ? 0.2 : 0;

    const suitableExercises = exercises.filter(e => 
      e.difficulty_level <= this.getUserMaxDifficulty(preferences) &&
      !preferences.avoided_exercises?.includes(e.id)
    ).slice(0, 2);

    suitableExercises.forEach(exercise => {
      recommendations.push({
        exercise_id: exercise.id,
        recommendation_type: 'optimal_timing',
        confidence_score: 0.6 + timeBoost,
        reasoning: timeDiff <= 2 ? 
          'Perfect timing for your workout!' : 
          'Good time to squeeze in a quick session.',
        optimal_duration: this.getOptimalDuration(exercise, preferences)
      });
    });

    return recommendations;
  }

  private getEngagementRecommendations(context: RecommendationContext): SmartRecommendation[] {
    const { streak, preferences, exercises, recentSessions } = context;
    const recommendations: SmartRecommendation[] = [];

    // Streak recovery recommendations
    if (streak && streak.current_streak === 0) {
      const easyExercises = exercises.filter(e => 
        e.is_beginner_friendly && 
        !preferences.avoided_exercises?.includes(e.id)
      );

      easyExercises.slice(0, 2).forEach(exercise => {
        recommendations.push({
          exercise_id: exercise.id,
          recommendation_type: 'streak_recovery',
          confidence_score: 0.8,
          reasoning: 'Get back on track with an easy, confidence-building workout.',
          optimal_duration: Math.min(preferences.preferred_workout_duration * 0.7, 180)
        });
      });
    }

    // Challenge recommendations for high performers
    if (streak && streak.current_streak >= 7) {
      const challengeExercises = exercises.filter(e => 
        e.difficulty_level >= 4 && 
        !preferences.avoided_exercises?.includes(e.id)
      );

      challengeExercises.slice(0, 1).forEach(exercise => {
        recommendations.push({
          exercise_id: exercise.id,
          recommendation_type: 'challenge_mode',
          confidence_score: 0.75,
          reasoning: `${streak.current_streak} day streak! Ready for a challenge?`,
          optimal_duration: preferences.preferred_workout_duration * 1.5
        });
      });
    }

    return recommendations;
  }

  private getRecoveryRecommendations(context: RecommendationContext): SmartRecommendation[] {
    const { recentSessions, exercises, preferences } = context;
    const recommendations: SmartRecommendation[] = [];

    // If last session was particularly long or intense, suggest easier options
    const lastSession = recentSessions[0];
    if (lastSession && lastSession.duration_seconds > preferences.preferred_workout_duration * 1.5) {
      const recoveryExercises = exercises.filter(e => 
        e.difficulty_level <= 2 && 
        e.is_beginner_friendly &&
        !preferences.avoided_exercises?.includes(e.id)
      );

      recoveryExercises.slice(0, 2).forEach(exercise => {
        recommendations.push({
          exercise_id: exercise.id,
          recommendation_type: 'active_recovery',
          confidence_score: 0.7,
          reasoning: 'Take it easier today after your intense session yesterday.',
          optimal_duration: Math.min(preferences.preferred_workout_duration * 0.8, 240)
        });
      });
    }

    return recommendations;
  }

  private getUserMaxDifficulty(preferences: UserPreferences): number {
    switch (preferences.difficulty_preference) {
      case 'beginner': return 2;
      case 'intermediate': return 4;
      case 'advanced': return 5;
      default: return 2;
    }
  }

  private getOptimalDuration(exercise: Exercise, preferences: UserPreferences): number {
    const baseDuration = preferences.preferred_workout_duration;
    const difficultyMultiplier = exercise.difficulty_level / 3;
    return Math.round(baseDuration * difficultyMultiplier);
  }
}
