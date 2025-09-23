import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, Target } from 'lucide-react';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useToast } from '@/hooks/use-toast';

interface WeeklyGoalSettingsProps {
  children: React.ReactNode;
}

const WeeklyGoalSettings: React.FC<WeeklyGoalSettingsProps> = ({ children }) => {
  const { preferences, updatePreferences } = useUserPreferences();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [weeklyGoal, setWeeklyGoal] = useState(preferences?.weekly_goal || 7);

  const handleSave = async () => {
    if (weeklyGoal < 1 || weeklyGoal > 14) {
      toast({
        title: "Invalid goal",
        description: "Weekly goal must be between 1 and 14 days.",
        variant: "destructive",
      });
      return;
    }

    await updatePreferences({ weekly_goal: weeklyGoal });
    setIsOpen(false);
    toast({
      title: "Weekly goal updated",
      description: `Your new weekly goal is ${weeklyGoal} ${weeklyGoal === 1 ? 'day' : 'days'}.`,
    });
  };

  return (
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
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="weekly-goal">Weekly workout goal (days)</Label>
            <Input
              id="weekly-goal"
              type="number"
              min="1"
              max="14"
              value={weeklyGoal}
              onChange={(e) => setWeeklyGoal(parseInt(e.target.value) || 1)}
              className="w-full"
            />
            <p className="text-sm text-muted-foreground">
              Set how many days per week you'd like to work out (1-14 days)
            </p>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Goal
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WeeklyGoalSettings;