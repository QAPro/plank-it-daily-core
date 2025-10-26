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
      text: 'Momentum',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
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
          <Card className="bg-white border-0 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 transition-all duration-200">
            <CardContent className="p-3 flex flex-col items-center text-center space-y-2">
              <div className="w-8 h-8 flex items-center justify-center mb-1">
                <span className="text-[32px]">{stat.emoji}</span>
              </div>
              <div className="space-y-1">
                <div className="text-lg font-bold text-[#2C3E50] leading-none">
                  {stat.number}
                </div>
                <div className="text-xs font-medium text-[#7F8C8D] uppercase tracking-wider leading-none">
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
