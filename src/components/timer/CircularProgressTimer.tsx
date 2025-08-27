
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

type CountdownTimerState = 'setup' | 'ready' | 'running' | 'paused' | 'completed';

interface CircularProgressTimerProps {
  timeLeft: number;
  duration: number;
  state: CountdownTimerState;
  progress: number;
}

const CircularProgressTimer = ({ timeLeft, duration, state, progress }: CircularProgressTimerProps) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStateColor = () => {
    if (state === 'completed') return { ring: 'stroke-green-500', bg: 'from-green-500 to-emerald-500' };
    if (timeLeft <= 10) return { ring: 'stroke-red-500', bg: 'from-red-500 to-pink-500' };
    if (timeLeft <= 30) return { ring: 'stroke-yellow-500', bg: 'from-yellow-500 to-amber-500' };
    if (state === 'paused') return { ring: 'stroke-gray-400', bg: 'from-gray-400 to-gray-500' };
    return { ring: 'stroke-blue-500', bg: 'from-blue-500 to-cyan-500' };
  };

  const getStateMessage = () => {
    switch (state) {
      case 'setup': return 'Set Your Timer';
      case 'ready': return 'Ready to Start';
      case 'running': return timeLeft <= 10 ? 'Almost There!' : 'Keep Going!';
      case 'paused': return 'Paused';
      case 'completed': return 'Completed!';
      default: return '';
    }
  };

  const colors = getStateColor();
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  // Invert progress calculation for counter-clockwise countdown
  // progress represents elapsed time (0-100%), we want remaining time for visual
  const remainingProgress = 100 - progress;
  const strokeDashoffset = circumference * (remainingProgress / 100);

  return (
    <Card className={`bg-gradient-to-br ${colors.bg} text-white border-0 shadow-lg`}>
      <CardContent className="p-8 text-center relative">
        {/* Circular Progress Ring */}
        <div className="relative inline-flex items-center justify-center mb-6">
          <svg width="280" height="280" className="transform rotate-90 scale-x-[-1]">
            {/* Background Circle */}
            <circle
              cx="140"
              cy="140"
              r={radius}
              stroke="rgba(255, 255, 255, 0.2)"
              strokeWidth="8"
              fill="none"
            />
            {/* Progress Circle */}
            <motion.circle
              cx="140"
              cy="140"
              r={radius}
              stroke="white"
              strokeWidth="8"
              fill="none"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </svg>
          
          {/* Timer Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.div
              key={timeLeft}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
              className="text-5xl font-bold mb-2"
            >
              {formatTime(timeLeft)}
            </motion.div>
          </div>
        </div>

        {/* State Message */}
        <motion.div
          key={state}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="text-lg font-semibold"
        >
          {getStateMessage()}
        </motion.div>

        {/* Warning for low time */}
        {state === 'running' && timeLeft <= 10 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="mt-2 text-sm font-medium"
          >
            🔥 Final countdown!
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};

export default CircularProgressTimer;
