import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { VapidKeyDebugger } from '@/components/debug/VapidKeyDebugger';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Key, X, Wrench, Send, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { validateVapidPublicKey, testVapidKey, type VapidKeyValidationResult } from '@/utils/vapidKeyValidator';
import { NotificationService } from '@/services/notificationService';
import { toast } from '@/components/ui/sonner';

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
      setLastTestResult(result);
      
      if (result?.message === 'No active subscriptions found for target users') {
        toast.error('No active subscriptions', { 
          description: 'Use "Repair Subscription" button below, then retry.' 
        });
      } else {
        toast.success('Test sent', { 
          description: `Delivered to ${result?.successCount || 0} of ${result?.totalAttempts || 0} subscriptions.` 
        });
      }
    } catch (e: any) {
      const errorResult = { error: e?.message ?? String(e), timestamp: new Date().toISOString() };
      setLastTestResult(errorResult);
      toast.error('Send failed', { description: e?.message ?? String(e) });
    } finally {
      setIsSending(false);
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
            </div>

            {!user?.id && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Sign in required:</strong> You must be signed in to send test notifications.
                </AlertDescription>
              </Alert>
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
                    <p>Sent: {lastTestResult.successCount || 0} / {lastTestResult.totalAttempts || 0}</p>
                    {lastTestResult.results && lastTestResult.results.length > 0 && (
                      <div className="text-xs space-y-1">
                        {lastTestResult.results.slice(0, 3).map((result: any, i: number) => (
                          <p key={i} className={result.success ? 'text-green-600' : 'text-red-600'}>
                            {result.success ? '✓' : '✗'} {result.subscription_id?.slice(0, 8)}...
                            {result.error && ` - ${result.error}`}
                          </p>
                        ))}
                      </div>
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
            
            <VapidKeyDebugger />
          </CardContent>
        </ScrollArea>
      </Card>
    </div>
  );
};