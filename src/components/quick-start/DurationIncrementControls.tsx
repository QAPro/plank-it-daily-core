import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface DurationIncrementControlsProps {
  duration: number;
  onDurationChange: (seconds: number) => void;
  disabled?: boolean;
}

const DurationIncrementControls = ({ 
  duration, 
  onDurationChange, 
  disabled = false 
}: DurationIncrementControlsProps) => {
  const minDuration = 10; // 10 seconds minimum
  const maxDuration = 600; // 10 minutes maximum

  const handleIncrement = (seconds: number) => {
    const newDuration = Math.min(maxDuration, duration + seconds);
    if (newDuration !== duration) {
      onDurationChange(newDuration);
    }
  };

  const handleDecrement = (seconds: number) => {
    const newDuration = Math.max(minDuration, duration - seconds);
    if (newDuration !== duration) {
      onDurationChange(newDuration);
    }
  };

  return (
    <div className="flex items-center space-x-2 sm:space-x-4">
      {/* 5-second controls */}
      <div className="flex items-center space-x-0.5 sm:space-x-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleDecrement(5)}
          disabled={disabled || duration <= minDuration}
          className="h-7 w-7 sm:h-8 sm:w-8 p-0 border-orange-200 hover:bg-orange-100"
        >
          <Minus className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
        </Button>
        <span className="text-xs text-muted-foreground min-w-[20px] sm:min-w-[24px] text-center">5s</span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleIncrement(5)}
          disabled={disabled || duration >= maxDuration}
          className="h-7 w-7 sm:h-8 sm:w-8 p-0 border-orange-200 hover:bg-orange-100"
        >
          <Plus className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
        </Button>
      </div>

      {/* Separator */}
      <div className="w-px h-6 bg-border"></div>

      {/* 1-minute controls */}
      <div className="flex items-center space-x-0.5 sm:space-x-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleDecrement(60)}
          disabled={disabled || duration <= minDuration}
          className="h-7 w-7 sm:h-8 sm:w-8 p-0 border-orange-200 hover:bg-orange-100"
        >
          <Minus className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
        </Button>
        <span className="text-xs text-muted-foreground min-w-[20px] sm:min-w-[24px] text-center">1m</span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleIncrement(60)}
          disabled={disabled || duration >= maxDuration}
          className="h-7 w-7 sm:h-8 sm:w-8 p-0 border-orange-200 hover:bg-orange-100"
        >
          <Plus className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
        </Button>
      </div>
    </div>
  );
};

export default DurationIncrementControls;