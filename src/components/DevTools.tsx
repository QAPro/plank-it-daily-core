
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ValidationService, ValidationResult } from '@/services/validationService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle, XCircle, AlertTriangle, Play, Bug, Bell } from 'lucide-react';
import { DevToolsNotifications } from '@/components/DevToolsNotifications';
import { PushNotificationDebugger } from '@/components/debug/PushNotificationDebugger';

const DevTools = () => {
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showDebugger, setShowDebugger] = useState(false);

  const runValidation = async () => {
    setIsRunning(true);
    try {
      const validationService = new ValidationService();
      const results = await validationService.runPreLaunchValidation();
      setValidationResults(results);
    } catch (error) {
      console.error('Validation failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: ValidationResult['status']) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'fail':
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusBadgeVariant = (status: ValidationResult['status']) => {
    switch (status) {
      case 'pass':
        return 'default' as const;
      case 'warning':
        return 'secondary' as const;
      case 'fail':
        return 'destructive' as const;
      default:
        return 'outline' as const;
    }
  };

  const groupedResults = validationResults.reduce((acc: Record<string, ValidationResult[]>, result) => {
    if (!acc[result.category]) {
      acc[result.category] = [];
    }
    acc[result.category].push(result);
    return acc;
  }, {});

  const summary = {
    total: validationResults.length,
    passed: validationResults.filter(r => r.status === 'pass').length,
    warnings: validationResults.filter(r => r.status === 'warning').length,
    failed: validationResults.filter(r => r.status === 'fail').length,
  };

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50">
        <Card className="w-96 max-h-96">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bug className="h-4 w-4" />
                <CardTitle className="text-sm">Dev Tools</CardTitle>
              </div>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  onClick={() => setShowNotifications(true)}
                  variant="outline"
                  className="h-6 px-2 text-xs"
                >
                  <Bell className="h-3 w-3 mr-1" />
                  Notifications
                </Button>
                <Button
                  size="sm"
                  onClick={() => setShowDebugger(true)}
                  variant="outline"
                  className="h-6 px-2 text-xs"
                >
                  Debug
                </Button>
                <Button
                  size="sm"
                  onClick={runValidation}
                  disabled={isRunning}
                  className="h-6 px-2 text-xs"
                >
                  <Play className="h-3 w-3 mr-1" />
                  {isRunning ? 'Running...' : 'Validate'}
                </Button>
              </div>
            </div>
          {summary.total > 0 && (
            <CardDescription className="text-xs">
              {summary.passed} passed, {summary.warnings} warnings, {summary.failed} failed
            </CardDescription>
          )}
        </CardHeader>
        
        {validationResults.length > 0 && (
          <CardContent className="pt-0">
            <ScrollArea className="h-64">
              <Tabs defaultValue={Object.keys(groupedResults)[0]} className="w-full">
                <TabsList className="grid w-full grid-cols-4 text-xs h-6">
                  {Object.keys(groupedResults).map(category => (
                    <TabsTrigger 
                      key={category} 
                      value={category}
                      className="text-xs px-1"
                    >
                      {category}
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {Object.entries(groupedResults).map(([category, results]) => (
                  <TabsContent key={category} value={category} className="mt-2">
                    <div className="space-y-2">
                      {results.map((result, index) => (
                        <div 
                          key={index}
                          className="flex items-start gap-2 p-2 rounded-sm bg-muted/30"
                        >
                          {getStatusIcon(result.status)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-medium truncate">
                                {result.test}
                              </span>
                              <Badge 
                                variant={getStatusBadgeVariant(result.status)}
                                className="text-xs px-1 py-0"
                              >
                                {result.status}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {result.message}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </ScrollArea>
          </CardContent>
        )}
      </Card>
    </div>
    
    {showNotifications && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
        <div className="max-w-2xl w-full mx-4">
          <DevToolsNotifications onClose={() => setShowNotifications(false)} />
        </div>
      </div>
    )}
    
    {showDebugger && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
        <div className="max-w-4xl w-full mx-4 max-h-[90vh] overflow-auto">
          <div className="bg-background rounded-lg">
            <div className="flex justify-end p-2">
              <Button
                onClick={() => setShowDebugger(false)}
                size="sm"
                variant="ghost"
              >
                ✕
              </Button>
            </div>
            <div className="p-4 pt-0">
              <PushNotificationDebugger />
            </div>
          </div>
        </div>
      </div>
    )}
  </>);
};

export default DevTools;
