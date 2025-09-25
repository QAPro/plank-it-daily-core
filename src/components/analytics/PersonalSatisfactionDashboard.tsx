import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Award, 
  DollarSign, 
  Clock, 
  Heart, 
  Target,
  Zap,
  Trophy,
  Calendar
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { PersonalProgressService, ProgressMetrics, HabitMilestone } from '@/services/personalProgressService';
import { MotivationalMilestoneEngine, MotivationalMilestone } from '@/services/motivationalMilestoneEngine';
import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import ImprovementCalculator from './ImprovementCalculator';
import ValuePropositionCard from './ValuePropositionCard';
import HabitFormationTracker from './HabitFormationTracker';
import HealthImpactVisualization from './HealthImpactVisualization';
import StrengthProgressionChart from './StrengthProgressionChart';

const PersonalSatisfactionDashboard: React.FC = () => {
  const { user } = useAuth();

  const { data: progressMetrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['personal-progress', user?.id],
    queryFn: () => PersonalProgressService.calculateProgressMetrics(user!.id),
    enabled: !!user,
  });

  const { data: habitMilestones, isLoading: milestonesLoading } = useQuery({
    queryKey: ['habit-milestones', user?.id],
    queryFn: () => PersonalProgressService.getHabitMilestones(user!.id),
    enabled: !!user,
  });

  const { data: motivationalMilestones, isLoading: motivationalLoading } = useQuery({
    queryKey: ['motivational-milestones', user?.id],
    queryFn: () => MotivationalMilestoneEngine.generateMilestones(user!.id),
    enabled: !!user,
  });

  if (metricsLoading || milestonesLoading || motivationalLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
              <div className="h-32 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Early return if data is not available to prevent hook ordering issues
  if (!progressMetrics || !user) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Unable to load progress data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with key metrics */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Your Transformation Journey</h2>
        <p className="text-muted-foreground">
          Celebrating your progress and the real impact you're making
        </p>
      </div>

      {/* Quick Wins Overview */}
      {motivationalMilestones && motivationalMilestones.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {motivationalMilestones.slice(0, 4).map((milestone, index) => (
            <motion.div
              key={milestone.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5" />
                <CardContent className="p-4 relative">
                  <div className="flex items-center justify-between">
                    <div className="text-2xl">{milestone.icon}</div>
                    <Badge 
                      variant={milestone.celebrationLevel === 'legendary' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {milestone.celebrationLevel}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-sm mt-2">{milestone.title}</h3>
                  <p className="text-lg font-bold mt-1 text-primary">{milestone.value}</p>
                  <p className="text-xs text-muted-foreground">{milestone.subtext}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="health">Health Impact</TabsTrigger>
          <TabsTrigger value="habits">Habit Formation</TabsTrigger>
          <TabsTrigger value="value">Value & Impact</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ImprovementCalculator metrics={progressMetrics} />
            <ValuePropositionCard metrics={progressMetrics} />
          </div>
          
          <StrengthProgressionChart userId={user.id} />
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Performance Analytics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Improvement</p>
                    <p className="text-2xl font-bold text-green-600">
                      +{progressMetrics.improvementPercentage}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Strength Gain</p>
                    <p className="text-2xl font-bold text-orange-600">
                      +{progressMetrics.strengthGainPercentage}%
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Consistency Score</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Progress 
                      value={progressMetrics.healthBenefits.consistencyScore} 
                      className="flex-1"
                    />
                    <span className="text-sm font-medium">
                      {progressMetrics.healthBenefits.consistencyScore}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Baseline Comparison
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Initial Duration</span>
                  <span className="font-medium">{progressMetrics.baseline.initialDuration}s</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Current Average</span>
                  <span className="font-medium">{progressMetrics.baseline.averageDuration}s</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Journey Started</span>
                  <span className="font-medium">
                    {progressMetrics.baseline.firstSessionDate.toLocaleDateString()}
                  </span>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Net Improvement</span>
                    <span className="font-bold text-primary">
                      +{progressMetrics.baseline.averageDuration - progressMetrics.baseline.initialDuration}s
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="health" className="space-y-6">
          <HealthImpactVisualization metrics={progressMetrics} />
        </TabsContent>

        <TabsContent value="habits" className="space-y-6">
          {habitMilestones && <HabitFormationTracker milestones={habitMilestones} />}
        </TabsContent>

        <TabsContent value="value" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Financial Impact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">
                    ${progressMetrics.costSavings}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Total savings vs gym membership
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <p className="text-lg font-bold">${Math.round(progressMetrics.costSavings / 12)}</p>
                    <p className="text-xs text-muted-foreground">Per month saved</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold">${Math.round(progressMetrics.costSavings * 12)}</p>
                    <p className="text-xs text-muted-foreground">Annual projection</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Time Dedicated
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">
                    {progressMetrics.timeDedicated.totalHours}h
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Total time dedicated to your health
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <p className="text-lg font-bold">{progressMetrics.timeDedicated.dailyAverage}min</p>
                    <p className="text-xs text-muted-foreground">Daily average</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold">{progressMetrics.timeDedicated.weeklyAverage}min</p>
                    <p className="text-xs text-muted-foreground">Weekly average</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PersonalSatisfactionDashboard;