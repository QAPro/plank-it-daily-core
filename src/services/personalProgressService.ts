import { supabase } from '@/integrations/supabase/client';

export interface ProgressMetrics {
  improvementPercentage: number;
  strengthGainPercentage: number;
  costSavings: number;
  timeDedicated: {
    totalHours: number;
    dailyAverage: number;
    weeklyAverage: number;
  };
  healthBenefits: {
    coreStrengthIncrease: number;
    postureImprovement: number;
    consistencyScore: number;
  };
  baseline: {
    averageDuration: number;
    firstSessionDate: Date;
    initialDuration: number;
  };
}

export interface HabitMilestone {
  type: '21_day' | '66_day' | '90_day' | '180_day' | '365_day';
  title: string;
  description: string;
  isAchieved: boolean;
  progress: number;
  target: number;
  achievedDate?: Date;
  daysRemaining?: number;
}

export class PersonalProgressService {
  static async calculateProgressMetrics(userId: string): Promise<ProgressMetrics> {
    // Fetch user sessions
    const { data: sessions } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('completed_at', { ascending: true });

    if (!sessions || sessions.length === 0) {
      return this.getEmptyMetrics();
    }

    const now = new Date();
    const firstSession = sessions[0];
    const firstSessionDate = new Date(firstSession.completed_at);
    const totalDays = Math.max(1, Math.ceil((now.getTime() - firstSessionDate.getTime()) / (1000 * 60 * 60 * 24)));

    // Calculate baseline metrics
    const initialDuration = firstSession.duration_seconds || 0;
    const recentSessions = sessions.slice(-10); // Last 10 sessions
    const currentAvgDuration = recentSessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) / recentSessions.length;
    
    // Improvement calculations
    const improvementPercentage = initialDuration > 0 ? 
      ((currentAvgDuration - initialDuration) / initialDuration) * 100 : 0;
    
    // Strength gain estimation based on duration improvement and consistency
    const consistencyScore = Math.min(sessions.length / totalDays, 1) * 100;
    const strengthGainPercentage = Math.min(improvementPercentage * 0.7 + consistencyScore * 0.3, 200);

