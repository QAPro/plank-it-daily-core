
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

type TimerState = 'ready' | 'running' | 'paused' | 'completed';

interface TimerDisplayProps {
  timeLeft: number;
  duration: number;
  state: TimerState;
}

const TimerDisplay = ({ timeLeft, duration, state }: TimerDisplayProps) => {
  const timeElapsed = duration - timeLeft;
  const progress = (timeElapsed / duration) * 100;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStateColor = () => {
    switch (state) {
      case 'running': return 'from-green-500 to-emerald-500';
      case 'paused': return 'from-yellow-500 to-amber-500';
      case 'completed': return 'from-purple-500 to-pink-500';
      default: return 'from-blue-500 to-cyan-500';
    }
  };

  const getStateMessage = () => {
    switch (state) {
      case 'ready': return 'Ready to Start';
      case 'running': return 'Keep Going!';
      case 'paused': return 'Paused';
      case 'completed': return 'Completed!';
      default: return '';
    }
  };

  return (
    <Card className={`bg-gradient-to-br ${getStateColor()} text-white border-0 shadow-lg`}>
      <CardContent className="p-8 text-center">
        <motion.div
          key={timeLeft}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.2 }}
          className="text-6xl font-bold mb-4"
        >
          {formatTime(timeLeft)}
        </motion.div>
        
        {/* Progress Bar */}
        <div className="w-full bg-white/20 rounded-full h-3 mb-4">
          <motion.div
            className="bg-white rounded-full h-3"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* State Indicator */}
        <div className="text-lg font-semibold">
          <AnimatePresence mode="wait">
            <motion.div
              key={state}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {getStateMessage()}
            </motion.div>
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
};

export default TimerDisplay;
