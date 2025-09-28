import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Plus, Trash2, Play } from "lucide-react";
import { useRolloutSchedules } from "@/hooks/useRolloutSchedules";

interface RolloutScheduleDialogProps {
  featureName: string;
  currentPercentage: number;
  children: React.ReactNode;
}

interface ScheduleStep {
  percentage: number;
  execute_at: string;
  executed: boolean;
}

export const RolloutScheduleDialog = ({ featureName, currentPercentage, children }: RolloutScheduleDialogProps) => {
  const [open, setOpen] = useState(false);
  const [scheduleName, setScheduleName] = useState("");
  const [steps, setSteps] = useState<ScheduleStep[]>([
    { percentage: Math.min(currentPercentage + 25, 100), execute_at: "", executed: false }
  ]);

  const { createSchedule, isCreating } = useRolloutSchedules();

  const addStep = () => {
    const lastPercentage = steps[steps.length - 1]?.percentage || currentPercentage;
    setSteps([...steps, { 
      percentage: Math.min(lastPercentage + 25, 100), 
      execute_at: "", 
      executed: false 
    }]);
  };

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const updateStep = (index: number, field: keyof ScheduleStep, value: any) => {
    const updatedSteps = [...steps];
    updatedSteps[index] = { ...updatedSteps[index], [field]: value };
    setSteps(updatedSteps);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleName.trim() || steps.length === 0) return;

    const validSteps = steps.filter(step => step.execute_at && step.percentage >= 0 && step.percentage <= 100);
    if (validSteps.length === 0) return;

    createSchedule({
      feature_name: featureName,
      schedule_name: scheduleName,
      schedule_data: validSteps.sort((a, b) => new Date(a.execute_at).getTime() - new Date(b.execute_at).getTime())
    });

    setOpen(false);
    setScheduleName("");
    setSteps([{ percentage: Math.min(currentPercentage + 25, 100), execute_at: "", executed: false }]);
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5); // Minimum 5 minutes from now
    return now.toISOString().slice(0, 16);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Schedule Gradual Rollout for {featureName}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="scheduleName">Schedule Name</Label>
            <Input
              id="scheduleName"
              value={scheduleName}
              onChange={(e) => setScheduleName(e.target.value)}
              placeholder="e.g., Gradual rollout to 100%"
              required
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Rollout Steps</Label>
              <Button type="button" onClick={addStep} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Step
              </Button>
            </div>

            <div className="bg-muted/50 p-3 rounded-md">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="secondary">{currentPercentage}%</Badge>
                Current rollout percentage
              </div>
            </div>

            {steps.map((step, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Step {index + 1}</Label>
                  {steps.length > 1 && (
                    <Button
                      type="button"
                      onClick={() => removeStep(index)}
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`percentage-${index}`} className="text-xs">Target Percentage</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id={`percentage-${index}`}
                        type="number"
                        min={currentPercentage}
                        max={100}
                        value={step.percentage}
                        onChange={(e) => updateStep(index, 'percentage', parseInt(e.target.value) || 0)}
                        className="text-sm"
                      />
                      <span className="text-xs text-muted-foreground">%</span>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor={`datetime-${index}`} className="text-xs">Execute At</Label>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <Input
                        id={`datetime-${index}`}
                        type="datetime-local"
                        min={getMinDateTime()}
                        value={step.execute_at}
                        onChange={(e) => updateStep(index, 'execute_at', e.target.value)}
                        className="text-xs"
                        required
                      />
                    </div>
                  </div>
                </div>

                {step.execute_at && (
                  <div className="text-xs text-muted-foreground bg-accent/50 p-2 rounded">
                    Will roll out to {step.percentage}% on {new Date(step.execute_at).toLocaleString()}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating || !scheduleName.trim() || steps.length === 0}>
              <Play className="h-4 w-4 mr-2" />
              {isCreating ? "Creating..." : "Create Schedule"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};