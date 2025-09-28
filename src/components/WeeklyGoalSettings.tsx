import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, Target } from 'lucide-react';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useToast } from '@/hooks/use-toast';
import FlagGuard from '@/components/access/FlagGuard';

interface WeeklyGoalSettingsProps {
  children: React.ReactNode;
}

const WeeklyGoalSettings: React.FC<WeeklyGoalSettingsProps> = ({ children }) => {
  const { preferences, updatePreferences } = useUserPreferences();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [weeklyGoal, setWeeklyGoal] = useState(preferences?.weekly_goal || 7);
  const [dailySessions, setDailySessions] = useState(preferences?.daily_sessions || 1);

  const handleSave = async () => {
    if (weeklyGoal < 1 || weeklyGoal > 7) {
      toast({
        title: "Invalid weekly goal",
        description: "Weekly goal must be between 1 and 7 days.",
        variant: "destructive",
      });
      return;
    }

    if (dailySessions < 1 || dailySessions > 5) {
      toast({
        title: "Invalid daily sessions",
        description: "Daily sessions must be between 1 and 5 sessions per day.",
        variant: "destructive",
      });
      return;
    }

    await updatePreferences({ 
      weekly_goal: weeklyGoal,
      daily_sessions: dailySessions 
    });
    setIsOpen(false);
    
    const totalWeeklySessions = weeklyGoal * dailySessions;
    toast({
      title: "Goals updated",
      description: `${weeklyGoal} ${weeklyGoal === 1 ? 'day' : 'days'} per week, ${dailySessions} ${dailySessions === 1 ? 'session' : 'sessions'} per day (${totalWeeklySessions} total weekly sessions).`,
    });
  };

  return (
    <FlagGuard featureName="weekly_goal_settings">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Target className="w-5 h-5 mr-2 text-primary" />
              Set Weekly Goal
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="weekly-goal">Days per week</Label>
                <Input
                  id="weekly-goal"
                  type="number"
                  min="1"
                  max="7"
                  value={weeklyGoal}
                  onChange={(e) => setWeeklyGoal(parseInt(e.target.value) || 1)}
                  className="w-full"
                />
                <p className="text-sm text-muted-foreground">
                  How many days per week you'd like to work out (1-7 days)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="daily-sessions">Sessions per day</Label>
                <Input
                  id="daily-sessions"
                  type="number"
                  min="1"
                  max="5"
                  value={dailySessions}
                  onChange={(e) => setDailySessions(parseInt(e.target.value) || 1)}
                  className="w-full"
                />
                <p className="text-sm text-muted-foreground">
                  Number of workout sessions per day (1-5 sessions)
                </p>
              </div>

              <div className="p-3 bg-muted/50 rounded-md">
                <p className="text-sm font-medium">
                  Total weekly goal: {weeklyGoal * dailySessions} sessions
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {weeklyGoal} {weeklyGoal === 1 ? 'day' : 'days'} × {dailySessions} {dailySessions === 1 ? 'session' : 'sessions'} per day
                </p>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                Save Goals
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </FlagGuard>
  );
};

export default WeeklyGoalSettings;