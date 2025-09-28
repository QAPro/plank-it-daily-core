import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, Target, Zap, Trophy, Clock } from 'lucide-react';
import { HabitMilestone } from '@/services/personalProgressService';
import { motion } from 'framer-motion';

interface HabitFormationTrackerProps {
  milestones: HabitMilestone[];
}

const HabitFormationTracker = ({ milestones }: HabitFormationTrackerProps) => {
  const getMilestoneIcon = (type: string, isAchieved: boolean) => {
    const iconClass = isAchieved ? 'text-green-600' : 'text-gray-400';
    
    switch (type) {
      case '21_day': return <Zap className={`w-5 h-5 ${iconClass}`} />;
      case '66_day': return <Target className={`w-5 h-5 ${iconClass}`} />;
      case '90_day': return <Calendar className={`w-5 h-5 ${iconClass}`} />;
      case '180_day': return <Trophy className={`w-5 h-5 ${iconClass}`} />;
      case '365_day': return <Clock className={`w-5 h-5 ${iconClass}`} />;
      default: return <Target className={`w-5 h-5 ${iconClass}`} />;
    }
  };

  const getMilestoneColor = (type: string, isAchieved: boolean): string => {
    if (!isAchieved) return 'text-gray-400';
    
    switch (type) {
      case '21_day': return 'text-yellow-600';
      case '66_day': return 'text-orange-600';
      case '90_day': return 'text-green-600';
      case '180_day': return 'text-blue-600';
      case '365_day': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  const getProgressColor = (type: string): string => {
    switch (type) {
      case '21_day': return 'bg-yellow-500';
      case '66_day': return 'bg-orange-500';
      case '90_day': return 'bg-green-500';
      case '180_day': return 'bg-blue-500';
      case '365_day': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const achievedMilestones = milestones.filter(m => m.isAchieved);
  const nextMilestone = milestones.find(m => !m.isAchieved);

  return (
    <div className="space-y-6">
      {/* Achievement Overview */}
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold">Habit Formation Journey</h3>
        <p className="text-muted-foreground">
          Building lasting change through the science of habit formation
        </p>
        <div className="flex items-center justify-center gap-2">
          <span className="text-lg font-medium">
            {achievedMilestones.length} of {milestones.length} milestones achieved
          </span>
          <Badge variant="secondary">
            {Math.round((achievedMilestones.length / milestones.length) * 100)}% Complete
          </Badge>
        </div>
      </div>

      {/* Next Milestone Focus */}
      {nextMilestone && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="relative overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getMilestoneIcon(nextMilestone.type, false)}
                  <span>Next Milestone</span>
                </div>
                <Badge variant="outline" className="text-primary border-primary">
                  {nextMilestone.daysRemaining} days to go
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-lg font-semibold">{nextMilestone.title}</h4>
                <p className="text-muted-foreground">{nextMilestone.description}</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Progress</span>
                  <span className="font-medium">
                    {nextMilestone.progress} / {nextMilestone.target} days
                  </span>
                </div>
                <div className="relative">
                  <Progress 
                    value={(nextMilestone.progress / nextMilestone.target) * 100} 
                    className="h-3"
                  />
                  <div 
                    className={`absolute top-0 left-0 h-3 rounded-full ${getProgressColor(nextMilestone.type)} transition-all duration-300`}
                    style={{ width: `${(nextMilestone.progress / nextMilestone.target) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  {Math.round((nextMilestone.progress / nextMilestone.target) * 100)}% complete
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* All Milestones Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {milestones.map((milestone, index) => (
          <motion.div
            key={milestone.type}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`relative ${milestone.isAchieved ? 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/10 dark:to-green-800/10' : ''}`}>
              {milestone.isAchieved && (
                <div className="absolute top-2 right-2">
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                    ✓ Achieved
                  </Badge>
                </div>
              )}
              
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  {getMilestoneIcon(milestone.type, milestone.isAchieved)}
                  <div>
                    <h4 className={`font-semibold ${getMilestoneColor(milestone.type, milestone.isAchieved)}`}>
                      {milestone.title}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {milestone.target} days
                    </p>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground">
                  {milestone.description}
                </p>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Progress</span>
                    <span className="font-medium">
                      {milestone.progress} / {milestone.target}
                    </span>
                  </div>
                  <Progress 
                    value={(milestone.progress / milestone.target) * 100}
                    className="h-2"
                  />
                  {milestone.isAchieved && milestone.achievedDate && (
                    <p className="text-xs text-green-600 font-medium">
                      🎉 Completed {milestone.achievedDate.toLocaleDateString()}
                    </p>
                  )}
                  {!milestone.isAchieved && milestone.daysRemaining !== undefined && (
                    <p className="text-xs text-muted-foreground">
                      {milestone.daysRemaining > 0 ? 
                        `${milestone.daysRemaining} days remaining` : 
                        'Ready to achieve!'
                      }
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Habit Science Info */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10">
        <CardContent className="p-6">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            The Science of Habit Formation
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-medium text-yellow-700 dark:text-yellow-300">21 Days</p>
              <p className="text-muted-foreground">
                Neural pathways begin forming for new behavior patterns
              </p>
            </div>
            <div>
              <p className="font-medium text-orange-700 dark:text-orange-300">66 Days</p>
              <p className="text-muted-foreground">
                Average time for behavior to become automatic (research-backed)
              </p>
            </div>
            <div>
              <p className="font-medium text-green-700 dark:text-green-300">90+ Days</p>
              <p className="text-muted-foreground">
                Lifestyle integration - permanent change achieved
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HabitFormationTracker;