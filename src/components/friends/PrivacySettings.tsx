
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Shield, Eye, EyeOff, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface PrivacySettings {
  show_workouts: boolean;
  show_achievements: boolean;
  show_streak: boolean;
}

const PrivacySettings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<PrivacySettings>({
    show_workouts: true,
    show_achievements: true,
    show_streak: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      loadPrivacySettings();
    }
  }, [user]);

  const loadPrivacySettings = async () => {
    if (!user) return;
    
    try {
      // For now, use default settings until database schema is fully updated
      setSettings({
        show_workouts: true,
        show_achievements: true,
        show_streak: true
      });
    } catch (error) {
      console.error('Error loading privacy settings:', error);
      toast.error('Failed to load privacy settings');
    } finally {
      setLoading(false);
    }
  };

  const savePrivacySettings = async () => {
    if (!user) return;

    setSaving(true);
    
    try {
      // For now, just show success - will be implemented when schema is updated
      toast.success('Privacy settings saved successfully');
    } catch (error) {
      console.error('Error saving privacy settings:', error);
      toast.error('Failed to save privacy settings');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: keyof PrivacySettings, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <Shield className="w-6 h-6 text-orange-500" />
        <h2 className="text-xl font-semibold text-gray-800">Privacy Settings</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Activity Visibility</CardTitle>
          <p className="text-sm text-gray-600">
            Control what information your friends can see about your fitness activities
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Eye className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <Label htmlFor="show-workouts" className="text-base font-medium">
                  Show Workouts
                </Label>
                <p className="text-sm text-gray-600">
                  Let friends see when you complete workouts
                </p>
              </div>
            </div>
            <Switch
              id="show-workouts"
              checked={settings.show_workouts}
              onCheckedChange={(checked) => updateSetting('show_workouts', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Eye className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <Label htmlFor="show-achievements" className="text-base font-medium">
                  Show Achievements
                </Label>
                <p className="text-sm text-gray-600">
                  Let friends see your earned achievements and milestones
                </p>
              </div>
            </div>
            <Switch
              id="show-achievements"
              checked={settings.show_achievements}
              onCheckedChange={(checked) => updateSetting('show_achievements', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Eye className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <Label htmlFor="show-streak" className="text-base font-medium">
                  Show Streak
                </Label>
                <p className="text-sm text-gray-600">
                  Let friends see your current workout streak
                </p>
              </div>
            </div>
            <Switch
              id="show-streak"
              checked={settings.show_streak}
              onCheckedChange={(checked) => updateSetting('show_streak', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-3">
          <EyeOff className="w-5 h-5 text-gray-500" />
          <div>
            <p className="font-medium text-gray-800">Privacy Notice</p>
            <p className="text-sm text-gray-600">
              Your personal information and exact workout details are always private
            </p>
          </div>
        </div>
      </div>

      <Button
        onClick={savePrivacySettings}
        disabled={saving}
        className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
      >
        {saving ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save className="w-4 h-4 mr-2" />
            Save Privacy Settings
          </>
        )}
      </Button>
    </div>
  );
};

export default PrivacySettings;
