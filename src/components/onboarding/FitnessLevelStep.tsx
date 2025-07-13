
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OnboardingData } from './OnboardingFlow';

interface FitnessLevelStepProps {
  data: OnboardingData;
  onUpdate: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const FitnessLevelStep = ({ data, onUpdate, onNext, onBack }: FitnessLevelStepProps) => {
  const levels = [
    { value: 1, label: 'Beginner', description: 'New to fitness or planks' },
    { value: 2, label: 'Novice', description: 'Some exercise experience' },
    { value: 3, label: 'Intermediate', description: 'Regular exercise routine' },
    { value: 4, label: 'Advanced', description: 'Strong fitness background' },
    { value: 5, label: 'Expert', description: 'High-level athlete' }
  ];

  const handleLevelSelect = (level: number) => {
    const experienceLevel = level <= 2 ? 'beginner' : level <= 3 ? 'intermediate' : 'advanced';
    onUpdate({ 
      fitnessLevel: level,
      experienceLevel,
      preferredDuration: level <= 2 ? 30 : level <= 3 ? 45 : 60
    });
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
          <h2 className="text-2xl font-bold text-gray-800 mb-2">What's your fitness level?</h2>
          <p className="text-gray-600">
            This helps us customize your plank workouts
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-3 mb-8"
        >
          {levels.map((level, index) => (
            <motion.button
              key={level.value}
              onClick={() => handleLevelSelect(level.value)}
              className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                data.fitnessLevel === level.value
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 bg-white hover:border-orange-300'
              }`}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-800">{level.label}</h3>
                  <p className="text-sm text-gray-600">{level.description}</p>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 ${
                  data.fitnessLevel === level.value
                    ? 'border-orange-500 bg-orange-500'
                    : 'border-gray-300'
                }`}>
                  {data.fitnessLevel === level.value && (
                    <div className="w-2 h-2 bg-white rounded-full m-1" />
                  )}
                </div>
              </div>
            </motion.button>
          ))}
        </motion.div>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <Button
            onClick={onNext}
            disabled={!data.fitnessLevel}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold py-3 rounded-xl"
          >
            Continue
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default FitnessLevelStep;
