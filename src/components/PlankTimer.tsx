
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, Square, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { useEnhancedSessionTracking } from '@/hooks/useEnhancedSessionTracking';
import SessionCompletionCelebration from './SessionCompletionCelebration';
import CoachingOverlay from '@/components/timer/CoachingOverlay';
import BreathingGuide from '@/components/timer/BreathingGuide';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useCoachingMessages } from '@/hooks/useCoachingMessages';

interface PlankTimerProps {
  selectedExercise: any;
  onExerciseChange: (exercise: any) => void;
}

const PlankTimer = ({ selectedExercise, onExerciseChange }: PlankTimerProps) => {
  const {
    exercises,
    isLoadingExercises,
    isTimerRunning,
    sessionDuration,
    startSession,
    pauseSession,
    resumeSession,
    endSession,
    completeSession,
    completedSession,
    sessionNotes,
    setSessionNotes,
    isCompleting
  } = useEnhancedSessionTracking();

  const { preferences } = useUserPreferences();
  const { randomOfType } = useCoachingMessages();

  const [showCelebration, setShowCelebration] = useState(false);
  const [coachMessage, setCoachMessage] = useState<string | null>(null);
  const [coachVisible, setCoachVisible] = useState(false);

  useEffect(() => {
    if (completedSession) {
      setShowCelebration(true);
    }
  }, [completedSession]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    if (selectedExercise) {
      startSession(selectedExercise);
      toast.success('Timer started! Hold that plank!');
    } else {
      toast.error('Please select an exercise first');
    }
  };

  const handlePause = () => {
    pauseSession();
    toast.info('Timer paused');
  };

  const handleResume = () => {
    resumeSession();
    toast.success('Timer resumed');
  };

  const handleStop = () => {
    endSession();
    toast.info('Timer stopped');
  };

  const handleComplete = async () => {
    if (sessionDuration === 0) {
      toast.error('Cannot complete a session with 0 duration');
      return;
    }

    await completeSession(sessionDuration, sessionNotes);
  };

  const handleReset = () => {
    endSession();
    // Reset duration will happen automatically when starting a new session
  };

  const handleCloseCelebration = () => {
    setShowCelebration(false);
    handleReset();
  };

  // Coaching message surfacing every ~20s while running
  useEffect(() => {
    if (!isTimerRunning) {
      setCoachVisible(false);
      return;
    }
    if (sessionDuration > 0 && sessionDuration % 20 === 0) {
      const msg = preferences?.form_reminders
        ? randomOfType('form_reminder') || randomOfType('encouragement')
        : randomOfType('encouragement');
      if (msg) {
        setCoachMessage(msg);
        setCoachVisible(true);
        const t = setTimeout(() => setCoachVisible(false), 5000);
        return () => clearTimeout(t);
      }
    }
  }, [isTimerRunning, sessionDuration, preferences?.form_reminders, randomOfType]);

  if (isLoadingExercises) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading exercises...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center">
            {selectedExercise ? selectedExercise.name : 'Select an Exercise'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Exercise Selection */}
          {exercises && exercises.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Choose Exercise:</label>
              <select
                value={selectedExercise?.id || ''}
                onChange={(e) => {
                  const exercise = exercises.find(ex => ex.id === e.target.value);
                  if (exercise) onExerciseChange(exercise);
                }}
                className="w-full p-2 border rounded-md"
                disabled={isTimerRunning}
              >
                <option value="">Select an exercise...</option>
                {exercises.map((exercise) => (
                  <option key={exercise.id} value={exercise.id}>
                    {exercise.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Timer Display */}
          <div className="text-center">
            <div className="text-6xl font-mono font-bold text-primary mb-4">
              {formatTime(sessionDuration)}
            </div>
            
            {selectedExercise && (
              <div className="text-sm text-gray-600 mb-4">
                <p>Difficulty: Level {selectedExercise.difficulty_level}</p>
                <p>Primary Muscles: {selectedExercise.primary_muscles?.join(', ')}</p>
              </div>
            )}
          </div>

          {/* Coaching + Breathing */}
          <div className="space-y-3">
            <CoachingOverlay message={coachMessage} visible={coachVisible} />
            <BreathingGuide enabled={Boolean(preferences?.breathing_guidance)} running={isTimerRunning} />
          </div>

          {/* Timer Controls */}
          <div className="flex justify-center space-x-2">
            {!isTimerRunning ? (
              <>
                <Button
                  onClick={handleStart}
                  disabled={!selectedExercise || sessionDuration > 0}
                  className="flex items-center space-x-2"
                >
                  <Play className="w-4 h-4" />
                  <span>Start</span>
                </Button>
                {sessionDuration > 0 && (
                  <Button
                    onClick={handleResume}
                    variant="outline"
                    className="flex items-center space-x-2"
                  >
                    <Play className="w-4 h-4" />
                    <span>Resume</span>
                  </Button>
                )}
              </>
            ) : (
              <Button
                onClick={handlePause}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <Pause className="w-4 h-4" />
                <span>Pause</span>
              </Button>
            )}

            {sessionDuration > 0 && (
              <>
                <Button
                  onClick={handleComplete}
                  disabled={isCompleting}
                  className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
                >
                  <Square className="w-4 h-4" />
                  <span>{isCompleting ? 'Saving...' : 'Complete'}</span>
                </Button>
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset</span>
                </Button>
              </>
            )}
          </div>

          {/* Session Notes */}
          {sessionDuration > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Session Notes (Optional):</label>
              <textarea
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                placeholder="How did this session feel? Any observations?"
                rows={3}
                className="w-full p-2 border rounded-md text-sm"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Session Completion Celebration */}
      {showCelebration && completedSession && (
        <SessionCompletionCelebration
          isVisible={showCelebration}
          duration={completedSession.duration}
          timeElapsed={completedSession.duration}
          exercise={completedSession.exercise}
          newAchievements={completedSession.achievements}
          onClose={handleCloseCelebration}
        />
      )}
    </>
  );
};

export default PlankTimer;
