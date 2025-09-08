import { supabase } from "@/integrations/supabase/client";
import { startOfDay, subDays, format } from "date-fns";

export interface HookCycleEvent {
  id: string;
  user_id: string;
  cycle_start_at: string;
  cycle_completed_at?: string;
  trigger_type: 'notification' | 'reminder' | 'social' | 'habit';
  trigger_data: Record<string, any>;
  action_taken: boolean;
  action_type?: string;
  action_duration_seconds?: number;
  reward_given?: string;
  reward_data: Record<string, any>;
  investment_actions: Record<string, any>;
  cycle_success_score: number;
}

export interface SuccessCorrelation {
  correlation_type: string;
  correlation_key: string;
  success_rate: number;
  sample_size: number;
  confidence_level: number;
}

export interface TriggerEffectivenessAnalysis {
  best_times: { hour: number; success_rate: number }[];
  best_days: { day: number; success_rate: number }[];
  best_messages: { content: string; success_rate: number }[];
  optimal_frequency: number; // hours between triggers
}

export interface ActionOptimizationInsights {
  friction_points: { location: string; frequency: number; avg_resolution_time: number }[];
  fastest_paths: { path: string; avg_completion_time: number }[];
  drop_off_locations: { location: string; drop_off_rate: number }[];
  time_to_start_distribution: { range: string; percentage: number }[];
}

export interface RewardImpactAnalysis {
  most_effective_rewards: { type: string; retention_boost: number; engagement_boost: number }[];
  optimal_xp_amounts: { activity: string; optimal_amount: number; satisfaction_score: number }[];
  sharing_rates: { achievement_type: string; share_rate: number }[];
  return_correlation: { reward_type: string; return_rate_7d: number; return_rate_30d: number }[];
}

export interface InvestmentDepthAnalysis {
  customization_impact: { type: string; ltv_boost: number; retention_boost: number }[];
  social_connection_impact: { connection_type: string; churn_reduction: number }[];
  habit_strength_correlation: { investment_level: string; habit_strength_score: number }[];
  progression_predictors: { factor: string; prediction_accuracy: number }[];
}

export interface HookFrequencyOptimization {
  optimal_cycles_per_day: number;
  habit_formation_timeline: { days: number; completion_rate: number }[];
  frequency_satisfaction: { frequency: number; user_satisfaction: number }[];
  burnout_indicators: { frequency: number; fatigue_score: number }[];
}

export interface SuccessMetrics {
  daily_active_users: { date: string; dau_percentage: number }[];
  retention_rates: { day_7: number; day_30: number; day_90: number };
  hook_completion_rate: number;
  investment_depth: { avg_customizations: number; distribution: Record<string, number> };
  habit_formation: { streak_21_plus: number; avg_streak_length: number };
  trigger_effectiveness: { avg_response_rate: number; best_performing: any[] };
  action_optimization: { avg_friction_score: number; completion_rate: number };
  reward_impact: { satisfaction_score: number; return_rate: number };
  wellbeing_indicators: { positive_sentiment: number; sustainable_usage: number };
  ethical_metrics: { healthy_engagement: number; graceful_graduation: number };
}

class HookModelAnalytics {
  /**
   * Track a new hook cycle event
   */
  async trackHookCycle(
    userId: string,
    triggerType: HookCycleEvent['trigger_type'],
    triggerData: Record<string, any> = {}
  ): Promise<string> {
    const { data, error } = await supabase
      .from('hook_cycle_events')
      .insert([{
        user_id: userId,
        trigger_type: triggerType,
        trigger_data: triggerData,
        cycle_start_at: new Date().toISOString()
      }])
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  }

