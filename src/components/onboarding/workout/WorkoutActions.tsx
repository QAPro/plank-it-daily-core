
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface WorkoutActionsProps {
  hasCompleted: boolean;
  time: number;
  formatTime: (seconds: number) => string;
  onNext: () => void;
}

const WorkoutActions = ({ hasCompleted, time, formatTime, onNext }: WorkoutActionsProps) => {
  return (
    <motion.div
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.4 }}
    >
      {hasCompleted ? (
        <Button
          onClick={onNext}
          className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold py-4 rounded-xl text-lg"
        >
          Amazing! Let's Finish Setup
        </Button>
      ) : (
        <Button
          onClick={onNext}
          variant="outline"
          className="w-full py-3 rounded-xl"
        >
          Skip First Workout
        </Button>
      )}
      
      {hasCompleted && time > 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-sm text-gray-600 mt-3"
        >
          🎉 You completed your first plank in {formatTime(time)}!
        </motion.p>
      )}
    </motion.div>
  );
};

export default WorkoutActions;
