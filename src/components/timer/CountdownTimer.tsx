
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, Square, RotateCcw, Volume2, VolumeX, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import TimerSetup from '@/components/TimerSetup';
import CircularProgressTimer from './CircularProgressTimer';
import EnhancedConfetti from '@/components/celebration/EnhancedConfetti';
import { useCountdownTimer } from '@/hooks/useCountdownTimer';
import { useEnhancedTimerAudio } from '@/hooks/useEnhancedTimerAudio';
import { useEnhancedSessionTracking } from '@/hooks/useEnhancedSessionTracking';
import SessionCompletionCelebration from '@/components/session/SessionCompletionCelebration';

interface CountdownTimerProps {
  selectedExercise: any;
  onBack: () => void;
  onExerciseChange: (exercise: any) => void;
  quickStartDuration?: number;
}

const CountdownTimer = ({ selectedExercise, onBack, onExerciseChange, quickStartDuration }: CountdownTimerProps) => {
  const [showSetup, setShowSetup] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [user, setUser] = useState<any>(null);

  // Track auth state
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      console.log('🔐 AUTH STATE:', session?.user ? `Logged in as ${session.user.id}` : 'NOT LOGGED IN');
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      console.log('🔐 AUTH CHANGED:', event, session?.user ? `User ${session.user.id}` : 'No user');
    });

    return () => subscription.unsubscribe();
  }, []);
  
  const {
    soundEnabled,
    countdownSoundsEnabled,
    playCompletionSound,
    playCountdownSound,
    toggleSound,
    toggleCountdownSounds,
  } = useEnhancedTimerAudio();

  const {
    completeSession,
    completedSession,
    clearCompletedSession,
    sessionNotes,
    setSessionNotes,
    isCompleting,
    selectExercise,
    handleFeedbackSubmission,
    autoLogFriction
  } = useEnhancedSessionTracking();

  const durationRef = useRef(60);
  const sessionNotesRef = useRef('');
  
  // Keep refs in sync
  sessionNotesRef.current = sessionNotes;

  const {
    duration,
    timeLeft,
    state,
    progress,
    setTimerDuration,
    handleStart,
    handlePause,
    handleResume,
    handleStop,
    handleReset,
  } = useCountdownTimer({
    initialDuration: 60,
    onComplete: useCallback(async (wasCompleted: boolean) => {
      console.log('🎯 TIMER COMPLETED:', { 
        wasCompleted, 
        user: user?.id,
        timestamp: new Date().toISOString()
      });
      setDebugInfo(`⏱️ Timer finished! Calling completeSession...`);
      
      if (wasCompleted) {
        setShowConfetti(true);
        console.log('🎉 CALLING completeSession()', {
          duration: durationRef.current,
          notes: sessionNotesRef.current,
          timestamp: new Date().toISOString()
        });
        
        try {
          await completeSession(durationRef.current, sessionNotesRef.current);
          console.log('✅ completeSession() FINISHED SUCCESSFULLY');
          setDebugInfo('✅ Session saved!');
          
          // Force celebration regardless of completeSession result
          setTimeout(() => {
            console.log('🎊 FORCING celebration dialog');
            setShowCelebration(true);
          }, 500);
        } catch (error) {
          console.error('❌ completeSession() FAILED:', error);
          setDebugInfo(`❌ Error: ${error}`);
          toast.error('Failed to save session, but great work!');
          
          // Still show celebration even on error
          setShowCelebration(true);
        }
      }
    }, [user?.id, completeSession, durationRef, sessionNotesRef, setDebugInfo, setShowConfetti, setShowCelebration]),
    onPlayCompletionSound: playCompletionSound,
    onPlayCountdownSound: countdownSoundsEnabled ? playCountdownSound : undefined,
  });
  
  // Keep duration ref in sync
  useEffect(() => {
    durationRef.current = duration;
  }, [duration]);

  // If quickStartDuration is provided, bypass setup and auto-start
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof quickStartDuration === 'number' && quickStartDuration > 0) {
      setTimerDuration(quickStartDuration);
      setShowSetup(false);
      // Slight delay to ensure state updates before start
      setTimeout(() => handleStart(), 50);
    }
  }, [quickStartDuration, setTimerDuration, handleStart]);

  // Sync selectedExercise prop with hook's internal state
  useEffect(() => {
    if (selectedExercise) {
      selectExercise(selectedExercise);
    }
  }, [selectedExercise, selectExercise]);

  // Show celebration when session completes
  useEffect(() => {
    console.log('🎊 completedSession changed:', completedSession);
    if (completedSession) {
      console.log('🎊 Setting showCelebration to true');
      setShowCelebration(true);
    }
  }, [completedSession]);

  const handleSetDuration = (newDuration: number) => {
    console.log('⏰ handleSetDuration:', newDuration);
    setTimerDuration(newDuration);
    setShowSetup(false);
    toast.success(`Timer set for ${Math.floor(newDuration / 60)}:${(newDuration % 60).toString().padStart(2, '0')}`);
  };

  const handleStartTimer = () => {
    console.log('▶️ Timer STARTED');
    handleStart();
    toast.success('Timer started! You can do this!');
  };

  const handlePauseTimer = () => {
    console.log('⏸️ Timer PAUSED');
    handlePause();
    toast.info('Timer paused');
    
    // Log friction point for early pause
    if (duration - timeLeft < duration * 0.3) { // Paused before 30% completion
      autoLogFriction('timer', 'confusion', {
        pause_time: duration - timeLeft,
        completion_percentage: ((duration - timeLeft) / duration) * 100,
        reason: 'early_pause'
      }).catch(console.error);
    }
  };

  const handleResumeTimer = () => {
    console.log('▶️ Timer RESUMED');
    handleResume();
    toast.success('Timer resumed');
  };

  const handleStopTimer = () => {
    console.log('⏹️ Timer STOPPED');
    handleStop();
    toast.info('Timer stopped');
    
    // Log friction point for early stop (abandonment)
    autoLogFriction('timer', 'abandonment', {
      stop_time: duration - timeLeft,
      completion_percentage: ((duration - timeLeft) / duration) * 100,
      reason: 'user_stopped'
    }).catch(console.error);
  };

  const handleResetTimer = () => {
    console.log('🔄 Timer RESET');
    handleReset();
    setShowConfetti(false);
    setShowCelebration(false);
    clearCompletedSession();
    setDebugInfo('');
  };

  const handleCloseCelebration = () => {
    console.log('❌ Closing celebration');
    setShowCelebration(false);
    setShowConfetti(false);
    clearCompletedSession();
    handleResetTimer();
  };

  if (showSetup) {
    return (
      <TimerSetup
        exercise={selectedExercise}
        onStart={handleSetDuration}
        onBack={onBack}
        onComplete={async (duration) => {
          console.log('🎯 Timer completed in TimerSetup:', duration);
          setShowSetup(false);
          setShowConfetti(true);
          await completeSession(duration, sessionNotes || '');
        }}
      />
    );
  }

  return (
    <>
      <div className="w-full max-w-md mx-auto space-y-6 relative">
        {/* Debug Banner - Always Visible */}
        {debugInfo && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg font-mono text-sm max-w-md">
            {debugInfo}
          </div>
        )}

        {/* Auth Status Indicator */}
        <div className={`text-center text-xs py-2 px-4 rounded-lg ${user ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {user ? `✅ Logged in: ${user.id?.substring(0, 8)}...` : '⚠️ NOT LOGGED IN - Progress will not be saved!'}
        </div>

        {/* Enhanced Confetti */}
        <EnhancedConfetti 
          isActive={showConfetti} 
          intensity="epic"
          duration={3000}
        />

        {/* Exercise Header */}
        <Card>
          <CardHeader className="text-center pb-2">
            <CardTitle className="flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={onBack}>
                ← Back
              </Button>
              <span className="text-lg">{selectedExercise?.name}</span>
              <div className="flex space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleSound}
                  className="p-2"
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleCountdownSounds}
                  className="p-2"
                  disabled={!soundEnabled}
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </CardTitle>
            {selectedExercise && (
              <p className="text-sm text-gray-600">
                Level {selectedExercise.difficulty_level}
                {selectedExercise.exercise_categories && ` • ${selectedExercise.exercise_categories.name}`}
              </p>
            )}
          </CardHeader>
        </Card>

        {/* Circular Progress Timer */}
        <CircularProgressTimer
          timeLeft={timeLeft}
          duration={duration}
          state={state}
          progress={progress}
        />

        {/* Timer Controls */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-center space-x-3 mb-4">
              <AnimatePresence mode="wait">
                {state === 'ready' && (
                  <motion.div
                    key="start"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <Button
                      onClick={handleStartTimer}
                      size="lg"
                      className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8"
                    >
                      <Play className="w-5 h-5 mr-2" />
                      Start Timer
                    </Button>
                  </motion.div>
                )}

                {state === 'running' && (
                  <motion.div
                    key="pause"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <Button
                      onClick={handlePauseTimer}
                      size="lg"
                      className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white px-8"
                    >
                      <Pause className="w-5 h-5 mr-2" />
                      Pause
                    </Button>
                  </motion.div>
                )}

                {state === 'paused' && (
                  <motion.div
                    key="resume"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex space-x-3"
                  >
                    <Button
                      onClick={handleResumeTimer}
                      size="lg"
                      className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                    >
                      <Play className="w-5 h-5 mr-2" />
                      Resume
                    </Button>
                    <Button
                      onClick={handleStopTimer}
                      variant="outline"
                      size="lg"
                    >
                      <Square className="w-5 h-5 mr-2" />
                      Stop
                    </Button>
                  </motion.div>
                )}

                {state === 'completed' && (
                  <motion.div
                    key="completed"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <Button
                      onClick={handleResetTimer}
                      size="lg"
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-8"
                    >
                      <RotateCcw className="w-5 h-5 mr-2" />
                      Do Again
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Reset Button (always available when timer is set up) */}
            {state !== 'completed' && (
              <div className="text-center">
                <Button
                  onClick={handleResetTimer}
                  variant="ghost"
                  size="sm"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset Timer
                </Button>
              </div>
            )}

            {/* Session Notes */}
            {(state === 'paused' || state === 'completed') && (
              <div className="mt-4 space-y-2">
                <label className="text-sm font-medium">Session Notes (Optional):</label>
                <textarea
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  placeholder="How is this workout feeling? Any observations?"
                  rows={3}
                  className="w-full p-2 border rounded-md text-sm"
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Session Completion Celebration */}
      {showCelebration && completedSession && (
        <SessionCompletionCelebration
          session={{
            id: completedSession.id,
            exercise_name: completedSession.exercise?.name || 'Exercise',
            duration_seconds: completedSession.duration,
            completed_at: completedSession.timestamp
          }}
          achievements={completedSession.achievements}
          onContinue={handleCloseCelebration}
          onViewStats={() => {/* TODO: Implement stats view */}}
          onShare={() => {/* TODO: Implement sharing */}}
          onFeedbackSubmit={handleFeedbackSubmission}
        />
      )}
    </>
  );
};

export default CountdownTimer;
