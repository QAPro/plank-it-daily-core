
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import WelcomeStep from './WelcomeStep';
import FitnessLevelStep from './FitnessLevelStep';
import GoalSelectionStep from './GoalSelectionStep';
import CompletionStep from './CompletionStep';

export type OnboardingStep = 'welcome' | 'fitness-level' | 'goals' | 'completion';

export interface OnboardingData {
  fitnessLevel: number;
  goals: string[];
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  preferredDuration: number;
  assessmentResult?: {
    duration: number;
    difficulty: number;
    notes?: string;
  };
}

const OnboardingFlow = ({ onComplete }: { onComplete: () => void }) => {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    fitnessLevel: 3,
    goals: [],
    experienceLevel: 'beginner',
    preferredDuration: 30,
  });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const updateOnboardingData = (updates: Partial<OnboardingData>) => {
    setOnboardingData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    const steps: OnboardingStep[] = ['welcome', 'fitness-level', 'goals', 'completion'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const prevStep = () => {
    const steps: OnboardingStep[] = ['welcome', 'fitness-level', 'goals', 'completion'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const completeOnboarding = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Update onboarding record
      const { error: onboardingError } = await supabase
        .from('user_onboarding')
        .update({
          fitness_level: onboardingData.fitnessLevel,
          goals: onboardingData.goals,
          experience_level: onboardingData.experienceLevel,
          preferred_duration: onboardingData.preferredDuration,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (onboardingError) throw onboardingError;

      toast({
        description: 'Your onboarding is complete. Ready to start your fitness journey?',
      });

      onComplete();
    } catch (error: any) {
      console.error('Error completing onboarding:', error);
      toast({
        title: 'Error',
        description: 'Failed to complete onboarding. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'welcome':
        return <WelcomeStep onNext={nextStep} />;
      case 'fitness-level':
        return (
          <FitnessLevelStep
            data={onboardingData}
            onUpdate={updateOnboardingData}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 'goals':
        return (
          <GoalSelectionStep
            data={onboardingData}
            onUpdate={updateOnboardingData}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 'completion':
        return (
          <CompletionStep
            data={onboardingData}
            onComplete={completeOnboarding}
            loading={loading}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="h-full"
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default OnboardingFlow;
