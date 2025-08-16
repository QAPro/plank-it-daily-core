
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Session = Tables<'user_sessions'>;

export interface MLInsights {
  performance_prediction: {
    next_7_day_avg: number;
    next_30_day_avg: number;
    confidence: number;
  };
  plateau_risk: number; // 0-100
  injury_risk: number; // 0-100
  optimal_training_load: {
    sessions_per_week: number;
    avg_duration: number;
    load_score: number; // 0-100
  };
  goal_suggestions: Array<{
    title: string;
    target_value: number;
    target_date: string; // ISO date
    measurement_unit: string;
  }>;
}

interface WeeklyLoad {
  weekStart: string; // ISO date
  totalDuration: number; // seconds
  sessions: number;
}

export class AdvancedProgressAnalytics {
  async generateMLInsights(userId: string): Promise<MLInsights> {
    console.log("[AdvancedProgressAnalytics] Generating insights for", userId);
    const history = await this.getUserHistory(userId);
    const weekly = this.groupByWeek(history);
    const { next7, next30, slope, confidence } = this.predictPerformance(history);
    const plateauRisk = this.calculatePlateauRisk(history, slope);
    const injuryRisk = this.estimateInjuryRisk(history, weekly);
    const trainingLoad = this.recommendTrainingLoad(weekly);
    const goals = this.suggestGoals(history, trainingLoad);

    const result: MLInsights = {
      performance_prediction: {
        next_7_day_avg: Math.max(0, Math.round(next7)),
        next_30_day_avg: Math.max(0, Math.round(next30)),
        confidence,
      },
      plateau_risk: Math.min(100, Math.max(0, plateauRisk)),
      injury_risk: Math.min(100, Math.max(0, injuryRisk)),
      optimal_training_load: trainingLoad,
      goal_suggestions: goals,
    };

    // Cache into ml_predictions as a single combined record
    await supabase.from('ml_predictions').insert({
      user_id: userId,
      prediction_type: 'advanced_progress',
      prediction_data: result as unknown as any,
      confidence_score: confidence,
      model_version: 'v1.0',
    });

    return result;
  }

  private async getUserHistory(userId: string): Promise<Session[]> {
    const start = new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString();
    const { data, error } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('user_id', userId)
      .gte('completed_at', start)
      .order('completed_at', { ascending: true });

    if (error) throw error;
    return (data || []) as Session[];
  }

