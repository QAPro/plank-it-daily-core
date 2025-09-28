import { useState, useCallback } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingUp, Users } from "lucide-react";
import { featureManagementService } from "@/services/featureManagementService";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Props = {
  featureName: string;
  currentPercentage: number;
  isEnabled: boolean;
  onUpdate?: () => void;
  userCount?: number;
  showConfirmation?: boolean;
};

const RolloutPercentageControl = ({ 
  featureName, 
  currentPercentage, 
  isEnabled,
  onUpdate,
  userCount = 0,
  showConfirmation = true 
}: Props) => {
  const [percentage, setPercentage] = useState(currentPercentage);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const presetValues = [0, 25, 50, 75, 100];
  
  const estimatedUsers = Math.floor((userCount * percentage) / 100);
  const isDecreasing = percentage < currentPercentage;
  const isSignificantChange = Math.abs(percentage - currentPercentage) >= 25;

  const handleUpdate = useCallback(async () => {
    if (percentage === currentPercentage) return;
    
    setIsUpdating(true);
    try {
      await featureManagementService.updateRolloutPercentage(featureName, percentage);
      toast({
        title: "Rollout updated",
        description: `${featureName} rollout set to ${percentage}%`,
      });
      onUpdate?.();
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Could not update rollout percentage",
        variant: "destructive",
      });
      setPercentage(currentPercentage); // Reset on error
    } finally {
      setIsUpdating(false);
    }
  }, [percentage, currentPercentage, featureName, onUpdate, toast]);

  const handleSliderChange = (values: number[]) => {
    setPercentage(values[0]);
  };

  const handlePresetClick = (value: number) => {
    setPercentage(value);
  };

  const renderUpdateButton = () => {
    if (percentage === currentPercentage) return null;

    const UpdateButton = (
      <Button
        size="sm"
        onClick={handleUpdate}
        disabled={isUpdating}
        variant={isDecreasing ? "destructive" : "default"}
        className="ml-2"
      >
        {isUpdating ? "Updating..." : "Update"}
      </Button>
    );

    if (showConfirmation && (isDecreasing || isSignificantChange)) {
      return (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            {UpdateButton}
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Confirm Rollout Change
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-2">
                <p>
                  You're about to change <strong>{featureName}</strong> rollout from{" "}
                  <strong>{currentPercentage}%</strong> to <strong>{percentage}%</strong>.
                </p>
                {isDecreasing && (
                  <p className="text-destructive">
                    ⚠️ This will reduce access for approximately{" "}
                    {Math.floor((userCount * (currentPercentage - percentage)) / 100)} users.
                  </p>
                )}
                {estimatedUsers > 0 && (
                  <p className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Estimated impact: {estimatedUsers} users
                  </p>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleUpdate} disabled={isUpdating}>
                {isUpdating ? "Updating..." : "Confirm Update"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      );
    }

    return UpdateButton;
  };

  return (
    <div className="space-y-3 p-3 border rounded-lg bg-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Rollout Percentage</span>
          <Badge 
            variant={isEnabled ? "default" : "secondary"}
            className="text-xs"
          >
            {percentage}%
          </Badge>
        </div>
        {estimatedUsers > 0 && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="h-3 w-3" />
            {estimatedUsers} users
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Slider
          value={[percentage]}
          onValueChange={handleSliderChange}
          min={0}
          max={100}
          step={1}
          className="flex-1"
          disabled={!isEnabled}
        />
        
        <div className="flex gap-1">
          {presetValues.map((value) => (
            <Button
              key={value}
              size="sm"
              variant={percentage === value ? "default" : "outline"}
              onClick={() => handlePresetClick(value)}
              disabled={!isEnabled}
              className="text-xs px-2 py-1 h-6"
            >
              {value}%
            </Button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {percentage}% of users will see this feature
        </span>
        {renderUpdateButton()}
      </div>
    </div>
  );
};

export default RolloutPercentageControl;