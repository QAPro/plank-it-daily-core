import { supabase } from "@/integrations/supabase/client";

export interface FeatureUsageEvent {
  user_id: string;
  feature_name: string;
  event_type: 'enabled' | 'disabled' | 'accessed' | 'interaction';
  metadata?: Record<string, any>;
  session_id?: string;
  component_path?: string;
}

export interface FeatureAnalytics {
  feature_name: string;
  total_users: number;
  active_users_24h: number;
  active_users_7d: number;
  active_users_30d: number;
  adoption_rate: number;
  engagement_score: number;
  performance_impact: 'low' | 'medium' | 'high';
  user_satisfaction: number;
}

export interface FeaturePerformanceMetrics {
  feature_name: string;
  avg_load_time: number;
  error_rate: number;
  cpu_usage_increase: number;
  memory_usage_increase: number;
  user_drop_off_rate: number;
}

export interface AdoptionTrendPoint {
  date: string;
  adoption_rate: number;
  active_features: number;
}

class FeatureAnalyticsService {
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async trackFeatureUsage(event: FeatureUsageEvent): Promise<void> {
    try {
      const { error } = await supabase
        .from('feature_usage_events')
        .insert({
          ...event,
          session_id: event.session_id || this.sessionId,
          created_at: new Date().toISOString(),
        });

      if (error) {
        console.error('[FeatureAnalytics] Failed to track usage:', error);
      }
    } catch (err) {
      console.error('[FeatureAnalytics] Error tracking usage:', err);
    }
  }

  async trackFeatureAccess(featureName: string, componentPath?: string): Promise<void> {
    const user = await this.getCurrentUser();
    if (!user) return;

    await this.trackFeatureUsage({
      user_id: user.id,
      feature_name: featureName,
      event_type: 'accessed',
      component_path: componentPath,
      metadata: {
        timestamp: Date.now(),
        user_agent: navigator.userAgent,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
      },
    });
  }

  async trackFeatureInteraction(
    featureName: string, 
    interactionType: string, 
    metadata?: Record<string, any>
  ): Promise<void> {
    const user = await this.getCurrentUser();
    if (!user) return;

    await this.trackFeatureUsage({
      user_id: user.id,
      feature_name: featureName,
      event_type: 'interaction',
      metadata: {
        interaction_type: interactionType,
        ...metadata,
      },
    });
  }

  async getFeatureAnalytics(featureName: string): Promise<FeatureAnalytics | null> {
    try {
      const { data, error } = await supabase.rpc('get_feature_analytics', {
        _feature_name: featureName,
      });

      if (error) {
        console.error('[FeatureAnalytics] Failed to get analytics:', error);
        return null;
      }

      // The RPC returns an array with one object, so we take the first element
      const result = data && data.length > 0 ? data[0] : null;
      if (result) {
        return {
          ...result,
          performance_impact: result.performance_impact as 'low' | 'medium' | 'high',
        };
      }
      return null;
    } catch (err) {
      console.error('[FeatureAnalytics] Error getting analytics:', err);
      return null;
    }
  }

  async getFeaturePerformanceMetrics(featureName: string): Promise<FeaturePerformanceMetrics | null> {
    try {
      const { data, error } = await supabase.rpc('get_feature_performance_metrics', {
        _feature_name: featureName,
      });

      if (error) {
        console.error('[FeatureAnalytics] Failed to get performance metrics:', error);
        return null;
      }

      // The RPC returns an array with one object, so we take the first element
      return data && data.length > 0 ? data[0] : null;
    } catch (err) {
      console.error('[FeatureAnalytics] Error getting performance metrics:', err);
      return null;
    }
  }

  async getFeatureAdoptionTrends(days: number = 30): Promise<AdoptionTrendPoint[]> {
    try {
      const { data, error } = await supabase.rpc('get_feature_adoption_trends', {
        _days_back: days,
      });

      if (error) {
        console.error('[FeatureAnalytics] Failed to get adoption trends:', error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error('[FeatureAnalytics] Error getting adoption trends:', err);
      return [];
    }
  }

  async getUserFeatureJourney(userId: string): Promise<FeatureUsageEvent[]> {
    try {
      const { data, error } = await supabase
        .from('feature_usage_events')
        .select(`
          user_id,
          feature_name,
          event_type,
          metadata,
          created_at,
          component_path,
          session_id
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
        .limit(1000);

      if (error) {
        console.error('[FeatureAnalytics] Failed to get user journey:', error);
        return [];
      }

      return (data || []).map(item => ({
        user_id: item.user_id,
        feature_name: item.feature_name,
        event_type: item.event_type as 'enabled' | 'disabled' | 'accessed' | 'interaction',
        metadata: (typeof item.metadata === 'object' && item.metadata !== null) 
          ? item.metadata as Record<string, any> 
          : {},
        component_path: item.component_path,
        session_id: item.session_id,
      }));
    } catch (err) {
      console.error('[FeatureAnalytics] Error getting user journey:', err);
      return [];
    }
  }

  private async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }

  // A/B Testing Support
  async assignUserToVariant(featureName: string, userId: string): Promise<string> {
    try {
      const { data, error } = await supabase.rpc('assign_ab_test_variant', {
        _feature_name: featureName,
        _user_id: userId,
      });

      if (error) {
        console.error('[FeatureAnalytics] Failed to assign variant:', error);
        return 'control';
      }

      return data || 'control';
    } catch (err) {
      console.error('[FeatureAnalytics] Error assigning variant:', err);
      return 'control';
    }
  }

  async getABTestResults(featureName: string): Promise<any> {
    try {
      const { data, error } = await supabase.rpc('get_ab_test_results', {
        _feature_name: featureName,
      });

      if (error) {
        console.error('[FeatureAnalytics] Failed to get A/B test results:', error);
        return null;
      }

      return data;
    } catch (err) {
      console.error('[FeatureAnalytics] Error getting A/B test results:', err);
      return null;
    }
  }
}

export const featureAnalyticsService = new FeatureAnalyticsService();