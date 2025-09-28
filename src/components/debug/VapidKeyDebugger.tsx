import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { validateVapidPublicKey, testVapidKey, getVapidKeyGenerationInstructions } from '@/utils/vapidKeyValidator';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { logInfo, logError } from '@/utils/productionLogger';

export const VapidKeyDebugger: React.FC = () => {
  const [vapidKey, setVapidKey] = useState<string>('');
  const [validation, setValidation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [serverError, setServerError] = useState<string>('');

  const handleFetchKey = async () => {
    setIsLoading(true);
    setServerError('');
    setValidation(null);
    setTestResult(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('get-vapid-public-key');
      
      if (error) {
        logError('[VAPID Debug] Fetch error:', { error });
        const errorMsg = `Function error: ${error.message}`;
        setServerError(errorMsg);
        setValidation({ isValid: false, errors: [errorMsg] });
        return;
      }

      if (data?.error) {
        logError('[VAPID Debug] Server error:', { error: data.error });
        setServerError(data.error);
        setValidation({ isValid: false, errors: [data.error] });
        return;
      }

      if (!data?.publicKey) {
        logError('[VAPID Debug] No public key in response:', { data });
        const errorMsg = 'No public key in server response';
        setServerError(errorMsg);
        setValidation({ isValid: false, errors: [errorMsg] });
        return;
      }

      const key = data.publicKey;
      setVapidKey(key);
      
      // Validate the key
      const validationResult = validateVapidPublicKey(key);
      setValidation(validationResult);
      
      // Test the key
      const testResult = await testVapidKey(key);
      setTestResult(testResult);
      
      logInfo('[VAPID Debug] Key fetched and tested:', {
        keyLength: key.length,
        validation: validationResult,
        testResult
      });
      
    } catch (error) {
      logError('[VAPID Debug] Exception:', { error });
      setValidation({ 
        isValid: false, 
        errors: [`Exception: ${error instanceof Error ? error.message : 'Unknown error'}`] 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestKey = async () => {
    if (!vapidKey) return;
    
    setIsLoading(true);
    try {
      const result = await testVapidKey(vapidKey);
      setTestResult(result);
    } catch (error) {
      setTestResult({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Test failed' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          VAPID Key Debugger
        </CardTitle>
        <CardDescription>
          Debug and validate VAPID keys for push notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {serverError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Server Error:</strong> {serverError}
              {serverError.includes('VAPID public key not configured') && (
                <div className="mt-2 text-sm">
                  <strong>Fix:</strong> Go to Supabase → Project → Edge Functions → Secrets and re-save the VAPID_PUBLIC_KEY secret. 
                  Make sure to paste the key without quotes or extra spaces.
                </div>
              )}
              {serverError.includes('Function error') && (
                <div className="mt-2 text-sm">
                  This usually means the edge function couldn't access the VAPID_PUBLIC_KEY secret.
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          <Button 
            onClick={handleFetchKey} 
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            Fetch & Test VAPID Key
          </Button>
          
          {vapidKey && (
            <Button 
              variant="outline" 
              onClick={handleTestKey} 
              disabled={isLoading}
            >
              Test Key Again
            </Button>
          )}
        </div>

        {vapidKey && (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Current VAPID Public Key:</label>
              <div className="mt-1 p-2 bg-muted rounded text-xs font-mono break-all">
                {vapidKey}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Length: {vapidKey.length} characters
              </div>
            </div>

            {validation && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {validation.isValid ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="font-medium">
                    Validation: 
                    <Badge variant={validation.isValid ? "default" : "destructive"} className="ml-2">
                      {validation.isValid ? 'VALID' : 'INVALID'}
                    </Badge>
                  </span>
                </div>

                {validation.keyFormat && (
                  <div className="text-sm">
                    Format: <Badge variant="outline">{validation.keyFormat}</Badge>
                  </div>
                )}

                {validation.errors && validation.errors.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-red-600">Errors:</div>
                    {validation.errors.map((error: string, index: number) => (
                      <div key={index} className="text-xs text-red-600 ml-4">
                        • {error}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {testResult && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {testResult.success ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="font-medium">
                    Browser Test: 
                    <Badge variant={testResult.success ? "default" : "destructive"} className="ml-2">
                      {testResult.success ? 'PASSED' : 'FAILED'}
                    </Badge>
                  </span>
                </div>

                {testResult.error && (
                  <div className="text-xs text-red-600">
                    Error: {testResult.error}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {validation && !validation.isValid && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="whitespace-pre-line text-xs">
              {getVapidKeyGenerationInstructions()}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};