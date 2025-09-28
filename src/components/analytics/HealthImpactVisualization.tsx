import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Heart, Zap, Shield, Target, TrendingUp } from 'lucide-react';
import { ProgressMetrics } from '@/services/personalProgressService';
import { motion } from 'framer-motion';

interface HealthImpactVisualizationProps {
  metrics: ProgressMetrics;
}

const HealthImpactVisualization = ({ metrics }: HealthImpactVisualizationProps) => {
  const healthBenefits = [
    {
      icon: Heart,
      title: 'Core Strength',
      description: 'Stronger abdominal and back muscles',
      improvement: metrics.healthBenefits.coreStrengthIncrease,
      maxValue: 100,
      color: 'text-red-600',
      bgColor: 'bg-red-100 dark:bg-red-900/20',
      benefits: ['Better spinal support', 'Reduced back pain risk', 'Improved athletic performance']
    },
    {
      icon: Zap,
      title: 'Posture Quality',
      description: 'Better alignment and body positioning',
      improvement: metrics.healthBenefits.postureImprovement,
      maxValue: 100,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
      benefits: ['Reduced neck strain', 'Better breathing', 'Increased confidence']
    },
    {
      icon: Shield,
      title: 'Injury Prevention',
      description: 'Lower risk of common injuries',
      improvement: Math.min(metrics.healthBenefits.coreStrengthIncrease * 0.8, 80),
      maxValue: 100,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
      benefits: ['Stronger stabilizer muscles', 'Better movement mechanics', 'Reduced fall risk']
    },
    {
      icon: Target,
      title: 'Functional Fitness',
      description: 'Better performance in daily activities',
      improvement: Math.min(metrics.healthBenefits.consistencyScore * 0.9, 90),
      maxValue: 100,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
      benefits: ['Easier lifting', 'Better balance', 'Increased endurance']
    }
  ];

  const getImprovementLevel = (value: number): { level: string; description: string } => {
    if (value >= 80) return { level: 'Excellent', description: 'Outstanding health improvements' };
    if (value >= 60) return { level: 'Very Good', description: 'Significant positive changes' };
    if (value >= 40) return { level: 'Good', description: 'Noticeable health benefits' };
    if (value >= 20) return { level: 'Fair', description: 'Building foundation for health' };
    return { level: 'Starting', description: 'Beginning your health journey' };
  };

  const overallHealthScore = Math.round((
    metrics.healthBenefits.coreStrengthIncrease +
    metrics.healthBenefits.postureImprovement +
    metrics.healthBenefits.consistencyScore
  ) / 3);

  const healthLevel = getImprovementLevel(overallHealthScore);

  // Calculate estimated health benefits timeline
  const getHealthTimeline = () => {
    const daysSinceStart = Math.max(1, Math.ceil(
      (new Date().getTime() - metrics.baseline.firstSessionDate.getTime()) / (1000 * 60 * 60 * 24)
    ));
    
    return {
      '1-2 weeks': daysSinceStart >= 14 ? 'Achieved' : 'In Progress',
      '3-4 weeks': daysSinceStart >= 28 ? 'Achieved' : daysSinceStart >= 14 ? 'Current Focus' : 'Upcoming',
      '2-3 months': daysSinceStart >= 90 ? 'Achieved' : daysSinceStart >= 28 ? 'Current Focus' : 'Upcoming',
      '6+ months': daysSinceStart >= 180 ? 'Achieved' : daysSinceStart >= 90 ? 'Current Focus' : 'Upcoming',
    };
  };

  const timeline = getHealthTimeline();

  return (
    <div className="space-y-6">
      {/* Overall Health Score */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <Card className="relative overflow-hidden bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/10 dark:to-blue-900/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-6 h-6 text-red-500" />
              Overall Health Impact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2">
                <span className="text-4xl font-bold text-green-600">
                  {overallHealthScore}%
                </span>
                <Badge variant="secondary" className="text-green-700 bg-green-100 dark:bg-green-900/20">
                  {healthLevel.level}
                </Badge>
              </div>
              <p className="text-muted-foreground">{healthLevel.description}</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Health Improvement Score</span>
                <span className="font-medium">{overallHealthScore}/100</span>
              </div>
              <Progress value={overallHealthScore} className="h-3" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Health Benefits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {healthBenefits.map((benefit, index) => (
          <motion.div
            key={benefit.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 + 0.2 }}
          >
            <Card className="h-full">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${benefit.bgColor} flex items-center justify-center`}>
                    <benefit.icon className={`w-5 h-5 ${benefit.color}`} />
                  </div>
                  <div>
                    <h4 className="font-semibold">{benefit.title}</h4>
                    <p className="text-xs text-muted-foreground">{benefit.description}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span>Improvement</span>
                    <span className={`font-bold ${benefit.color}`}>
                      +{benefit.improvement}%
                    </span>
                  </div>
                  <Progress 
                    value={benefit.improvement} 
                    className="h-2"
                  />
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Key Benefits:</p>
                  {benefit.benefits.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      {item}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Health Benefits Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Health Benefits Timeline
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Your body's adaptation to consistent plank training
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { period: '1-2 weeks', benefit: 'Initial strength gains, better body awareness', details: timeline['1-2 weeks'] },
              { period: '3-4 weeks', benefit: 'Noticeable core stability, improved posture habits', details: timeline['3-4 weeks'] },
              { period: '2-3 months', benefit: 'Significant strength increases, reduced back discomfort', details: timeline['2-3 months'] },
              { period: '6+ months', benefit: 'Long-term injury prevention, athletic performance gains', details: timeline['6+ months'] },
            ].map((item, index) => (
              <div key={item.period} className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-4 h-4 rounded-full ${
                    item.details === 'Achieved' ? 'bg-green-500' :
                    item.details === 'Current Focus' ? 'bg-blue-500 animate-pulse' :
                    'bg-gray-300'
                  }`} />
                  {index < 3 && <div className="w-px h-8 bg-gray-200 mt-2" />}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{item.period}</span>
                    <Badge 
                      variant={
                        item.details === 'Achieved' ? 'default' :
                        item.details === 'Current Focus' ? 'secondary' :
                        'outline'
                      }
                      className="text-xs"
                    >
                      {item.details}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.benefit}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Health Tips */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <Card className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/10 dark:to-green-900/10">
          <CardContent className="p-6">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              Maximizing Your Health Benefits
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <p className="font-medium text-green-700 dark:text-green-300">Form Focus</p>
                <p className="text-muted-foreground">
                  Maintain proper alignment to maximize core activation and prevent injury
                </p>
              </div>
              <div className="space-y-2">
                <p className="font-medium text-blue-700 dark:text-blue-300">Progressive Overload</p>
                <p className="text-muted-foreground">
                  Gradually increase duration to continue building strength and endurance
                </p>
              </div>
              <div className="space-y-2">
                <p className="font-medium text-purple-700 dark:text-purple-300">Consistency</p>
                <p className="text-muted-foreground">
                  Regular practice compounds benefits - small daily efforts create lasting change
                </p>
              </div>
              <div className="space-y-2">
                <p className="font-medium text-orange-700 dark:text-orange-300">Recovery</p>
                <p className="text-muted-foreground">
                  Allow rest between sessions for muscle adaptation and strength building
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default HealthImpactVisualization;