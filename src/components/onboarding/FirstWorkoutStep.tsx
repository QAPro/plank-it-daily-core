
import { useState } from 'react';
import SessionCompletionCelebration from '@/components/SessionCompletionCelebration';
import WorkoutHeader from './workout/WorkoutHeader';
import WorkoutTimer from './workout/WorkoutTimer';
import WorkoutActions from './workout/WorkoutActions';
import { useFirstWorkoutTimer } from '@/hooks/useFirstWorkoutTimer';
import { OnboardingData } from './OnboardingFlow';

interface FirstWorkoutStepProps {
  data: OnboardingData;
  onNext: () => void;
  onBack: () => void;
}

const FirstWorkoutStep = ({ data, onNext, onBack }: FirstWorkoutStepProps) => {
  const [showCelebration, setShowCelebration] = useState(false);

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

  const handleComplete = () => {
    setShowCelebration(true);
  };

  const {
    isActive,
    time,
    hasCompleted,
    progress,
    startTimer,
    stopTimer,
    resetTimer,
    formatTime,
  } = useFirstWorkoutTimer({
    targetTime,
    onComplete: handleComplete,
  });

  const handleResetTimer = () => {
    resetTimer();
    setShowCelebration(false);
  };

  return (
    <>
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md">
          <WorkoutHeader
            targetTime={targetTime}
            onBack={onBack}
            formatTime={formatTime}
          />

          <WorkoutTimer
            time={time}
            targetTime={targetTime}
            progress={progress}
            isActive={isActive}
            hasCompleted={hasCompleted}
            formatTime={formatTime}
            onStart={startTimer}
            onStop={stopTimer}
            onReset={handleResetTimer}
          />

          <WorkoutActions
            hasCompleted={hasCompleted}
            time={time}
            formatTime={formatTime}
            onNext={onNext}
          />
        </div>
      </div>

      {/* Session Completion Celebration */}
      <SessionCompletionCelebration
        isVisible={showCelebration}
        exercise={mockExercise}
        duration={targetTime}
        timeElapsed={time}
        onClose={() => setShowCelebration(false)}
        onDoAgain={handleResetTimer}
      />
    </>
  );
};

export default FirstWorkoutStep;
