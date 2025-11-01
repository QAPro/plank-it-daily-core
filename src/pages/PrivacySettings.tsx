import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Eye, Users, Database, Bell, Download, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { usePrivacySettings } from '@/hooks/usePrivacySettings';
import VisibilityRadioGroup from '@/components/privacy/VisibilityRadioGroup';
import PrivacyHierarchyWarning from '@/components/privacy/PrivacyHierarchyWarning';
import { toast } from 'sonner';

const PrivacySettings = () => {
  const navigate = useNavigate();
  const { privacySettings, updateSetting, isLoading } = usePrivacySettings();

  const profileVisibilityOptions = [
    {
      value: 'public',
      label: 'Public',
      description: 'Anyone can view your profile, workouts, and achievements',
    },
    {
      value: 'friends_only',
      label: 'Friends Only',
      description: 'Only your accepted friends can see your profile',
    },
    {
      value: 'private',
      label: 'Private',
      description: 'Only you can see your profile information',
    },
  ];

  // Filter activity options based on profile visibility
  const getActivityVisibilityOptions = () => {
    const allOptions = [
      {
        value: 'public',
        label: 'Public',
        description: 'Your workouts appear in the community feed for everyone',
      },
      {
        value: 'friends_only',
        label: 'Friends Only',
        description: 'Only your friends can see your workout activities',
      },
      {
        value: 'private',
        label: 'Private',
        description: 'Your activities are completely private',
      },
    ];

    // If profile is private, only allow private activity
    if (privacySettings?.profile_visibility === 'private') {
      return allOptions.filter(opt => opt.value === 'private');
    }

    // If profile is friends_only, don't allow public activity
    if (privacySettings?.profile_visibility === 'friends_only') {
      return allOptions.filter(opt => opt.value !== 'public');
    }

    return allOptions;
  };

  const activityVisibilityOptions = getActivityVisibilityOptions();

  const friendRequestOptions = [
    {
      value: 'everyone',
      label: 'Everyone',
      description: 'Anyone can send you friend requests',
    },
    {
      value: 'friends_of_friends',
      label: 'Friends of Friends',
      description: 'Only people with mutual friends can send requests',
    },
    {
      value: 'no_one',
      label: 'No One',
      description: 'You won\'t receive any friend requests',
    },
  ];

  const handleDataExport = () => {
    toast.info('Data export is not automated yet. Please contact support@innerfire.app to request your data.');
  };

  const handleAccountDeletion = () => {
    toast.info('Account deletion requires manual review. Please contact support@innerfire.app to initiate this process.');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading privacy settings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="max-w-2xl mx-auto p-6 space-y-6 pb-32">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/settings')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Privacy Settings</h1>
            <p className="text-muted-foreground">Control your privacy and data</p>
          </div>
        </motion.div>

        {/* Profile Visibility */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Profile Visibility
              </CardTitle>
              <CardDescription>
                Control who can see your profile information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(privacySettings?.profile_visibility === 'private' || privacySettings?.profile_visibility === 'friends_only') && (
                <PrivacyHierarchyWarning visibility={privacySettings.profile_visibility} />
              )}
              <VisibilityRadioGroup
                value={privacySettings?.profile_visibility ?? 'public'}
                onValueChange={(value) => updateSetting({ profile_visibility: value as any })}
                options={profileVisibilityOptions}
                name="profile-visibility"
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Activity Sharing */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Activity Sharing
              </CardTitle>
              <CardDescription>
                Choose who can see your workout activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              {privacySettings?.profile_visibility === 'private' && (
                <p className="text-sm text-muted-foreground mb-4 p-3 bg-muted rounded-lg">
                  Activity visibility is locked to <strong>Private</strong> because your profile is private.
                </p>
              )}
              {privacySettings?.profile_visibility === 'friends_only' && privacySettings?.activity_visibility === 'public' && (
                <p className="text-sm text-muted-foreground mb-4 p-3 bg-muted rounded-lg">
                  Public activity is not available with a Friends Only profile.
                </p>
              )}
              <VisibilityRadioGroup
                value={privacySettings?.activity_visibility ?? 'friends_only'}
                onValueChange={(value) => updateSetting({ activity_visibility: value as any })}
                options={activityVisibilityOptions}
                name="activity-visibility"
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* What's Visible */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>What's Visible on Your Profile</CardTitle>
              <CardDescription>
                Choose which elements appear on your profile
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {privacySettings?.profile_visibility === 'private' && (
                <p className="text-sm text-muted-foreground mb-4 p-3 bg-muted rounded-lg">
                  All profile fields are hidden when your profile is set to <strong>Private</strong>.
                </p>
              )}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="show-achievements" className={privacySettings?.profile_visibility === 'private' ? 'text-muted-foreground' : ''}>
                    Show achievements
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Display your earned badges and milestones
                  </p>
                </div>
                <Switch
                  id="show-achievements"
                  checked={privacySettings?.show_achievements ?? true}
                  disabled={privacySettings?.profile_visibility === 'private'}
                  onCheckedChange={(checked) => updateSetting({ show_achievements: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="show-statistics" className={privacySettings?.profile_visibility === 'private' ? 'text-muted-foreground' : ''}>
                    Show statistics
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Display your workout stats and progress charts
                  </p>
                </div>
                <Switch
                  id="show-statistics"
                  checked={privacySettings?.show_statistics ?? true}
                  disabled={privacySettings?.profile_visibility === 'private'}
                  onCheckedChange={(checked) => updateSetting({ show_statistics: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="show-streak" className={privacySettings?.profile_visibility === 'private' ? 'text-muted-foreground' : ''}>
                    Show current streak
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Display your active workout streak
                  </p>
                </div>
                <Switch
                  id="show-streak"
                  checked={privacySettings?.show_streak ?? true}
                  disabled={privacySettings?.profile_visibility === 'private'}
                  onCheckedChange={(checked) => updateSetting({ show_streak: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Social Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Social Features
              </CardTitle>
              <CardDescription>
                Manage how others can interact with you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-base font-semibold mb-3 block">
                  Who can send you friend requests?
                </Label>
                {privacySettings?.profile_visibility === 'private' && (
                  <p className="text-sm text-muted-foreground mb-4 p-3 bg-muted rounded-lg">
                    Friend requests are disabled when your profile is <strong>Private</strong>.
                  </p>
                )}
                <VisibilityRadioGroup
                  value={privacySettings?.friend_request_privacy ?? 'everyone'}
                  onValueChange={(value) => updateSetting({ friend_request_privacy: value as any })}
                  options={friendRequestOptions}
                  name="friend-request-privacy"
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="space-y-0.5">
                  <Label htmlFor="friend-suggestions">Allow friend suggestions</Label>
                  <p className="text-sm text-muted-foreground">
                    Show suggested friends based on mutual connections
                  </p>
                </div>
                <Switch
                  id="friend-suggestions"
                  checked={privacySettings?.allow_friend_suggestions ?? true}
                  onCheckedChange={(checked) => updateSetting({ allow_friend_suggestions: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="allow-tagging">Allow friends to tag you</Label>
                  <p className="text-sm text-muted-foreground">
                    Friends can mention you in their activities
                  </p>
                </div>
                <Switch
                  id="allow-tagging"
                  checked={privacySettings?.allow_tagging ?? true}
                  onCheckedChange={(checked) => updateSetting({ allow_tagging: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Data & Privacy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Data & Privacy
              </CardTitle>
              <CardDescription>
                Control how we use your data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="analytics">Analytics & improvement</Label>
                  <p className="text-sm text-muted-foreground">
                    Help us improve by sharing anonymous usage data
                  </p>
                </div>
                <Switch
                  id="analytics"
                  checked={privacySettings?.data_collection_analytics ?? true}
                  onCheckedChange={(checked) => updateSetting({ data_collection_analytics: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="personalization">Personalization</Label>
                  <p className="text-sm text-muted-foreground">
                    Use your data to personalize recommendations
                  </p>
                </div>
                <Switch
                  id="personalization"
                  checked={privacySettings?.data_collection_personalization ?? true}
                  onCheckedChange={(checked) => updateSetting({ data_collection_personalization: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Communication Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Communication Preferences
              </CardTitle>
              <CardDescription>
                Choose which emails you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="marketing">Marketing emails</Label>
                  <p className="text-sm text-muted-foreground">
                    Promotions, tips, and fitness inspiration
                  </p>
                </div>
                <Switch
                  id="marketing"
                  checked={privacySettings?.marketing_emails ?? false}
                  onCheckedChange={(checked) => updateSetting({ marketing_emails: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="product-updates">Product updates</Label>
                  <p className="text-sm text-muted-foreground">
                    New features and important app announcements
                  </p>
                </div>
                <Switch
                  id="product-updates"
                  checked={privacySettings?.product_updates ?? true}
                  onCheckedChange={(checked) => updateSetting({ product_updates: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Privacy Tools */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Privacy Tools</CardTitle>
              <CardDescription>
                Manage your data and account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleDataExport}
              >
                <Download className="w-4 h-4 mr-2" />
                Download My Data
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-destructive hover:text-destructive"
                onClick={handleAccountDeletion}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default PrivacySettings;
