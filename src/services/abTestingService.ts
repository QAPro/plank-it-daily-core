import { supabase } from "@/integrations/supabase/client";

export interface ABTestExperiment {
  id: string;
  feature_flag_id: string | null;
  experiment_name: string;
  experiment_description?: string;
  hypothesis?: string;
  success_metric: string;
  traffic_split: any;
  minimum_sample_size: number;
  significance_threshold: number;
  test_duration_days: number;
  status: string;
  winner_variant?: string;
  confidence_level?: number;
  created_by?: string;
  created_at: string;
  started_at?: string;
  ended_at?: string;
  updated_at: string;
}

export interface ABTestResult {
  id: string;
  experiment_id: string;
  user_id: string;
  variant: string;
  event_type: string;
  event_value: number;
  session_id?: string;
  metadata: any;
  created_at: string;
}

export interface ABTestStatistics {
  id: string;
  experiment_id: string;
  variant: string;
  total_users: number;
  conversions: number;
  conversion_rate: number;
  confidence_interval_lower?: number;
  confidence_interval_upper?: number;
  statistical_significance?: number;
  p_value?: number;
  calculated_at: string;
}

class ABTestingService {
  // Experiment Management
  async getExperiments(): Promise<ABTestExperiment[]> {
    const { data, error } = await supabase
      .from('ab_test_experiments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as any;
  }

  async getExperiment(id: string): Promise<ABTestExperiment | null> {
    const { data, error } = await supabase
      .from('ab_test_experiments')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as any;
  }

  async createExperiment(experiment: any): Promise<ABTestExperiment> {
    const { data, error } = await supabase
      .from('ab_test_experiments')
      .insert([experiment])
      .select()
      .single();

    if (error) throw error;
    return data as any;
  }

  async updateExperiment(id: string, updates: Partial<ABTestExperiment>): Promise<ABTestExperiment> {
    const { data, error } = await supabase
      .from('ab_test_experiments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as any;
  }

  async startExperiment(id: string): Promise<ABTestExperiment> {
    return this.updateExperiment(id, {
      status: 'running',
      started_at: new Date().toISOString()
    });
  }

  async pauseExperiment(id: string): Promise<ABTestExperiment> {
    return this.updateExperiment(id, { status: 'paused' });
  }

  async stopExperiment(id: string): Promise<ABTestExperiment> {
    return this.updateExperiment(id, {
      status: 'stopped',
      ended_at: new Date().toISOString()
    });
  }

  // Variant Assignment
  async getUserVariant(featureName: string, userId: string): Promise<string> {
    // First check if user already has an assignment
    const { data: existingAssignment } = await supabase
      .from('ab_test_assignments')
      .select('variant')
      .eq('feature_name', featureName)
      .eq('user_id', userId)
      .single();

    if (existingAssignment) {
      return existingAssignment.variant;
    }

    // Call Edge Function for new assignment
    const { data, error } = await supabase.functions.invoke('assign-ab-test-variant', {
      body: { featureName, userId }
    });

    if (error) throw error;
    return data.variant;
  }

  // Results Tracking
  async trackConversion(
    experimentId: string,
    userId: string,
    variant: string,
    eventType: string,
    eventValue: number = 1,
    sessionId?: string,
    metadata: Record<string, any> = {}
  ): Promise<ABTestResult> {
    const { data, error } = await supabase
      .from('ab_test_results')
      .insert([{
        experiment_id: experimentId,
        user_id: userId,
        variant,
        event_type: eventType,
        event_value: eventValue,
        session_id: sessionId,
        metadata
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getExperimentResults(experimentId: string): Promise<ABTestResult[]> {
    const { data, error } = await supabase
      .from('ab_test_results')
      .select('*')
      .eq('experiment_id', experimentId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Statistics
  async getExperimentStatistics(experimentId: string): Promise<ABTestStatistics[]> {
    const { data, error } = await supabase
      .from('ab_test_statistics')
      .select('*')
      .eq('experiment_id', experimentId);

    if (error) throw error;
    return data || [];
  }

  async calculateStatistics(experimentId: string): Promise<void> {
    const { error } = await supabase.rpc('calculate_ab_test_statistics', {
      _experiment_id: experimentId
    });

    if (error) throw error;
  }

  async detectWinner(experimentId: string): Promise<string | null> {
    const { data, error } = await supabase.rpc('detect_experiment_winner', {
      _experiment_id: experimentId
    });

    if (error) throw error;
    return data;
  }

  // Integration with Feature Flags
  async linkExperimentToFeature(experimentId: string, featureId: string): Promise<void> {
    const { error } = await supabase
      .from('feature_flags')
      .update({
        ab_test_enabled: true,
        current_experiment_id: experimentId
      })
      .eq('id', featureId);

    if (error) throw error;
  }

  async unlinkExperimentFromFeature(featureId: string): Promise<void> {
    const { error } = await supabase
      .from('feature_flags')
      .update({
        ab_test_enabled: false,
        current_experiment_id: null
      })
      .eq('id', featureId);

    if (error) throw error;
  }

  // Helper methods
  async getSuccessMetricOptions(): Promise<string[]> {
    return [
      'button_click',
      'page_view',
      'conversion',
      'engagement',
      'retention',
      'signup',
      'purchase',
      'feature_usage',
      'time_spent',
      'task_completion'
    ];
  }

  calculateSampleSize(
    baselineConversionRate: number,
    minimumDetectableEffect: number,
    significance: number = 0.95,
    power: number = 0.8
  ): number {
    // Simplified sample size calculation
    const z_alpha = significance === 0.95 ? 1.96 : 2.58;
    const z_beta = power === 0.8 ? 0.84 : 1.28;
    
    const p1 = baselineConversionRate;
    const p2 = baselineConversionRate * (1 + minimumDetectableEffect);
    const p_pooled = (p1 + p2) / 2;
    
    const numerator = Math.pow(z_alpha + z_beta, 2) * 2 * p_pooled * (1 - p_pooled);
    const denominator = Math.pow(p2 - p1, 2);
    
    return Math.ceil(numerator / denominator);
  }
}

export const abTestingService = new ABTestingService();