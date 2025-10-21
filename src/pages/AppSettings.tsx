import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Volume2, Vibrate } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { EnhancedNotificationPreferences } from '@/components/notifications/EnhancedNotificationPreferences';
import { MusicPreferences } from '@/components/preferences/MusicPreferences';
import FlagGuard from '@/components/access/FlagGuard';

const AppSettings = () => {
  const navigate = useNavigate();
  const { preferences, loading, updatePreferences } = useUserPreferences();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
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
            <h1 className="text-3xl font-bold text-foreground">App Settings</h1>
            <p className="text-muted-foreground">Customize your app experience</p>
          </div>
        </motion.div>

        {/* App Settings Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>General Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Bell className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">Workout Reminders</p>
                    <p className="text-sm text-muted-foreground">Get notified about your workouts</p>
                  </div>
                </div>
                <Switch
                  checked={preferences?.workout_reminders}
                  onCheckedChange={(checked) => updatePreferences({ workout_reminders: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Volume2 className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">Sound Effects</p>
                    <p className="text-sm text-muted-foreground">Play sounds during workouts</p>
                  </div>
                </div>
                <Switch
                  checked={preferences?.sound_effects}
                  onCheckedChange={(checked) => updatePreferences({ sound_effects: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Vibrate className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">Haptic Feedback</p>
                    <p className="text-sm text-muted-foreground">Vibrate on interactions</p>
                  </div>
                </div>
                <Switch
                  checked={preferences?.haptic_feedback}
                  onCheckedChange={(checked) => updatePreferences({ haptic_feedback: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Music Preferences - Only show if feature is enabled */}
        <FlagGuard featureName="background_music_player">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <MusicPreferences />
          </motion.div>
        </FlagGuard>

        {/* Enhanced Notification Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <EnhancedNotificationPreferences />
        </motion.div>
      </div>
    </div>
  );
};

export default AppSettings;
