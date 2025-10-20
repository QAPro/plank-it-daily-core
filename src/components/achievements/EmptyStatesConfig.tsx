import { Trophy, Sparkles, Crown, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateConfig {
  icon: React.ReactNode;
  title: string;
  message: string;
  action?: React.ReactNode;
}

export const EMPTY_STATES = {
  NEW_USER: {
    icon: <Sparkles className="h-16 w-16 text-primary" />,
    title: "Welcome to Your Achievement Journey!",
    message: "Complete meditation sessions, build streaks, and explore different categories to start earning achievements. Your first goal: complete your first session!",
  },
  
  ALL_EARNED: {
    icon: <Trophy className="h-16 w-16 text-yellow-500" />,
    title: "🎉 Achievement Master!",
    message: "Congratulations! You've earned all available achievements. Check back regularly for new challenges and seasonal events!",
  },
  
  PREMIUM_WALL: (onUpgrade?: () => void) => ({
    icon: <Crown className="h-16 w-16 text-yellow-500" />,
    title: "Ready for More?",
    message: "You've completed all free achievements! Upgrade to Premium to unlock exclusive achievements and advanced features.",
    action: onUpgrade ? (
      <Button onClick={onUpgrade} className="mt-4">
        Unlock Premium Achievements
      </Button>
    ) : null,
  }),
  
  ERROR_LOADING: (onRetry?: () => void) => ({
    icon: <Gift className="h-16 w-16 text-muted-foreground" />,
    title: "Couldn't Load Recommendations",
    message: "We're having trouble loading your personalized recommendations. Please try again.",
    action: onRetry ? (
      <Button onClick={onRetry} variant="outline" className="mt-4">
        Try Again
      </Button>
    ) : null,
  }),
} as const;

export const EmptyStateDisplay: React.FC<{
  config: EmptyStateConfig;
}> = ({ config }) => (
  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
    <div className="mb-4">{config.icon}</div>
    <h3 className="text-xl font-semibold mb-2">{config.title}</h3>
    <p className="text-muted-foreground max-w-md mb-4">{config.message}</p>
    {config.action}
  </div>
);
