import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';

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
      emoji: 'calendar',
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
    <div className="grid grid-cols-3 gap-3 w-full max-w-md mx-auto">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.text}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex"
        >
          <Card className="bg-card border-0 rounded-xl shadow-soft hover:shadow-medium hover:-translate-y-0.5 transition-all duration-200 flex-1">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-2 min-h-[110px]">
              <div className="w-8 h-8 flex items-center justify-center">
                {stat.emoji === 'calendar' ? (
                  <div className="relative w-10 h-10 flex flex-col items-center justify-center bg-gradient-to-b from-red-500 to-red-600 rounded-lg shadow-sm">
                    <div className="absolute top-0 left-0 right-0 h-2 bg-red-700 rounded-t-lg"></div>
                    <div className="text-[10px] font-bold text-white uppercase mt-1">{format(new Date(), 'MMM')}</div>
                    <div className="text-lg font-bold text-white leading-none">{format(new Date(), 'd')}</div>
                  </div>
                ) : (
                  <span className="text-[32px]">{stat.emoji}</span>
                )}
              </div>
              <div className="space-y-1 w-full">
                <div className="text-lg font-bold text-foreground leading-tight min-h-[24px] flex items-center justify-center">
                  <span className="inline-block">{stat.number}</span>
                </div>
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider leading-tight">
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
