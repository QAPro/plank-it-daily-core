import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { VapidKeyDebugger } from '@/components/debug/VapidKeyDebugger';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Key, X } from 'lucide-react';

interface VapidKeyManagerProps {
  onClose?: () => void;
}

export const VapidKeyManager: React.FC<VapidKeyManagerProps> = ({ onClose }) => {
  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      // Fallback: reload the page to get back to normal state
      window.location.reload();
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
            
            <VapidKeyDebugger />
          </CardContent>
        </ScrollArea>
      </Card>
    </div>
  );
};