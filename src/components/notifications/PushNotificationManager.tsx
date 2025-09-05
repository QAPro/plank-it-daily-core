import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Bell, BellOff, Smartphone, AlertCircle, ExternalLink, Info } from "lucide-react";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { isInIframe, openInNewTab } from "@/utils/iframe";

export const PushNotificationManager = () => {
  const {
    isSupported,
    isSubscribed,
    isLoading,
    subscribe,
    unsubscribe,
    resubscribe
  } = usePushNotifications();

  const inIframe = isInIframe();

  const handleToggle = async () => {
    if (isSubscribed) {
      await unsubscribe();
    } else {
      await subscribe();
    }
  };

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5" />
            Push Notifications
          </CardTitle>
          <CardDescription>
            Your browser doesn't support push notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">
              Please use a modern browser like Chrome, Firefox, or Safari to receive notifications
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Push Notifications
          {isSubscribed && (
            <Badge variant="secondary" className="ml-auto">
              Enabled
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Get notified about workout reminders, achievements, and streaks
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {inIframe && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Push notifications are blocked in preview mode. 
              <Button 
                variant="link" 
                size="sm" 
                onClick={openInNewTab}
                className="h-auto p-0 ml-1"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Open in new tab
              </Button>
              for full functionality.
            </AlertDescription>
          </Alert>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Smartphone className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">Browser Notifications</p>
              <p className="text-sm text-muted-foreground">
                {isSubscribed 
                  ? "You're receiving push notifications" 
                  : "Enable to get workout reminders and achievement alerts"
                }
              </p>
            </div>
          </div>
          <Switch
            checked={isSubscribed}
            onCheckedChange={handleToggle}
            disabled={isLoading}
          />
        </div>

        {!isSubscribed && (
          <Button 
            onClick={subscribe} 
            disabled={isLoading}
            className="w-full"
            variant="outline"
          >
            {isLoading ? "Enabling..." : "Enable Push Notifications"}
          </Button>
        )}

        {isSubscribed && (
          <Button 
            onClick={resubscribe}
            disabled={isLoading}
            className="w-full"
            variant="outline"
            size="sm"
          >
            {isLoading ? "Refreshing..." : "Refresh Subscription"}
          </Button>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Get reminders for your daily workouts</p>
          <p>• Celebrate achievements instantly</p>
          <p>• Don't break your streak alerts</p>
          <p>• Weekly progress updates</p>
        </div>
      </CardContent>
    </Card>
  );
};