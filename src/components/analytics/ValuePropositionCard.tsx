import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Clock, Target, TrendingUp } from 'lucide-react';
import { ProgressMetrics } from '@/services/personalProgressService';
import { motion } from 'framer-motion';

interface ValuePropositionCardProps {
  metrics: ProgressMetrics;
}

const ValuePropositionCard: React.FC<ValuePropositionCardProps> = ({ metrics }) => {
  const formatTime = (hours: number): string => {
    if (hours < 1) return `${Math.round(hours * 60)}min`;
    return `${Math.round(hours * 10) / 10}h`;
  };

  const getValueLevel = (savings: number): { level: string; color: string; message: string } => {
    if (savings >= 500) return { 
      level: 'Elite Saver', 
      color: 'text-purple-600', 
      message: 'You\'ve saved enough for a vacation!' 
    };
    if (savings >= 300) return { 
      level: 'Master Saver', 
      color: 'text-orange-600', 
      message: 'That\'s serious money in your pocket!' 
    };
    if (savings >= 150) return { 
      level: 'Smart Saver', 
      color: 'text-green-600', 
      message: 'Amazing progress from your daily dedication!' 
    };
    if (savings >= 50) return { 
      level: 'Wise Investor', 
      color: 'text-blue-600', 
      message: 'Already saving money!' 
    };
    return { 
      level: 'Getting Started', 
      color: 'text-gray-600', 
      message: 'Building value every session!' 
    };
  };

  const valueLevel = getValueLevel(metrics.costSavings);

  // Calculate projections
  const monthlyProjection = Math.round(metrics.costSavings / 
    Math.max(1, Math.ceil((new Date().getTime() - metrics.baseline.firstSessionDate.getTime()) / (1000 * 60 * 60 * 24 * 30))));
  const annualProjection = monthlyProjection * 12;

  const valuePropositions = [
    {
      icon: DollarSign,
      title: 'Money Saved',
      value: `$${metrics.costSavings}`,
      subtitle: 'vs gym membership',
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
    },
    {
      icon: Clock,
      title: 'Time Dedicated',
      value: formatTime(metrics.timeDedicated.totalHours),
      subtitle: `${Math.round(metrics.timeDedicated.dailyAverage)}min/day avg`,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    },
    {
      icon: Target,
      title: 'Efficiency',
      value: `${Math.round((metrics.costSavings / Math.max(metrics.timeDedicated.totalHours, 1)) * 10) / 10}`,
      subtitle: '$/hour value',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
    },
  ];

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-emerald-900/10 dark:to-blue-900/10" />
      <CardHeader className="relative">
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-6 h-6 text-emerald-600" />
          Your Progress Value
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          The real-world impact of your consistency
        </p>
      </CardHeader>
      <CardContent className="relative space-y-6">
        {/* Main Value Display */}
        <motion.div 
          className="text-center space-y-2"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="flex items-center justify-center gap-2">
            <span className="text-4xl font-bold text-emerald-600">
              ${metrics.costSavings}
            </span>
            <Badge 
              variant="secondary" 
              className={`${valueLevel.color} bg-emerald-100 dark:bg-emerald-900/20`}
            >
              {valueLevel.level}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {valueLevel.message}
          </p>
        </motion.div>

        {/* Value Proposition Grid */}
        <div className="grid grid-cols-1 gap-3">
          {valuePropositions.map((item, index) => (
            <motion.div
              key={item.title}
              className="flex items-center gap-3 p-3 rounded-lg bg-white/50 dark:bg-gray-800/50"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 + 0.2 }}
            >
              <div className={`w-10 h-10 rounded-full ${item.bgColor} flex items-center justify-center`}>
                <item.icon className={`w-5 h-5 ${item.color}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{item.title}</span>
                  <span className={`font-bold text-lg ${item.color}`}>{item.value}</span>
                </div>
                <p className="text-xs text-muted-foreground">{item.subtitle}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Projection Section */}
        <motion.div 
          className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 rounded-lg p-4 space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h4 className="font-medium flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            Savings Projection
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Monthly rate:</p>
              <p className="font-bold text-emerald-600">${monthlyProjection}/mo</p>
            </div>
            <div>
              <p className="text-muted-foreground">Annual projection:</p>
              <p className="font-bold text-emerald-600">${annualProjection}/yr</p>
            </div>
          </div>
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-muted-foreground text-center">
              💡 That's money you can invest in other goals and dreams!
            </p>
          </div>
        </motion.div>

        {/* Efficiency Insight */}
        <motion.div 
          className="text-center p-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
            🚀 Just {Math.round(metrics.timeDedicated.dailyAverage)} minutes daily = 
            ${Math.round(metrics.costSavings / (Math.max(metrics.timeDedicated.totalHours, 1) * 60) * 100) / 100} value per minute!
          </p>
        </motion.div>
      </CardContent>
    </Card>
  );
};

export default ValuePropositionCard;