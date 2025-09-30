
import { motion } from "framer-motion";
import { Bell, Volume2, Vibrate } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { EnhancedNotificationPreferences } from "@/components/notifications/EnhancedNotificationPreferences";
import { MusicPreferences } from "@/components/preferences/MusicPreferences";
import FlagGuard from "@/components/access/FlagGuard";

const PreferencesSettings = () => {
  const { preferences, loading, updatePreferences } = useUserPreferences();

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse bg-gray-200 h-8 w-48 rounded"></div>
        <div className="animate-pulse bg-gray-200 h-32 rounded-lg"></div>
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Unable to load preferences</p>
      </div>
    );
  }


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* App Settings */}
      <Card className="bg-white/80 backdrop-blur-sm border-orange-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">App Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="w-4 h-4 text-orange-500" />
              <span className="text-sm">Workout Reminders</span>
            </div>
            <Switch
              checked={preferences.workout_reminders}
              onCheckedChange={(checked) => updatePreferences({ workout_reminders: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Volume2 className="w-4 h-4 text-orange-500" />
              <span className="text-sm">Sound Effects</span>
            </div>
            <Switch
              checked={preferences.sound_effects}
              onCheckedChange={(checked) => updatePreferences({ sound_effects: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Vibrate className="w-4 h-4 text-orange-500" />
              <span className="text-sm">Haptic Feedback</span>
            </div>
            <Switch
              checked={preferences.haptic_feedback}
              onCheckedChange={(checked) => updatePreferences({ haptic_feedback: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Music Preferences - Only show if feature is enabled */}
      <FlagGuard featureName="background_music_player">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <MusicPreferences />
        </motion.div>
      </FlagGuard>

      {/* Enhanced Notification Preferences */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <EnhancedNotificationPreferences />
      </motion.div>
    </motion.div>
  );
};

export default PreferencesSettings;
