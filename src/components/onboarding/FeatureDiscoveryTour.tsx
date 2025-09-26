
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Star, BarChart3, Users, Zap, Crown, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSubscription } from '@/hooks/useSubscription';

type TourStep = {
  id: string;
  title: string;
  description: string;
  feature: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  benefits: string[];
  mockup?: React.ReactNode;
};

type FeatureDiscoveryTourProps = {
  onComplete: () => void;
  onSkip: () => void;
};

const FeatureDiscoveryTour: React.FC<FeatureDiscoveryTourProps> = ({ onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const { upgrade, plans } = useSubscription();

  const tourSteps: TourStep[] = [
    {
      id: 'advanced-stats',
      title: 'Advanced Statistics',
      description: 'Get detailed insights into your workout performance with comprehensive analytics.',
      feature: 'Premium',
      icon: BarChart3,
      color: 'from-blue-500 to-blue-600',
      benefits: [
        'Detailed progress charts',
        'Performance trends analysis',
        'Personal records tracking',
        'Weekly & monthly summaries'
      ],
      mockup: (
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-sm">This Week's Progress</h4>
            <Badge className="bg-green-100 text-green-800 text-xs">+15%</Badge>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>Average Hold Time</span>
              <span className="font-semibold">2:45</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '75%' }}></div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'smart-recommendations',
      title: 'Smart Recommendations',
      description: 'AI-powered workout suggestions tailored to your goals, progress, and preferences.',
      feature: 'Premium',
      icon: Zap,
      color: 'from-orange-500 to-red-500',
      benefits: [
        'Personalized workout plans',
        'Adaptive difficulty progression',
        'Goal-based recommendations',
        'Recovery time optimization'
      ],
      mockup: (
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center mb-3">
            <Zap className="w-4 h-4 text-orange-500 mr-2" />
            <span className="font-semibold text-sm">Recommended for You</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs bg-orange-50 p-2 rounded">
              <span>Advanced Plank Series</span>
              <Badge className="bg-orange-100 text-orange-800">Perfect Match</Badge>
            </div>
            <p className="text-xs text-gray-600">Based on your progress, try this challenging variation</p>
          </div>
        </div>
      )
    },
    {
      id: 'social-challenges',
      title: 'Social Challenges',
      description: 'Join community challenges, compete with friends, and stay motivated together.',
      feature: 'Premium',
      icon: Users,
      color: 'from-green-500 to-emerald-600',
      benefits: [
        'Weekly community challenges',
        'Friend competitions',
        'Leaderboards & rankings',
        'Achievement sharing'
      ],
      mockup: (
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <Users className="w-4 h-4 text-green-500 mr-2" />
              <span className="font-semibold text-sm">30-Day Plank Challenge</span>
            </div>
            <Badge className="bg-green-100 text-green-800 text-xs">3 days left</Badge>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>Your Rank</span>
              <span className="font-semibold">#12 of 250</span>
            </div>
            <div className="text-xs text-gray-600">You're ahead of 95% of participants!</div>
          </div>
        </div>
      )
    },
    {
      id: 'custom-workouts',
      title: 'Custom Workout Builder',
      description: 'Create personalized workout routines with our advanced workout builder.',
      feature: 'Premium',
      icon: Crown,
      color: 'from-purple-500 to-purple-600',
      benefits: [
        'Drag & drop workout builder',
        'Custom exercise combinations',
        'Save & share workouts',
        'Advanced timing controls'
      ],
      mockup: (
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center mb-3">
            <Crown className="w-4 h-4 text-purple-500 mr-2" />
            <span className="font-semibold text-sm">My Custom Workout</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs bg-purple-50 p-2 rounded">
              <span>Core Strength Circuit</span>
              <span className="text-purple-600">5 exercises</span>
            </div>
            <div className="text-xs text-gray-600">Your personalized 15-minute routine</div>
          </div>
        </div>
      )
    }
  ];

  const currentTourStep = tourSteps[currentStep];
  const isLastStep = currentStep === tourSteps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleUpgrade = () => {
    const targetPlan = plans.find(plan => plan.name.toLowerCase().includes('premium'));
    
    if (targetPlan) {
      upgrade(targetPlan);
    }
    onComplete();
  };

  const Icon = currentTourStep.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className={`bg-gradient-to-r ${currentTourStep.color} text-white p-6 rounded-t-xl relative`}>
            <button
              onClick={onSkip}
              className="absolute top-4 right-4 text-white/80 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-4">
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <Badge className="bg-white/20 text-white border-white/30 mb-2">
                  {currentTourStep.feature}
                </Badge>
                <h2 className="text-xl font-bold">{currentTourStep.title}</h2>
              </div>
            </div>
            
            <p className="text-white/90 text-sm">
              {currentTourStep.description}
            </p>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Mockup */}
            {currentTourStep.mockup && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Preview:</h4>
                {currentTourStep.mockup}
              </div>
            )}

            {/* Benefits */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">Key Benefits:</h4>
              <ul className="space-y-2">
                {currentTourStep.benefits.map((benefit, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center text-sm text-gray-600"
                  >
                    <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    {benefit}
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* Progress Indicator */}
            <div className="flex justify-center space-x-2">
              {tourSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentStep ? 'bg-blue-500' : 
                    index < currentStep ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t bg-gray-50 rounded-b-xl">
            <div className="flex justify-between items-center mb-4">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              
              <span className="text-sm text-gray-600">
                {currentStep + 1} of {tourSteps.length}
              </span>
              
              <Button onClick={handleNext}>
                {isLastStep ? 'Finish Tour' : 'Next'}
                {!isLastStep && <ChevronRight className="w-4 h-4 ml-1" />}
              </Button>
            </div>

            {/* Upgrade CTA */}
            <Button
              onClick={handleUpgrade}
              className={`w-full bg-gradient-to-r ${currentTourStep.color} text-white hover:opacity-90`}
            >
              <Star className="w-4 h-4 mr-2" />
              Upgrade to {currentTourStep.feature}
            </Button>
            
            <button
              onClick={onSkip}
              className="w-full text-center text-sm text-gray-500 mt-2 hover:text-gray-700"
            >
              Skip tour
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FeatureDiscoveryTour;
