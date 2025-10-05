
import { motion } from 'framer-motion';
import { Trophy, Target, TrendingUp, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OnboardingData } from './OnboardingFlow';

interface CompletionStepProps {
  data: OnboardingData;
  onComplete: () => void;
  loading: boolean;
}

const CompletionStep = ({ data, onComplete, loading }: CompletionStepProps) => {
  const achievements = [
    {
      icon: Trophy,
      title: 'Welcome Bonus',
      description: 'You\'ve joined the Inner Fire community!'
    },
    {
      icon: Target,
      title: 'Goals Set',
      description: `${data.goals.length} fitness goals selected`
    },
    {
      icon: TrendingUp,
      title: 'Profile Set',
      description: 'Ready to start tracking your progress'
    },
    {
      icon: Zap,
      title: 'Ready to Go',
      description: 'Your fitness journey has begun!'
    }
  ];

  const getMotivationalMessage = () => {
    if (data.experienceLevel === 'beginner') {
      return "Every expert was once a beginner. You're taking the first step toward building an incredible future for yourself!";
    } else if (data.experienceLevel === 'intermediate') {
      return "You're ready to take your fitness to the next level. Let's build those gains!";
    } else {
      return "Time to push your limits and achieve new personal records. Let's make it happen!";
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full flex items-center justify-center mb-6 mx-auto shadow-2xl">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            >
              <Trophy className="w-12 h-12 text-white" />
            </motion.div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-800 mb-3">Congratulations!</h1>
          <h2 className="text-xl text-gray-600 mb-4">Your Inner Fire setup is complete</h2>
          
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-orange-800 leading-relaxed">
              {getMotivationalMessage()}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="grid grid-cols-2 gap-3 mb-8"
        >
          {achievements.map((achievement, index) => (
            <motion.div
              key={achievement.title}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.6 + index * 0.1, duration: 0.4 }}
              className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-orange-100"
            >
              <achievement.icon className="w-6 h-6 text-orange-500 mb-2 mx-auto" />
              <h3 className="font-semibold text-gray-800 text-sm mb-1">{achievement.title}</h3>
              <p className="text-xs text-gray-600 leading-relaxed">{achievement.description}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.0, duration: 0.6 }}
          className="space-y-4"
        >
          <Button
            onClick={onComplete}
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold py-4 rounded-2xl text-lg shadow-xl transform transition-all duration-200 hover:scale-105"
          >
            {loading ? 'Setting up your account...' : 'Start Your Journey'}
          </Button>
          
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <span>Ready to train</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              <span>Progress tracking enabled</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CompletionStep;
