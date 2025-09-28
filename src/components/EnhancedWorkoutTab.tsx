
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, TrendingUp } from 'lucide-react';
import { QuickStartButton } from '@/components/QuickStartButton';
import { ProgressionSuggestion } from '@/components/ProgressionSuggestion';
import { useQuickStart } from '@/hooks/useQuickStart';
import { useAuth } from '@/contexts/AuthContext';
import { useExercises } from '@/hooks/useExercises';
import WorkoutTab from '@/components/tabs/WorkoutTab';

const EnhancedWorkoutTab = () => {
  const { user } = useAuth();
  const { data: exercises } = useExercises();
  const { quickStartData, nextChallenge, isLoading, getProgressionSuggestion } = useQuickStart();
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [progressionSuggestion, setProgressionSuggestion] = useState<any>(null);

  // Handle quick start from URL parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const quickStart = urlParams.get('quick-start');
    
    if (quickStart === 'true' && quickStartData) {
      handleQuickStart();
    }
  }, [quickStartData]);

  const handleQuickStart = () => {
    if (!quickStartData || !exercises) return;
    
    const exercise = exercises.find(ex => ex.id === quickStartData.exerciseId);
    if (exercise) {
      // This would trigger the workout to start
      console.log('Starting quick workout:', exercise);
      // Implementation would integrate with existing workout flow
    }
  };

  const loadProgressionSuggestion = async () => {
    if (!quickStartData || !user) return;
    
    const suggestion = await getProgressionSuggestion(quickStartData.exerciseId, quickStartData.duration);
    if (suggestion) {
      setProgressionSuggestion(suggestion);
      setShowSuggestion(true);
    }
  };

  const handleAcceptSuggestion = (newValue: number) => {
    setShowSuggestion(false);
    console.log('Accepted suggestion for duration:', newValue);
    // Implementation would update the workout setup
  };

  const handleDismissSuggestion = () => {
    setShowSuggestion(false);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-3/4"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Start Section */}
      {quickStartData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6"
        >
          <div className="space-y-4">
            {nextChallenge && (
              <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-sm text-primary font-medium">
                    <TrendingUp className="h-4 w-4" />
                    <span>{nextChallenge}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            <QuickStartButton
              quickStartData={quickStartData}
              onQuickStart={handleQuickStart}
            />

            <div className="flex gap-2">
              <button
                onClick={loadProgressionSuggestion}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Get progression suggestion →
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Progression Suggestion */}
      {showSuggestion && progressionSuggestion && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="px-6"
        >
          <ProgressionSuggestion
            suggestion={progressionSuggestion}
            onAccept={handleAcceptSuggestion}
            onDismiss={handleDismissSuggestion}
          />
        </motion.div>
      )}

      {/* Standard Workout Tab Content */}
      <WorkoutTab />
    </div>
  );
};

export default EnhancedWorkoutTab;