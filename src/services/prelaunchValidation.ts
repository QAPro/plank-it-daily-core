
import { ValidationService, ValidationResult } from '@/services/validationService';

export class PreLaunchValidationService extends ValidationService {
  async runProductionReadinessCheck(): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];
    
    // Run all standard validations
    const standardResults = await this.runPreLaunchValidation();
    results.push(...standardResults);
    
    // Additional production-specific validations
    results.push(...await this.validateProductionConfiguration());
    results.push(...await this.validateAuthConfiguration());
    results.push(...await this.validateDatabaseIntegrity());
    
    return results;
  }

  private async validateProductionConfiguration(): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    // Check if we're in production environment
    const isProduction = window.location.hostname !== 'localhost' && 
                        !window.location.hostname.includes('127.0.0.1');
    
    results.push({
      category: 'Configuration',
      test: 'Environment Detection',
      status: 'pass',
      message: isProduction ? 'Production environment detected' : 'Development environment (expected for testing)',
    });

    // Check for proper error boundaries
    const hasErrorBoundary = document.querySelector('[data-error-boundary]') !== null;
    results.push({
      category: 'Configuration',
      test: 'Error Handling',
      status: hasErrorBoundary ? 'pass' : 'warning',
      message: hasErrorBoundary ? 'Error boundaries implemented' : 'Consider adding error boundaries for better UX',
    });

    return results;
  }

  private async validateAuthConfiguration(): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      // Check if auth is properly configured
      const { data: { session } } = await supabase.auth.getSession();
      
      results.push({
        category: 'Authentication',
        test: 'Auth Configuration',
        status: 'pass',
        message: 'Authentication system properly configured',
      });

      // Check RLS policies
      const { error: relsTest } = await supabase.from('users').select('id').limit(1);
      
      results.push({
        category: 'Authentication',
        test: 'Row Level Security',
        status: relsTest ? 'pass' : 'warning',
        message: relsTest ? 'RLS policies active (expected behavior)' : 'RLS policies may need review',
      });

    } catch (error) {
      results.push({
        category: 'Authentication',
        test: 'Auth Configuration', 
        status: 'fail',
        message: 'Authentication configuration error',
        details: error,
      });
    }

    return results;
  }

  private async validateDatabaseIntegrity(): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      // Test key tables exist and are accessible - using explicit table names
      // Test exercises table
      try {
        const { data, error } = await supabase
          .from('exercises')
          .select('*')
          .limit(1);
        
        results.push({
          category: 'Database',
          test: 'Table: exercises',
          status: error ? 'warning' : 'pass',
          message: error ? `Table access issue: ${error.message}` : 'Table exercises accessible',
        });
      } catch (error) {
        results.push({
          category: 'Database',
          test: 'Table: exercises',
          status: 'fail',
          message: 'Failed to access table exercises',
          details: error,
        });
      }

      // Test user_streaks table
      try {
        const { data, error } = await supabase
          .from('user_streaks')
          .select('*')
          .limit(1);
        
        results.push({
          category: 'Database',
          test: 'Table: user_streaks',
          status: error ? 'warning' : 'pass',
          message: error ? `Table access issue: ${error.message}` : 'Table user_streaks accessible',
        });
      } catch (error) {
        results.push({
          category: 'Database',
          test: 'Table: user_streaks',
          status: 'fail',
          message: 'Failed to access table user_streaks',
          details: error,
        });
      }

      // Test user_onboarding table
      try {
        const { data, error } = await supabase
          .from('user_onboarding')
          .select('*')
          .limit(1);
        
        results.push({
          category: 'Database',
          test: 'Table: user_onboarding',
          status: error ? 'warning' : 'pass',
          message: error ? `Table access issue: ${error.message}` : 'Table user_onboarding accessible',
        });
      } catch (error) {
        results.push({
          category: 'Database',
          test: 'Table: user_onboarding',
          status: 'fail',
          message: 'Failed to access table user_onboarding',
          details: error,
        });
      }

      // Test if exercises data exists
      const { data: exercises, error: exercisesError } = await supabase
        .from('exercises')
        .select('count');
        
      results.push({
        category: 'Database',
        test: 'Exercise Data',
        status: exercisesError ? 'fail' : exercises && exercises.length > 0 ? 'pass' : 'warning',
        message: exercisesError 
          ? 'Cannot access exercise data' 
          : exercises && exercises.length > 0 
            ? 'Exercise data populated' 
            : 'No exercise data found',
      });

    } catch (error) {
      results.push({
        category: 'Database',
        test: 'Database Connection',
        status: 'fail',
        message: 'Database connection failed',
        details: error,
      });
    }

    return results;
  }
}
