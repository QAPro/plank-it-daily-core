import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Bell, BellOff, Smartphone, AlertCircle } from "lucide-react";
import { usePushNotifications } from "@/hooks/usePushNotifications";

export const PushNotificationManager = () => {
  const {
    isSupported,
    isSubscribed,
    isLoading,
    subscribe,
    unsubscribe,
    resubscribe
  } = usePushNotifications();

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