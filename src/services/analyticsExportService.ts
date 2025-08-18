
import { 
  getUserRegistrationTrends,
  getActiveUsersMetrics,
  getFeatureFlagAnalytics,
  getWorkoutCompletionAnalytics,
  getUserEngagementSummary,
  getAdminActivitySummary,
  getUserRetentionCohorts,
  getOnboardingAnalytics,
  getDevicePlatformAnalytics
} from "./adminAnalyticsService";

export type ExportFormat = 'csv' | 'json';

export interface ExportConfig {
  format: ExportFormat;
  sections: string[];
  dateRange?: {
    start?: Date;
    end?: Date;
    daysBack?: number;
  };
  filters?: Record<string, any>;
}

class AnalyticsExportService {
  private static generateFilename(section: string, format: ExportFormat): string {
    const timestamp = new Date().toISOString().split('T')[0];
    return `analytics_${section}_${timestamp}.${format}`;
  }

  private static convertToCSV(data: any[], headers?: string[]): string {
    if (!data.length) return '';
    
    const keys = headers || Object.keys(data[0]);
    const csvHeaders = keys.join(',');
    const csvRows = data.map(row => 
      keys.map(key => {
        const value = row[key];
        // Handle values that might contain commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value ?? '';
      }).join(',')
    );
    
    return [csvHeaders, ...csvRows].join('\n');
  }

  private static downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  static async exportRegistrationTrends(config: ExportConfig): Promise<void> {
    const daysBack = config.dateRange?.daysBack || 30;
    const data = await getUserRegistrationTrends(daysBack);
    
    const filename = this.generateFilename('registration_trends', config.format);
    
    if (config.format === 'csv') {
      const csv = this.convertToCSV(data, ['date', 'new_users', 'cumulative_users']);
      this.downloadFile(csv, filename, 'text/csv');
    } else {
      const json = JSON.stringify({
        export_info: {
          section: 'registration_trends',
          exported_at: new Date().toISOString(),
          date_range: `${daysBack} days`,
          total_records: data.length
        },
        data
      }, null, 2);
      this.downloadFile(json, filename, 'application/json');
    }
  }

  static async exportActiveUsers(config: ExportConfig): Promise<void> {
    const data = await getActiveUsersMetrics();
    
    const filename = this.generateFilename('active_users', config.format);
    
    if (config.format === 'csv') {
      const csv = this.convertToCSV(data, ['metric_type', 'metric_value', 'period_label']);
      this.downloadFile(csv, filename, 'text/csv');
    } else {
      const json = JSON.stringify({
        export_info: {
          section: 'active_users',
          exported_at: new Date().toISOString(),
          total_records: data.length
        },
        data
      }, null, 2);
      this.downloadFile(json, filename, 'application/json');
    }
  }

  static async exportFeatureUsage(config: ExportConfig): Promise<void> {
    const data = await getFeatureFlagAnalytics();
    
    const filename = this.generateFilename('feature_usage', config.format);
    
    if (config.format === 'csv') {
      const csv = this.convertToCSV(data, ['feature_name', 'total_evaluations', 'enabled_evaluations', 'adoption_rate', 'unique_users']);
      this.downloadFile(csv, filename, 'text/csv');
    } else {
      const json = JSON.stringify({
        export_info: {
          section: 'feature_usage',
          exported_at: new Date().toISOString(),
          total_records: data.length
        },
        data
      }, null, 2);
      this.downloadFile(json, filename, 'application/json');
    }
  }

  static async exportWorkoutPerformance(config: ExportConfig): Promise<void> {
    const daysBack = config.dateRange?.daysBack || 30;
    const data = await getWorkoutCompletionAnalytics(daysBack);
    
    const filename = this.generateFilename('workout_performance', config.format);
    
    if (config.format === 'csv') {
      const csv = this.convertToCSV(data, ['exercise_name', 'total_attempts', 'avg_duration', 'completion_rate', 'popularity_rank']);
      this.downloadFile(csv, filename, 'text/csv');
    } else {
      const json = JSON.stringify({
        export_info: {
          section: 'workout_performance',
          exported_at: new Date().toISOString(),
          date_range: `${daysBack} days`,
          total_records: data.length
        },
        data
      }, null, 2);
      this.downloadFile(json, filename, 'application/json');
    }
  }

