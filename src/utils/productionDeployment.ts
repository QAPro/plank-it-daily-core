import { PreLaunchValidationService } from '@/services/prelaunchValidation';

export const runProductionReadinessCheck = async () => {
  console.log('🚀 Starting Production Readiness Check...');
  
  const validationService = new PreLaunchValidationService();
  
  try {
    const results = await validationService.runProductionReadinessCheck();
    
    const passed = results.filter(r => r.status === 'pass').length;
    const warnings = results.filter(r => r.status === 'warning').length;
    const failed = results.filter(r => r.status === 'fail').length;
    
    console.log(`📊 Production Readiness Results:`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`⚠️ Warnings: ${warnings}`);
    console.log(`❌ Failed: ${failed}`);
    
    // Log detailed results
    results.forEach(result => {
      const icon = result.status === 'pass' ? '✅' : result.status === 'warning' ? '⚠️' : '❌';
      console.log(`${icon} [${result.category}] ${result.test}: ${result.message}`);
    });
    
    // Determine deployment readiness
    if (failed === 0) {
      console.log('🎉 PRODUCTION READY! You can deploy now.');
      return { ready: true, results, summary: { passed, warnings, failed } };
    } else {
      console.log('🔧 Critical issues found. Please resolve before deploying.');
      return { ready: false, results, summary: { passed, warnings, failed } };
    }
    
  } catch (error) {
    console.error('❌ Production readiness check failed:', error);
    return { ready: false, error, results: [] };
  }
};

export const getDeploymentInstructions = () => {
  return {
    steps: [
      '1. Click "Publish" in the top-right corner of Lovable',
      '2. Configure your deployment settings',
      '3. Set up custom domain (optional)',
      '4. Test production deployment',
      '5. Monitor for 24 hours post-deployment'
    ],
    notes: [
      'Database is configured for production',
      'Security policies are active',
      'Feature flags are properly set',
      'Authentication system is ready'
    ]
  };
};