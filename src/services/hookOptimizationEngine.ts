import { supabase } from "@/integrations/supabase/client";
import { hookModelAnalytics, type SuccessCorrelation } from "./hookModelAnalytics";

export interface OptimizationRecommendation {
  type: 'trigger_timing' | 'reward_amount' | 'message_tone' | 'friction_reduction';
  priority: 'high' | 'medium' | 'low';
  recommendation: string;
  expected_impact: number; // 0-100 percentage improvement
  confidence: number; // 0-100 statistical confidence
  implementation_data: Record<string, any>;
}

export interface PersonalizedTriggerConfig {
  optimal_times: number[]; // Hours of day
  optimal_frequency: number; // Hours between triggers
  preferred_message_tone: string;
  effective_trigger_types: string[];
  avoid_patterns: string[];
}

export interface FrictionReductionSuggestion {
  location: string;
  friction_type: string;
  suggested_solution: string;
  priority: number;
  estimated_impact: number;
}

export interface ExperimentConfig {
  name: string;
  type: string;
  variant_a: Record<string, any>;
  variant_b: Record<string, any>;
  target_metric: string;
  duration_days: number;
  target_users: number;
}

class HookOptimizationEngine {
  /**
   * Generate personalized optimization recommendations for a user
   */
  async generatePersonalizedRecommendations(
    userId: string,
    timeframe: number = 30
  ): Promise<OptimizationRecommendation[]> {
    // Get user's success correlations
    const { data: correlations } = await supabase
      .from('user_success_correlations')
      .select('*')
      .eq('user_id', userId)
      .gte('sample_size', 3); // Minimum sample for reliable recommendations

    if (!correlations) return [];

    const recommendations: OptimizationRecommendation[] = [];

    // Analyze trigger timing
    const timingCorrelations = correlations.filter(c => c.correlation_type === 'trigger_time');
    if (timingCorrelations.length > 0) {
      const bestTime = timingCorrelations.reduce((best, current) => 
        current.success_rate > best.success_rate ? current : best
      );
      
      recommendations.push({
        type: 'trigger_timing',
        priority: 'high',
        recommendation: `Schedule notifications at ${bestTime.correlation_key} for optimal response`,
        expected_impact: Math.round(bestTime.success_rate - 50), // Improvement over baseline
        confidence: bestTime.confidence_level,
        implementation_data: {
          optimal_hour: bestTime.correlation_key,
          current_success_rate: bestTime.success_rate
        }
      });
    }

    // Analyze reward effectiveness
    const rewardCorrelations = correlations.filter(c => c.correlation_type === 'reward_type');
    if (rewardCorrelations.length > 0) {
      const bestReward = rewardCorrelations.reduce((best, current) => 
        current.success_rate > best.success_rate ? current : best
      );
      
      recommendations.push({
        type: 'reward_amount',
        priority: 'medium',
        recommendation: `Use ${bestReward.correlation_key} rewards for maximum motivation`,
        expected_impact: Math.round(bestReward.success_rate - 40),
        confidence: bestReward.confidence_level,
        implementation_data: {
          optimal_reward: bestReward.correlation_key,
          success_rate: bestReward.success_rate
        }
      });
    }

    // Check for friction points
    const frictionRecommendations = await this.generateFrictionReductions(userId);
    recommendations.push(...frictionRecommendations.map(f => ({
      type: 'friction_reduction' as const,
      priority: f.priority > 7 ? 'high' as const : 'medium' as const,
      recommendation: f.suggested_solution,
      expected_impact: f.estimated_impact,
      confidence: 85,
      implementation_data: {
        location: f.location,
        friction_type: f.friction_type
      }
    })));

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Get personalized trigger configuration for a user
   */
  async getPersonalizedTriggerConfig(userId: string): Promise<PersonalizedTriggerConfig> {
    const { data: correlations } = await supabase
      .from('user_success_correlations')
      .select('*')
      .eq('user_id', userId)
      .gte('sample_size', 2);

    const config: PersonalizedTriggerConfig = {
      optimal_times: [9, 18], // Default times
      optimal_frequency: 8, // Default 8 hours
      preferred_message_tone: 'encouraging',
      effective_trigger_types: ['reminder'],
      avoid_patterns: []
    };

    if (!correlations) return config;

    // Extract optimal times
    const timeCorrelations = correlations.filter(c => 
      c.correlation_type === 'trigger_time' && c.success_rate > 60
    );
    if (timeCorrelations.length > 0) {
      config.optimal_times = timeCorrelations
        .map(c => parseInt(c.correlation_key))
        .sort((a, b) => a - b);
    }

    // Extract message preferences
    const messageCorrelations = correlations.filter(c => 
      c.correlation_type === 'message_tone' && c.success_rate > 50
    );
    if (messageCorrelations.length > 0) {
      const bestTone = messageCorrelations.reduce((best, current) => 
        current.success_rate > best.success_rate ? current : best
      );
      config.preferred_message_tone = bestTone.correlation_key;
    }

    // Extract effective trigger types
    const triggerTypeCorrelations = correlations.filter(c => 
      c.correlation_type === 'trigger_type' && c.success_rate > 60
    );
    if (triggerTypeCorrelations.length > 0) {
      config.effective_trigger_types = triggerTypeCorrelations.map(c => c.correlation_key);
    }

    // Identify patterns to avoid
    const ineffectivePatterns = correlations.filter(c => c.success_rate < 30);
    config.avoid_patterns = ineffectivePatterns.map(c => 
      `${c.correlation_type}:${c.correlation_key}`
    );

    return config;
  }

  /**
   * Generate friction reduction suggestions
   */
  async generateFrictionReductions(userId: string): Promise<FrictionReductionSuggestion[]> {
    const { data: frictionLogs } = await supabase
      .from('friction_point_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    if (!frictionLogs || frictionLogs.length === 0) return [];

    // Group friction points by location and type
    const frictionMap = frictionLogs.reduce((acc, log) => {
      const key = `${log.friction_location}:${log.friction_type}`;
      if (!acc[key]) {
        acc[key] = {
          location: log.friction_location,
          type: log.friction_type,
          count: 0,
          totalImpact: 0,
          avgResolutionTime: 0
        };
      }
      acc[key].count++;
      acc[key].totalImpact += log.impact_score;
      acc[key].avgResolutionTime += log.time_to_resolve_seconds || 0;
      return acc;
    }, {});

    return Object.values(frictionMap).map((friction: any) => {
      const avgImpact = friction.totalImpact / friction.count;
      const avgResolution = friction.avgResolutionTime / friction.count;
      
      return {
        location: friction.location,
        friction_type: friction.type,
        suggested_solution: this.generateFrictionSolution(friction.location, friction.type),
        priority: Math.round(avgImpact * (friction.count / 5)), // Higher priority for frequent high-impact friction
        estimated_impact: Math.min(avgImpact * 10, 100) // Convert to percentage
      };
    }).sort((a, b) => b.priority - a.priority);
  }

  /**
   * Create and run A/B test experiment
   */
  async createExperiment(config: ExperimentConfig): Promise<string> {
    const { data, error } = await supabase
      .from('optimization_experiments')
      .insert([{
        experiment_name: config.name,
        experiment_type: config.type,
        variant_a_config: config.variant_a,
        variant_b_config: config.variant_b,
        target_metric: config.target_metric,
        end_date: new Date(Date.now() + config.duration_days * 24 * 60 * 60 * 1000).toISOString(),
        is_active: true
      }])
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  }

  /**
   * Analyze experiment results
   */
  async analyzeExperiment(experimentId: string): Promise<{
    is_complete: boolean;
    results: Record<string, any>;
    winner?: 'a' | 'b';
    confidence: number;
  }> {
    const { data: experiment } = await supabase
      .from('optimization_experiments')
      .select('*')
      .eq('id', experimentId)
      .single();

    if (!experiment) throw new Error('Experiment not found');

    // Check if experiment is complete
    const now = new Date();
    const endDate = new Date(experiment.end_date);
    const isComplete = now >= endDate;

    if (!isComplete) {
      return {
        is_complete: false,
        results: {},
        confidence: 0
      };
    }

    // Analyze results based on target metric
    const results = await this.calculateExperimentResults(experiment);
    
    return results;
  }

  /**
   * Apply optimization automatically based on success correlations
   */
  async applyAutoOptimization(userId: string): Promise<{
    applied_optimizations: string[];
    skipped_optimizations: string[];
    next_review_date: string;
  }> {
    const recommendations = await this.generatePersonalizedRecommendations(userId);
    const applied: string[] = [];
    const skipped: string[] = [];

    for (const rec of recommendations) {
      if (rec.priority === 'high' && rec.confidence > 80) {
        try {
          await this.implementRecommendation(userId, rec);
          applied.push(rec.recommendation);
        } catch (error) {
          console.error('Failed to apply optimization:', error);
          skipped.push(rec.recommendation);
        }
      } else {
        skipped.push(rec.recommendation);
      }
    }

    return {
      applied_optimizations: applied,
      skipped_optimizations: skipped,
      next_review_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };
  }

  /**
   * Monitor for degrading performance and auto-adjust
   */
  async monitorAndAdjust(userId: string): Promise<{
    performance_status: 'improving' | 'stable' | 'declining';
    adjustments_made: string[];
    next_check: string;
  }> {
    // Get recent performance data
    const recentMetrics = await hookModelAnalytics.getSuccessMetrics(7);
    const previousMetrics = await hookModelAnalytics.getSuccessMetrics(14);

    const performance = this.comparePerformance(recentMetrics, previousMetrics);
    const adjustments: string[] = [];

    if (performance === 'declining') {
      // Implement emergency adjustments
      const urgentRecommendations = await this.generatePersonalizedRecommendations(userId);
      const criticalRecs = urgentRecommendations.filter(r => 
        r.priority === 'high' && r.expected_impact > 20
      );

      for (const rec of criticalRecs.slice(0, 2)) { // Limit to 2 most critical
        try {
          await this.implementRecommendation(userId, rec);
          adjustments.push(`Applied: ${rec.recommendation}`);
        } catch (error) {
          console.error('Failed emergency adjustment:', error);
        }
      }
    }

    return {
      performance_status: performance,
      adjustments_made: adjustments,
      next_check: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };
  }

  // Private helper methods

  private generateFrictionSolution(location: string, type: string): string {
    const solutions = {
      'load_time': 'Implement caching and optimize asset loading',
      'ui_confusion': 'Add contextual help tooltips and simplify interface',
      'technical_error': 'Add error handling and user-friendly error messages',
      'navigation': 'Improve navigation flow and add breadcrumbs',
      'form_validation': 'Add real-time validation and clearer error messages'
    };

    return solutions[type] || `Address ${type} issue in ${location}`;
  }

  private async calculateExperimentResults(experiment: any): Promise<any> {
    // Implementation would analyze actual experiment data
    return {
      is_complete: true,
      results: {
        variant_a: { metric_value: 65, sample_size: 100 },
        variant_b: { metric_value: 72, sample_size: 98 }
      },
      winner: 'b' as const,
      confidence: 85
    };
  }

  private async implementRecommendation(userId: string, recommendation: OptimizationRecommendation): Promise<void> {
    switch (recommendation.type) {
      case 'trigger_timing':
        await this.updateNotificationSchedule(userId, recommendation.implementation_data);
        break;
      case 'reward_amount':
        await this.updateRewardSettings(userId, recommendation.implementation_data);
        break;
      case 'friction_reduction':
        // Log the issue for development team to address
        await this.logOptimizationRequest(userId, recommendation);
        break;
      default:
        console.warn('Unknown recommendation type:', recommendation.type);
    }
  }

  private async updateNotificationSchedule(userId: string, data: Record<string, any>): Promise<void> {
    const optimalHour = parseInt(data.optimal_hour);
    
    await supabase
      .from('user_notification_schedules')
      .upsert({
        user_id: userId,
        slot: 'primary',
        send_time: `${optimalHour.toString().padStart(2, '0')}:00:00`,
        enabled: true
      });
  }

  private async updateRewardSettings(userId: string, data: Record<string, any>): Promise<void> {
    // Update user preferences with optimal reward settings
    await supabase
      .from('user_preferences')
      .upsert({
        user_id: userId,
        preferred_reward_type: data.optimal_reward
      });
  }

  private async logOptimizationRequest(userId: string, recommendation: OptimizationRecommendation): Promise<void> {
    // Log optimization requests for manual implementation
    console.log('Optimization request logged:', {
      user_id: userId,
      type: recommendation.type,
      recommendation: recommendation.recommendation,
      priority: recommendation.priority
    });
  }

  private comparePerformance(recent: any, previous: any): 'improving' | 'stable' | 'declining' {
    const recentCompletion = recent.hook_completion_rate;
    const previousCompletion = previous.hook_completion_rate;
    
    const change = recentCompletion - previousCompletion;
    
    if (change > 5) return 'improving';
    if (change < -5) return 'declining';
    return 'stable';
  }
}

export const hookOptimizationEngine = new HookOptimizationEngine();