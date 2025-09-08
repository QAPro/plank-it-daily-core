import { supabase } from '@/integrations/supabase/client';

export interface MotivationalMilestone {
  id: string;
  type: 'improvement' | 'strength' | 'value' | 'time' | 'health';
  title: string;
  message: string;
  value: string;
  subtext: string;
  icon: string;
  color: string;
  isAchieved: boolean;
  progress?: number;
  celebrationLevel: 'minor' | 'major' | 'legendary';
}

export class MotivationalMilestoneEngine {
  private static CELEBRATION_THRESHOLDS = {
    improvement: [25, 50, 100, 200, 300], // % improvement
    strength: [20, 40, 60, 80, 100], // % strength gain
    cost_savings: [50, 100, 200, 300, 500], // $ saved
    time_dedicated: [5, 10, 20, 30, 50], // hours dedicated
    consistency: [50, 70, 80, 90, 95], // % consistency score
  };

  static async generateMilestones(userId: string): Promise<MotivationalMilestone[]> {
    const milestones: MotivationalMilestone[] = [];

    // Get user sessions for calculations
    const { data: sessions } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('completed_at', { ascending: true });

    if (!sessions || sessions.length === 0) {
      return [];
    }

    const firstSession = sessions[0];
    const recentSessions = sessions.slice(-10);
    const now = new Date();
    const daysActive = Math.max(1, Math.ceil((now.getTime() - new Date(firstSession.completed_at).getTime()) / (1000 * 60 * 60 * 24)));

    // Calculate metrics
    const initialDuration = firstSession.duration_seconds || 0;
    const currentAvg = recentSessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) / recentSessions.length;
    const improvementPercent = initialDuration > 0 ? ((currentAvg - initialDuration) / initialDuration) * 100 : 0;
    const totalHours = sessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) / 3600;
    const consistencyScore = (sessions.length / daysActive) * 100;
    const costSavings = Math.floor((daysActive / 30) * 50); // $50/month gym cost
    const strengthGain = Math.min(improvementPercent * 0.7 + consistencyScore * 0.3, 100);

    // Generate improvement milestones
    milestones.push(...this.generateImprovementMilestones(improvementPercent, initialDuration, currentAvg));

    // Generate strength milestones
    milestones.push(...this.generateStrengthMilestones(strengthGain, consistencyScore));

    // Generate value milestones
    milestones.push(...this.generateValueMilestones(costSavings, totalHours));

    // Generate time dedication milestones
    milestones.push(...this.generateTimeMilestones(totalHours, daysActive));

    // Generate health milestones
    milestones.push(...this.generateHealthMilestones(consistencyScore, strengthGain));

    return milestones.filter(m => m.isAchieved).sort((a, b) => {
      const levelOrder = { 'legendary': 3, 'major': 2, 'minor': 1 };
      return levelOrder[b.celebrationLevel] - levelOrder[a.celebrationLevel];
    });
  }

  private static generateTimeMilestones(totalHours: number, daysActive: number): MotivationalMilestone[] {
    const milestones: MotivationalMilestone[] = [];

    this.CELEBRATION_THRESHOLDS.time_dedicated.forEach((threshold, index) => {
      if (totalHours >= threshold) {
        const dailyAvg = (totalHours * 60) / Math.max(daysActive, 1);
        milestones.push({
          id: `time_${threshold}`,
          type: 'time',
          title: `${threshold} Hour Achiever`,
          message: `You've dedicated ${Math.round(totalHours * 10) / 10} hours to your health!`,
          value: `${Math.round(totalHours * 10) / 10} hours`,
          subtext: `Just ${Math.round(dailyAvg)} minutes per day on average`,
          icon: '⏰',
          color: 'text-blue-600',
          isAchieved: true,
          celebrationLevel: index >= 3 ? 'legendary' : index >= 1 ? 'major' : 'minor',
        });
      }
    });

    return milestones;
  }

  private static generateImprovementMilestones(improvementPercent: number, initial: number, current: number): MotivationalMilestone[] {
    const milestones: MotivationalMilestone[] = [];

    this.CELEBRATION_THRESHOLDS.improvement.forEach((threshold, index) => {
      if (improvementPercent >= threshold) {
        milestones.push({
          id: `improvement_${threshold}`,
          type: 'improvement',
          title: `${threshold}% Improvement Champion`,
          message: `You've improved by ${Math.round(improvementPercent)}% since starting!`,
          value: `+${Math.round(improvementPercent)}%`,
          subtext: `From ${Math.round(initial)}s to ${Math.round(current)}s average`,
          icon: '📈',
          color: 'text-green-600',
          isAchieved: true,
          celebrationLevel: index >= 3 ? 'legendary' : index >= 1 ? 'major' : 'minor',
        });
      }
    });

    return milestones;
  }

  private static generateStrengthMilestones(strengthGain: number, consistency: number): MotivationalMilestone[] {
    const milestones: MotivationalMilestone[] = [];

    this.CELEBRATION_THRESHOLDS.strength.forEach((threshold, index) => {
      if (strengthGain >= threshold) {
        milestones.push({
          id: `strength_${threshold}`,
          type: 'strength',
          title: `${threshold}% Stronger Core`,
          message: `Your core strength has increased by an estimated ${Math.round(strengthGain)}%!`,
          value: `${Math.round(strengthGain)}% stronger`,
          subtext: `Based on consistency and performance improvements`,
          icon: '💪',
          color: 'text-orange-600',
          isAchieved: true,
          celebrationLevel: index >= 3 ? 'legendary' : index >= 1 ? 'major' : 'minor',
        });
      }
    });

    return milestones;
  }

  private static generateValueMilestones(costSavings: number, totalHours: number): MotivationalMilestone[] {
    const milestones: MotivationalMilestone[] = [];

    this.CELEBRATION_THRESHOLDS.cost_savings.forEach((threshold, index) => {
      if (costSavings >= threshold) {
        milestones.push({
          id: `savings_${threshold}`,
          type: 'value',
          title: `$${threshold} Money Saver`,
          message: `You've saved $${costSavings} compared to a gym membership!`,
          value: `$${costSavings} saved`,
          subtext: `That's money in your pocket for other goals`,
          icon: '💰',
          color: 'text-emerald-600',
          isAchieved: true,
          celebrationLevel: index >= 3 ? 'legendary' : index >= 1 ? 'major' : 'minor',
        });
      }
    });

    return milestones;
  }

  private static generateHealthMilestones(consistencyScore: number, strengthGain: number): MotivationalMilestone[] {
    const milestones: MotivationalMilestone[] = [];

    if (consistencyScore >= 80) {
      milestones.push({
        id: 'health_consistency',
        type: 'health',
        title: 'Habit Master',
        message: 'Your consistency is building lasting health benefits!',
        value: `${Math.round(consistencyScore)}% consistent`,
        subtext: 'Better posture, reduced back pain risk, increased functional strength',
        icon: '🎯',
        color: 'text-purple-600',
        isAchieved: true,
        celebrationLevel: consistencyScore >= 95 ? 'legendary' : 'major',
      });
    }

    if (strengthGain >= 50) {
      milestones.push({
        id: 'health_transformation',
        type: 'health',
        title: 'Body Transformer',
        message: 'You\'re experiencing real physical transformation!',
        value: 'Visible changes',
        subtext: 'Stronger core, better balance, improved athletic performance',
        icon: '🔥',
        color: 'text-red-600',
        isAchieved: true,
        celebrationLevel: strengthGain >= 80 ? 'legendary' : 'major',
      });
    }

    return milestones;
  }

  static async checkForNewMilestones(userId: string): Promise<MotivationalMilestone[]> {
    // Get previously celebrated milestones
    const { data: celebratedMilestones } = await supabase
      .from('user_achievements')
      .select('achievement_name')
      .eq('user_id', userId)
      .eq('achievement_type', 'motivational_milestone');

    const celebratedIds = new Set(
      (celebratedMilestones || []).map(m => m.achievement_name)
    );

    // Get current milestones
    const currentMilestones = await this.generateMilestones(userId);

    // Filter for new milestones
    const newMilestones = currentMilestones.filter(
      milestone => !celebratedIds.has(milestone.id)
    );

    // Save new milestones as achievements
    for (const milestone of newMilestones) {
      await supabase.from('user_achievements').insert({
        user_id: userId,
        achievement_type: 'motivational_milestone',
        achievement_name: milestone.id,
        description: milestone.message,
        metadata: {
          value: milestone.value,
          celebrationLevel: milestone.celebrationLevel,
          icon: milestone.icon,
        },
      });
    }

    return newMilestones;
  }

  static generateCelebrationMessage(milestone: MotivationalMilestone): string {
    const messages = {
      minor: [
        `🎉 ${milestone.title}! ${milestone.message}`,
        `Amazing progress! ${milestone.message}`,
        `Keep it up! ${milestone.message}`,
      ],
      major: [
        `🚀 MILESTONE ACHIEVED: ${milestone.title}! ${milestone.message}`,
        `🏆 INCREDIBLE: ${milestone.title}! ${milestone.message}`,
        `💥 BREAKTHROUGH: ${milestone.title}! ${milestone.message}`,
      ],
      legendary: [
        `🔥 LEGENDARY ACHIEVEMENT: ${milestone.title}! ${milestone.message}`,
        `⭐ EXTRAORDINARY: ${milestone.title}! ${milestone.message}`,
        `🎯 PHENOMENAL: ${milestone.title}! ${milestone.message}`,
      ],
    };

    const categoryMessages = messages[milestone.celebrationLevel];
    return categoryMessages[Math.floor(Math.random() * categoryMessages.length)];
  }
}
