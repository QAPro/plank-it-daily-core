
import { motion } from "framer-motion";
import FlagGuard from '@/components/access/FlagGuard';

type TimerState = 'ready' | 'running' | 'paused' | 'completed';

interface TimerTipsProps {
  state: TimerState;
}

const TimerTips = ({ state }: TimerTipsProps) => {
  if (state !== 'running') return null;

  return (
    <FlagGuard featureName="timer_tips">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 0.5 }}
        className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center"
      >
        <p className="text-sm text-blue-800">
          💡 Keep your core tight and breathe steadily
        </p>
      </motion.div>
    </FlagGuard>
  );
};

export default TimerTips;
