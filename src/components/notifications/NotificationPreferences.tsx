import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Clock, Target, Trophy, Users, Zap } from "lucide-react";
import { useUserPreferences } from "@/hooks/useUserPreferences";

export const NotificationPreferences = () => {
  const { preferences, updatePreferences, loading } = useUserPreferences();

  if (loading || !preferences) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>Loading preferences...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const notificationTypes = preferences.notification_types || {};

  const handleNotificationTypeChange = (type: string, enabled: boolean) => {
    updatePreferences({
      notification_types: {
        ...notificationTypes,
        [type]: enabled
      }
    });
  };

  const handleFrequencyChange = (frequency: string) => {
    updatePreferences({
      notification_frequency: frequency as 'minimal' | 'normal' | 'frequent'
    });
  };

  const handleQuietHoursChange = (field: 'start' | 'end', value: string) => {
    updatePreferences({
      [field === 'start' ? 'quiet_hours_start' : 'quiet_hours_end']: value
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>
          Customize when and how you receive notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Notification Types */}
        <div className="space-y-4">
          <h4 className="font-medium">Notification Types</h4>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <Label htmlFor="reminders">Workout Reminders</Label>
                  <p className="text-sm text-muted-foreground">Daily workout reminders</p>
                </div>
              </div>
              <Switch
                id="reminders"
                checked={notificationTypes.reminders ?? true}
                onCheckedChange={(checked) => handleNotificationTypeChange('reminders', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Trophy className="h-4 w-4 text-muted-foreground" />
                <div>
                  <Label htmlFor="achievements">Achievements</Label>
                  <p className="text-sm text-muted-foreground">New achievement unlocks</p>
                </div>
              </div>
              <Switch
                id="achievements"
                checked={notificationTypes.achievements ?? true}
                onCheckedChange={(checked) => handleNotificationTypeChange('achievements', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Zap className="h-4 w-4 text-muted-foreground" />
                <div>
                  <Label htmlFor="streaks">Streak Alerts</Label>
                  <p className="text-sm text-muted-foreground">Don't break your streak reminders</p>
                </div>
              </div>
              <Switch
                id="streaks"
                checked={notificationTypes.streaks ?? true}
                onCheckedChange={(checked) => handleNotificationTypeChange('streaks', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Target className="h-4 w-4 text-muted-foreground" />
                <div>
                  <Label htmlFor="milestones">Milestones</Label>
                  <p className="text-sm text-muted-foreground">Weekly and monthly progress updates</p>
                </div>
              </div>
              <Switch
                id="milestones"
                checked={notificationTypes.milestones ?? true}
                onCheckedChange={(checked) => handleNotificationTypeChange('milestones', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div>
                  <Label htmlFor="social">Social Activity</Label>
                  <p className="text-sm text-muted-foreground">Friends' achievements and challenges</p>
                </div>
              </div>
              <Switch
                id="social"
                checked={notificationTypes.social ?? false}
                onCheckedChange={(checked) => handleNotificationTypeChange('social', checked)}
              />
            </div>
          </div>
        </div>

        {/* Notification Frequency */}
        <div className="space-y-3">
          <Label htmlFor="frequency">Notification Frequency</Label>
          <Select
            value={preferences.notification_frequency || 'normal'}
            onValueChange={handleFrequencyChange}
          >
            <SelectTrigger id="frequency">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="minimal">
                <div className="flex items-center gap-2">
                  Minimal
                  <Badge variant="secondary">Only critical</Badge>
                </div>
              </SelectItem>
              <SelectItem value="normal">
                <div className="flex items-center gap-2">
                  Normal
                  <Badge variant="secondary">Recommended</Badge>
                </div>
              </SelectItem>
              <SelectItem value="frequent">
                <div className="flex items-center gap-2">
                  Frequent
                  <Badge variant="secondary">All notifications</Badge>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Quiet Hours */}
        <div className="space-y-3">
          <Label>Quiet Hours</Label>
          <p className="text-sm text-muted-foreground">
            Don't send notifications during these hours
          </p>
          <div className="flex items-center gap-3">
            <Select
              value={preferences.quiet_hours_start || '22:00'}
              onValueChange={(value) => handleQuietHoursChange('start', value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 24 }, (_, i) => {
                  const hour = i.toString().padStart(2, '0');
                  return (
                    <SelectItem key={hour} value={`${hour}:00`}>
                      {hour}:00
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <span className="text-muted-foreground">to</span>
            <Select
              value={preferences.quiet_hours_end || '08:00'}
              onValueChange={(value) => handleQuietHoursChange('end', value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 24 }, (_, i) => {
                  const hour = i.toString().padStart(2, '0');
                  return (
                    <SelectItem key={hour} value={`${hour}:00`}>
                      {hour}:00
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};