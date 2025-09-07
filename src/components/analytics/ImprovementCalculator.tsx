import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Award, Zap } from 'lucide-react';
import { ProgressMetrics } from '@/services/personalProgressService';
import { motion } from 'framer-motion';

interface ImprovementCalculatorProps {
  metrics: ProgressMetrics;
}

const ImprovementCalculator: React.FC<ImprovementCalculatorProps> = ({ metrics }) => {
  const getImprovementLevel = (percentage: number): { level: string; color: string; description: string } => {
    if (percentage >= 200) return { level: 'Legendary', color: 'text-purple-600', description: 'Extraordinary transformation' };
    if (percentage >= 100) return { level: 'Exceptional', color: 'text-orange-600', description: 'Outstanding progress' };
    if (percentage >= 50) return { level: 'Strong', color: 'text-green-600', description: 'Significant improvement' };
    if (percentage >= 25) return { level: 'Good', color: 'text-blue-600', description: 'Solid progress' };
    if (percentage >= 10) return { level: 'Developing', color: 'text-yellow-600', description: 'Building momentum' };
    return { level: 'Starting', color: 'text-gray-600', description: 'Beginning journey' };
  };

  const improvementLevel = getImprovementLevel(metrics.improvementPercentage);
  const strengthLevel = getImprovementLevel(metrics.strengthGainPercentage);

  const motivationalMessages = {
    improvement: [
      `You've improved your plank duration by ${metrics.improvementPercentage}% since starting!`,
      `Your dedication shows - you're ${metrics.improvementPercentage}% stronger than when you began!`,
      `Amazing progress! You've grown ${metrics.improvementPercentage}% in your plank ability!`,
    ],
    strength: [
      `Your core strength has increased by an estimated ${metrics.strengthGainPercentage}%!`,
      `Feel the difference? Your core is ${metrics.strengthGainPercentage}% stronger now!`,
      `Real transformation: ${metrics.strengthGainPercentage}% stronger core muscles!`,
    ],
  };

  const getRandomMessage = (type: 'improvement' | 'strength') => {
    const messages = motivationalMessages[type];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/10 dark:to-green-800/10" />
      <CardHeader className="relative">
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-green-600" />
          Your Progress Journey
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Quantified improvement since you started
        </p>
      </CardHeader>
      <CardContent className="relative space-y-6">
        {/* Main Improvement Metric */}
        <motion.div 
          className="text-center space-y-2"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="flex items-center justify-center gap-2">
            <span className="text-4xl font-bold text-green-600">
              +{metrics.improvementPercentage}%
            </span>
            <Badge 
              variant="secondary" 
              className={`${improvementLevel.color} bg-green-100 dark:bg-green-900/20`}
            >
              {improvementLevel.level}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {getRandomMessage('improvement')}
          </p>
        </motion.div>

        {/* Progress Breakdown */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div 
            className="space-y-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Performance</span>
              <span className="text-sm font-medium">{metrics.improvementPercentage}%</span>
            </div>
            <Progress value={Math.min(metrics.improvementPercentage, 100)} className="h-2" />
            <p className="text-xs text-muted-foreground">{improvementLevel.description}</p>
          </motion.div>

          <motion.div 
            className="space-y-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Strength Gain</span>
              <span className="text-sm font-medium">{metrics.strengthGainPercentage}%</span>
            </div>
            <Progress value={Math.min(metrics.strengthGainPercentage, 100)} className="h-2" />
            <p className="text-xs text-muted-foreground">{strengthLevel.description}</p>
          </motion.div>
        </div>

        {/* Comparison Metrics */}
        <motion.div 
          className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h4 className="font-medium flex items-center gap-2">
            <Award className="w-4 h-4 text-orange-500" />
            Before vs. Now
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Started at:</p>
              <p className="font-bold">{metrics.baseline.initialDuration}s</p>
            </div>
            <div>
              <p className="text-muted-foreground">Current avg:</p>
              <p className="font-bold text-primary">{metrics.baseline.averageDuration}s</p>
            </div>
          </div>
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Net improvement:</span>
              <span className="font-bold text-green-600 flex items-center gap-1">
                <Zap className="w-3 h-3" />
                +{metrics.baseline.averageDuration - metrics.baseline.initialDuration}s
              </span>
            </div>
          </div>
        </motion.div>

        {/* Motivational Footer */}
        <motion.div 
          className="text-center p-3 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <p className="text-sm font-medium text-green-700 dark:text-green-300">
            🎉 Every session makes you stronger! Keep building on this amazing progress.
          </p>
        </motion.div>
      </CardContent>
    </Card>
  );
};

export default ImprovementCalculator;