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
      text: 'Day Streak'
    },
    {
      emoji: '📅',
      number: `${weeklyWorkouts}/7`,
      text: 'Workouts'
    },
    {
      emoji: '⚡',
      number: `${Math.round(momentumScore)} / ${momentumGoal}`,
      text: 'Momentum'
    }
  ];

  return (
    <div className="grid grid-cols-3 gap-2 w-full max-w-md mx-auto">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.text}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="bg-card border-0 rounded-xl shadow-soft hover:shadow-medium hover:-translate-y-0.5 transition-all duration-200">
            <CardContent className="p-3 flex flex-col items-center text-center space-y-2">
              <div className="w-8 h-8 flex items-center justify-center mb-1">
                <span className="text-[32px]">{stat.emoji}</span>
              </div>
              <div className="space-y-1">
                <div className="text-lg font-bold text-foreground leading-none">
                  {stat.number}
                </div>
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider leading-none">
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