  static async exportUserEngagement(config: ExportConfig): Promise<void> {
    const data = await getUserEngagementSummary();
    
    const filename = this.generateFilename('user_engagement', config.format);
    
    if (config.format === 'csv') {
      if (!data) {
        this.downloadFile('No engagement data available', filename, 'text/csv');
        return;
      }
      const csv = this.convertToCSV([data], ['total_users', 'active_today', 'active_this_week', 'avg_sessions_per_user', 'avg_session_duration', 'total_sessions']);
      this.downloadFile(csv, filename, 'text/csv');
    } else {
      const json = JSON.stringify({
        export_info: {
          section: 'user_engagement',
          exported_at: new Date().toISOString()
        },
        data: data || null
      }, null, 2);
      this.downloadFile(json, filename, 'application/json');
    }
  }

  static async exportOnboardingFunnel(config: ExportConfig): Promise<void> {
    const daysBack = config.dateRange?.daysBack || 30;
    const data = await getOnboardingAnalytics(daysBack);
    
    const filename = this.generateFilename('onboarding_funnel', config.format);
    
    if (config.format === 'csv') {
      const csv = this.convertToCSV(data, ['step_name', 'total_users', 'completed_users', 'completion_rate', 'avg_time_to_complete', 'drop_off_rate']);
      this.downloadFile(csv, filename, 'text/csv');
    } else {
      const json = JSON.stringify({
        export_info: {
          section: 'onboarding_funnel',
          exported_at: new Date().toISOString(),
          date_range: `${daysBack} days`,
          total_records: data.length
        },
        data
      }, null, 2);
      this.downloadFile(json, filename, 'application/json');
    }
  }

  static async exportDevicePlatform(config: ExportConfig): Promise<void> {
    const daysBack = config.dateRange?.daysBack || 30;
    const data = await getDevicePlatformAnalytics(daysBack);
    
    const filename = this.generateFilename('device_platform', config.format);
    
    if (config.format === 'csv') {
      const csv = this.convertToCSV(data, ['platform_type', 'device_category', 'user_count', 'session_count', 'avg_session_duration', 'bounce_rate']);
      this.downloadFile(csv, filename, 'text/csv');
    } else {
      const json = JSON.stringify({
        export_info: {
          section: 'device_platform',
          exported_at: new Date().toISOString(),
          date_range: `${daysBack} days`,
          total_records: data.length
        },
        data
      }, null, 2);
      this.downloadFile(json, filename, 'application/json');
    }
  }

  static async exportRetentionCohorts(config: ExportConfig): Promise<void> {
    const monthsBack = Math.max(1, Math.min(12, Math.ceil((config.dateRange?.daysBack || 30) / 30)));
    const data = await getUserRetentionCohorts(monthsBack);
    
    const filename = this.generateFilename('retention_cohorts', config.format);
    
    if (config.format === 'csv') {
      const csv = this.convertToCSV(data, ['cohort_month', 'cohort_size', 'week_1_retention', 'week_2_retention', 'week_4_retention', 'week_8_retention', 'week_12_retention']);
      this.downloadFile(csv, filename, 'text/csv');
    } else {
      const json = JSON.stringify({
        export_info: {
          section: 'retention_cohorts',
          exported_at: new Date().toISOString(),
          months_back: monthsBack,
          total_records: data.length
        },
        data
      }, null, 2);
      this.downloadFile(json, filename, 'application/json');
    }
  }

  static async exportAllSections(config: ExportConfig): Promise<void> {
    const daysBack = config.dateRange?.daysBack || 30;
    const monthsBack = Math.max(1, Math.min(12, Math.ceil(daysBack / 30)));

    const [
      registrationTrends,
      activeUsers,
      featureUsage,
      workoutPerformance,
      userEngagement,
      onboardingFunnel,
      devicePlatform,
      retentionCohorts
    ] = await Promise.all([
      getUserRegistrationTrends(daysBack),
      getActiveUsersMetrics(),
      getFeatureFlagAnalytics(),
      getWorkoutCompletionAnalytics(daysBack),
      getUserEngagementSummary(),
      getOnboardingAnalytics(daysBack),
      getDevicePlatformAnalytics(daysBack),
      getUserRetentionCohorts(monthsBack)
    ]);

    const allData = {
      export_info: {
        exported_at: new Date().toISOString(),
        date_range: `${daysBack} days`,
        months_back: monthsBack,
        sections: [
          'registration_trends',
          'active_users', 
          'feature_usage',
          'workout_performance',
          'user_engagement',
          'onboarding_funnel',
          'device_platform',
          'retention_cohorts'
        ]
      },
      registration_trends: registrationTrends,
      active_users: activeUsers,
      feature_usage: featureUsage,
      workout_performance: workoutPerformance,
      user_engagement: userEngagement,
      onboarding_funnel: onboardingFunnel,
      device_platform: devicePlatform,
      retention_cohorts: retentionCohorts
    };

    const filename = this.generateFilename('complete_analytics', config.format);
    
    if (config.format === 'csv') {
      // For CSV export of all sections, create a zip-like structure with separate CSV content
      let csvContent = '# Complete Analytics Export\n';
      csvContent += `# Exported at: ${new Date().toISOString()}\n`;
      csvContent += `# Date range: ${daysBack} days\n\n`;
      
      csvContent += '## Registration Trends\n';
      csvContent += this.convertToCSV(registrationTrends, ['date', 'new_users', 'cumulative_users']) + '\n\n';
      
      csvContent += '## Active Users\n';
      csvContent += this.convertToCSV(activeUsers, ['metric_type', 'metric_value', 'period_label']) + '\n\n';
      
      csvContent += '## Feature Usage\n';
      csvContent += this.convertToCSV(featureUsage, ['feature_name', 'total_evaluations', 'enabled_evaluations', 'adoption_rate', 'unique_users']) + '\n\n';
      
      csvContent += '## Workout Performance\n';
      csvContent += this.convertToCSV(workoutPerformance, ['exercise_name', 'total_attempts', 'avg_duration', 'completion_rate', 'popularity_rank']) + '\n\n';
      
      if (userEngagement) {
        csvContent += '## User Engagement Summary\n';
        csvContent += this.convertToCSV([userEngagement], ['total_users', 'active_today', 'active_this_week', 'avg_sessions_per_user', 'avg_session_duration', 'total_sessions']) + '\n\n';
      }
      
      csvContent += '## Onboarding Funnel\n';
      csvContent += this.convertToCSV(onboardingFunnel, ['step_name', 'total_users', 'completed_users', 'completion_rate', 'avg_time_to_complete', 'drop_off_rate']) + '\n\n';
      
      csvContent += '## Device & Platform Analytics\n';
      csvContent += this.convertToCSV(devicePlatform, ['platform_type', 'device_category', 'user_count', 'session_count', 'avg_session_duration', 'bounce_rate']) + '\n\n';
      
      csvContent += '## Retention Cohorts\n';
      csvContent += this.convertToCSV(retentionCohorts, ['cohort_month', 'cohort_size', 'week_1_retention', 'week_2_retention', 'week_4_retention', 'week_8_retention', 'week_12_retention']);
      
      this.downloadFile(csvContent, filename, 'text/csv');
    } else {
      const json = JSON.stringify(allData, null, 2);
      this.downloadFile(json, filename, 'application/json');
    }
  }
}

export default AnalyticsExportService;
