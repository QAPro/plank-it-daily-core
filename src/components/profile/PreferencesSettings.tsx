
import { motion } from "framer-motion";
import { Bell, Volume2, Vibrate, Moon, Zap, Timer } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { EnhancedNotificationPreferences } from "@/components/notifications/EnhancedNotificationPreferences";

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

  const handleDifficultyChange = (difficulty: string) => {
    if (difficulty && ['beginner', 'intermediate', 'advanced'].includes(difficulty)) {
      updatePreferences({ difficulty_preference: difficulty as any });
    }
  };

  const handleDurationChange = (duration: number) => {
    updatePreferences({ preferred_workout_duration: duration });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <h3 className="text-lg font-semibold text-gray-800">Workout Preferences</h3>
      
      {/* Difficulty Preference */}
      <Card className="bg-white/80 backdrop-blur-sm border-orange-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center">
            <Zap className="w-4 h-4 mr-2 text-orange-500" />
            Difficulty Level
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'beginner', label: 'Beginner' },
              { value: 'intermediate', label: 'Intermediate' },
              { value: 'advanced', label: 'Advanced' }
            ].map((difficulty) => (
              <Button
                key={difficulty.value}
                variant={preferences.difficulty_preference === difficulty.value ? "default" : "outline"}
                size="sm"
                onClick={() => handleDifficultyChange(difficulty.value)}
                className="text-xs"
              >
                {difficulty.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Duration Preference */}
      <Card className="bg-white/80 backdrop-blur-sm border-orange-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center">
            <Timer className="w-4 h-4 mr-2 text-orange-500" />
            Preferred Duration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
            {[30, 60, 120].map((duration) => (
              <Button
                key={duration}
                variant={preferences.preferred_workout_duration === duration ? "default" : "outline"}
                size="sm"
                onClick={() => handleDurationChange(duration)}
                className="text-xs"
              >
                {duration}s
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

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