  /**
   * Complete a hook cycle with action and reward data
   */
  async completeHookCycle(
    cycleId: string,
    actionTaken: boolean,
    actionType?: string,
    actionDuration?: number,
    rewardGiven?: string,
    rewardData: Record<string, any> = {},
    investmentActions: Record<string, any> = {}
  ): Promise<void> {
    const cycleSuccessScore = this.calculateCycleSuccessScore({
      action_taken: actionTaken,
      action_duration_seconds: actionDuration,
      reward_given: rewardGiven,
      investment_actions: investmentActions
    });

    const { error } = await supabase
      .from('hook_cycle_events')
      .update({
        cycle_completed_at: new Date().toISOString(),
        action_taken: actionTaken,
        action_type: actionType,
        action_duration_seconds: actionDuration,
        reward_given: rewardGiven,
        reward_data: rewardData,
        investment_actions: investmentActions,
        cycle_success_score: cycleSuccessScore
      })
      .eq('id', cycleId);

    if (error) throw error;

    // Update user success correlations
    await this.updateSuccessCorrelations(cycleId);
  }

  /**
   * Analyze trigger effectiveness across different dimensions
   */
  async analyzeTriggerEffectiveness(
    userId?: string,
    timeframe: number = 30
  ): Promise<TriggerEffectivenessAnalysis> {
    const startDate = subDays(new Date(), timeframe).toISOString();
    
    let query = supabase
      .from('trigger_effectiveness_logs')
      .select('*')
      .gte('trigger_timestamp', startDate);
    
    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;
    if (error) throw error;

    return this.processTriggerEffectivenessData(data || []);
  }

  /**
   * Get action optimization insights
   */
  async analyzeActionOptimization(
    userId?: string,
    timeframe: number = 30
  ): Promise<ActionOptimizationInsights> {
    const startDate = subDays(new Date(), timeframe).toISOString();
    
    // Get friction point data
    let frictionQuery = supabase
      .from('friction_point_logs')
      .select('*')
      .gte('created_at', startDate);
    
    if (userId) {
      frictionQuery = frictionQuery.eq('user_id', userId);
    }

    const { data: frictionData, error: frictionError } = await frictionQuery;
    if (frictionError) throw frictionError;

    // Get session completion data
    let sessionQuery = supabase
      .from('user_sessions')
      .select('*')
      .gte('completed_at', startDate);
    
    if (userId) {
      sessionQuery = sessionQuery.eq('user_id', userId);
    }

    const { data: sessionData, error: sessionError } = await sessionQuery;
    if (sessionError) throw sessionError;

    return this.processActionOptimizationData(frictionData || [], sessionData || []);
  }

  /**
   * Analyze reward impact on user behavior
   */
  async analyzeRewardImpact(
    userId?: string,
    timeframe: number = 30
  ): Promise<RewardImpactAnalysis> {
    const startDate = subDays(new Date(), timeframe).toISOString();
    
    // Get hook cycle data with rewards
    let query = supabase
      .from('hook_cycle_events')
      .select('*')
      .gte('cycle_start_at', startDate)
      .not('reward_given', 'is', null);
    
    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;
    if (error) throw error;

    return this.processRewardImpactData(data || []);
  }

  /**
   * Analyze investment depth and its correlation with retention
   */
  async analyzeInvestmentDepth(
    userId?: string,
    timeframe: number = 30
  ): Promise<InvestmentDepthAnalysis> {
    const startDate = subDays(new Date(), timeframe).toISOString();
    
    let query = supabase
      .from('hook_cycle_events')
      .select('*')
      .gte('cycle_start_at', startDate)
      .not('investment_actions', 'eq', '{}');
    
    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;
    if (error) throw error;

    return this.processInvestmentDepthData(data || []);
  }

  /**
   * Calculate optimal hook cycle frequency
   */
  async calculateOptimalFrequency(
    userId?: string,
    timeframe: number = 30
  ): Promise<HookFrequencyOptimization> {
    const startDate = subDays(new Date(), timeframe).toISOString();
    
    let query = supabase
      .from('hook_cycle_events')
      .select('*')
      .gte('cycle_start_at', startDate)
      .order('cycle_start_at');
    
    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;
    if (error) throw error;

    return this.processFrequencyOptimizationData(data || []);
  }

