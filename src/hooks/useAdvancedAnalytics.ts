
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type SessionWithExercise = Tables<'user_sessions'> & {
  plank_exercises: Tables<'plank_exercises'> | null;
};

interface AdvancedMetrics {
  consistency_score: number;
  improvement_rate: number;
  exercise_variety: number;
  average_session_duration: number;
  total_duration: number;
  sessions_count: number;
  plateau_risk: number;
  goal_achievement_probability: number;
}

interface TimeCorrelation {
  best_time_of_day: string;
  best_day_of_week: string;
  performance_by_hour: { hour: number; avg_duration: number }[];
  performance_by_day: { day: string; avg_duration: number }[];
}

interface AnalyticsInsight {
  type: 'improvement' | 'plateau' | 'achievement' | 'recommendation';
  title: string;
  description: string;
  confidence: number;
  actionable: boolean;
  icon: string;
}

interface ChartData {
  type: 'line' | 'bar' | 'heatmap' | 'radar';
  title: string;
  data: any[];
  config?: any;
}

interface AnalyticsData {
  user_id: string;
  timeframe: 'week' | 'month' | 'quarter' | 'year';
  metrics: AdvancedMetrics;
  charts: ChartData[];
  insights: AnalyticsInsight[];
  timeCorrelation: TimeCorrelation;
}

class AdvancedAnalyticsEngine {
  static async generateAnalytics(
    userId: string, 
    timeframe: 'week' | 'month' | 'quarter' | 'year'
  ): Promise<AnalyticsData> {
    const sessions = await this.getUserSessions(userId, timeframe);
    const metrics = await this.calculateAdvancedMetrics(sessions);
    const charts = await this.generateChartData(sessions, timeframe);
    const insights = await this.generateInsights(metrics, sessions);
    const timeCorrelation = await this.analyzeTimeCorrelation(sessions);
    
    return {
      user_id: userId,
      timeframe,
      metrics,
      charts,
      insights,
      timeCorrelation
    };
  }

  private static async getUserSessions(userId: string, timeframe: string): Promise<SessionWithExercise[]> {
    const now = new Date();
    let startDate: Date;

    switch (timeframe) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'quarter':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const { data, error } = await supabase
      .from('user_sessions')
      .select(`
        *,
        plank_exercises (
          id,
          name,
          difficulty_level,
          category
        )
      `)
      .eq('user_id', userId)
      .gte('completed_at', startDate.toISOString())
      .order('completed_at', { ascending: true });

    if (error) throw error;
    return data as SessionWithExercise[];
  }

  private static async calculateAdvancedMetrics(sessions: SessionWithExercise[]): Promise<AdvancedMetrics> {
    if (sessions.length === 0) {
      return {
        consistency_score: 0,
        improvement_rate: 0,
        exercise_variety: 0,
        average_session_duration: 0,
        total_duration: 0,
        sessions_count: 0,
        plateau_risk: 0,
        goal_achievement_probability: 0.5
      };
    }

    const totalDuration = sessions.reduce((sum, s) => sum + s.duration_seconds, 0);
    const averageDuration = totalDuration / sessions.length;
    const uniqueExercises = new Set(sessions.map(s => s.exercise_id)).size;
    
    // Calculate consistency score (0-100)
    const daysWithWorkouts = this.calculateWorkoutDays(sessions);
    const consistencyScore = Math.min(100, (daysWithWorkouts.length / 30) * 100);

    // Calculate improvement rate
    const improvementRate = this.calculateImprovementRate(sessions);

    // Calculate plateau risk
    const plateauRisk = this.calculatePlateauRisk(sessions);

    // Calculate goal achievement probability
    const goalProbability = this.calculateGoalProbability(sessions, improvementRate);

    return {
      consistency_score: consistencyScore,
      improvement_rate: improvementRate,
      exercise_variety: uniqueExercises,
      average_session_duration: Math.round(averageDuration),
      total_duration: totalDuration,
      sessions_count: sessions.length,
      plateau_risk: plateauRisk,
      goal_achievement_probability: goalProbability
    };
  }

