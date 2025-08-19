
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Crown, 
  Star, 
  ArrowRight, 
  Timer, 
  BarChart3, 
  Users, 
  Zap,
  Target,
  TrendingUp,
  Heart,
  Gift,
  Clock,
  Sparkles
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useSubscription } from '@/hooks/useSubscription';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';

type UpgradeReason = 
  | 'usage_limit' 
  | 'feature_interest' 
  | 'engagement_milestone' 
  | 'retention'
  | 'social_proof'
  | 'limited_offer'
  | 'goal_achievement';

type SmartPromptData = {
  reason: UpgradeReason;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  urgency: 'low' | 'medium' | 'high';
  features: string[];
  personalizedMessage?: string;
  socialProof?: string;
  offer?: {
    discount: number;
    timeLeft: string;
    originalPrice: number;
    discountedPrice: number;
  };
  cta: string;
  variant?: 'A' | 'B' | 'C'; // For A/B testing
};

type SmartUpgradePromptProps = {
  trigger: UpgradeReason;
  onClose: () => void;
  onUpgrade: () => void;
  userData?: {
    sessionsThisMonth?: number;
    daysActive?: number;
    favoriteFeatures?: string[];
    goalProgress?: number;
    socialConnections?: number;
  };
};

const SmartUpgradePrompt: React.FC<SmartUpgradePromptProps> = ({ 
  trigger, 
  onClose, 
  onUpgrade,
  userData = {}
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [timeLeft, setTimeLeft] = useState(3600); // 1 hour in seconds
  const [variant] = useState<'A' | 'B' | 'C'>(
    ['A', 'B', 'C'][Math.floor(Math.random() * 3)] as 'A' | 'B' | 'C'
  );
  
  const { active, upgrade, plans } = useSubscription();
  const { tier } = useFeatureAccess();

  // Don't show if user already has premium
  if (active || tier !== 'free') {
    return null;
  }

  const promptData: Record<UpgradeReason, SmartPromptData> = {
    usage_limit: {
      reason: 'usage_limit',
      title: variant === 'A' ? 'You\'re close to your limit!' : 
             variant === 'B' ? 'Don\'t let limits slow you down!' : 
             'Keep your momentum going!',
      description: variant === 'A' ? 'Upgrade now to continue your fitness journey without interruptions.' :
                   variant === 'B' ? 'Unlock unlimited access and reach your fitness goals faster.' :
                   'Your dedication deserves unlimited access to all features.',
      icon: Timer,
      color: 'from-orange-500 to-red-500',
      urgency: 'high',
      features: ['Unlimited workouts', 'Advanced statistics', 'Smart recommendations'],
      personalizedMessage: userData.sessionsThisMonth ? 
        `You've completed ${userData.sessionsThisMonth} sessions this month - amazing progress!` :
        'You\'ve been crushing your workouts! Don\'t let limits slow you down.',
      socialProof: '🔥 Join 10,000+ users who upgraded for unlimited access',
      offer: {
        discount: 25,
        timeLeft: '23:45:12',
        originalPrice: 999,
        discountedPrice: 749
      },
      cta: variant === 'A' ? 'Upgrade Now' : variant === 'B' ? 'Go Unlimited' : 'Remove Limits',
      variant
    },
    feature_interest: {
      reason: 'feature_interest',
      title: 'Unlock Your Full Potential',
      description: 'Based on your activity, these premium features would be perfect for you!',
      icon: Star,
      color: 'from-blue-500 to-purple-500',
      urgency: 'medium',
      features: ['Social challenges', 'Detailed analytics', 'Custom workout builder'],
      personalizedMessage: userData.favoriteFeatures?.length ? 
        `Since you love ${userData.favoriteFeatures[0]}, you'll love our premium analytics!` :
        'Your dedication deserves premium tools.',
      socialProof: '⭐ 95% of users say premium features transformed their workouts',
      cta: 'Explore Premium Features',
      variant
    },
    engagement_milestone: {
      reason: 'engagement_milestone',
      title: 'Celebrate Your Progress!',
      description: 'You\'ve reached an amazing milestone. Take your training to the next level!',
      icon: Crown,
      color: 'from-green-500 to-blue-500',
      urgency: 'medium',
      features: ['Achievement tracking', 'Progress insights', 'Community challenges'],
      personalizedMessage: userData.daysActive ? 
        `${userData.daysActive} days of consistent training - you're on fire! 🔥` :
        'You\'ve completed 10 workouts this month! Time to level up?',
      socialProof: '🏆 Top performers use premium features to stay ahead',
      cta: 'Level Up Now',
      variant
    },
    retention: {
      reason: 'retention',
      title: 'Welcome Back!',
      description: 'We\'ve missed you! Here\'s a special offer to restart your journey.',
      icon: Heart,
      color: 'from-purple-500 to-pink-500',
      urgency: 'low',
      features: ['Motivation tools', 'Streak tracking', 'Community support'],
      personalizedMessage: 'We\'ve saved your progress - let\'s get back on track together!',
      socialProof: '💪 Returning users achieve 2x better results with premium',
      offer: {
        discount: 40,
        timeLeft: '7 days',
        originalPrice: 999,
        discountedPrice: 599
      },
      cta: 'Restart Premium',
      variant
    },
    social_proof: {
      reason: 'social_proof',
      title: 'Join the Premium Community',
      description: 'See what thousands of users are achieving with premium features!',
      icon: Users,
      color: 'from-green-500 to-teal-500',
      urgency: 'medium',
      features: ['Community challenges', 'Leaderboards', 'Group motivation'],
      personalizedMessage: userData.socialConnections ? 
        `${userData.socialConnections} of your friends are already premium members!` :
        'Be part of our most successful fitness community.',
      socialProof: '🚀 Premium users are 3x more likely to reach their goals',
      cta: 'Join Premium Community',
      variant
    },
    limited_offer: {
      reason: 'limited_offer',
      title: 'Limited Time: 50% Off Premium!',
      description: 'This exclusive offer expires soon - don\'t miss out on premium features!',
      icon: Gift,
      color: 'from-red-500 to-pink-500',
      urgency: 'high',
      features: ['All premium features', '50% savings', 'Limited time only'],
      personalizedMessage: 'Exclusive offer just for dedicated users like you!',
      socialProof: '⚡ Over 500 users upgraded in the last 24 hours',
      offer: {
        discount: 50,
        timeLeft: formatTimeLeft(timeLeft),
        originalPrice: 999,
        discountedPrice: 499
      },
      cta: 'Claim 50% Off',
      variant
    },
    goal_achievement: {
      reason: 'goal_achievement',
      title: 'You\'re So Close to Your Goal!',
      description: 'Premium features can help you reach your fitness goals faster.',
      icon: Target,
      color: 'from-blue-500 to-green-500',
      urgency: 'medium',
      features: ['Goal tracking', 'Progress analytics', 'Smart recommendations'],
      personalizedMessage: userData.goalProgress ? 
        `${userData.goalProgress}% complete - premium features can help with the final push!` :
        'You\'re making great progress! Premium features can accelerate your results.',
      socialProof: '🎯 Premium users reach their goals 40% faster',
      cta: 'Accelerate Progress',
      variant
    }
  };

  function formatTimeLeft(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  // Countdown timer for limited offers
  useEffect(() => {
    if (trigger !== 'limited_offer') return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [trigger]);

  // Auto-hide for low urgency prompts
  useEffect(() => {
    const currentPrompt = promptData[trigger];
    if (currentPrompt.urgency === 'low') {
      const timer = setTimeout(() => {
        handleClose();
      }, 30000);
      return () => clearTimeout(timer);
    }
  }, [trigger]);

  const currentPrompt = promptData[trigger];
  const Icon = currentPrompt.icon;

  const handleUpgradeClick = () => {
    const premiumPlan = plans.find(plan => 
      plan.name.toLowerCase().includes('premium') && 
      plan.name.toLowerCase().includes('monthly')
    );
    if (premiumPlan) {
      upgrade(premiumPlan);
    }
    onUpgrade();
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          className="fixed bottom-6 right-6 z-50 max-w-md w-full"
        >
          <Card className="shadow-2xl border-0 overflow-hidden backdrop-blur-sm">
            {/* Header with gradient */}
            <div className={`bg-gradient-to-r ${currentPrompt.color} p-4 text-white relative overflow-hidden`}>
              {/* Animated background elements */}
              <motion.div
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 20, 
                  repeat: Infinity,
                  ease: "linear"
                }}
                className="absolute -top-4 -right-4 w-16 h-16 bg-white/10 rounded-full"
              />
              <motion.div
                animate={{ 
                  rotate: [360, 0],
                  scale: [1.1, 1, 1.1]
                }}
                transition={{ 
                  duration: 15, 
                  repeat: Infinity,
                  ease: "linear"
                }}
                className="absolute -bottom-2 -left-2 w-12 h-12 bg-white/10 rounded-full"
              />

              <button
                onClick={handleClose}
                className="absolute top-2 right-2 text-white/80 hover:text-white z-10"
              >
                <X className="w-4 h-4" />
              </button>
              
              <div className="flex items-center mb-3">
                <motion.div 
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity 
                  }}
                  className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-3"
                >
                  <Icon className="w-5 h-5" />
                </motion.div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge 
                      className={`bg-white/20 text-white border-white/30 text-xs ${
                        currentPrompt.urgency === 'high' ? 'animate-pulse' : ''
                      }`}
                    >
                      {currentPrompt.urgency === 'high' ? '🔥 Urgent' : 
                       currentPrompt.urgency === 'medium' ? '⭐ Recommended' : '🎁 Special Offer'}
                    </Badge>
                    {currentPrompt.offer && (
                      <Badge className="bg-yellow-500 text-yellow-900 text-xs animate-pulse">
                        -{currentPrompt.offer.discount}% OFF
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-bold text-lg leading-tight">{currentPrompt.title}</h3>
                </div>
              </div>
              
              <p className="text-white/90 text-sm">{currentPrompt.description}</p>

              {/* Countdown timer for limited offers */}
              {currentPrompt.offer && trigger === 'limited_offer' && (
                <div className="mt-3 p-2 bg-white/20 rounded-lg">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Time left:
                    </span>
                    <span className="font-mono font-bold">
                      {currentPrompt.offer.timeLeft}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <CardContent className="p-4 space-y-4">
              {/* Personalized message */}
              {currentPrompt.personalizedMessage && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-blue-50 p-3 rounded-lg border border-blue-100"
                >
                  <p className="text-sm text-blue-800 font-medium">
                    <Sparkles className="w-3 h-3 inline mr-1" />
                    {currentPrompt.personalizedMessage}
                  </p>
                </motion.div>
              )}

              {/* Social proof */}
              {currentPrompt.socialProof && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-center"
                >
                  <p className="text-xs text-gray-600 bg-gray-50 px-3 py-2 rounded-full">
                    {currentPrompt.socialProof}
                  </p>
                </motion.div>
              )}

              {/* Price comparison for offers */}
              {currentPrompt.offer && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-green-50 border border-green-200 rounded-lg p-3"
                >
                  <div className="text-center">
                    <p className="text-xs text-green-700 mb-1">Special Pricing</p>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-lg line-through text-gray-400">
                        ${(currentPrompt.offer.originalPrice / 100).toFixed(2)}
                      </span>
                      <span className="text-2xl font-bold text-green-600">
                        ${(currentPrompt.offer.discountedPrice / 100).toFixed(2)}
                      </span>
                    </div>
                    <p className="text-xs text-green-600">
                      Save ${((currentPrompt.offer.originalPrice - currentPrompt.offer.discountedPrice) / 100).toFixed(2)} per month!
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Features list */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-2 text-sm">You'll get:</h4>
                <ul className="space-y-1">
                  {currentPrompt.features.map((feature, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index + 0.5 }}
                      className="flex items-center text-sm text-gray-600"
                    >
                      <motion.div 
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ 
                          delay: 0.1 * index + 0.7,
                          duration: 0.3
                        }}
                        className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 flex-shrink-0" 
                      />
                      {feature}
                    </motion.li>
                  ))}
                </ul>
              </div>

              {/* Action buttons */}
              <div className="space-y-2">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    onClick={handleUpgradeClick}
                    className={`w-full bg-gradient-to-r ${currentPrompt.color} text-white hover:opacity-90 font-semibold`}
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    {currentPrompt.cta}
                    <ArrowRight className="w-3 h-3 ml-2" />
                  </Button>
                </motion.div>
                
                <button
                  onClick={handleClose}
                  className="w-full text-center text-sm text-gray-500 hover:text-gray-700 py-2 transition-colors"
                >
                  Maybe later
                </button>
              </div>

              {/* Urgency indicator */}
              {currentPrompt.urgency === 'high' && (
                <motion.div 
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="text-center"
                >
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">
                    ⏰ Limited time offer - Act now!
                  </Badge>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SmartUpgradePrompt;
