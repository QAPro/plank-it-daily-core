
import { motion } from "framer-motion";
import { Flame, Trophy, Target, TrendingUp } from "lucide-react";

interface CelebrationStatsProps {
  duration: number;
  exercise: any;
  isPersonalBest?: boolean;
  previousBest?: number;
  caloriesEstimate: number;
  completionPercentage: number;
}

const CelebrationStats = ({
  duration,
  exercise,
  isPersonalBest = false,
  previousBest,
  caloriesEstimate,
  completionPercentage
}: CelebrationStatsProps) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const improvement = previousBest ? duration - previousBest : 0;

  return (
    <div className="grid grid-cols-2 gap-3 mb-6">
      {/* Time Stat */}
      <motion.div
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.3, type: "spring", damping: 12 }}
        className="bg-white/20 rounded-xl p-3 text-center relative"
      >
        {isPersonalBest && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.8 }}
            className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-1"
          >
            <Trophy className="w-4 h-4 text-yellow-800" />
          </motion.div>
        )}
        <Target className="w-6 h-6 mx-auto mb-2" />
        <div className="text-lg font-bold">{formatTime(duration)}</div>
        <div className="text-xs opacity-80">Duration</div>
        {isPersonalBest && (
          <div className="text-xs text-yellow-200 font-semibold mt-1">
            Personal Best! 🏆
          </div>
        )}
      </motion.div>

      {/* Calories Stat */}
      <motion.div
        initial={{ scale: 0, rotate: 10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.4, type: "spring", damping: 12 }}
        className="bg-white/20 rounded-xl p-3 text-center"
      >
        <Flame className="w-6 h-6 mx-auto mb-2" />
        <div className="text-lg font-bold">{caloriesEstimate}</div>
        <div className="text-xs opacity-80">Calories</div>
      </motion.div>

      {/* Improvement Stat */}
      {improvement > 0 && (
        <motion.div
          initial={{ scale: 0, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ delay: 0.5, type: "spring", damping: 12 }}
          className="bg-white/20 rounded-xl p-3 text-center"
        >
          <TrendingUp className="w-6 h-6 mx-auto mb-2" />
          <div className="text-lg font-bold">+{improvement}s</div>
          <div className="text-xs opacity-80">Improved</div>
        </motion.div>
      )}

      {/* Level Stat */}
      <motion.div
        initial={{ scale: 0, rotate: -5 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.6, type: "spring", damping: 12 }}
        className="bg-white/20 rounded-xl p-3 text-center"
      >
        <div className="text-2xl mb-1">💪</div>
        <div className="text-lg font-bold">L{exercise.difficulty_level}</div>
        <div className="text-xs opacity-80">Level</div>
      </motion.div>
    </div>
  );
};

export default CelebrationStats;
