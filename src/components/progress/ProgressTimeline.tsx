import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Calendar, TrendingUp } from 'lucide-react';
import { useProgressAnalytics } from '@/hooks/useProgressAnalytics';

const ProgressTimeline: React.FC = () => {
  const { data: analytics, isLoading } = useProgressAnalytics();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-muted rounded w-1/3"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analytics || analytics.progressGrowth.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-primary" />
            Progress Timeline
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Complete more workouts to see your progress over time!</p>
        </CardContent>
      </Card>
    );
  }

  // Format data for chart
  const chartData = analytics.progressGrowth.map((point, index) => ({
    ...point,
    timeInHours: Math.round(point.cumulativeTime / 3600 * 10) / 10,
    date: new Date(point.date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    }),
  }));

  // Take last 30 days or all data if less than 30 points
  const displayData = chartData.slice(-30);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-semibold">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.dataKey === 'timeInHours' ? 'Time' : 
                 entry.dataKey === 'cumulativeXP' ? 'XP' : 
                 'Achievements'}: ${
                entry.dataKey === 'timeInHours' ? `${entry.value}h` :
                entry.dataKey === 'cumulativeAchievements' ? Math.round(entry.value) :
                entry.value.toLocaleString()
              }`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-primary" />
            Progress Timeline
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Track your cumulative progress over time
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={displayData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  className="text-xs fill-muted-foreground"
                  tick={{ fontSize: 12 }}
                />
                <YAxis className="text-xs fill-muted-foreground" tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="timeInHours"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  name="Time Dedicated (hours)"
                  dot={{ r: 4, fill: "hsl(var(--primary))" }}
                />
                <Line
                  type="monotone"
                  dataKey="cumulativeXP"
                  stroke="hsl(var(--secondary))"
                  strokeWidth={2}
                  name="Experience Points"
                  dot={{ r: 4, fill: "hsl(var(--secondary))" }}
                />
                <Line
                  type="monotone"
                  dataKey="cumulativeAchievements"
                  stroke="hsl(var(--accent))"
                  strokeWidth={2}
                  name="Achievements"
                  dot={{ r: 4, fill: "hsl(var(--accent))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Progress Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="w-4 h-4 text-primary mr-1" />
                <span className="text-sm font-medium">Total Progress</span>
              </div>
              <p className="text-lg font-bold text-primary">
                {formatTime(analytics.totalTimeDedicated)}
              </p>
              <p className="text-xs text-muted-foreground">Time Dedicated</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="w-4 h-4 text-secondary mr-1" />
                <span className="text-sm font-medium">XP Growth</span>
              </div>
              <p className="text-lg font-bold text-secondary">
                {analytics.xpGained.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">Experience Points</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="w-4 h-4 text-accent mr-1" />
                <span className="text-sm font-medium">Milestone Growth</span>
              </div>
              <p className="text-lg font-bold text-accent">
                {analytics.achievementsEarned}
              </p>
              <p className="text-xs text-muted-foreground">Achievements</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ProgressTimeline;