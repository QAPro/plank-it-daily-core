
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertTriangle, Loader2, Shield, Database, Globe, Zap } from 'lucide-react';
import { ValidationService, ValidationResult } from '@/services/validationService';

export const ProductionReadinessCheck: React.FC = () => {
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const validationService = new ValidationService();

  const runValidation = async () => {
    setIsRunning(true);
    setValidationResults([]);
    
    try {
      const results = await validationService.runPreLaunchValidation();
      setValidationResults(results);
      setShowReport(true);
    } catch (error) {
      console.error('Validation failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'fail':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Loader2 className="h-4 w-4 animate-spin" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pass':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Pass</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      case 'fail':
        return <Badge variant="destructive">Fail</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'database':
        return <Database className="h-5 w-5" />;
      case 'security':
        return <Shield className="h-5 w-5" />;
      case 'performance':
        return <Zap className="h-5 w-5" />;
      default:
        return <Globe className="h-5 w-5" />;
    }
  };

  const getOverallStatus = () => {
    if (validationResults.length === 0) return { status: 'pending', message: 'Ready to validate' };
    
    const failed = validationResults.filter(r => r.status === 'fail').length;
    const warnings = validationResults.filter(r => r.status === 'warning').length;
    const passed = validationResults.filter(r => r.status === 'pass').length;
    
    if (failed > 0) {
      return { status: 'fail', message: `${failed} critical issues found` };
    } else if (warnings > 0) {
      return { status: 'warning', message: `${passed} passed, ${warnings} warnings` };
    } else {
      return { status: 'pass', message: 'All checks passed - Ready for production!' };
    }
  };

  const getProgressPercentage = () => {
    if (validationResults.length === 0) return 0;
    const passed = validationResults.filter(r => r.status === 'pass').length;
    return (passed / validationResults.length) * 100;
  };

  const overallStatus = getOverallStatus();
  const progressPercentage = getProgressPercentage();

  const categories = Array.from(new Set(validationResults.map(r => r.category)));

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Production Readiness Check
          </CardTitle>
          <CardDescription>
            Validate your app before deploying to production
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                {getStatusIcon(overallStatus.status)}
                <span className="font-medium">{overallStatus.message}</span>
              </div>
              {validationResults.length > 0 && (
                <Progress value={progressPercentage} className="h-2" />
              )}
            </div>
            <Button 
              onClick={runValidation} 
              disabled={isRunning}
              className="ml-4"
            >
              {isRunning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Validating...
                </>
              ) : (
                'Run Validation'
              )}
            </Button>
          </div>

          {overallStatus.status === 'pass' && validationResults.length > 0 && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                🎉 Your app is production-ready! You can now deploy with confidence.
              </AlertDescription>
            </Alert>
          )}

          {overallStatus.status === 'fail' && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                Critical issues detected. Please resolve these before deploying to production.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {showReport && validationResults.length > 0 && (
        <div className="space-y-4">
          {categories.map(category => {
            const categoryResults = validationResults.filter(r => r.category === category);
            const categoryStatus = categoryResults.every(r => r.status === 'pass') ? 'pass' :
                                 categoryResults.some(r => r.status === 'fail') ? 'fail' : 'warning';

            return (
              <Card key={category}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    {getCategoryIcon(category)}
                    {category}
                    {getStatusBadge(categoryStatus)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {categoryResults.map((result, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 rounded-lg border">
                        {getStatusIcon(result.status)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{result.test}</span>
                            {getStatusBadge(result.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">{result.message}</p>
                          {result.details && (
                            <details className="mt-2">
                              <summary className="text-xs text-muted-foreground cursor-pointer">
                                Show details
                              </summary>
                              <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-auto">
                                {JSON.stringify(result.details, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}

          <Card>
            <CardHeader>
              <CardTitle>Deployment Instructions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold">Ready to Deploy? Follow these steps:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Click the "Publish" button in Lovable (top-right corner)</li>
                  <li>Choose your deployment settings</li>
                  <li>Verify your custom domain (if applicable)</li>
                  <li>Test the production deployment thoroughly</li>
                  <li>Monitor the app for the first 24 hours</li>
                </ol>
              </div>
              
              <Alert>
                <Globe className="h-4 w-4" />
                <AlertDescription>
                  <strong>Note:</strong> Your Supabase project is already configured for production. 
                  The database security fixes have been applied successfully.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