  /**
   * Get comprehensive success metrics
   */
  async getSuccessMetrics(timeframe: number = 30): Promise<SuccessMetrics> {
    const startDate = subDays(new Date(), timeframe).toISOString();
    
    // Parallel queries for different metrics
    const [
      hookCycles,
      sessions,
      users,
      triggerLogs,
      frictionLogs
    ] = await Promise.all([
      supabase.from('hook_cycle_events').select('*').gte('cycle_start_at', startDate),
      supabase.from('user_sessions').select('*').gte('completed_at', startDate),
      supabase.from('users').select('id,created_at').gte('created_at', startDate),
      supabase.from('trigger_effectiveness_logs').select('*').gte('trigger_timestamp', startDate),
      supabase.from('friction_point_logs').select('*').gte('created_at', startDate)
    ]);

    return this.calculateSuccessMetrics({
      hookCycles: hookCycles.data || [],
      sessions: sessions.data || [],
      users: users.data || [],
      triggerLogs: triggerLogs.data || [],
      frictionLogs: frictionLogs.data || []
    });
  }

  /**
   * Track user success correlation
   */
  async updateSuccessCorrelations(cycleId: string): Promise<void> {
    const { data: cycle } = await supabase
      .from('hook_cycle_events')
      .select('*')
      .eq('id', cycleId)
      .single();

    if (!cycle) return;

    const correlations = this.extractCorrelationsFromCycle(cycle);
    
    for (const correlation of correlations) {
      await supabase
        .from('user_success_correlations')
        .upsert({
          user_id: cycle.user_id,
          correlation_type: correlation.type,
          correlation_key: correlation.key,
          success_rate: correlation.success_rate,
          sample_size: correlation.sample_size,
          confidence_level: correlation.confidence_level
        });
    }
  }

  /**
   * Log friction point
   */
  async logFrictionPoint(
    userId: string,
    sessionId: string | null,
    frictionType: string,
    frictionLocation: string,
    frictionData: Record<string, any> = {},
    impactScore: number = 1
  ): Promise<void> {
    await supabase
      .from('friction_point_logs')
      .insert([{
        user_id: userId,
        session_id: sessionId,
        friction_type: frictionType,
        friction_location: frictionLocation,
        friction_data: frictionData,
        impact_score: impactScore
      }]);
  }

  /**
   * Log trigger effectiveness
   */
  async logTriggerEffectiveness(
    userId: string,
    notificationId: string | null,
    triggerType: string,
    triggerContent: string,
    userContext: Record<string, any> = {}
  ): Promise<string> {
    const now = new Date();
    const { data, error } = await supabase
      .from('trigger_effectiveness_logs')
      .insert([{
        user_id: userId,
        notification_id: notificationId,
        trigger_type: triggerType,
        trigger_content: triggerContent,
        time_of_day: now.getHours(),
        day_of_week: now.getDay(),
        user_context: userContext
      }])
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  }

  /**
   * Update trigger effectiveness with response
   */
  async updateTriggerResponse(
    logId: string,
    responseAction: string,
    responseTimestamp: Date = new Date()
  ): Promise<void> {
    const { data: log } = await supabase
      .from('trigger_effectiveness_logs')
      .select('trigger_timestamp')
      .eq('id', logId)
      .single();

    if (!log) return;

    const responseDelay = Math.floor(
      (responseTimestamp.getTime() - new Date(log.trigger_timestamp).getTime()) / 1000
    );

    const effectivenessScore = this.calculateEffectivenessScore(responseAction, responseDelay);

    await supabase
      .from('trigger_effectiveness_logs')
      .update({
        response_action: responseAction,
        response_timestamp: responseTimestamp.toISOString(),
        response_delay_seconds: responseDelay,
        effectiveness_score: effectivenessScore
      })
      .eq('id', logId);
  }

  // Private helper methods
  private calculateCycleSuccessScore(cycle: {
    action_taken?: boolean;
    action_duration_seconds?: number;
    reward_given?: string;
    investment_actions?: Record<string, any>;
  }): number {
    let score = 0;
    
    if (cycle.action_taken) score += 40;
    if (cycle.action_duration_seconds && cycle.action_duration_seconds > 30) score += 30;
    if (cycle.reward_given) score += 20;
    if (cycle.investment_actions && Object.keys(cycle.investment_actions).length > 0) score += 10;
    
    return Math.min(score, 100);
  }

