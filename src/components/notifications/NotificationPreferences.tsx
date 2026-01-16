import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Clock, Target, Trophy, Users, Zap, ChevronDown, ChevronRight, UserPlus, UserCheck, Heart, MessageSquare, Activity, Award, TrendingUp, Flame } from "lucide-react";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export const NotificationPreferences = () => {
  const { preferences, updatePreferences, loading } = useUserPreferences();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    social: false,
  });

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
  const socialSettings = typeof notificationTypes.social === 'object' 
    ? notificationTypes.social 
    : { enabled: notificationTypes.social ?? false };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleNotificationTypeChange = (type: string, enabled: boolean) => {
    updatePreferences({
      notification_types: {
        ...notificationTypes,
        [type]: enabled
      }
    });
  };

  const handleSocialSettingChange = (setting: string, enabled: boolean) => {
    updatePreferences({
      notification_types: {
        ...notificationTypes,
        social: {
          ...socialSettings,
          [setting]: enabled
        }
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
            {/* Workout Reminders */}
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

            {/* Achievements */}
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

            {/* Streak Alerts */}
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

            {/* Milestones */}
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

            {/* Social Activity - Collapsible */}
            <Collapsible
              open={expandedSections.social}
              onOpenChange={() => toggleSection('social')}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <CollapsibleTrigger className="flex items-center gap-3 flex-1 hover:opacity-70 transition-opacity">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1 text-left">
                      <Label className="cursor-pointer">Social Activity</Label>
                      <p className="text-sm text-muted-foreground">Friend requests, cheers, and activity</p>
                    </div>
                    {expandedSections.social ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </CollapsibleTrigger>
                  <Switch
                    id="social"
                    checked={socialSettings.enabled ?? true}
                    onCheckedChange={(checked) => handleSocialSettingChange('enabled', checked)}
                    className="ml-2"
                  />
                </div>

                <CollapsibleContent className="space-y-3 pl-7 pt-2">
                  {/* Friend Requests */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <UserPlus className="h-3.5 w-3.5 text-muted-foreground" />
                      <div>
                        <Label htmlFor="friend_requests" className="text-sm">Friend Requests</Label>
                        <p className="text-xs text-muted-foreground">New friend requests received</p>
                      </div>
                    </div>
                    <Switch
                      id="friend_requests"
                      checked={socialSettings.friend_requests ?? true}
                      onCheckedChange={(checked) => handleSocialSettingChange('friend_requests', checked)}
                      disabled={!socialSettings.enabled}
                    />
                  </div>

                  {/* Friend Accepted */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <UserCheck className="h-3.5 w-3.5 text-muted-foreground" />
                      <div>
                        <Label htmlFor="friend_accepted" className="text-sm">Friend Accepted</Label>
                        <p className="text-xs text-muted-foreground">When someone accepts your request</p>
                      </div>
                    </div>
                    <Switch
                      id="friend_accepted"
                      checked={socialSettings.friend_accepted ?? true}
                      onCheckedChange={(checked) => handleSocialSettingChange('friend_accepted', checked)}
                      disabled={!socialSettings.enabled}
                    />
                  </div>

                  {/* Cheers Received */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Heart className="h-3.5 w-3.5 text-muted-foreground" />
                      <div>
                        <Label htmlFor="cheers_received" className="text-sm">Cheers Received</Label>
                        <p className="text-xs text-muted-foreground">When friends cheer your workouts</p>
                      </div>
                    </div>
                    <Switch
                      id="cheers_received"
                      checked={socialSettings.cheers_received ?? true}
                      onCheckedChange={(checked) => handleSocialSettingChange('cheers_received', checked)}
                      disabled={!socialSettings.enabled}
                    />
                  </div>

                  {/* Reactions Received */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
                      <div>
                        <Label htmlFor="reactions_received" className="text-sm">Reactions Received</Label>
                        <p className="text-xs text-muted-foreground">Daily digest of reactions</p>
                      </div>
                    </div>
                    <Switch
                      id="reactions_received"
                      checked={socialSettings.reactions_received ?? false}
                      onCheckedChange={(checked) => handleSocialSettingChange('reactions_received', checked)}
                      disabled={!socialSettings.enabled}
                    />
                  </div>

                  {/* Friend Workouts */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Activity className="h-3.5 w-3.5 text-muted-foreground" />
                      <div>
                        <Label htmlFor="friend_workouts" className="text-sm">Friend Workouts</Label>
                        <p className="text-xs text-muted-foreground">Daily digest of friend workouts</p>
                      </div>
                    </div>
                    <Switch
                      id="friend_workouts"
                      checked={socialSettings.friend_workouts ?? false}
                      onCheckedChange={(checked) => handleSocialSettingChange('friend_workouts', checked)}
                      disabled={!socialSettings.enabled}
                    />
                  </div>

                  {/* Friend Achievements */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Award className="h-3.5 w-3.5 text-muted-foreground" />
                      <div>
                        <Label htmlFor="friend_achievements" className="text-sm">Friend Achievements</Label>
                        <p className="text-xs text-muted-foreground">Daily digest of friend achievements</p>
                      </div>
                    </div>
                    <Switch
                      id="friend_achievements"
                      checked={socialSettings.friend_achievements ?? false}
                      onCheckedChange={(checked) => handleSocialSettingChange('friend_achievements', checked)}
                      disabled={!socialSettings.enabled}
                    />
                  </div>

                  {/* Friend Level Ups */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
                      <div>
                        <Label htmlFor="friend_levelups" className="text-sm">Friend Level Ups</Label>
                        <p className="text-xs text-muted-foreground">Daily digest when friends level up</p>
                      </div>
                    </div>
                    <Switch
                      id="friend_levelups"
                      checked={socialSettings.friend_levelups ?? false}
                      onCheckedChange={(checked) => handleSocialSettingChange('friend_levelups', checked)}
                      disabled={!socialSettings.enabled}
                    />
                  </div>

                  {/* Friend Streaks */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Flame className="h-3.5 w-3.5 text-muted-foreground" />
                      <div>
                        <Label htmlFor="friend_streaks" className="text-sm">Friend Streak Milestones</Label>
                        <p className="text-xs text-muted-foreground">Daily digest of friend streak milestones</p>
                      </div>
                    </div>
                    <Switch
                      id="friend_streaks"
                      checked={socialSettings.friend_streaks ?? false}
                      onCheckedChange={(checked) => handleSocialSettingChange('friend_streaks', checked)}
                      disabled={!socialSettings.enabled}
                    />
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
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