  private static calculateWorkoutDays(sessions: SessionWithExercise[]): string[] {
    const days = new Set<string>();
    sessions.forEach(session => {
      if (session.completed_at) {
        const date = new Date(session.completed_at).toDateString();
        days.add(date);
      }
    });
    return Array.from(days);
  }

  private static calculateImprovementRate(sessions: SessionWithExercise[]): number {
    if (sessions.length < 5) return 0;

    const recentSessions = sessions.slice(-5);
    const olderSessions = sessions.slice(0, 5);

    const recentAvg = recentSessions.reduce((sum, s) => sum + s.duration_seconds, 0) / 5;
    const olderAvg = olderSessions.reduce((sum, s) => sum + s.duration_seconds, 0) / 5;

    return olderAvg > 0 ? ((recentAvg - olderAvg) / olderAvg) * 100 : 0;
  }

  private static calculatePlateauRisk(sessions: SessionWithExercise[]): number {
    if (sessions.length < 10) return 0;

    const recentSessions = sessions.slice(-10);
    const durations = recentSessions.map(s => s.duration_seconds);
    
    // Calculate variance in recent sessions
    const mean = durations.reduce((sum, d) => sum + d, 0) / durations.length;
    const variance = durations.reduce((sum, d) => sum + Math.pow(d - mean, 2), 0) / durations.length;
    
    // Low variance indicates plateau
    return Math.max(0, Math.min(100, 100 - (variance / 100)));
  }

  private static calculateGoalProbability(sessions: SessionWithExercise[], improvementRate: number): number {
    const baseProb = 0.5;
    const improvementFactor = Math.min(0.3, improvementRate / 100);
    const consistencyFactor = Math.min(0.2, sessions.length / 30);
    
    return Math.max(0, Math.min(1, baseProb + improvementFactor + consistencyFactor));
  }

  private static async analyzeTimeCorrelation(sessions: SessionWithExercise[]): Promise<TimeCorrelation> {
    const hourlyPerformance = new Map<number, number[]>();
    const dailyPerformance = new Map<string, number[]>();

    sessions.forEach(session => {
      if (session.completed_at) {
        const date = new Date(session.completed_at);
        const hour = date.getHours();
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

        if (!hourlyPerformance.has(hour)) hourlyPerformance.set(hour, []);
        if (!dailyPerformance.has(dayName)) dailyPerformance.set(dayName, []);

        hourlyPerformance.get(hour)!.push(session.duration_seconds);
        dailyPerformance.get(dayName)!.push(session.duration_seconds);
      }
    });

    const performanceByHour = Array.from(hourlyPerformance.entries()).map(([hour, durations]) => ({
      hour,
      avg_duration: durations.reduce((sum, d) => sum + d, 0) / durations.length
    }));

    const performanceByDay = Array.from(dailyPerformance.entries()).map(([day, durations]) => ({
      day,
      avg_duration: durations.reduce((sum, d) => sum + d, 0) / durations.length
    }));

    const bestHour = performanceByHour.reduce((best, current) => 
      current.avg_duration > best.avg_duration ? current : best, performanceByHour[0]);

    const bestDay = performanceByDay.reduce((best, current) => 
      current.avg_duration > best.avg_duration ? current : best, performanceByDay[0]);

    return {
      best_time_of_day: `${bestHour?.hour || 9}:00`,
      best_day_of_week: bestDay?.day || 'Monday',
      performance_by_hour: performanceByHour,
      performance_by_day: performanceByDay
    };
  }

  private static async generateChartData(sessions: SessionWithExercise[], timeframe: string): Promise<ChartData[]> {
    const charts: ChartData[] = [];

    // Progress trend chart
    const progressData = this.generateProgressTrendData(sessions, timeframe);
    charts.push({
      type: 'line',
      title: 'Duration Progress Trend',
      data: progressData
    });

    // Exercise variety chart
    const varietyData = this.generateExerciseVarietyData(sessions);
    charts.push({
      type: 'bar',
      title: 'Exercise Variety',
      data: varietyData
    });

    // Consistency heatmap
    const consistencyData = this.generateConsistencyHeatmapData(sessions);
    charts.push({
      type: 'heatmap',
      title: 'Workout Consistency',
      data: consistencyData
    });

    return charts;
  }

