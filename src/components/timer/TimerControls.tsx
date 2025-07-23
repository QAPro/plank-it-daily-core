
import { Play, Pause, Square, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";

type TimerState = 'ready' | 'running' | 'paused' | 'completed';

interface TimerControlsProps {
  state: TimerState;
  soundEnabled: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onReset: () => void;
  onBack: () => void;
  onToggleSound: () => void;
}

const TimerControls = ({
  state,
  soundEnabled,
  onStart,
  onPause,
  onResume,
  onStop,
  onReset,
  onBack,
  onToggleSound
}: TimerControlsProps) => {
  return (
    <div className="space-y-4">
      {/* Primary Controls */}
      <div className="flex justify-center space-x-4">
        {state === 'ready' && (
          <Button
            onClick={onStart}
            size="lg"
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8"
          >
            <Play className="w-5 h-5 mr-2" />
            Start
          </Button>
        )}

        {state === 'running' && (
          <Button
            onClick={onPause}
            size="lg"
            className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white px-8"
          >
            <Pause className="w-5 h-5 mr-2" />
            Pause
          </Button>
        )}

        {state === 'paused' && (
          <>
            <Button
              onClick={onResume}
              size="lg"
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6"
            >
              <Play className="w-5 h-5 mr-2" />
              Resume
            </Button>
            <Button
              onClick={onStop}
              variant="outline"
              size="lg"
              className="px-6"
            >
              <Square className="w-5 h-5 mr-2" />
              Stop
            </Button>
          </>
        )}

        {state === 'completed' && (
          <Button
            onClick={onReset}
            size="lg"
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-8"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Do Again
          </Button>
        )}
      </div>

      {/* Secondary Controls */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={onBack}
          className="px-6"
        >
          Back
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleSound}
          className="px-3"
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4" />
          ) : (
            <VolumeX className="w-4 h-4" />
          )}
        </Button>

        {(state === 'running' || state === 'paused') && (
          <Button
            variant="outline"
            onClick={onReset}
            className="px-6"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        )}
      </div>
    </div>
  );
};

export default TimerControls;
