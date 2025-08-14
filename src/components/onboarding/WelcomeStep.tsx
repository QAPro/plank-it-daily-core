
import { motion } from 'framer-motion';
import { Target, TrendingUp, Users, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WelcomeStepProps {
  onNext: () => void;
}

const WelcomeStep = ({ onNext }: WelcomeStepProps) => {
  const benefits = [
    {
      icon: Target,
      title: 'Build Core Strength',
      description: 'Strengthen your entire core with proven plank techniques'
    },
    {
      icon: TrendingUp,
      title: 'Track Progress',
      description: 'Watch your endurance improve day by day'
    },
    {
      icon: Users,
      title: 'Join Community',
      description: 'Connect with thousands of fitness enthusiasts'
    },
    {
      icon: Zap,
      title: 'Quick Sessions',
      description: 'Effective workouts in just 5-10 minutes'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="mb-8"
      >
        <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-amber-500 rounded-3xl flex items-center justify-center mb-4 mx-auto shadow-2xl">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="text-white text-3xl font-bold"
          >
            P
          </motion.div>
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome to PlankCoach!</h1>
        <p className="text-lg text-gray-600 max-w-md">
          Let's set up your personalized plank journey in just a few steps
        </p>
      </motion.div>

      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="grid grid-cols-2 gap-4 mb-12 max-w-lg w-full"
      >
        {benefits.map((benefit, index) => (
          <motion.div
            key={benefit.title}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.6 + index * 0.1, duration: 0.4 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-orange-100"
          >
            <benefit.icon className="w-6 h-6 text-orange-500 mb-2 mx-auto" />
            <h3 className="font-semibold text-gray-800 text-sm mb-1">{benefit.title}</h3>
            <p className="text-xs text-gray-600 leading-relaxed">{benefit.description}</p>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="w-full max-w-sm"
      >
        <Button
          onClick={onNext}
          className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold py-4 rounded-2xl text-lg shadow-xl transform transition-all duration-200 hover:scale-105"
        >
          Let's Get Started
        </Button>
        <p className="text-sm text-gray-500 mt-4">
          This will take about 2-3 minutes
        </p>
      </motion.div>
    </div>
  );
};

export default WelcomeStep;
