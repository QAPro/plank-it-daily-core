
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OnboardingData } from './OnboardingFlow';

interface AssessmentStepProps {
  data: OnboardingData;
  onUpdate: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const AssessmentStep = ({ data, onUpdate, onNext, onBack }: AssessmentStepProps) => {
  const [isActive, setIsActive] = useState(false);
  const [time, setTime] = useState(0);
  const [difficulty, setDifficulty] = useState<number>(3);
  const [hasCompleted, setHasCompleted] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive) {
      interval = setInterval(() => {
        setTime(time => time + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const startTimer = () => {
    setIsActive(true);
    setTime(0);
  };

  const stopTimer = () => {
    setIsActive(false);
    setHasCompleted(true);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTime(0);
    setHasCompleted(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleContinue = () => {
    onUpdate({
      assessmentResult: {
        duration: time,
        difficulty,
        notes: `Initial plank assessment: ${formatTime(time)}`
      }
    });
    onNext();
  };

  const skipAssessment = () => {
    onNext();
  };

  return (
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
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Quick Plank Assessment</h2>
          <p className="text-gray-600 mb-4">
            Let's see how long you can hold a plank to customize your workouts
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
            <p className="font-medium mb-1">Instructions:</p>
            <p>Get into plank position and hold as long as you can. Don't worry about the time - even 10 seconds is great!</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-orange-100 mb-6">
            <div className="text-6xl font-mono font-bold text-orange-600 mb-4">
              {formatTime(time)}
            </div>
            
            <div className="flex justify-center space-x-4">
              {!isActive && time === 0 && (
                <Button
                  onClick={startTimer}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-xl flex items-center space-x-2"
                >
                  <Play className="w-5 h-5" />
                  <span>Start</span>
                </Button>
              )}
              
              {isActive && (
                <Button
                  onClick={stopTimer}
                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-xl flex items-center space-x-2"
                >
                  <Pause className="w-5 h-5" />
                  <span>Stop</span>
                </Button>
              )}
              
              {time > 0 && (
                <Button
                  onClick={resetTimer}
                  variant="outline"
                  className="px-6 py-2 rounded-xl flex items-center space-x-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset</span>
                </Button>
              )}
            </div>
          </div>

          {hasCompleted && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mb-6"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-3">How did that feel?</h3>
              <div className="flex justify-center space-x-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setDifficulty(rating)}
                    className={`w-12 h-12 rounded-full border-2 text-sm font-medium transition-all ${
                      difficulty === rating
                        ? 'border-orange-500 bg-orange-500 text-white'
                        : 'border-gray-300 text-gray-600 hover:border-orange-300'
                    }`}
                  >
                    {rating}
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-2 px-2">
                <span>Too Easy</span>
                <span>Just Right</span>
                <span>Too Hard</span>
              </div>
            </motion.div>
          )}
        </motion.div>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-3"
        >
          {hasCompleted ? (
            <Button
              onClick={handleContinue}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold py-3 rounded-xl"
            >
              Great Job! Continue
            </Button>
          ) : (
            <Button
              onClick={skipAssessment}
              variant="outline"
              className="w-full py-3 rounded-xl"
            >
              Skip Assessment
            </Button>
          )}
          
          {hasCompleted && time > 0 && (
            <p className="text-center text-sm text-gray-600">
              You held a plank for {formatTime(time)}! 🎉
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AssessmentStep;
