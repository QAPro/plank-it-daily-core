import { supabase } from "@/integrations/supabase/client";
import { abTestingService, ABTestExperiment, ABTestStatistics } from "./abTestingService";

export interface BayesianResult {
  variant: string;
  probability_of_being_best: number;
  expected_loss: number;
  credible_interval_lower: number;
  credible_interval_upper: number;
}

export interface ExperimentTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  success_metric: string;
  hypothesis_template: string;
  recommended_sample_size: number;
  recommended_duration_days: number;
  traffic_split: any;
}

export interface MultiVariateTest {
  id: string;
  experiment_name: string;
  variables: {
    name: string;
    variants: string[];
  }[];
  combinations: {
    combination_id: string;
    variables: Record<string, string>;
  }[];
}

export interface ExperimentRecommendation {
  feature_name: string;
  recommended_test_type: string;
  priority_score: number;
  reasoning: string;
  estimated_impact: number;
  recommended_metrics: string[];
}

class EnhancedABTestingService {
  // Bayesian Analysis
  async calculateBayesianStatistics(experimentId: string): Promise<BayesianResult[]> {
    // Simulate Bayesian calculation (in real implementation, use proper Bayesian libraries)
    const statistics = await abTestingService.getExperimentStatistics(experimentId);
    
    return statistics.map(stat => ({
      variant: stat.variant,
      probability_of_being_best: stat.variant === 'control' ? 0.35 : 0.65,
      expected_loss: Math.random() * 0.05,
      credible_interval_lower: stat.conversion_rate - 0.02,
      credible_interval_upper: stat.conversion_rate + 0.02
    }));
  }

  // Multi-Armed Bandit
  async updateBanditAllocation(experimentId: string): Promise<{ control: number; variant_a: number }> {
    const statistics = await abTestingService.getExperimentStatistics(experimentId);
    const controlStats = statistics.find(s => s.variant === 'control');
    const variantStats = statistics.find(s => s.variant === 'variant_a');

    if (!controlStats || !variantStats) {
      return { control: 50, variant_a: 50 };
    }

    // Thompson Sampling-like allocation
    const controlRate = controlStats.conversion_rate;
    const variantRate = variantStats.conversion_rate;
    
    const total = controlRate + variantRate;
    if (total === 0) return { control: 50, variant_a: 50 };

    const controlAllocation = Math.floor((controlRate / total) * 100);
    const variantAllocation = 100 - controlAllocation;

    return { 
      control: Math.max(10, Math.min(90, controlAllocation)), 
      variant_a: Math.max(10, Math.min(90, variantAllocation))
    };
  }

  // Sequential Testing
  async checkSequentialTestingBounds(experimentId: string): Promise<{
    should_stop: boolean;
    reason?: string;
    winning_variant?: string;
  }> {
    const statistics = await abTestingService.getExperimentStatistics(experimentId);
    const controlStats = statistics.find(s => s.variant === 'control');
    const variantStats = statistics.find(s => s.variant === 'variant_a');

    if (!controlStats || !variantStats || !variantStats.p_value) {
      return { should_stop: false };
    }

    // Simple sequential bounds (O'Brien-Fleming-like)
    const totalUsers = controlStats.total_users + variantStats.total_users;
    const plannedSampleSize = 10000; // Should come from experiment config
    const fraction = totalUsers / plannedSampleSize;

    // Adjusted alpha for interim analysis
    const adjustedAlpha = 0.05 / Math.sqrt(fraction);

    if (variantStats.p_value < adjustedAlpha) {
      return {
        should_stop: true,
        reason: 'Statistical significance reached with sequential bounds',
        winning_variant: variantStats.conversion_rate > controlStats.conversion_rate ? 'variant_a' : 'control'
      };
    }

    // Futility bounds
    if (fraction > 0.5 && variantStats.p_value > 0.8) {
      return {
        should_stop: true,
        reason: 'Futility bound reached - unlikely to detect effect'
      };
    }

    return { should_stop: false };
  }

  // Advanced Sample Size Calculation
  calculateAdvancedSampleSize(params: {
    baselineRate: number;
    minimumDetectableEffect: number;
    alpha: number;
    power: number;
    testType: 'two-tailed' | 'one-tailed';
    adjustment?: 'bonferroni' | 'benjamini-hochberg';
    multipleComparisons?: number;
  }): {
    sample_size_per_group: number;
    total_sample_size: number;
    effect_size: number;
    adjusted_alpha: number;
  } {
    const { baselineRate, minimumDetectableEffect, alpha, power, testType, adjustment, multipleComparisons = 1 } = params;

    // Adjust alpha for multiple comparisons
    let adjustedAlpha = alpha;
    if (adjustment === 'bonferroni' && multipleComparisons > 1) {
      adjustedAlpha = alpha / multipleComparisons;
    }

    // Z-scores based on test type
    const zAlpha = testType === 'two-tailed' 
      ? this.getZScore(1 - adjustedAlpha / 2)
      : this.getZScore(1 - adjustedAlpha);
    const zBeta = this.getZScore(power);

    const p1 = baselineRate;
    const p2 = baselineRate * (1 + minimumDetectableEffect);
    const pPooled = (p1 + p2) / 2;

    const numerator = Math.pow(zAlpha + zBeta, 2) * 2 * pPooled * (1 - pPooled);
    const denominator = Math.pow(p2 - p1, 2);

    const sampleSizePerGroup = Math.ceil(numerator / denominator);
    const totalSampleSize = sampleSizePerGroup * 2;

    return {
      sample_size_per_group: sampleSizePerGroup,
      total_sample_size: totalSampleSize,
      effect_size: minimumDetectableEffect,
      adjusted_alpha: adjustedAlpha
    };
  }

  private getZScore(probability: number): number {
    // Approximate inverse normal CDF
    if (probability === 0.5) return 0;
    if (probability > 0.5) {
      return -this.getZScore(1 - probability);
    }
    
    const t = Math.sqrt(-2 * Math.log(probability));
    return -(t - (2.515517 + 0.802853 * t + 0.010328 * t * t) / 
      (1 + 1.432788 * t + 0.189269 * t * t + 0.001308 * t * t * t));
  }

  // Experiment Templates
  async getExperimentTemplates(): Promise<ExperimentTemplate[]> {
    return [
      {
        id: 'button-optimization',
        name: 'Button Optimization',
        description: 'Test different button designs, colors, or text',
        category: 'UI/UX',
        success_metric: 'button_click',
        hypothesis_template: 'Changing the button [element] from [current] to [variant] will increase click-through rate because [reasoning]',
        recommended_sample_size: 2000,
        recommended_duration_days: 14,
        traffic_split: { control: 50, variant_a: 50 }
      },
      {
        id: 'pricing-test',
        name: 'Pricing Test',
        description: 'Test different pricing strategies or displays',
        category: 'Revenue',
        success_metric: 'purchase',
        hypothesis_template: 'Changing the price from [current] to [variant] will [increase/decrease] conversion rate by [expected]% because [reasoning]',
        recommended_sample_size: 5000,
        recommended_duration_days: 21,
        traffic_split: { control: 50, variant_a: 50 }
      },
      {
        id: 'onboarding-flow',
        name: 'Onboarding Flow',
        description: 'Test different user onboarding experiences',
        category: 'User Experience',
        success_metric: 'task_completion',
        hypothesis_template: 'Modifying the onboarding flow by [change] will improve completion rate because [reasoning]',
        recommended_sample_size: 3000,
        recommended_duration_days: 28,
        traffic_split: { control: 50, variant_a: 50 }
      },
      {
        id: 'feature-adoption',
        name: 'Feature Adoption',
        description: 'Test ways to increase adoption of new features',
        category: 'Product',
        success_metric: 'feature_usage',
        hypothesis_template: 'Adding [feature_hint/tutorial/prompt] will increase feature adoption by [expected]% because [reasoning]',
        recommended_sample_size: 4000,
        recommended_duration_days: 30,
        traffic_split: { control: 50, variant_a: 50 }
      }
    ];
  }

  // Multi-variate Testing
  async createMultiVariateTest(test: Omit<MultiVariateTest, 'id'>): Promise<MultiVariateTest> {
    // In a real implementation, this would create multiple experiments
    // For now, return the test with an ID
    return {
      id: crypto.randomUUID(),
      ...test
    };
  }

  // Automatic Recommendations
  async generateExperimentRecommendations(userId: string): Promise<ExperimentRecommendation[]> {
    // Simulate intelligent recommendations based on user behavior patterns
    return [
      {
        feature_name: 'checkout_button',
        recommended_test_type: 'button-optimization',
        priority_score: 85,
        reasoning: 'High traffic area with moderate conversion rate - good opportunity for improvement',
        estimated_impact: 12,
        recommended_metrics: ['button_click', 'conversion', 'revenue']
      },
      {
        feature_name: 'pricing_display',
        recommended_test_type: 'pricing-test',
        priority_score: 78,
        reasoning: 'Users spend significant time on pricing page but many don\'t convert',
        estimated_impact: 18,
        recommended_metrics: ['page_view', 'time_spent', 'purchase']
      },
      {
        feature_name: 'feature_discovery',
        recommended_test_type: 'feature-adoption',
        priority_score: 72,
        reasoning: 'New feature has low adoption despite positive user feedback',
        estimated_impact: 25,
        recommended_metrics: ['feature_usage', 'engagement', 'retention']
      }
    ];
  }

  // Meta-analysis across experiments
  async getExperimentLearnings(): Promise<{
    total_experiments: number;
    successful_tests: number;
    average_lift: number;
    top_performing_elements: string[];
    common_failure_patterns: string[];
  }> {
    const experiments = await abTestingService.getExperiments();
    const completedExperiments = experiments.filter(exp => exp.status === 'completed');

    const successfulTests = completedExperiments.filter(exp => exp.winner_variant && exp.winner_variant !== 'control');

    return {
      total_experiments: experiments.length,
      successful_tests: successfulTests.length,
      average_lift: 8.5, // Simulated average
      top_performing_elements: ['button_color', 'headline_text', 'pricing_display'],
      common_failure_patterns: ['insufficient_sample_size', 'test_too_short', 'low_baseline_rate']
    };
  }

  // Power Analysis for Running Experiments
  async calculateCurrentPower(experimentId: string): Promise<{
    current_power: number;
    projected_end_power: number;
    recommendation: string;
  }> {
    const experiment = await abTestingService.getExperiment(experimentId);
    const statistics = await abTestingService.getExperimentStatistics(experimentId);

    if (!experiment || statistics.length === 0) {
      return {
        current_power: 0,
        projected_end_power: 0,
        recommendation: 'Insufficient data for power analysis'
      };
    }

    const totalUsers = statistics.reduce((sum, stat) => sum + stat.total_users, 0);
    const plannedSampleSize = experiment.minimum_sample_size * 2; // Assuming equal split

    // Simplified power calculation
    const currentPower = Math.min(0.8, (totalUsers / plannedSampleSize) * 0.8);
    const projectedEndPower = 0.8; // Assuming we reach planned sample size

    let recommendation = '';
    if (currentPower < 0.5) {
      recommendation = 'Continue running - insufficient power to detect meaningful effects';
    } else if (currentPower >= 0.8) {
      recommendation = 'Sufficient power reached - can make decision';
    } else {
      recommendation = 'Moderate power - consider extending if no clear winner emerges';
    }

    return {
      current_power: currentPower,
      projected_end_power: projectedEndPower,
      recommendation
    };
  }
}

export const enhancedABTestingService = new EnhancedABTestingService();