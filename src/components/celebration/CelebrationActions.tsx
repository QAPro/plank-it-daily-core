
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { RotateCcw, TrendingUp, Calendar, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CelebrationActionsProps {
  onClose: () => void;
  onDoAgain?: () => void;
  exerciseName: string;
}

const CelebrationActions = ({ onClose, onDoAgain, exerciseName }: CelebrationActionsProps) => {
  const navigate = useNavigate();

  const handleViewProgress = () => {
    onClose();
    // Navigate to stats tab - assuming we have a way to switch tabs
    navigate('/?tab=stats');
  };

  const handlePlanNextWorkout = () => {
    onClose();
    // Navigate to workout selection
    navigate('/?tab=workout');
  };

  const handleGoHome = () => {
    onClose();
    navigate('/');
  };

  return (
    <motion.div
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 1.6 }}
      className="space-y-3"
    >
      {/* Primary Action */}
      <Button
        onClick={onClose}
        className="w-full bg-white text-gray-800 hover:bg-gray-100 font-semibold py-3 rounded-xl text-lg shadow-lg"
      >
        Awesome! Continue 🎉
      </Button>
      
      <div className="grid grid-cols-2 gap-2">
        {/* Do Again */}
        {onDoAgain && (
          <Button
            onClick={onDoAgain}
            variant="outline"
            className="border-white/30 text-white hover:bg-white/20 py-2 rounded-lg flex items-center justify-center"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Do Again
          </Button>
        )}

        {/* View Progress */}
        <Button
          onClick={handleViewProgress}
          variant="outline"
          className="border-white/30 text-white hover:bg-white/20 py-2 rounded-lg flex items-center justify-center"
        >
          <TrendingUp className="w-4 h-4 mr-1" />
          Progress
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {/* Plan Next Workout */}
        <Button
          onClick={handlePlanNextWorkout}
          variant="outline"
          className="border-white/30 text-white hover:bg-white/20 py-2 rounded-lg flex items-center justify-center"
        >
          <Calendar className="w-4 h-4 mr-1" />
          Next Workout
        </Button>

        {/* Go Home */}
        <Button
          onClick={handleGoHome}
          variant="outline"
          className="border-white/30 text-white hover:bg-white/20 py-2 rounded-lg flex items-center justify-center"
        >
          <Home className="w-4 h-4 mr-1" />
          Home
        </Button>
      </div>
    </motion.div>
  );
};

export default CelebrationActions;
