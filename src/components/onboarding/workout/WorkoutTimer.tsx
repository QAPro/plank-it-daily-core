
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WorkoutTimerProps {
  time: number;
  targetTime: number;
  progress: number;
  isActive: boolean;
  hasCompleted: boolean;
  formatTime: (seconds: number) => string;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
}

const WorkoutTimer = ({
  time,
  targetTime,
  progress,
  isActive,
  hasCompleted,
  formatTime,
  onStart,
  onStop,
  onReset,
}: WorkoutTimerProps) => {
  return (
    <motion.div
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="text-center mb-8"
    >
      <div className="bg-white rounded-3xl p-8 shadow-xl border border-orange-100 mb-6">
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
          <motion.div
            className="bg-gradient-to-r from-orange-500 to-amber-500 h-3 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        
        <div className="text-6xl font-mono font-bold text-orange-600 mb-2">
          {formatTime(time)}
        </div>
        
        <div className="text-sm text-gray-600 mb-4">
          Target: {formatTime(targetTime)}
        </div>
        
        {hasCompleted && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex items-center justify-center text-green-600 mb-4"
          >
            <CheckCircle className="w-8 h-8 mr-2" />
            <span className="text-lg font-semibold">Completed!</span>
          </motion.div>
        )}
        
        <div className="flex justify-center space-x-4">
          {!isActive && time === 0 && (
            <Button
              onClick={onStart}
              className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-xl flex items-center space-x-2 text-lg"
            >
              <Play className="w-6 h-6" />
              <span>Start Workout</span>
            </Button>
          )}
          
          {isActive && (
            <Button
              onClick={onStop}
              className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-xl flex items-center space-x-2 text-lg"
            >
              <Pause className="w-6 h-6" />
              <span>Finish</span>
            </Button>
          )}
          
          {time > 0 && !isActive && (
            <Button
              onClick={onReset}
              variant="outline"
              className="px-6 py-3 rounded-xl flex items-center space-x-2"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Try Again</span>
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default WorkoutTimer;
