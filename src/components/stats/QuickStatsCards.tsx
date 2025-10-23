import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';

interface QuickStatsCardsProps {
  currentStreak: number;
  weeklyWorkouts: number;
  momentumScore: number;
  momentumGoal?: number;
}

const QuickStatsCards = ({ 
  currentStreak, 
  weeklyWorkouts, 
  momentumScore, 
  momentumGoal = 200 
}: QuickStatsCardsProps) => {
  const stats = [
    {
      emoji: '🔥',
      number: `${currentStreak}`,
      text: 'Day Streak',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      emoji: '📅',
      number: `${weeklyWorkouts}/7`,
      text: 'Workouts',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      emoji: '⚡',
      number: `${Math.round(momentumScore)} / ${momentumGoal}`,
      text: 'Weekly Momentum',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.text}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex-shrink-0 w-28"
        >
          <Card className="bg-white/60 backdrop-blur-sm border-white/20 hover:shadow-md transition-shadow">
            <CardContent className="p-3 space-y-1.5 flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full ${stat.bgColor} flex items-center justify-center`}>
                <span className="text-xl">{stat.emoji}</span>
              </div>
              <div className="space-y-0.5 text-center">
                <div className="text-lg font-bold text-foreground leading-tight">
                  {stat.number}
                </div>
                <div className="text-xs text-muted-foreground leading-tight">
                  {stat.text}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default QuickStatsCards;
