
import { motion } from 'framer-motion';
import { ChevronLeft, Target, Zap, TrendingUp, Heart, Shield, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OnboardingData } from './OnboardingFlow';

interface GoalSelectionStepProps {
  data: OnboardingData;
  onUpdate: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const GoalSelectionStep = ({ data, onUpdate, onNext, onBack }: GoalSelectionStepProps) => {
  const goals = [
    { id: 'core_strength', label: 'Build Core Strength', icon: Shield },
    { id: 'endurance', label: 'Improve Endurance', icon: TrendingUp },
    { id: 'weight_loss', label: 'Weight Loss', icon: Target },
    { id: 'posture', label: 'Better Posture', icon: Heart },
    { id: 'fitness', label: 'General Fitness', icon: Zap },
    { id: 'challenge', label: 'Personal Challenge', icon: Trophy }
  ];

  const toggleGoal = (goalId: string) => {
    const currentGoals = data.goals || [];
    const newGoals = currentGoals.includes(goalId)
      ? currentGoals.filter(g => g !== goalId)
      : [...currentGoals, goalId];
    
    onUpdate({ goals: newGoals });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
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
          <h2 className="text-2xl font-bold text-gray-800 mb-2">What are your goals?</h2>
          <p className="text-gray-600">
            Select all that apply to personalize your experience
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 gap-3 mb-8"
        >
          {goals.map((goal, index) => {
            const isSelected = data.goals?.includes(goal.id);
            return (
              <motion.button
                key={goal.id}
                onClick={() => toggleGoal(goal.id)}
                className={`p-4 rounded-xl border-2 transition-all text-center ${
                  isSelected
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 bg-white hover:border-orange-300'
                }`}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <goal.icon className={`w-6 h-6 mx-auto mb-2 ${
                  isSelected ? 'text-orange-500' : 'text-gray-400'
                }`} />
                <p className={`text-sm font-medium ${
                  isSelected ? 'text-orange-700' : 'text-gray-700'
                }`}>
                  {goal.label}
                </p>
              </motion.button>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <Button
            onClick={onNext}
            disabled={!data.goals?.length}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold py-3 rounded-xl"
          >
            Continue
          </Button>
          {data.goals?.length > 0 && (
            <p className="text-sm text-gray-500 text-center mt-3">
              {data.goals.length} goal{data.goals.length > 1 ? 's' : ''} selected
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default GoalSelectionStep;
