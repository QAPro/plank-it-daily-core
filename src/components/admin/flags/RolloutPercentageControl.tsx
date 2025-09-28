import { useState, useCallback } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingUp, Users, History, Calendar } from "lucide-react";
import { featureManagementService } from "@/services/featureManagementService";
import { useToast } from "@/hooks/use-toast";
import { useFeatureUserMetrics } from "@/hooks/useFeatureUserMetrics";
import type { FeatureFlag } from "@/services/featureManagementService";
import RolloutHistoryPanel from "./RolloutHistoryPanel";
import { RolloutScheduleManager } from "./RolloutScheduleManager";
import { RolloutScheduleDialog } from "./RolloutScheduleDialog";
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
  featureFlag: FeatureFlag;
  onUpdate?: () => void;
  showConfirmation?: boolean;
};

const RolloutPercentageControl = ({ 
  featureFlag,
  onUpdate,
  showConfirmation = true 
}: Props) => {
  const [percentage, setPercentage] = useState(featureFlag.rollout_percentage || 100);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  
  const { data: userMetrics } = useFeatureUserMetrics(featureFlag.feature_name);
  
  const currentPercentage = featureFlag.rollout_percentage || 100;
  const isEnabled = featureFlag.is_enabled;

  const presetValues = [0, 25, 50, 75, 100];
  
  const totalUsers = userMetrics?.total_users || 0;
  const estimatedUsers = Math.floor((totalUsers * percentage) / 100);
  const isDecreasing = percentage < currentPercentage;
  const isSignificantChange = Math.abs(percentage - currentPercentage) >= 25;

  const handleUpdate = useCallback(async () => {
    if (percentage === currentPercentage) return;
    
    setIsUpdating(true);
    try {
      await featureManagementService.updateRolloutPercentage(featureFlag.feature_name, percentage);
      toast({
        title: "Rollout updated",
        description: `${featureFlag.feature_name} rollout set to ${percentage}%`,
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
  }, [percentage, currentPercentage, featureFlag.feature_name, onUpdate, toast]);

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
                  You're about to change <strong>{featureFlag.feature_name}</strong> rollout from{" "}
                  <strong>{currentPercentage}%</strong> to <strong>{percentage}%</strong>.
                </p>
                {isDecreasing && (
                  <p className="text-destructive">
                    ⚠️ This will reduce access for approximately{" "}
                    {Math.floor((totalUsers * (currentPercentage - percentage)) / 100)} users.
                  </p>
                )}
                {userMetrics?.error_rate > 0 && (
                  <p className="text-amber-600">
                    Current error rate: {userMetrics.error_rate.toFixed(2)}%
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
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {estimatedUsers > 0 && (
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {estimatedUsers} users
            </div>
          )}
          {userMetrics?.active_users_24h !== undefined && (
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              {userMetrics.active_users_24h} active (24h)
            </div>
          )}
        </div>
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
        <div className="flex gap-2">
          {(showConfirmation && (percentage < featureFlag.rollout_percentage! || percentage < 50)) ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                {renderUpdateButton()}
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Rollout Change</AlertDialogTitle>
                  <AlertDialogDescription className="space-y-3">
                    <div>
                      You're about to change the rollout from{" "}
                      <Badge variant="outline">{featureFlag.rollout_percentage}%</Badge> to{" "}
                      <Badge variant="outline">{percentage}%</Badge>
                    </div>
                    
                    {userMetrics && userMetrics.current_rollout_users > 0 && (
                      <div className="bg-amber-50 p-3 rounded-md">
                        <p className="text-sm text-amber-800">
                          <strong>Estimated Impact:</strong> This change could affect approximately{" "}
                          {Math.abs(
                            Math.ceil((userMetrics.total_users * percentage / 100) - 
                            userMetrics.current_rollout_users)
                          )} users.
                        </p>
                        {userMetrics.error_rate > 0 && (
                          <p className="text-sm text-amber-800 mt-1">
                            Current error rate: {userMetrics.error_rate.toFixed(1)}%
                          </p>
                        )}
                      </div>
                    )}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleUpdate}>
                    Confirm Change
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : (
            renderUpdateButton()
          )}
          
          <RolloutScheduleDialog 
            featureName={featureFlag.feature_name} 
            currentPercentage={featureFlag.rollout_percentage || 0}
          >
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule
            </Button>
          </RolloutScheduleDialog>
        </div>
      </div>
      
        <RolloutHistoryPanel featureName={featureFlag.feature_name} />
        <RolloutScheduleManager featureName={featureFlag.feature_name} />
    </div>
  );
};

export default RolloutPercentageControl;