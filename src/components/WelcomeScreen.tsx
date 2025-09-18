
import { motion } from "framer-motion";
import { Play, Target, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WelcomeScreenProps {
  onGetStarted: () => void;
}

const WelcomeScreen = ({ onGetStarted }: WelcomeScreenProps) => {
  const features = [
    {
      icon: Play,
      title: "Guided Sessions",
      description: "5-minute daily plank workouts designed for all levels"
    },
    {
      icon: Target,
      title: "Progress Tracking",
      description: "Track your improvement and build consistency"
    },
    {
      icon: TrendingUp,
      title: "Streak Building",
      description: "Build habits with daily streak tracking"
    },
    {
      icon: Users,
      title: "Community",
      description: "Join thousands building core strength together"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex flex-col items-center justify-center p-6 text-center"
    >
      {/* Logo and Title */}
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="mb-8"
      >
        <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-amber-500 rounded-3xl flex items-center justify-center mb-4 mx-auto shadow-2xl">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="text-white text-4xl font-bold"
          >
            P
          </motion.div>
        </div>
        <h1 className="text-4xl font-bold text-gray-800 mb-2">PlankCoach</h1>
        <p className="text-lg text-gray-600">Build Your Core, Build Your Strength</p>
      </motion.div>

      {/* Features Grid */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="grid grid-cols-2 gap-4 mb-12 max-w-sm w-full"
      >
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.6 + index * 0.1, duration: 0.4 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-orange-100"
          >
            <feature.icon className="w-8 h-8 text-orange-500 mb-2 mx-auto" />
            <h3 className="font-semibold text-gray-800 text-sm mb-1">{feature.title}</h3>
            <p className="text-xs text-gray-600 leading-relaxed">{feature.description}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="w-full max-w-sm"
      >
        <Button
          onClick={onGetStarted}
          className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold py-4 rounded-2xl text-lg shadow-xl transform transition-all duration-200 hover:scale-105"
        >
          Start Your Journey
        </Button>
        <p className="text-sm text-gray-500 mt-4">
          Join other motivated users building stronger cores
        </p>
      </motion.div>
    </motion.div>
  );
};

export default WelcomeScreen;
