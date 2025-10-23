import { motion } from 'framer-motion';
import { Calendar, Clock, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface QuickStatsCardsProps {
  weeklyWorkouts: number;
  totalMinutes: number;
  momentumScore: number;
}

const QuickStatsCards = ({ weeklyWorkouts, totalMinutes, momentumScore }: QuickStatsCardsProps) => {
  const stats = [
    {
      icon: Calendar,
      label: 'This Week',
      value: `${weeklyWorkouts}/7`,
      description: 'days active',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      icon: Clock,
      label: 'Total Time',
      value: `${totalMinutes}m`,
      description: 'this week',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      icon: TrendingUp,
      label: 'Momentum',
      value: Math.round(momentumScore),
      description: 'points',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  return (
    <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex-shrink-0 w-32"
        >
          <Card className="bg-white/60 backdrop-blur-sm border-white/20 hover:shadow-md transition-shadow">
            <CardContent className="p-4 space-y-2">
              <div className={`w-10 h-10 rounded-full ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {stat.value}
                </div>
                <div className="text-xs text-muted-foreground">
                  {stat.label}
                </div>
                <div className="text-xs text-muted-foreground opacity-70">
                  {stat.description}
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
