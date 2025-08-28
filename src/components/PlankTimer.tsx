
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEnhancedSessionTracking } from '@/hooks/useEnhancedSessionTracking';
import CountdownTimer from '@/components/timer/CountdownTimer';

interface PlankTimerProps {
  selectedExercise: any;
  onExerciseChange: (exercise: any) => void;
  onBack?: () => void;
}

const PlankTimer = ({ selectedExercise, onExerciseChange, onBack }: PlankTimerProps) => {
  const {
    exercises,
    isLoadingExercises,
  } = useEnhancedSessionTracking();

  const [currentExercise, setCurrentExercise] = useState(selectedExercise);

  useEffect(() => {
    if (selectedExercise) {
      setCurrentExercise(selectedExercise);
    }
  }, [selectedExercise]);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      // Fallback for backward compatibility
      window.history.back();
    }
  };

  if (isLoadingExercises) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading exercises...</div>
        </CardContent>
      </Card>
    );
  }

  if (!currentExercise && exercises && exercises.length > 0) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Select an Exercise</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Choose Exercise:</label>
            <select
              value=""
              onChange={(e) => {
                const exercise = exercises.find(ex => ex.id === e.target.value);
                if (exercise) {
                  setCurrentExercise(exercise);
                  onExerciseChange(exercise);
                }
              }}
              className="w-full p-2 border rounded-md"
            >
              <option value="">Select an exercise...</option>
              {exercises.map((exercise) => (
                <option key={exercise.id} value={exercise.id}>
                  {exercise.name}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <CountdownTimer
      selectedExercise={currentExercise}
      onBack={handleBack}
      onExerciseChange={onExerciseChange}
    />
  );
};

export default PlankTimer;
