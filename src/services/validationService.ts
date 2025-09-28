
import { supabase } from '@/integrations/supabase/client';

export interface ValidationResult {
  category: string;
  test: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: any;
}

export class ValidationService {
  async runPreLaunchValidation(): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    // Database connectivity tests
    results.push(...await this.validateDatabaseConnectivity());
    
    // Authentication tests
    results.push(...await this.validateAuthentication());
    
    // Performance tests
    results.push(...await this.validatePerformance());
    
    // Security tests
    results.push(...await this.validateSecurity());
    
    // Accessibility tests
    results.push(...await this.validateAccessibility());

    return results;
  }

  private async validateDatabaseConnectivity(): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    try {
      // Test basic connectivity
      const { data, error } = await supabase.from('plank_exercises').select('count').limit(1);
      
      if (error) {
        results.push({
          category: 'Database',
          test: 'Basic Connectivity',
          status: 'fail',
          message: 'Failed to connect to database',
          details: error,
        });
      } else {
        results.push({
          category: 'Database',
          test: 'Basic Connectivity',
          status: 'pass',
          message: 'Database connection successful',
        });
      }
    } catch (error) {
      results.push({
        category: 'Database',
        test: 'Basic Connectivity',
        status: 'fail',
        message: 'Database connection error',
        details: error,
      });
    }

    return results;
  }

  private async validateAuthentication(): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    try {
      // Test session retrieval
      const { data: { session }, error } = await supabase.auth.getSession();
      
      results.push({
        category: 'Authentication',
        test: 'Session Retrieval',
        status: error ? 'fail' : 'pass',
        message: error ? 'Failed to retrieve session' : 'Session retrieval working',
        details: error,
      });
    } catch (error) {
      results.push({
        category: 'Authentication',
        test: 'Session Retrieval',
        status: 'fail',
        message: 'Authentication system error',
        details: error,
      });
    }

    return results;
  }

  private async validatePerformance(): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    // Test actual page load time using Navigation Timing API
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const loadTime = navigation ? navigation.loadEventEnd - navigation.fetchStart : 0;
    const threshold = 3000; // 3 seconds

    results.push({
      category: 'Performance',
      test: 'Initial Load Time',
      status: loadTime < threshold ? 'pass' : loadTime < threshold * 1.5 ? 'warning' : 'fail',
      message: `Initial load time: ${loadTime.toFixed(2)}ms`,
      details: { loadTime, threshold },
    });

    // Test memory usage
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const memoryUsage = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
      
      results.push({
        category: 'Performance',
        test: 'Memory Usage',
        status: memoryUsage < 0.7 ? 'pass' : memoryUsage < 0.9 ? 'warning' : 'fail',
        message: `Memory usage: ${(memoryUsage * 100).toFixed(1)}%`,
        details: { memoryUsage, memory },
      });
    }

    return results;
  }

  private async validateSecurity(): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    // Check HTTPS
    const isHTTPS = location.protocol === 'https:';
    results.push({
      category: 'Security',
      test: 'HTTPS Connection',
      status: isHTTPS || location.hostname === 'localhost' ? 'pass' : 'fail',
      message: isHTTPS ? 'Using HTTPS' : 'Not using HTTPS (required for production)',
    });

    // Check Content Security Policy
    const hasCsp = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    results.push({
      category: 'Security',
      test: 'Content Security Policy',
      status: hasCsp ? 'pass' : 'warning',
      message: hasCsp ? 'CSP header found' : 'No CSP header detected',
    });

    return results;
  }

  private async validateAccessibility(): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    // Check for proper heading structure
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const hasH1 = document.querySelector('h1');
    
    results.push({
      category: 'Accessibility',
      test: 'Heading Structure',
      status: hasH1 ? 'pass' : 'warning',
      message: hasH1 ? `Found ${headings.length} headings with proper H1` : 'No H1 heading found',
    });

    // Check for alt text on images
    const images = document.querySelectorAll('img');
    const imagesWithoutAlt = Array.from(images).filter(img => !img.alt);
    
    results.push({
      category: 'Accessibility',
      test: 'Image Alt Text',
      status: imagesWithoutAlt.length === 0 ? 'pass' : 'warning',
      message: `${imagesWithoutAlt.length} images missing alt text out of ${images.length} total`,
    });

    return results;
  }

  generateReport(results: ValidationResult[]): string {
    const passed = results.filter(r => r.status === 'pass').length;
    const warnings = results.filter(r => r.status === 'warning').length;
    const failed = results.filter(r => r.status === 'fail').length;
    
    let report = `Pre-Launch Validation Report\n`;
    report += `==========================\n\n`;
    report += `Total Tests: ${results.length}\n`;
    report += `Passed: ${passed}\n`;
    report += `Warnings: ${warnings}\n`;
    report += `Failed: ${failed}\n\n`;
    
    const categories = Array.from(new Set(results.map(r => r.category)));
    
    categories.forEach(category => {
      report += `${category}:\n`;
      report += `${'='.repeat(category.length)}:\n`;
      
      const categoryResults = results.filter(r => r.category === category);
      categoryResults.forEach(result => {
        const status = result.status.toUpperCase();
        report += `  [${status}] ${result.test}: ${result.message}\n`;
      });
      report += '\n';
    });
    
    return report;
  }
}