  private groupByWeek(sessions: Session[]): WeeklyLoad[] {
    const map = new Map<string, { total: number; count: number }>();
    for (const s of sessions) {
      if (!s.completed_at) continue;
      const d = new Date(s.completed_at);
      // Calculate week start (Monday)
      const day = d.getDay(); // 0=Sun..6=Sat
      const diffToMonday = (day + 6) % 7; 
      const monday = new Date(d);
      monday.setDate(d.getDate() - diffToMonday);
      monday.setHours(0, 0, 0, 0);
      const key = monday.toISOString().split('T')[0];

      const entry = map.get(key) || { total: 0, count: 0 };
      entry.total += s.duration_seconds || 0;
      entry.count += 1;
      map.set(key, entry);
    }
    // Sort by weekStart asc
    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([weekStart, v]) => ({
        weekStart,
        totalDuration: v.total,
        sessions: v.count,
      }));
  }

  private predictPerformance(sessions: Session[]) {
    // Simple linear regression on daily sessions by date index
    const dayAgg = new Map<string, number>();
    for (const s of sessions) {
      if (!s.completed_at) continue;
      const day = s.completed_at.split('T')[0];
      dayAgg.set(day, (dayAgg.get(day) || 0) + (s.duration_seconds || 0));
    }
    const points = Array.from(dayAgg.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([, duration], idx) => ({ x: idx, y: duration }));

    if (points.length < 5) {
      const avg = points.reduce((sum, p) => sum + p.y, 0) / Math.max(1, points.length);
      return { next7: avg, next30: avg, slope: 0, confidence: 0.4 };
    }

    const n = points.length;
    const sumX = points.reduce((s, p) => s + p.x, 0);
    const sumY = points.reduce((s, p) => s + p.y, 0);
    const sumXY = points.reduce((s, p) => s + p.x * p.y, 0);
    const sumXX = points.reduce((s, p) => s + p.x * p.x, 0);
    const slope = (n * sumXY - sumX * sumY) / Math.max(1, (n * sumXX - sumX * sumX));
    const intercept = (sumY - slope * sumX) / n;

    const latestX = points[points.length - 1].x;
    const predict = (x: number) => slope * x + intercept;

    const avgDay = predict(latestX + 1);
    // next 7/30 day avg by projecting a bit (simple approach)
    const next7 = avgDay;
    const next30 = avgDay;

    // Confidence heuristic: more points + stronger slope => higher confidence
    const slopeNorm = Math.min(1, Math.abs(slope) / 100);
    const confidence = Math.min(0.95, 0.5 + Math.min(0.4, n / 120) + 0.1 * slopeNorm);

    return { next7, next30, slope, confidence };
  }

  private calculatePlateauRisk(sessions: Session[], slope: number): number {
    // Use slope and recent variance: low slope and low variance => higher plateau risk
    const last = sessions.slice(-10);
    if (last.length < 5) return 20;

    const durations = last.map(s => s.duration_seconds || 0);
    const mean = durations.reduce((a, b) => a + b, 0) / durations.length;
    const variance = durations.reduce((sum, d) => sum + Math.pow(d - mean, 2), 0) / durations.length;
    const varianceScore = Math.max(0, 100 - (variance / 100)); // normalize-ish
    const slopeScore = 100 - Math.min(100, Math.abs(slope)); // flatter => higher

    return Math.round(0.6 * varianceScore + 0.4 * slopeScore);
  }

  private estimateInjuryRisk(sessions: Session[], weekly: WeeklyLoad[]): number {
    // Acute:Chronic Workload Ratio (ACWR)
    const now = new Date();
    const d7 = new Date(now.getTime() - 7 * 24 * 3600 * 1000).toISOString().split('T')[0];
    const d28 = new Date(now.getTime() - 28 * 24 * 3600 * 1000).toISOString().split('T')[0];

    const load7 = sessions
      .filter(s => s.completed_at && s.completed_at >= d7)
      .reduce((sum, s) => sum + (s.duration_seconds || 0), 0);

    const load28 = sessions
      .filter(s => s.completed_at && s.completed_at >= d28)
      .reduce((sum, s) => sum + (s.duration_seconds || 0), 0);

    const chronicPerWeek = load28 / 4;
    const acute = load7;
    const acwr = chronicPerWeek > 0 ? acute / chronicPerWeek : 1;

    // Risk curve: >1.5 or <0.8 increases risk
    let risk = 30;
    if (acwr > 1.5) risk = 75 + Math.min(25, (acwr - 1.5) * 50);
    else if (acwr < 0.8) risk = 60 + Math.min(20, (0.8 - acwr) * 100);
    else risk = 25 + (Math.abs(acwr - 1) * 50);

    // Cap based on weekly spikes
    const spikes = weekly.slice(-4).some(w => w.sessions >= 5 && w.totalDuration > 1800);
    if (spikes) risk = Math.min(100, risk + 10);

    return Math.round(risk);
  }

  private recommendTrainingLoad(weekly: WeeklyLoad[]) {
    const last4 = weekly.slice(-4);
    const avgSessions = last4.length > 0 ? last4.reduce((s, w) => s + w.sessions, 0) / last4.length : 2;
    const avgDuration = last4.length > 0 ? last4.reduce((s, w) => s + w.totalDuration / Math.max(1, w.sessions), 0) / last4.length : 60;
    // Suggest a gentle progressive overload: +10% sessions capped 5, duration +10% capped 600s
    const targetSessions = Math.min(5, Math.max(2, Math.round(avgSessions * 1.1)));
    const targetAvgDuration = Math.min(600, Math.max(60, Math.round(avgDuration * 1.1)));
    const loadScore = Math.min(100, Math.round((targetSessions / 5) * 50 + (targetAvgDuration / 600) * 50));

    return {
      sessions_per_week: targetSessions,
      avg_duration: targetAvgDuration,
      load_score: loadScore,
    };
  }

  private suggestGoals(sessions: Session[], training: { sessions_per_week: number; avg_duration: number }) {
    const last = sessions.slice(-10);
    const currentAvg = last.length > 0 ? Math.round(last.reduce((s, x) => s + (x.duration_seconds || 0), 0) / last.length) : 60;
    const plus10 = Math.round(currentAvg * 1.1);

    const in30Days = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0];
    return [
      {
        title: "Increase average session duration by 10%",
        target_value: plus10,
        target_date: in30Days,
        measurement_unit: "seconds",
      },
      {
        title: `Maintain ${training.sessions_per_week} sessions/week`,
        target_value: training.sessions_per_week,
        target_date: in30Days,
        measurement_unit: "sessions_per_week",
      },
    ];
  }
}
