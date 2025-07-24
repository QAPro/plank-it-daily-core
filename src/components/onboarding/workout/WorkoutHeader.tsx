
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';

interface WorkoutHeaderProps {
  targetTime: number;
  onBack: () => void;
  formatTime: (seconds: number) => string;
}

const WorkoutHeader = ({ targetTime, onBack, formatTime }: WorkoutHeaderProps) => {
  return (
    <>
      <motion.button
        onClick={onBack}
        className="flex items-center text-gray-600 hover:text-orange-500 mb-8 transition-colors"
        whileHover={{ x: -5 }}
      >
        <ChevronLeft className="w-5 h-5 mr-1" />
        Back
      </motion.button>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-8"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Your First Workout!</h2>
        <p className="text-gray-600 mb-4">
          Let's do a {formatTime(targetTime)} plank to start your journey
        </p>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800">
          <p className="font-medium">You've got this! 💪</p>
          <p>Focus on your form and breathe steadily</p>
        </div>
      </motion.div>
    </>
  );
};

export default WorkoutHeader;
