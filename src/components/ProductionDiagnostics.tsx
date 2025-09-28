import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface DiagnosticInfo {
  timestamp: string;
  userAgent: string;
  url: string;
  authState: string;
  supabaseConnection: string;
  serviceWorkerState: string;
  errors: string[];
}

export const ProductionDiagnostics = () => {
  const [diagnostics, setDiagnostics] = useState<DiagnosticInfo | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const { user, loading, error } = useAuth();

  useEffect(() => {
    // Show diagnostics if there's an auth error or if user is stuck loading
    if (error || (loading && window.performance.now() > 10000)) {
      setIsVisible(true);
    }
  }, [error, loading]);

  const runDiagnostics = async () => {
    const errors: string[] = [];
    
    try {
      // Test Supabase connection with a simple query
      const { error: supabaseError } = await supabase.auth.getSession();
      const supabaseConnection = supabaseError ? `Error: ${supabaseError.message}` : 'Connected';
      
      // Check service worker
      let serviceWorkerState = 'Not supported';
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        serviceWorkerState = registration ? `Active: ${registration.active?.state}` : 'Not registered';
      }
      
      // Collect errors
      if (error) errors.push(`Auth Error: ${error}`);
      if (loading && window.performance.now() > 15000) errors.push('Auth stuck in loading state');
      
      setDiagnostics({
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        authState: user ? `Authenticated (${user.email})` : loading ? 'Loading' : 'Not authenticated',
        supabaseConnection,
        serviceWorkerState,
        errors
      });
    } catch (err) {
      errors.push(`Diagnostics error: ${err instanceof Error ? err.message : 'Unknown'}`);
      setDiagnostics({
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        authState: 'Error running diagnostics',
        supabaseConnection: 'Error',
        serviceWorkerState: 'Error',
        errors
      });
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full max-h-[80vh] overflow-auto">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            Production Diagnostics
            <Button variant="outline" size="sm" onClick={() => setIsVisible(false)}>
              Close
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={runDiagnostics} className="w-full">
            Run Diagnostics
          </Button>
          
          {diagnostics && (
            <div className="space-y-3 text-sm">
              <div><strong>Timestamp:</strong> {diagnostics.timestamp}</div>
              <div><strong>URL:</strong> {diagnostics.url}</div>
              <div><strong>Auth State:</strong> {diagnostics.authState}</div>
              <div><strong>Supabase:</strong> {diagnostics.supabaseConnection}</div>
              <div><strong>Service Worker:</strong> {diagnostics.serviceWorkerState}</div>
              
              {diagnostics.errors.length > 0 && (
                <div>
                  <strong>Errors:</strong>
                  <ul className="list-disc list-inside mt-1 text-red-600">
                    {diagnostics.errors.map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  navigator.clipboard?.writeText(JSON.stringify(diagnostics, null, 2));
                }}
              >
                Copy to Clipboard
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};