
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Crown, Star, ArrowRight, Timer, BarChart3, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSubscription } from '@/hooks/useSubscription';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';

type UpgradeReason = 'usage_limit' | 'feature_interest' | 'engagement_milestone' | 'retention';

type SmartPromptData = {
  reason: UpgradeReason;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  urgency: 'low' | 'medium' | 'high';
  features: string[];
  personalizedMessage?: string;
};

type SmartUpgradePromptProps = {
  trigger: UpgradeReason;
  onClose: () => void;
  onUpgrade: () => void;
};

const SmartUpgradePrompt: React.FC<SmartUpgradePromptProps> = ({ trigger, onClose, onUpgrade }) => {
  const [isVisible, setIsVisible] = useState(true);
  const { active, upgrade, plans } = useSubscription();
  const { tier } = useFeatureAccess();

  // Don't show if user already has premium
  if (active || tier !== 'free') {
    return null;
  }

  const promptData: Record<UpgradeReason, SmartPromptData> = {
    usage_limit: {
      reason: 'usage_limit',
      title: 'You\'re close to your limit!',
      description: 'Upgrade now to continue your fitness journey without interruptions.',
      icon: Timer,
      color: 'from-orange-500 to-red-500',
      urgency: 'high',
      features: ['Unlimited workouts', 'Advanced statistics', 'Smart recommendations'],
      personalizedMessage: 'You\'ve been crushing your workouts! Don\'t let limits slow you down.'
    },
    feature_interest: {
      reason: 'feature_interest',
      title: 'Unlock Advanced Features',
      description: 'Based on your activity, these premium features would be perfect for you!',
      icon: Star,
      color: 'from-blue-500 to-purple-500',
      urgency: 'medium',
      features: ['Social challenges', 'Detailed analytics', 'Custom workout builder'],
      personalizedMessage: 'Your dedication deserves premium tools.'
    },
    engagement_milestone: {
      reason: 'engagement_milestone',
      title: 'Celebrate Your Progress!',
      description: 'You\'ve reached an amazing milestone. Take your training to the next level!',
      icon: Crown,
      color: 'from-green-500 to-blue-500',
      urgency: 'medium',
      features: ['Achievement tracking', 'Progress insights', 'Community challenges'],
      personalizedMessage: 'You\'ve completed 10 workouts this month! Time to level up?'
    },
    retention: {
      reason: 'retention',
      title: 'Welcome Back!',
      description: 'We\'ve missed you! Here\'s a special offer to restart your journey.',
      icon: Users,
      color: 'from-purple-500 to-pink-500',
      urgency: 'low',
      features: ['Motivation tools', 'Streak tracking', 'Community support'],
      personalizedMessage: 'Your fitness journey matters. Let\'s get back on track together.'
    }
  };

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

  // Auto-hide after 30 seconds for low urgency prompts
  useEffect(() => {
    if (currentPrompt.urgency === 'low') {
      const timer = setTimeout(() => {
        handleClose();
      }, 30000);
      return () => clearTimeout(timer);
    }
  }, [currentPrompt.urgency]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          className="fixed bottom-6 right-6 z-50 max-w-sm w-full"
        >
          <Card className="shadow-xl border-0 overflow-hidden">
            {/* Header with gradient */}
            <div className={`bg-gradient-to-r ${currentPrompt.color} p-4 text-white relative`}>
              <button
                onClick={handleClose}
                className="absolute top-2 right-2 text-white/80 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
              
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-3">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <Badge 
                    className={`bg-white/20 text-white border-white/30 text-xs ${
                      currentPrompt.urgency === 'high' ? 'animate-pulse' : ''
                    }`}
                  >
                    {currentPrompt.urgency === 'high' ? 'Urgent' : 
                     currentPrompt.urgency === 'medium' ? 'Recommended' : 'Special Offer'}
                  </Badge>
                </div>
              </div>
              
              <h3 className="font-bold text-lg mb-1">{currentPrompt.title}</h3>
              <p className="text-white/90 text-sm">{currentPrompt.description}</p>
            </div>

            <CardContent className="p-4 space-y-4">
              {/* Personalized message */}
              {currentPrompt.personalizedMessage && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-700 italic">
                    "{currentPrompt.personalizedMessage}"
                  </p>
                </div>
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
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center text-sm text-gray-600"
                    >
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2" />
                      {feature}
                    </motion.li>
                  ))}
                </ul>
              </div>

              {/* Action buttons */}
              <div className="space-y-2">
                <Button 
                  onClick={handleUpgradeClick}
                  className={`w-full bg-gradient-to-r ${currentPrompt.color} text-white hover:opacity-90`}
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade to Premium
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
                
                <button
                  onClick={handleClose}
                  className="w-full text-center text-sm text-gray-500 hover:text-gray-700 py-1"
                >
                  Maybe later
                </button>
              </div>

              {/* Limited time offer for high urgency */}
              {currentPrompt.urgency === 'high' && (
                <div className="text-center">
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">
                    ⏰ Don't lose your progress!
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SmartUpgradePrompt;
