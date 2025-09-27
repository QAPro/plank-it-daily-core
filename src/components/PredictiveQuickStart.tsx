import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, Zap, Clock, TrendingUp } from 'lucide-react';
import { usePredictiveLoading } from '@/hooks/usePredictiveLoading';
import { motion } from 'framer-motion';
import FlagGuard from '@/components/access/FlagGuard';

interface PredictiveQuickStartProps {
  onExerciseSelect: (exerciseId: string, duration: number) => void;
}

const PredictiveQuickStart: React.FC<PredictiveQuickStartProps> = ({ 
  onExerciseSelect 
}) => {
  const { predictions, isLoading } = usePredictiveLoading();

  if (isLoading || predictions.length === 0) {
    return null;
  }

  const topPrediction = predictions[0];

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600 bg-green-50';
    if (confidence >= 60) return 'text-blue-600 bg-blue-50';
    if (confidence >= 40) return 'text-yellow-600 bg-yellow-50';
    return 'text-orange-600 bg-orange-50';
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 80) return 'Highly Recommended';
    if (confidence >= 60) return 'Good Match';
    if (confidence >= 40) return 'Suitable';
    return 'Alternative';
  };

  return (
    <FlagGuard featureName="predictive_recommendations">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Brain className="w-5 h-5 text-primary" />
              Smart Recommendation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Main Recommendation */}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold">
                    {topPrediction.exercise_name || `Exercise ${topPrediction.exercise_id}`}
                  </h3>
                  <Badge className={getConfidenceColor(topPrediction.confidence)}>
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {getConfidenceText(topPrediction.confidence)}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {topPrediction.suggested_duration}s
                  </div>
                  <div className="flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    {topPrediction.confidence}% confidence
                  </div>
                </div>
                
                <p className="text-xs text-muted-foreground mt-1">
                  {topPrediction.reason}
                </p>
              </div>
              
              <Button
                onClick={() => onExerciseSelect(topPrediction.exercise_id, topPrediction.suggested_duration)}
                className="ml-4"
              >
                <Zap className="w-4 h-4 mr-2" />
                Start Now
              </Button>
            </div>
            
            {/* Alternative Predictions */}
            {predictions.length > 1 && (
              <div className="pt-2 border-t border-border/50">
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Other Suggestions:
                </p>
                <div className="flex gap-2 flex-wrap">
                  {predictions.slice(1, 3).map((pred) => (
                    <Button
                      key={pred.exercise_id}
                      variant="outline"
                      size="sm"
                      onClick={() => onExerciseSelect(pred.exercise_id, pred.suggested_duration)}
                      className="text-xs"
                    >
                      {pred.exercise_name} ({pred.suggested_duration}s)
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </FlagGuard>
  );
};

export default PredictiveQuickStart;