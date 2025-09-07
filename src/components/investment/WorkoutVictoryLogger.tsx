import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { BookOpen, Trophy, Zap, Lightbulb, Star, TrendingUp } from 'lucide-react';
import { useWorkoutVictoryLogs } from '@/hooks/useWorkoutVictoryLogs';
import { motion, AnimatePresence } from 'framer-motion';

interface WorkoutVictoryLoggerProps {
  sessionId?: string;
  isOpen: boolean;
  onClose: () => void;
}

const WorkoutVictoryLogger: React.FC<WorkoutVictoryLoggerProps> = ({ 
  sessionId, 
  isOpen, 
  onClose 
}) => {
  const { addVictoryLog } = useWorkoutVictoryLogs();
  const [victoryData, setVictoryData] = useState({
    victory_level: 3,
    todays_win: '',
    power_moments: [] as string[],
    growth_insights: '',
    victory_notes: '',
    breakthrough_achieved: false,
    energy_before: 5,
    energy_after: 7,
  });
  
  const [currentPowerMoment, setCurrentPowerMoment] = useState('');

  const victoryLevelLabels = {
    1: { label: 'Good Start', color: 'text-blue-500', emoji: '💪' },
    2: { label: 'Solid Victory', color: 'text-green-500', emoji: '⭐' },
    3: { label: 'Great Success', color: 'text-yellow-500', emoji: '🌟' },
    4: { label: 'Epic Win', color: 'text-orange-500', emoji: '🔥' },
    5: { label: 'Total Victory!', color: 'text-red-500', emoji: '🏆' },
  };

  const handleAddPowerMoment = () => {
    if (currentPowerMoment.trim()) {
      setVictoryData({
        ...victoryData,
        power_moments: [...victoryData.power_moments, currentPowerMoment.trim()]
      });
      setCurrentPowerMoment('');
    }
  };

  const handleRemovePowerMoment = (index: number) => {
    setVictoryData({
      ...victoryData,
      power_moments: victoryData.power_moments.filter((_, i) => i !== index)
    });
  };

  const handleSaveVictoryLog = async () => {
    if (!sessionId) return;
    
    await addVictoryLog(sessionId, victoryData);
    onClose();
    
    // Reset form
    setVictoryData({
      victory_level: 3,
      todays_win: '',
      power_moments: [],
      growth_insights: '',
      victory_notes: '',
      breakthrough_achieved: false,
      energy_before: 5,
      energy_after: 7,
    });
  };

  const currentVictoryLevel = victoryLevelLabels[victoryData.victory_level as keyof typeof victoryLevelLabels];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <BookOpen className="w-5 h-5 mr-2 text-primary" />
            Capture Your Victory Story
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Victory Level */}
          <div>
            <Label className="text-base font-semibold">How victorious was this workout?</Label>
            <div className="mt-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Victory Level</span>
                <div className="flex items-center">
                  <span className={`text-lg font-bold ${currentVictoryLevel.color}`}>
                    {currentVictoryLevel.emoji} {currentVictoryLevel.label}
                  </span>
                </div>
              </div>
              <Slider
                value={[victoryData.victory_level]}
                onValueChange={([value]) => setVictoryData({ ...victoryData, victory_level: value })}
                min={1}
                max={5}
                step={1}
                className="w-full"
              />
            </div>
          </div>

          {/* Today's Win */}
          <div>
            <Label htmlFor="todays-win" className="text-base font-semibold flex items-center">
              <Trophy className="w-4 h-4 mr-2 text-yellow-500" />
              What was your biggest win today?
            </Label>
            <Textarea
              id="todays-win"
              placeholder="I pushed through that tough moment... I held the plank longer... I felt so strong..."
              value={victoryData.todays_win}
              onChange={(e) => setVictoryData({ ...victoryData, todays_win: e.target.value })}
              className="mt-2"
            />
          </div>

          {/* Power Moments */}
          <div>
            <Label className="text-base font-semibold flex items-center">
              <Zap className="w-4 h-4 mr-2 text-orange-500" />
              Power Moments
            </Label>
            <p className="text-sm text-muted-foreground mb-3">
              Capture those special moments when you felt unstoppable!
            </p>
            
            <div className="flex gap-2 mb-3">
              <Textarea
                placeholder="I felt my core activate... My form was perfect... I broke through my limit..."
                value={currentPowerMoment}
                onChange={(e) => setCurrentPowerMoment(e.target.value)}
                className="flex-1"
                rows={2}
              />
              <Button onClick={handleAddPowerMoment} size="sm">
                <Zap className="w-4 h-4" />
              </Button>
            </div>

            <AnimatePresence>
              {victoryData.power_moments.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  {victoryData.power_moments.map((moment, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex items-center justify-between p-2 rounded bg-orange-50 border border-orange-200"
                    >
                      <span className="text-sm">{moment}</span>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => handleRemovePowerMoment(index)}
                      >
                        ×
                      </Button>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Growth Insights */}
          <div>
            <Label htmlFor="growth-insights" className="text-base font-semibold flex items-center">
              <Lightbulb className="w-4 h-4 mr-2 text-blue-500" />
              Growth Insights
            </Label>
            <Textarea
              id="growth-insights"
              placeholder="What did you learn about yourself? How are you getting stronger?"
              value={victoryData.growth_insights}
              onChange={(e) => setVictoryData({ ...victoryData, growth_insights: e.target.value })}
              className="mt-2"
            />
          </div>

          {/* Energy Levels */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Energy Before Workout</Label>
              <div className="mt-2">
                <Slider
                  value={[victoryData.energy_before]}
                  onValueChange={([value]) => setVictoryData({ ...victoryData, energy_before: value })}
                  min={1}
                  max={10}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Drained</span>
                  <span className="font-medium">{victoryData.energy_before}/10</span>
                  <span>Energized</span>
                </div>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Energy After Workout</Label>
              <div className="mt-2">
                <Slider
                  value={[victoryData.energy_after]}
                  onValueChange={([value]) => setVictoryData({ ...victoryData, energy_after: value })}
                  min={1}
                  max={10}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Drained</span>
                  <span className="font-medium">{victoryData.energy_after}/10</span>
                  <span>Supercharged</span>
                </div>
              </div>
            </div>
          </div>

          {/* Energy Gain Indicator */}
          {victoryData.energy_after > victoryData.energy_before && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-3 rounded-lg bg-green-50 border border-green-200 flex items-center"
            >
              <TrendingUp className="w-5 h-5 text-green-600 mr-3" />
              <div>
                <p className="font-medium text-green-800">Amazing Energy Boost!</p>
                <p className="text-sm text-green-600">
                  You gained {victoryData.energy_after - victoryData.energy_before} energy points from this workout!
                </p>
              </div>
            </motion.div>
          )}

          {/* Breakthrough Toggle */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="breakthrough"
              checked={victoryData.breakthrough_achieved}
              onChange={(e) => setVictoryData({ ...victoryData, breakthrough_achieved: e.target.checked })}
              className="rounded border-gray-300"
            />
            <Label htmlFor="breakthrough" className="flex items-center text-base font-medium">
              <Star className="w-4 h-4 mr-2 text-purple-500" />
              I achieved a breakthrough today!
            </Label>
          </div>

          {/* Victory Notes */}
          <div>
            <Label htmlFor="victory-notes" className="text-base font-semibold">
              Additional Victory Notes
            </Label>
            <Textarea
              id="victory-notes"
              placeholder="Any other thoughts, feelings, or victories you want to remember..."
              value={victoryData.victory_notes}
              onChange={(e) => setVictoryData({ ...victoryData, victory_notes: e.target.value })}
              className="mt-2"
            />
          </div>

          {/* Save Button */}
          <div className="flex gap-3 pt-4">
            <Button onClick={handleSaveVictoryLog} className="flex-1" size="lg">
              <Trophy className="w-4 h-4 mr-2" />
              Save Victory Story
            </Button>
            <Button onClick={onClose} variant="outline" size="lg">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WorkoutVictoryLogger;