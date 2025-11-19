import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { VapidKeyDebugger } from '@/components/debug/VapidKeyDebugger';
import { VapidKeySecretManager } from '@/components/VapidKeySecretManager';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Key, X, Wrench, Send, RefreshCw, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { validateVapidPublicKey, testVapidKey, type VapidKeyValidationResult } from '@/utils/vapidKeyValidator';
import { NotificationService } from '@/services/notificationService';
import { toast } from '@/components/ui/sonner';
import { logInfo } from '@/utils/productionLogger';

interface VapidKeyManagerProps {
  onClose?: () => void;
}

export const VapidKeyManager: React.FC<VapidKeyManagerProps> = ({ onClose }) => {
  const { user } = useAuth();
  const { isSubscribed, subscribe, unsubscribe } = usePushNotifications();

  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [validation, setValidation] = useState<VapidKeyValidationResult | null>(null);
  const [testResult, setTestResult] = useState<{ success: boolean; error?: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isRepairing, setIsRepairing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [lastTestResult, setLastTestResult] = useState<any>(null);
  const [connectivityTest, setConnectivityTest] = useState<any>(null);
  const [serverValidation, setServerValidation] = useState<any>(null);

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      // Fallback: reload the page to get back to normal state
      window.location.reload();
    }
  };

  const handleFetchAndTest = async () => {
    try {
      setIsTesting(true);
      const { data, error } = await supabase.functions.invoke('get-vapid-public-key');
      if (error) throw error;
      const key = (data as any)?.publicKey as string;
      setPublicKey(key);
      const v = validateVapidPublicKey(key);
      setValidation(v);
      const t = await testVapidKey(key);
      setTestResult(t);
      if (t.success) {
        toast.success('VAPID key valid', { description: `Format ${v.keyFormat}, length ${v.keyLength}` });
      } else {
        toast.error('VAPID key failed', { description: t.error });
      }
    } catch (e: any) {
      setTestResult({ success: false, error: e?.message ?? String(e) });
      toast.error('Error', { description: e?.message ?? String(e) });
    } finally {
      setIsTesting(false);
    }
  };

  const handleRepairSubscription = async () => {
    try {
      setIsRepairing(true);
      if (isSubscribed) {
        await unsubscribe();
      }
      await subscribe();
      toast.success('Subscription repaired', { description: 'Push subscription refreshed.' });
    } catch (e: any) {
      toast.error('Repair failed', { description: e?.message ?? String(e) });
    } finally {
      setIsRepairing(false);
    }
  };

  const handleConnectivityTest = async () => {
    try {
      setConnectivityTest({ status: 'testing', timestamp: new Date().toISOString() });
      
      const results: any = {
        edgeFunction: { status: 'pending' },
        authHealth: { status: 'pending' },
        restCheck: { status: 'pending' }
      };
      
      // 1. Edge Function ping (get-vapid-public-key)
      try {
        const vapidResponse = await supabase.functions.invoke('get-vapid-public-key');
        if (vapidResponse.error) {
          results.edgeFunction = { 
            status: 'failed', 
            error: `Edge function error: ${vapidResponse.error.message}` 
          };
        } else {
          results.edgeFunction = { 
            status: 'success', 
            message: 'Edge function reachable' 
          };
        }
      } catch (e: any) {
        results.edgeFunction = { 
          status: 'failed', 
          error: `Network error: ${e?.message ?? String(e)}` 
        };
      }
      
      // 2. Auth (SDK) connectivity check
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          results.authHealth = {
            status: 'failed',
            error: `Auth SDK error: ${error.message}`
          };
        } else {
          const email = data.session?.user?.email;
          results.authHealth = {
            status: 'success',
            message: email ? `SDK reachable (session for ${email})` : 'SDK reachable (no active session)'
          };
        }
      } catch (e: any) {
        results.authHealth = {
          status: 'failed',
          error: `Auth SDK network error: ${e?.message ?? String(e)}`
        };
      }
      
      // 3. REST check with direct fetch
      try {
        const restUrl = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/user_preferences?select=id&limit=1`;
        const restResponse = await fetch(restUrl, {
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`
          }
        });
        
        if (restResponse.ok) {
          results.restCheck = { 
            status: 'success', 
            message: `REST API reachable (${restResponse.status})` 
          };
        } else if (restResponse.status === 401 || restResponse.status === 403) {
          results.restCheck = { 
            status: 'success', 
            message: `REST API reachable (${restResponse.status} - RLS/permissions blocked, not connectivity)` 
          };
        } else {
          results.restCheck = { 
            status: 'failed', 
            error: `REST API error: ${restResponse.status} ${restResponse.statusText}` 
          };
        }
      } catch (e: any) {
        results.restCheck = { 
          status: 'failed', 
          error: `REST network error: ${e?.message ?? String(e)}` 
        };
      }
      
      // Generate diagnostics for console
      const diagnostics = {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        protocol: window.location.protocol,
        host: window.location.host,
        results
      };
      
      logInfo('VAPID Connectivity Diagnostics', diagnostics);
      
      // Determine overall status
      const allPassed = Object.values(results).every((r: any) => r.status === 'success');
      const anyNetworkError = Object.values(results).some((r: any) => 
        r.error && (r.error.includes('Network error') || r.error.includes('TypeError') || r.error.includes('Failed to fetch'))
      );
      
      setConnectivityTest({ 
        status: allPassed ? 'success' : (anyNetworkError ? 'network-error' : 'partial'),
        results,
        diagnostics,
        timestamp: new Date().toISOString()
      });
      
      if (allPassed) {
        toast.success('Connectivity OK', { description: 'All three checks passed.' });
      } else if (anyNetworkError) {
        toast.error('Network connectivity issue', { 
          description: 'Browser cannot reach Supabase. Check console for details.' 
        });
      } else {
        toast.warning('Partial connectivity', { 
          description: 'Some endpoints reachable. Check details below.' 
        });
      }
    } catch (e: any) {
      const diagnostics = {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        protocol: window.location.protocol,
        host: window.location.host,
        globalError: e?.message ?? String(e)
      };
      
      logInfo('VAPID Connectivity Diagnostics (Global Error)', diagnostics);
      
      setConnectivityTest({ 
        status: 'failed', 
        error: `Global network error: ${e?.message ?? String(e)}`,
        diagnostics,
        timestamp: new Date().toISOString()
      });
      toast.error('Connectivity failed', { description: e?.message ?? String(e) });
    }
  };

  const copyDiagnostics = () => {
    if (connectivityTest?.diagnostics) {
      navigator.clipboard.writeText(JSON.stringify(connectivityTest.diagnostics, null, 2));
      toast.success('Diagnostics copied', { description: 'Paste in chat for troubleshooting.' });
    }
  };

  const handleSendTest = async () => {
    if (!user?.id) {
      toast.error('Sign in required', { description: 'Sign in to receive a test push.' });
      return;
    }
    try {
      setIsSending(true);
      const result = await NotificationService.sendToUser(user.id, 'test', {
        title: 'Test Push',
        body: 'This is a test push notification.',
      });
      setLastTestResult({ ...result, timestamp: new Date().toISOString() });
      
      if (result?.message === 'No active subscriptions found for target users') {
        toast.error('No active subscriptions', { 
          description: 'Use "Repair Subscription" button below, then retry.' 
        });
      } else {
        const sent = result?.sent || result?.successCount || 0;
        const total = result?.total || result?.totalAttempts || 0;
        if (sent === 0 && total > 0) {
          toast.error('Test failed', { 
            description: `Failed to deliver to ${total} subscription(s). Check error details below.` 
          });
        } else {
          toast.success('Test sent', { 
            description: `Delivered to ${sent} of ${total} subscriptions.` 
          });
        }
      }
    } catch (e: any) {
      const errorMsg = e?.message ?? String(e);
      const errorResult = { error: errorMsg, timestamp: new Date().toISOString() };
      setLastTestResult(errorResult);
      
      // Enhanced error diagnostics
      if (errorMsg.includes('Failed to send a request to the Edge Function')) {
        toast.error('Connection failed', { 
          description: 'Cannot reach notification service. Check connectivity above.' 
        });
      } else if (errorMsg.includes('NetworkError') || errorMsg.includes('fetch')) {
        toast.error('Network error', { 
          description: 'Connection issue. Try disabling browser extensions.' 
        });
      } else {
        toast.error('Send failed', { description: errorMsg });
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleValidateServerKeys = async () => {
    try {
      setServerValidation({ status: 'testing', timestamp: new Date().toISOString() });
      
      const { data, error } = await supabase.functions.invoke('validate-vapid-keys');
      
      if (error) {
        setServerValidation({ 
          status: 'failed', 
          error: `Validation failed: ${error.message}`,
          timestamp: new Date().toISOString()
        });
        toast.error('Validation failed', { description: error.message });
        return;
      }
      
      setServerValidation({ 
        status: 'completed', 
        data,
        timestamp: new Date().toISOString()
      });
      
      if (data.isValid) {
        toast.success('Server keys valid', { description: 'VAPID keys are correctly configured.' });
      } else {
        toast.error('Server keys invalid', { 
          description: data.recommendations?.slice(0, 2).join('; ') || 'Keys need fixing.' 
        });
      }
    } catch (e: any) {
      setServerValidation({ 
        status: 'failed', 
        error: `Network error: ${e?.message ?? String(e)}`,
        timestamp: new Date().toISOString()
      });
      toast.error('Validation error', { description: e?.message ?? String(e) });
    }
  };
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                VAPID Key Management
              </CardTitle>
              <CardDescription>
                Manage and validate VAPID keys for push notifications
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <ScrollArea className="flex-1">
          <CardContent className="space-y-4">
            <Alert className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Current Issue:</strong> Push notification subscriptions are failing. 
                This is likely due to invalid or incorrectly formatted VAPID keys in Supabase secrets.
              </AlertDescription>
            </Alert>

            <div className="flex flex-wrap gap-2">
              <Button onClick={handleFetchAndTest} disabled={isTesting}>
                <RefreshCw className="h-4 w-4 mr-2" />
                {isTesting ? 'Testing…' : 'Fetch & Test VAPID Key'}
              </Button>
              <Button onClick={handleConnectivityTest} disabled={connectivityTest?.status === 'testing'} variant="outline">
                <AlertTriangle className="h-4 w-4 mr-2" />
                {connectivityTest?.status === 'testing' ? 'Testing…' : 'Test Connectivity'}
              </Button>
              <Button onClick={handleRepairSubscription} disabled={isRepairing} variant="secondary">
                <Wrench className="h-4 w-4 mr-2" />
                {isRepairing ? 'Repairing…' : 'Repair Subscription'}
              </Button>
              <Button 
                onClick={handleSendTest} 
                variant="outline" 
                disabled={isSending || !user?.id}
              >
                <Send className="h-4 w-4 mr-2" />
                {isSending ? 'Sending…' : 'Send Test Notification'}
              </Button>
              <Button 
                onClick={handleValidateServerKeys} 
                variant="outline" 
                disabled={serverValidation?.status === 'testing'}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                {serverValidation?.status === 'testing' ? 'Validating…' : 'Validate Server Keys'}
              </Button>
            </div>

            {!user?.id && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Sign in required:</strong> You must be signed in to send test notifications.
                </AlertDescription>
              </Alert>
            )}

            {connectivityTest && (
              <div className="rounded-md border p-3 text-sm">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium">Connectivity Test:</p>
                  {connectivityTest.diagnostics && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={copyDiagnostics}
                      className="h-6 text-xs"
                    >
                      Copy Diagnostics
                    </Button>
                  )}
                </div>
                
                {connectivityTest.status === 'testing' ? (
                  <p className="text-blue-600">Testing three connectivity endpoints...</p>
                ) : connectivityTest.status === 'failed' ? (
                  <div className="space-y-2">
                    <p className="text-destructive">❌ {connectivityTest.error}</p>
                    <p className="text-muted-foreground text-xs">
                      Try: Disable browser extensions, hard refresh (Ctrl+Shift+R), check network.
                    </p>
                  </div>
                ) : connectivityTest.results ? (
                  <div className="space-y-2">
                    <div className="grid gap-1 text-xs">
                      <p className={connectivityTest.results.edgeFunction?.status === 'success' ? 'text-green-600' : 'text-destructive'}>
                        {connectivityTest.results.edgeFunction?.status === 'success' ? '✅' : '❌'} Edge Function: {connectivityTest.results.edgeFunction?.message || connectivityTest.results.edgeFunction?.error}
                      </p>
                      <p className={connectivityTest.results.authHealth?.status === 'success' ? 'text-green-600' : 'text-destructive'}>
                        {connectivityTest.results.authHealth?.status === 'success' ? '✅' : '❌'} Auth (SDK): {connectivityTest.results.authHealth?.message || connectivityTest.results.authHealth?.error}
                      </p>
                      <p className={connectivityTest.results.restCheck?.status === 'success' ? 'text-green-600' : 'text-destructive'}>
                        {connectivityTest.results.restCheck?.status === 'success' ? '✅' : '❌'} REST API: {connectivityTest.results.restCheck?.message || connectivityTest.results.restCheck?.error}
                      </p>
                    </div>
                    
                    {connectivityTest.status === 'network-error' && (
                      <p className="text-xs text-muted-foreground bg-orange-50 dark:bg-orange-950/20 p-2 rounded">
                        🔧 Network connectivity issue detected. Try: disable browser extensions, check firewall/proxy, try incognito mode, or open in new tab.
                      </p>
                    )}
                    
                    {connectivityTest.status === 'partial' && (
                      <p className="text-xs text-muted-foreground bg-yellow-50 dark:bg-yellow-950/20 p-2 rounded">
                        ⚠️ Partial connectivity. Some endpoints reachable but others failed.
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-green-600">✅ All connectivity tests passed</p>
                )}
                
                <p className="text-xs text-muted-foreground mt-2">
                  {new Date(connectivityTest.timestamp).toLocaleTimeString()}
                </p>
              </div>
            )}

            {lastTestResult && (
              <div className="rounded-md border p-3 text-sm">
                <p className="font-medium mb-2">Last Test Result:</p>
                {lastTestResult.error ? (
                  <p className="text-destructive">Error: {lastTestResult.error}</p>
                ) : lastTestResult.message === 'No active subscriptions found for target users' ? (
                  <div className="space-y-2">
                    <p className="text-orange-600">No active push subscriptions found</p>
                    <p className="text-muted-foreground text-xs">
                      Use the "Repair Subscription" button above to refresh your push subscription, then retry.
                    </p>
                  </div>
                 ) : (
                   <div className="space-y-1">
                     <p>Sent: {lastTestResult.sent || lastTestResult.successCount || 0} / {lastTestResult.total || lastTestResult.totalAttempts || (lastTestResult.results?.length) || 0}</p>
                     {lastTestResult.results && lastTestResult.results.length > 0 && (
                       <div className="text-xs space-y-1">
                         {lastTestResult.results.slice(0, 3).map((result: any, i: number) => (
                           <p key={i} className={result.success ? 'text-green-600' : 'text-red-600'}>
                             {result.success ? '✓' : '✗'} User {result.user_id?.slice(0, 8)}...
                             {result.error && ` - ${result.error}`}
                           </p>
                         ))}
                         {lastTestResult.results.length > 3 && (
                           <p className="text-muted-foreground">...and {lastTestResult.results.length - 3} more</p>
                         )}
                       </div>
                     )}
                     {lastTestResult.results?.[0]?.error && (
                       <p className="text-xs text-destructive mt-1">
                         First error: {lastTestResult.results[0].error}
                       </p>
                     )}
                   </div>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  {new Date(lastTestResult.timestamp || Date.now()).toLocaleTimeString()}
                </p>
              </div>
            )}

            {(publicKey || validation || testResult) && (
              <div className="rounded-md border p-3 text-sm">
                {publicKey && (
                  <p><strong>Public key:</strong> <code className="break-all">{publicKey}</code></p>
                )}
                {validation && (
                  <ul className="mt-2 list-disc pl-5 space-y-1">
                    <li>Format: {validation.keyFormat}</li>
                    <li>Length: {validation.keyLength}</li>
                    {validation.errors.length > 0 && (
                      <li>Errors: {validation.errors.join('; ')}</li>
                    )}
                  </ul>
                )}
                {testResult && (
                  <p className="mt-2">
                    Test: {testResult.success ? 'Successful' : `Failed - ${testResult.error}`}
                  </p>
                )}
              </div>
            )}

            {serverValidation && (
              <div className="rounded-md border p-3 text-sm">
                <p className="font-medium mb-2">Server VAPID Key Validation:</p>
                {serverValidation.status === 'testing' ? (
                  <p className="text-blue-600">Validating server keys...</p>
                ) : serverValidation.status === 'failed' ? (
                  <p className="text-destructive">❌ {serverValidation.error}</p>
                ) : serverValidation.data ? (
                  <div className="space-y-2">
                    <p className={serverValidation.data.isValid ? 'text-green-600' : 'text-destructive'}>
                      {serverValidation.data.isValid ? '✅ Keys are valid' : '❌ Keys are invalid'}
                    </p>
                    {serverValidation.data.recommendations?.length > 0 && (
                      <div className="text-xs space-y-1">
                        {serverValidation.data.recommendations.map((rec: string, i: number) => (
                          <p key={i} className="text-muted-foreground">• {rec}</p>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No validation data</p>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  {new Date(serverValidation.timestamp).toLocaleTimeString()}
                </p>
              </div>
            )}
            
            <VapidKeySecretManager onKeysUpdated={() => {
              // Clear previous results when keys are updated
              setServerValidation(null);
              setLastTestResult(null);
              setTestResult(null);
              setValidation(null);
              setPublicKey(null);
            }} />
            
            <VapidKeyDebugger />
          </CardContent>
        </ScrollArea>
      </Card>
    </div>
  );
};