    // Time dedication calculations
    const totalSeconds = sessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0);
    const totalHours = totalSeconds / 3600;
    const dailyAverage = totalHours / Math.max(totalDays, 1);
    const weeklyAverage = dailyAverage * 7;

    // Cost savings calculation (vs gym membership)
    const monthsActive = Math.max(1, totalDays / 30);
    const avgGymCost = 50; // $50/month average
    const costSavings = monthsActive * avgGymCost;

    // Health benefits estimation
    const coreStrengthIncrease = Math.min(strengthGainPercentage, 100);
    const postureImprovement = Math.min(consistencyScore * 0.8, 80);

    return {
      improvementPercentage: Math.round(improvementPercentage * 10) / 10,
      strengthGainPercentage: Math.round(strengthGainPercentage * 10) / 10,
      costSavings: Math.round(costSavings),
      timeDedicated: {
        totalHours: Math.round(totalHours * 10) / 10,
        dailyAverage: Math.round(dailyAverage * 60 * 10) / 10, // in minutes
        weeklyAverage: Math.round(weeklyAverage * 60 * 10) / 10, // in minutes
      },
      healthBenefits: {
        coreStrengthIncrease: Math.round(coreStrengthIncrease),
        postureImprovement: Math.round(postureImprovement),
        consistencyScore: Math.round(consistencyScore),
      },
      baseline: {
        averageDuration: Math.round(currentAvgDuration),
        firstSessionDate,
        initialDuration,
      },
    };
  }

  static async getHabitMilestones(userId: string): Promise<HabitMilestone[]> {
    // Fetch user streak data
    const { data: streakData } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', userId)
      .single();

    const currentStreak = streakData?.current_streak || 0;
    const longestStreak = streakData?.longest_streak || 0;

    // Fetch first session date
    const { data: firstSession } = await supabase
      .from('user_sessions')
      .select('completed_at')
      .eq('user_id', userId)
      .order('completed_at', { ascending: true })
      .limit(1)
      .single();

    const daysSinceStart = firstSession ? 
      Math.ceil((new Date().getTime() - new Date(firstSession.completed_at).getTime()) / (1000 * 60 * 60 * 24)) : 0;

    const milestones: HabitMilestone[] = [
      {
        type: '21_day',
        title: 'Habit Foundation',
        description: 'Build the neural pathways for lasting change',
        isAchieved: longestStreak >= 21,
        progress: Math.min(currentStreak, 21),
        target: 21,
        achievedDate: longestStreak >= 21 ? new Date() : undefined,
        daysRemaining: longestStreak >= 21 ? undefined : Math.max(0, 21 - currentStreak),
      },
      {
        type: '66_day',
        title: 'Automatic Behavior',
        description: 'Transform plank into an automatic habit',
        isAchieved: longestStreak >= 66,
        progress: Math.min(currentStreak, 66),
        target: 66,
        achievedDate: longestStreak >= 66 ? new Date() : undefined,
        daysRemaining: longestStreak >= 66 ? undefined : Math.max(0, 66 - currentStreak),
      },
      {
        type: '90_day',
        title: 'Lifestyle Integration',
        description: 'Make fitness a permanent part of your life',
        isAchieved: daysSinceStart >= 90,
        progress: Math.min(daysSinceStart, 90),
        target: 90,
        achievedDate: daysSinceStart >= 90 ? new Date() : undefined,
        daysRemaining: daysSinceStart >= 90 ? undefined : Math.max(0, 90 - daysSinceStart),
      },
      {
        type: '180_day',
        title: 'Transformation Master',
        description: 'Achieve significant physical transformation',
        isAchieved: daysSinceStart >= 180,
        progress: Math.min(daysSinceStart, 180),
        target: 180,
        achievedDate: daysSinceStart >= 180 ? new Date() : undefined,
        daysRemaining: daysSinceStart >= 180 ? undefined : Math.max(0, 180 - daysSinceStart),
      },
      {
        type: '365_day',
        title: 'Fitness Legend',
        description: 'Complete a full year of consistent training',
        isAchieved: daysSinceStart >= 365,
        progress: Math.min(daysSinceStart, 365),
        target: 365,
        achievedDate: daysSinceStart >= 365 ? new Date() : undefined,
        daysRemaining: daysSinceStart >= 365 ? undefined : Math.max(0, 365 - daysSinceStart),
      },
    ];

    return milestones;
  }

  static predictFutureProgress(sessions: any[], days: number = 30): { predictedDuration: number; confidence: number } {
    if (sessions.length < 5) {
      return { predictedDuration: 0, confidence: 0 };
    }

    // Simple linear regression for prediction
    const recentSessions = sessions.slice(-20); // Last 20 sessions
    const durations = recentSessions.map((s, i) => ({ x: i, y: s.duration_seconds || 0 }));
    
    const n = durations.length;
    const sumX = durations.reduce((sum, p) => sum + p.x, 0);
    const sumY = durations.reduce((sum, p) => sum + p.y, 0);
    const sumXY = durations.reduce((sum, p) => sum + p.x * p.y, 0);
    const sumXX = durations.reduce((sum, p) => sum + p.x * p.x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const predictedDuration = Math.max(0, slope * (n + days) + intercept);
    const variance = durations.reduce((sum, p) => {
      const predicted = slope * p.x + intercept;
      return sum + Math.pow(p.y - predicted, 2);
    }, 0) / n;

    const confidence = Math.max(0, Math.min(1, 1 - (variance / (sumY / n)))) * 100;

    return {
      predictedDuration: Math.round(predictedDuration),
      confidence: Math.round(confidence),
    };
  }

  private static getEmptyMetrics(): ProgressMetrics {
    return {
      improvementPercentage: 0,
      strengthGainPercentage: 0,
      costSavings: 0,
      timeDedicated: {
        totalHours: 0,
        dailyAverage: 0,
        weeklyAverage: 0,
      },
      healthBenefits: {
        coreStrengthIncrease: 0,
        postureImprovement: 0,
        consistencyScore: 0,
      },
      baseline: {
        averageDuration: 0,
        firstSessionDate: new Date(),
        initialDuration: 0,
      },
    };
  }
}