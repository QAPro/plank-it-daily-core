import { supabase } from '@/integrations/supabase/client';

export interface ProgressionSuggestion {
  type: 'duration' | 'difficulty' | 'new_exercise';
  suggestion: string;
  currentValue: number;
  suggestedValue: number;
  confidence: 'low' | 'medium' | 'high';
  reasoning: string;
}

export interface PerformanceAnalysis {
  exercise_id: string;
  success_rate: number;
  average_completion: number;
  best_performance: number;
  recent_trend: 'improving' | 'stable' | 'declining';
  session_count: number;
}

export class ProgressiveDifficultyService {
  static async analyzePerformance(userId: string, exerciseId: string): Promise<PerformanceAnalysis | null> {
    try {
      // Get recent sessions (last 10) for this exercise
      const { data: sessions, error } = await supabase
        .from('user_sessions')
        .select('duration_seconds, completed_at')
        .eq('user_id', userId)
        .eq('exercise_id', exerciseId)
        .order('completed_at', { ascending: false })
        .limit(10);

      if (error || !sessions || sessions.length === 0) {
        return null;
      }

      // Get performance data
      const { data: performance } = await supabase
        .from('user_exercise_performance')
        .select('*')
        .eq('user_id', userId)
        .eq('exercise_id', exerciseId)
        .single();

      const durations = sessions.map(s => s.duration_seconds);
      const averageCompletion = durations.reduce((a, b) => a + b, 0) / durations.length;
      const bestPerformance = Math.max(...durations);

      // Calculate trend (compare first half with second half of recent sessions)
      let recentTrend: 'improving' | 'stable' | 'declining' = 'stable';
      if (sessions.length >= 4) {
        const firstHalf = durations.slice(0, Math.floor(durations.length / 2));
        const secondHalf = durations.slice(Math.floor(durations.length / 2));
        const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
        
        if (firstAvg > secondAvg * 1.1) recentTrend = 'improving';
        else if (secondAvg > firstAvg * 1.1) recentTrend = 'declining';
      }

      return {
        exercise_id: exerciseId,
        success_rate: performance?.total_sessions ? (sessions.length / performance.total_sessions) * 100 : 100,
        average_completion: averageCompletion,
        best_performance: bestPerformance,
        recent_trend: recentTrend,
        session_count: sessions.length
      };
    } catch (error) {
      console.error('Error analyzing performance:', error);
      return null;
    }
  }

  static async generateSuggestion(userId: string, exerciseId: string, currentDuration: number): Promise<ProgressionSuggestion | null> {
    const analysis = await this.analyzePerformance(userId, exerciseId);
    
    if (!analysis) {
      return {
        type: 'duration',
        suggestion: `Try holding for ${currentDuration + 10} seconds to challenge yourself!`,
        currentValue: currentDuration,
        suggestedValue: currentDuration + 10,
        confidence: 'medium',
        reasoning: 'Building on your previous performance'
      };
    }

    // If user is consistently succeeding, suggest progression
    if (analysis.success_rate > 80 && analysis.recent_trend === 'improving') {
      const increment = Math.max(5, Math.floor(currentDuration * 0.1)); // 10% increase or minimum 5 seconds
      return {
        type: 'duration',
        suggestion: `You're doing great! Try ${currentDuration + increment} seconds - you held ${analysis.best_performance}s last time!`,
        currentValue: currentDuration,
        suggestedValue: currentDuration + increment,
        confidence: 'high',
        reasoning: `Your success rate is ${analysis.success_rate.toFixed(0)}% and you're improving`
      };
    }

    // If user is struggling, suggest maintaining current level
    if (analysis.success_rate < 60) {
      return {
        type: 'duration',
        suggestion: `Focus on consistency - try to hit ${currentDuration} seconds again to build strength.`,
        currentValue: currentDuration,
        suggestedValue: currentDuration,
        confidence: 'high',
        reasoning: 'Building consistency before progressing'
      };
    }

    // Default moderate progression
    const increment = Math.max(5, Math.floor(analysis.average_completion * 0.05));
    return {
      type: 'duration',
      suggestion: `Ready for a small challenge? Try ${currentDuration + increment} seconds!`,
      currentValue: currentDuration,
      suggestedValue: currentDuration + increment,
      confidence: 'medium',
      reasoning: 'Gradual progression based on your average performance'
    };
  }

  static async getNextChallenge(userId: string, lastExerciseId: string): Promise<string> {
    const analysis = await this.analyzePerformance(userId, lastExerciseId);
    
    if (!analysis) return "Ready for your next workout?";

    if (analysis.recent_trend === 'improving' && analysis.success_rate > 85) {
      return "🔥 You're on fire! Ready to push your limits today?";
    }

    if (analysis.recent_trend === 'declining') {
      return "💪 Let's get back on track - consistency builds strength!";
    }

    return "⭐ Keep building that habit - every session counts!";
  }
}