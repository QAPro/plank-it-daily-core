import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { VapidKeyDebugger } from '@/components/debug/VapidKeyDebugger';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Key } from 'lucide-react';

export const VapidKeyManager: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            VAPID Key Management
          </CardTitle>
          <CardDescription>
            Manage and validate VAPID keys for push notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Current Issue:</strong> Push notification subscriptions are failing. 
              This is likely due to invalid or incorrectly formatted VAPID keys in Supabase secrets.
            </AlertDescription>
          </Alert>
          
          <VapidKeyDebugger />
        </CardContent>
      </Card>
    </div>
  );
};