  private static generateProgressTrendData(sessions: SessionWithExercise[], timeframe: string) {
    const groupedData = new Map<string, number[]>();

    sessions.forEach(session => {
      if (session.completed_at) {
        const date = new Date(session.completed_at);
        let key: string;

        if (timeframe === 'week') {
          key = date.toLocaleDateString('en-US', { weekday: 'short' });
        } else {
          key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }

        if (!groupedData.has(key)) groupedData.set(key, []);
        groupedData.get(key)!.push(session.duration_seconds);
      }
    });

    return Array.from(groupedData.entries()).map(([date, durations]) => ({
      date,
      duration: Math.round(durations.reduce((sum, d) => sum + d, 0) / durations.length),
      sessions: durations.length
    }));
  }

  private static generateExerciseVarietyData(sessions: SessionWithExercise[]) {
    const exerciseCounts = new Map<string, number>();

    sessions.forEach(session => {
      const exerciseName = session.plank_exercises?.name || 'Unknown';
      exerciseCounts.set(exerciseName, (exerciseCounts.get(exerciseName) || 0) + 1);
    });

    return Array.from(exerciseCounts.entries()).map(([name, count]) => ({
      exercise: name,
      sessions: count
    }));
  }

  private static generateConsistencyHeatmapData(sessions: SessionWithExercise[]) {
    const heatmapData = [];
    const now = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const sessionsOnDay = sessions.filter(s => 
        s.completed_at && s.completed_at.startsWith(dateStr)
      ).length;

      heatmapData.push({
        date: dateStr,
        day: date.getDate(),
        sessions: sessionsOnDay,
        intensity: Math.min(4, sessionsOnDay)
      });
    }

    return heatmapData;
  }

  private static async generateInsights(metrics: AdvancedMetrics, sessions: SessionWithExercise[]): Promise<AnalyticsInsight[]> {
    const insights: AnalyticsInsight[] = [];

    // Improvement insight
    if (metrics.improvement_rate > 10) {
      insights.push({
        type: 'improvement',
        title: 'Great Progress!',
        description: `Your performance has improved by ${metrics.improvement_rate.toFixed(1)}% recently. Keep up the excellent work!`,
        confidence: 0.9,
        actionable: false,
        icon: '📈'
      });
    }

    // Consistency insight
    if (metrics.consistency_score > 70) {
      insights.push({
        type: 'achievement',
        title: 'Consistency Champion',
        description: `Your consistency score of ${metrics.consistency_score.toFixed(0)}% shows great dedication to your fitness routine.`,
        confidence: 0.95,
        actionable: false,
        icon: '🏆'
      });
    }

    // Plateau warning
    if (metrics.plateau_risk > 60) {
      insights.push({
        type: 'plateau',
        title: 'Plateau Risk Detected',
        description: 'Your progress has been steady. Consider trying more challenging exercises to continue improving.',
        confidence: 0.8,
        actionable: true,
        icon: '⚠️'
      });
    }

    // Exercise variety recommendation
    if (metrics.exercise_variety < 3) {
      insights.push({
        type: 'recommendation',
        title: 'Diversify Your Workouts',
        description: 'Try incorporating different plank variations to target various muscle groups and prevent boredom.',
        confidence: 0.85,
        actionable: true,
        icon: '🎯'
      });
    }

    return insights;
  }
}

export const useAdvancedAnalytics = (timeframe: 'week' | 'month' | 'quarter' | 'year' = 'month') => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['advanced-analytics', user?.id, timeframe],
    queryFn: async () => {
      if (!user) return null;
      return AdvancedAnalyticsEngine.generateAnalytics(user.id, timeframe);
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
