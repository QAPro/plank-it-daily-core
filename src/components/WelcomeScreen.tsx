import { motion } from "framer-motion";
import { Flame, Target, TrendingUp, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import innerFireLogo from "@/assets/inner-fire-logo.png";

interface WelcomeScreenProps {
  onGetStarted: () => void;
}

const WelcomeScreen = ({ onGetStarted }: WelcomeScreenProps) => {
  const features = [
    {
      icon: Flame,
      title: "Daily Fire",
      description: "Build your streak with just 5 minutes a day"
    },
    {
      icon: Target,
      title: "Your Goals",
      description: "Personalized workouts that adapt to you"
    },
    {
      icon: TrendingUp,
      title: "Track Progress",
      description: "Watch your strength grow over time"
    },
    {
      icon: Award,
      title: "Earn Rewards",
      description: "Unlock achievements as you improve"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background flex flex-col items-center justify-center p-6 text-center"
    >
      {/* Logo and Title */}
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="mb-8"
      >
        <motion.img
          src={innerFireLogo}
          alt="Inner Fire Logo"
          className="w-24 h-24 object-contain mx-auto mb-4"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        />
        <h1 className="text-5xl font-bold text-gradient mb-2">Inner Fire</h1>
        <p className="text-xl text-muted-foreground font-medium">5 Minutes a Day, Just for You</p>
      </motion.div>

      {/* Features Grid */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="grid grid-cols-2 gap-4 mb-12 max-w-2xl w-full"
      >
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.6 + index * 0.1, duration: 0.4 }}
            className="bg-card rounded-2xl p-6 shadow-soft hover:shadow-medium transition-shadow duration-200 border border-border/50"
          >
            <feature.icon className="w-10 h-10 text-coral mx-auto mb-3" />
            <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
            <p className="text-sm text-muted-foreground">{feature.description}</p>
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
          size="lg"
          className="w-full text-lg py-6 shadow-glow"
        >
          Start Your Journey
        </Button>
        <p className="text-sm text-muted-foreground mt-4">
          Transform yourself, one workout at a time
        </p>
      </motion.div>
    </motion.div>
  );
};

export default WelcomeScreen;

interface WelcomeScreenProps {
  onGetStarted: () => void;
}

const WelcomeScreen = ({ onGetStarted }: WelcomeScreenProps) => {
  const features = [
    {
      icon: Play,
      title: "Guided Sessions",
      description: "5-minute daily workouts designed for all levels"
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
      description: "Join a community getting healthier together"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex flex-col items-center justify-start sm:justify-center p-4 sm:p-6 text-center pt-8 sm:pt-0"
    >
      {/* Logo and Title */}
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="mb-6 sm:mb-8"
      >
        <motion.img
          src="/icon-512x512.png"
          alt="Inner Fire Logo"
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          className="w-16 h-16 sm:w-24 sm:h-24 object-contain rounded-3xl mb-3 sm:mb-4 mx-auto shadow-2xl"
        />
        <h1 className="text-2xl sm:text-4xl font-bold text-gray-800 mb-2">Inner Fire</h1>
        <p className="text-base sm:text-lg text-gray-600">Just 5 minutes a day, just for you</p>
      </motion.div>

      {/* Features Grid */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="grid grid-cols-2 gap-3 sm:gap-4 mb-8 sm:mb-12 max-w-sm w-full"
      >
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.6 + index * 0.1, duration: 0.4 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-3 sm:p-4 shadow-lg border border-orange-100"
          >
            <feature.icon className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500 mb-2 mx-auto" />
            <h3 className="font-semibold text-gray-800 text-xs sm:text-sm mb-1">{feature.title}</h3>
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
          className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold py-3 sm:py-4 rounded-2xl text-base sm:text-lg shadow-xl transform transition-all duration-200 hover:scale-105"
        >
          Start Your Journey
        </Button>
        <p className="text-sm text-gray-500 mt-3 sm:mt-4">
          Join motivated users getting healthier every day
        </p>
      </motion.div>
    </motion.div>
  );
};

export default WelcomeScreen;
