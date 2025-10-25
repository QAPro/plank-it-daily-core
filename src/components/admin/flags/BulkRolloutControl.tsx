import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp } from "lucide-react";
import { featureManagementService } from "@/services/featureManagementService";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  selectedFeatures: string[];
  onSuccess?: () => void;
};

const BulkRolloutControl = ({ isOpen, onClose, selectedFeatures, onSuccess }: Props) => {
  const [percentage, setPercentage] = useState(100);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const presetValues = [0, 25, 50, 75, 100];

  const handleUpdate = async () => {
    if (selectedFeatures.length === 0) return;

    setIsUpdating(true);
    try {
      await featureManagementService.bulkUpdateRolloutPercentage(selectedFeatures, percentage);
      onSuccess?.();
      onClose();
    } catch (error) {
      toast({
        title: "Bulk update failed",
        description: "Could not update rollout percentages",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSliderChange = (values: number[]) => {
    setPercentage(values[0]);
  };

  const handlePresetClick = (value: number) => {
    setPercentage(value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Bulk Rollout Update
          </DialogTitle>
          <DialogDescription>
            Set rollout percentage for {selectedFeatures.length} selected features
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Target Rollout</span>
            <Badge variant="outline" className="text-sm">
              {percentage}%
            </Badge>
          </div>

          <div className="space-y-3">
            <Slider
              value={[percentage]}
              onValueChange={handleSliderChange}
              min={0}
              max={100}
              step={5}
              className="w-full"
            />
            
            <div className="flex gap-2 justify-center">
              {presetValues.map((value) => (
                <Button
                  key={value}
                  size="sm"
                  variant={percentage === value ? "default" : "outline"}
                  onClick={() => handlePresetClick(value)}
                  className="text-xs px-3"
                >
                  {value}%
                </Button>
              ))}
            </div>
          </div>

          <div className="bg-muted p-3 rounded-lg space-y-1">
            <p className="text-sm font-medium">Selected Features:</p>
            <div className="flex flex-wrap gap-1">
              {selectedFeatures.slice(0, 3).map((feature) => (
                <Badge key={feature} variant="secondary" className="text-xs">
                  {feature}
                </Badge>
              ))}
              {selectedFeatures.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{selectedFeatures.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isUpdating}>
            Cancel
          </Button>
          <Button onClick={handleUpdate} disabled={isUpdating || selectedFeatures.length === 0}>
            {isUpdating ? "Updating..." : `Update ${selectedFeatures.length} Features`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BulkRolloutControl;