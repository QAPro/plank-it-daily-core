import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Smile, Meh, Frown, ThumbsUp, ThumbsDown, Zap } from 'lucide-react';

interface WorkoutFeedbackProps {
  onSubmit: (feedback: WorkoutFeedback) => void;
  onSkip: () => void;
  isSubmitting?: boolean;
}

export interface WorkoutFeedback {
  mood: 'great' | 'good' | 'okay' | 'tough' | 'struggled';
  energy: 'energized' | 'normal' | 'tired';
  notes?: string;
  difficulty_felt: 'easy' | 'just_right' | 'challenging';
}

const WorkoutFeedback: React.FC<WorkoutFeedbackProps> = ({ 
  onSubmit, 
  onSkip, 
  isSubmitting = false 
}) => {
  const [selectedMood, setSelectedMood] = useState<WorkoutFeedback['mood'] | null>(null);
  const [selectedEnergy, setSelectedEnergy] = useState<WorkoutFeedback['energy'] | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<WorkoutFeedback['difficulty_felt'] | null>(null);
  const [notes, setNotes] = useState('');

  const moodOptions = [
    { value: 'great', label: 'Great', icon: Smile, color: 'bg-green-100 text-green-700' },
    { value: 'good', label: 'Good', icon: ThumbsUp, color: 'bg-blue-100 text-blue-700' },
    { value: 'okay', label: 'Okay', icon: Meh, color: 'bg-yellow-100 text-yellow-700' },
    { value: 'tough', label: 'Tough', icon: ThumbsDown, color: 'bg-orange-100 text-orange-700' },
    { value: 'struggled', label: 'Struggled', icon: Frown, color: 'bg-red-100 text-red-700' },
  ];

  const energyOptions = [
    { value: 'energized', label: 'Energized', icon: Zap, color: 'bg-green-100 text-green-700' },
    { value: 'normal', label: 'Normal', icon: ThumbsUp, color: 'bg-blue-100 text-blue-700' },
    { value: 'tired', label: 'Tired', icon: Meh, color: 'bg-gray-100 text-gray-700' },
  ];

  const difficultyOptions = [
    { value: 'easy', label: 'Too Easy', color: 'bg-green-100 text-green-700' },
    { value: 'just_right', label: 'Just Right', color: 'bg-blue-100 text-blue-700' },
    { value: 'challenging', label: 'Challenging', color: 'bg-orange-100 text-orange-700' },
  ];

  const handleSubmit = () => {
    if (!selectedMood || !selectedEnergy || !selectedDifficulty) return;
    
    onSubmit({
      mood: selectedMood,
      energy: selectedEnergy,
      difficulty_felt: selectedDifficulty,
      notes: notes.trim() || undefined
    });
  };

  const canSubmit = selectedMood && selectedEnergy && selectedDifficulty;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-lg">How was your workout?</CardTitle>
        <p className="text-sm text-muted-foreground">
          Help us understand your experience (optional)
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Mood Selection */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">How did it feel?</h4>
          <div className="flex flex-wrap gap-2">
            {moodOptions.map((option) => {
              const Icon = option.icon;
              return (
                <Badge
                  key={option.value}
                  variant={selectedMood === option.value ? "default" : "outline"}
                  className={`cursor-pointer transition-colors ${
                    selectedMood === option.value ? option.color : 'hover:bg-muted'
                  }`}
                  onClick={() => setSelectedMood(option.value as WorkoutFeedback['mood'])}
                >
                  <Icon className="w-3 h-3 mr-1" />
                  {option.label}
                </Badge>
              );
            })}
          </div>
        </div>

        {/* Energy Level */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Energy level after?</h4>
          <div className="flex flex-wrap gap-2">
            {energyOptions.map((option) => {
              const Icon = option.icon;
              return (
                <Badge
                  key={option.value}
                  variant={selectedEnergy === option.value ? "default" : "outline"}
                  className={`cursor-pointer transition-colors ${
                    selectedEnergy === option.value ? option.color : 'hover:bg-muted'
                  }`}
                  onClick={() => setSelectedEnergy(option.value as WorkoutFeedback['energy'])}
                >
                  <Icon className="w-3 h-3 mr-1" />
                  {option.label}
                </Badge>
              );
            })}
          </div>
        </div>

        {/* Difficulty Level */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Difficulty level?</h4>
          <div className="flex flex-wrap gap-2">
            {difficultyOptions.map((option) => (
              <Badge
                key={option.value}
                variant={selectedDifficulty === option.value ? "default" : "outline"}
                className={`cursor-pointer transition-colors ${
                  selectedDifficulty === option.value ? option.color : 'hover:bg-muted'
                }`}
                onClick={() => setSelectedDifficulty(option.value as WorkoutFeedback['difficulty_felt'])}
              >
                {option.label}
              </Badge>
            ))}
          </div>
        </div>

        {/* Optional Notes */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Additional thoughts? (optional)</h4>
          <Textarea
            placeholder="How you felt, what you noticed, goals for next time..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[60px] resize-none"
            maxLength={200}
          />
          <p className="text-xs text-muted-foreground text-right">
            {notes.length}/200
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          <Button 
            variant="outline" 
            onClick={onSkip} 
            disabled={isSubmitting}
            className="flex-1"
          >
            Skip
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!canSubmit || isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? 'Saving...' : 'Submit'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkoutFeedback;