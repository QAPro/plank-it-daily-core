
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Play, Pause, RotateCcw, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import SessionCompletionCelebration from '@/components/SessionCompletionCelebration';
import { OnboardingData } from './OnboardingFlow';

interface FirstWorkoutStepProps {
  data: OnboardingData;
  onNext: () => void;
  onBack: () => void;
}

const FirstWorkoutStep = ({ data, onNext, onBack }: FirstWorkoutStepProps) => {
  const [isActive, setIsActive] = useState(false);
  const [time, setTime] = useState(0);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const { user } = useAuth();

  // Determine target time based on fitness level and assessment
  const getTargetTime = () => {
    if (data.assessmentResult) {
      return Math.max(15, Math.floor(data.assessmentResult.duration * 0.7));
    }
    
    switch (data.fitnessLevel) {
      case 1: return 15;
      case 2: return 20;
      case 3: return 30;
      case 4: return 45;
      case 5: return 60;
      default: return 30;
    }
  };

  const targetTime = getTargetTime();

  // Mock exercise for celebration component
  const mockExercise = {
    id: 'onboarding-plank',
    name: 'First Plank',
    difficulty_level: data.fitnessLevel || 1,
    description: 'Your first plank workout',
    created_at: new Date().toISOString(),
    image_url: null,
    instructions: null
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive) {
      interval = setInterval(() => {
        setTime(time => {
          const newTime = time + 1;
          if (newTime >= targetTime && !hasCompleted) {
            setIsActive(false);
            setHasCompleted(true);
            setShowCelebration(true);
          }
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, targetTime, hasCompleted]);

  const startTimer = () => {
    setIsActive(true);
    setTime(0);
    setHasCompleted(false);
  };

  const stopTimer = async () => {
    setIsActive(false);
    if (time >= 10) { // Only count as completed if they held for at least 10 seconds
      setHasCompleted(true);
      setShowCelebration(true);
      await saveWorkoutSession();
    }
  };

  const resetTimer = () => {
    setIsActive(false);
    setTime(0);
    setHasCompleted(false);
    setShowCelebration(false);
  };

  const saveWorkoutSession = async () => {
    if (!user) return;
    
    try {
      // Save the workout session
      await supabase.from('user_sessions').insert({
        user_id: user.id,
        duration_seconds: time,
        notes: 'First onboarding workout'
      });

      // Update streak (this will be handled by the streak system)
      console.log('First workout completed:', time, 'seconds');
    } catch (error) {
      console.error('Error saving workout session:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = Math.min((time / targetTime) * 100, 100);

  return (
    <>
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md">
          <motion.button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-orange-500 mb-8 transition-colors"
            whileHover={{ x: -5 }}
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back
          </motion.button>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-center mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Your First Workout!</h2>
            <p className="text-gray-600 mb-4">
              Let's do a {formatTime(targetTime)} plank to start your journey
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800">
              <p className="font-medium">You've got this! 💪</p>
              <p>Focus on your form and breathe steadily</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-orange-100 mb-6">
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                <motion.div
                  className="bg-gradient-to-r from-orange-500 to-amber-500 h-3 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              
              <div className="text-6xl font-mono font-bold text-orange-600 mb-2">
                {formatTime(time)}
              </div>
              
              <div className="text-sm text-gray-600 mb-4">
                Target: {formatTime(targetTime)}
              </div>
              
              {hasCompleted && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center justify-center text-green-600 mb-4"
                >
                  <CheckCircle className="w-8 h-8 mr-2" />
                  <span className="text-lg font-semibold">Completed!</span>
                </motion.div>
              )}
              
              <div className="flex justify-center space-x-4">
                {!isActive && time === 0 && (
                  <Button
                    onClick={startTimer}
                    className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-xl flex items-center space-x-2 text-lg"
                  >
                    <Play className="w-6 h-6" />
                    <span>Start Workout</span>
                  </Button>
                )}
                
                {isActive && (
                  <Button
                    onClick={stopTimer}
                    className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-xl flex items-center space-x-2 text-lg"
                  >
                    <Pause className="w-6 h-6" />
                    <span>Finish</span>
                  </Button>
                )}
                
                {time > 0 && !isActive && (
                  <Button
                    onClick={resetTimer}
                    variant="outline"
                    className="px-6 py-3 rounded-xl flex items-center space-x-2"
                  >
                    <RotateCcw className="w-5 h-5" />
                    <span>Try Again</span>
                  </Button>
                )}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {hasCompleted ? (
              <Button
                onClick={onNext}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold py-4 rounded-xl text-lg"
              >
                Amazing! Let's Finish Setup
              </Button>
            ) : (
              <Button
                onClick={onNext}
                variant="outline"
                className="w-full py-3 rounded-xl"
              >
                Skip First Workout
              </Button>
            )}
            
            {hasCompleted && time > 0 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-sm text-gray-600 mt-3"
              >
                🎉 You completed your first plank in {formatTime(time)}!
              </motion.p>
            )}
          </motion.div>
        </div>
      </div>

      {/* Session Completion Celebration */}
      <SessionCompletionCelebration
        isVisible={showCelebration}
        exercise={mockExercise}
        duration={targetTime}
        timeElapsed={time}
        onClose={() => setShowCelebration(false)}
        onDoAgain={resetTimer}
      />
    </>
  );
};

export default FirstWorkoutStep;