  private processTriggerEffectivenessData(data: any[]): TriggerEffectivenessAnalysis {
    // Group by hour and calculate success rates
    const hourlyData = data.reduce((acc, item) => {
      const hour = item.time_of_day;
      if (!acc[hour]) acc[hour] = { total: 0, successful: 0 };
      acc[hour].total++;
      if (item.effectiveness_score > 50) acc[hour].successful++;
      return acc;
    }, {});

    const best_times = Object.entries(hourlyData).map(([hour, stats]: [string, any]) => ({
      hour: parseInt(hour),
      success_rate: (stats.successful / stats.total) * 100
    })).sort((a, b) => b.success_rate - a.success_rate);

    // Similar processing for days, messages, and frequency
    return {
      best_times,
      best_days: [], // Similar calculation for days
      best_messages: [], // Analysis of message content effectiveness
      optimal_frequency: 8 // Calculate based on user response patterns
    };
  }

  private processActionOptimizationData(frictionData: any[], sessionData: any[]): ActionOptimizationInsights {
    // Process friction points
    const frictionPoints = frictionData.reduce((acc, item) => {
      const location = item.friction_location;
      if (!acc[location]) acc[location] = { count: 0, totalTime: 0 };
      acc[location].count++;
      acc[location].totalTime += item.time_to_resolve_seconds || 0;
      return acc;
    }, {});

    const friction_points = Object.entries(frictionPoints).map(([location, data]: [string, any]) => ({
      location,
      frequency: data.count,
      avg_resolution_time: data.totalTime / data.count
    }));

    return {
      friction_points,
      fastest_paths: [], // Analyze session completion paths
      drop_off_locations: [], // Calculate drop-off rates by location
      time_to_start_distribution: [] // Distribution of start times
    };
  }

  private processRewardImpactData(data: any[]): RewardImpactAnalysis {
    // Analyze reward effectiveness
    return {
      most_effective_rewards: [],
      optimal_xp_amounts: [],
      sharing_rates: [],
      return_correlation: []
    };
  }

  private processInvestmentDepthData(data: any[]): InvestmentDepthAnalysis {
    // Analyze investment patterns
    return {
      customization_impact: [],
      social_connection_impact: [],
      habit_strength_correlation: [],
      progression_predictors: []
    };
  }

  private processFrequencyOptimizationData(data: any[]): HookFrequencyOptimization {
    // Calculate optimal frequency patterns
    return {
      optimal_cycles_per_day: 3,
      habit_formation_timeline: [],
      frequency_satisfaction: [],
      burnout_indicators: []
    };
  }

  private calculateSuccessMetrics(data: any): SuccessMetrics {
    // Calculate comprehensive success metrics
    return {
      daily_active_users: [],
      retention_rates: { day_7: 0, day_30: 0, day_90: 0 },
      hook_completion_rate: 0,
      investment_depth: { avg_customizations: 0, distribution: {} },
      habit_formation: { streak_21_plus: 0, avg_streak_length: 0 },
      trigger_effectiveness: { avg_response_rate: 0, best_performing: [] },
      action_optimization: { avg_friction_score: 0, completion_rate: 0 },
      reward_impact: { satisfaction_score: 0, return_rate: 0 },
      wellbeing_indicators: { positive_sentiment: 0, sustainable_usage: 0 },
      ethical_metrics: { healthy_engagement: 0, graceful_graduation: 0 }
    };
  }

  private extractCorrelationsFromCycle(cycle: any): any[] {
    // Extract success correlations from completed cycle
    return [];
  }

  private calculateEffectivenessScore(responseAction: string, responseDelay: number): number {
    let score = 0;
    
    // Response type scoring
    switch (responseAction) {
      case 'workout_started': score += 80; break;
      case 'workout_completed': score += 100; break;
      case 'dismissed': score += 20; break;
      case 'ignored': score += 0; break;
      default: score += 10;
    }
    
    // Response time penalty
    if (responseDelay < 300) score *= 1; // Within 5 minutes
    else if (responseDelay < 1800) score *= 0.8; // Within 30 minutes
    else if (responseDelay < 3600) score *= 0.5; // Within 1 hour
    else score *= 0.2; // After 1 hour
    
    return Math.min(score, 100);
  }
}

export const hookModelAnalytics = new HookModelAnalytics();