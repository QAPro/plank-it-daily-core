
import { format, subDays, startOfDay } from 'date-fns';

export interface TrendDataPoint {
  date: string;
  duration: number;
  sessions: number;
  movingAverage?: number;
}

export interface ExerciseDistribution {
  name: string;
  value: number;
  percentage: number;
  difficulty: number;
  color: string;
}

export interface PersonalRecord {
  exercise: string;
  duration: number;
  achievedAt: string;
  isRecent: boolean;
}

export interface MilestoneProgress {
  title: string;
  current: number;
  target: number;
  percentage: number;
  icon: string;
  type: 'sessions' | 'duration' | 'streak';
}

export const generateTrendData = (sessions: any[], days = 30): TrendDataPoint[] => {
  const dataMap = new Map<string, { duration: number; sessions: number }>();
  
  // Initialize all dates with zero values
  for (let i = 0; i < days; i++) {
    const date = format(startOfDay(subDays(new Date(), i)), 'yyyy-MM-dd');
    dataMap.set(date, { duration: 0, sessions: 0 });
  }
  
  // Fill in actual data
  sessions.forEach(session => {
    const date = format(new Date(session.completed_at), 'yyyy-MM-dd');
    const existing = dataMap.get(date) || { duration: 0, sessions: 0 };
    dataMap.set(date, {
      duration: existing.duration + session.duration_seconds,
      sessions: existing.sessions + 1
    });
  });
  
  // Calculate moving average
  const sortedData = Array.from(dataMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, data]) => ({
      date: format(new Date(date), 'MMM dd'),
      duration: data.sessions > 0 ? Math.round(data.duration / data.sessions) : 0,
      sessions: data.sessions
    }));
  
  // Add 7-day moving average
  return sortedData.map((point, index) => {
    const start = Math.max(0, index - 6);
    const window = sortedData.slice(start, index + 1);
    const movingAverage = window.reduce((sum, p) => sum + p.duration, 0) / window.length;
    
    return {
      ...point,
      movingAverage: Math.round(movingAverage)
    };
  });
};

export const generateExerciseDistribution = (sessions: any[]): ExerciseDistribution[] => {
  const exerciseMap = new Map<string, { count: number; duration: number; difficulty: number }>();
  
  sessions.forEach(session => {
    const name = session.plank_exercises?.name || 'Unknown Exercise';
    const difficulty = session.plank_exercises?.difficulty_level || 1;
    const existing = exerciseMap.get(name) || { count: 0, duration: 0, difficulty };
    
    exerciseMap.set(name, {
      count: existing.count + 1,
      duration: existing.duration + session.duration_seconds,
      difficulty
    });
  });
  
  const total = sessions.length;
  const difficultyColors = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
  
  return Array.from(exerciseMap.entries())
    .map(([name, data]) => ({
      name,
      value: data.count,
      percentage: Math.round((data.count / total) * 100),
      difficulty: data.difficulty,
      color: difficultyColors[data.difficulty - 1] || '#6b7280'
    }))
    .sort((a, b) => b.value - a.value);
};

export const findPersonalRecords = (sessions: any[]): PersonalRecord[] => {
  const recordMap = new Map<string, { duration: number; date: string }>();
  
  sessions.forEach(session => {
    const exerciseName = session.plank_exercises?.name || 'Unknown Exercise';
    const existing = recordMap.get(exerciseName);
    
    if (!existing || session.duration_seconds > existing.duration) {
      recordMap.set(exerciseName, {
        duration: session.duration_seconds,
        date: session.completed_at
      });
    }
  });
  
  const recentThreshold = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  
  return Array.from(recordMap.entries())
    .map(([exercise, record]) => ({
      exercise,
      duration: record.duration,
      achievedAt: record.date,
      isRecent: new Date(record.date) > recentThreshold
    }))
    .sort((a, b) => b.duration - a.duration)
    .slice(0, 5);
};

export const calculateMilestones = (sessions: any[], streakData: any): MilestoneProgress[] => {
  const totalSessions = sessions.length;
  const totalDuration = sessions.reduce((sum, s) => sum + s.duration_seconds, 0);
  const currentStreak = streakData?.current_streak || 0;
  
  return [
    {
      title: '100 Sessions',
      current: totalSessions,
      target: 100,
      percentage: Math.min((totalSessions / 100) * 100, 100),
      icon: '🎯',
      type: 'sessions'
    },
    {
      title: '10 Hour Journey',
      current: Math.floor(totalDuration / 3600),
      target: 10,
      percentage: Math.min((totalDuration / 36000) * 100, 100),
      icon: '⏱️',
      type: 'duration'
    },
    {
      title: '30 Day Streak',
      current: currentStreak,
      target: 30,
      percentage: Math.min((currentStreak / 30) * 100, 100),
      icon: '🔥',
      type: 'streak'
    }
  ];
};
