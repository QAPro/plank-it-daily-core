import { motion } from "framer-motion";
import { Activity, User, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { User as AuthUser } from "@supabase/supabase-js";
import innerFireLogo from "@/assets/inner-fire-logo.png";
import { useUserProfile } from "@/hooks/useUserProfile";

interface WelcomeScreenProps {
  user: AuthUser;
  onWorkoutSelected: (exerciseId: string, exerciseName: string) => void;
  onSkip: () => void;
}

const WelcomeScreen = ({ user, onWorkoutSelected, onSkip }: WelcomeScreenProps) => {
  // Get username and firstName from database
  const { username, firstName } = useUserProfile();
  
  // Prioritize username, then firstName, then email fallback
  const getDisplayName = () => {
    if (username) return username;
    if (firstName) return firstName;
    if (user.user_metadata?.name) {
      return user.user_metadata.name.split(' ')[0];
    }
    if (user.email) {
      return user.email.split('@')[0];
    }
    return 'there';
  };

  const workouts = [
    {
      id: 'f5b8fe48-b477-43ee-918a-6a95e1edf147',
      name: 'Forearm Plank',
      duration: 30,
      icon: Activity,
      description: 'Core strength foundation',
    },
    {
      id: 'b58c7718-ebc0-4394-bc3f-e3f6e7af2c6f',
      name: 'Standard Wall Sit',
      duration: 30,
      icon: User,
      description: 'Lower body endurance',
    },
    {
      id: '1f8d6c5b-dc28-4e4f-958c-900212f6104e',
      name: 'Alternating Leg Raises',
      duration: 30,
      icon: TrendingUp,
      description: 'Build lower core power',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background flex flex-col items-center justify-center p-6 text-center"
    >
      {/* Logo */}
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="mb-8"
      >
        <motion.img
          src={innerFireLogo}
          alt="Inner Fire Logo"
          className="w-20 h-20 object-contain mx-auto mb-4"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        />
        <h1 className="text-4xl font-bold text-gradient mb-2">
          Welcome to Inner Fire, {getDisplayName()}!
        </h1>
        <p className="text-lg text-muted-foreground font-medium">
          Let's begin your journey. Choose your first workout:
        </p>
      </motion.div>

      {/* Workout Cards */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 max-w-3xl w-full"
      >
        {workouts.map((workout, index) => (
          <motion.button
            key={workout.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.6 + index * 0.1, duration: 0.4 }}
            onClick={() => onWorkoutSelected(workout.id, workout.name)}
            className="bg-card rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all duration-200 border border-border/50 hover:border-primary hover:scale-105 cursor-pointer group"
          >
            <workout.icon className="w-12 h-12 text-coral mx-auto mb-3 group-hover:scale-110 transition-transform duration-200" />
            <h3 className="font-semibold text-foreground mb-1 text-lg">{workout.name}</h3>
            <p className="text-sm text-muted-foreground mb-2">{workout.description}</p>
            <div className="inline-block px-3 py-1 bg-gradient-primary/10 rounded-full">
              <span className="text-sm font-medium text-coral">{workout.duration} seconds</span>
            </div>
          </motion.button>
        ))}
      </motion.div>

      {/* Skip Link */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        <button
          onClick={onSkip}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 underline underline-offset-4"
        >
          I'll explore on my own
        </button>
      </motion.div>
    </motion.div>
  );
};

export default WelcomeScreen;
