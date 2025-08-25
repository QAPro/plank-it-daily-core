
import { useState } from "react";
import { motion } from "framer-motion";
import { Play, Clock, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Tables } from '@/integrations/supabase/types';

type Exercise = Tables<'plank_exercises'>;

interface TimerSetupProps {
  exercise: Exercise;
  onStart: (duration: number) => void;
  onBack: () => void;
}

const presetTimes = [
  { label: "30 sec", value: 30 },
  { label: "1 min", value: 60 },
  { label: "2 min", value: 120 },
  { label: "3 min", value: 180 },
  { label: "5 min", value: 300 },
];

const TimerSetup = ({ exercise, onStart, onBack }: TimerSetupProps) => {
  const [selectedTime, setSelectedTime] = useState(60);
  const [customTime, setCustomTime] = useState("");

  const handleCustomTimeChange = (value: string) => {
    setCustomTime(value);
    const seconds = parseInt(value) * 60;
    if (!isNaN(seconds) && seconds > 0) {
      setSelectedTime(seconds);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 space-y-6"
    >
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Set Your Timer</h2>
        <p className="text-gray-600">Choose duration for {exercise.name}</p>
      </div>

      {/* Exercise Info */}
      <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-800">{exercise.name}</h3>
              <p className="text-sm text-gray-600">Level {exercise.difficulty_level}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-orange-600">
                {formatTime(selectedTime)}
              </div>
              <p className="text-xs text-gray-500">Selected Duration</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preset Times */}
      <div>
        <h3 className="font-semibold mb-3">Quick Select</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {presetTimes.map((preset) => (
            <Button
              key={preset.value}
              variant={selectedTime === preset.value ? "default" : "outline"}
              onClick={() => setSelectedTime(preset.value)}
              className="h-10 text-sm"
            >
              <Clock className="w-3.5 h-3.5 mr-1.5" />
              {preset.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Custom Time */}
      <div>
        <h3 className="font-semibold mb-3">Custom Duration</h3>
        <div className="flex items-center space-x-3">
          <input
            type="number"
            placeholder="Enter minutes"
            value={customTime}
            onChange={(e) => handleCustomTimeChange(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            min="1"
            max="60"
          />
          <span className="text-gray-600 text-sm">min</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex-1"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button
          onClick={() => onStart(selectedTime)}
          className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold"
        >
          <Play className="w-4 h-4 mr-2" />
          Start Timer
        </Button>
      </div>
    </motion.div>
  );
};

export default TimerSetup;
