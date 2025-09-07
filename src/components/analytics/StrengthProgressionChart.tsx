import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Target, Zap } from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { useExtendedSessionHistory } from '@/hooks/useExtendedSessionHistory';
import { PersonalProgressService } from '@/services/personalProgressService';
import { motion } from 'framer-motion';

interface StrengthProgressionChartProps {
  userId: string;
}

const StrengthProgressionChart: React.FC<StrengthProgressionChartProps> = ({ userId }) => {
  const { data: sessions = [], isLoading } = useExtendedSessionHistory(120); // 4 months of data

  const { data: prediction } = useQuery({
    queryKey: ['strength-prediction', userId, sessions.length],
    queryFn: () => PersonalProgressService.predictFutureProgress(sessions, 30),
    enabled: sessions.length > 5,
  });

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-6">
          <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </CardContent>
      </Card>
    );
  }

  // Process data for visualization
  const chartData = React.useMemo(() => {
    if (sessions.length === 0) return [];

    // Group sessions by week for smoother visualization
    const weeklyData = new Map<string, { duration: number; count: number; date: string }>();
    
    sessions.forEach((session, index) => {
      const date = new Date(session.completed_at);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      
      const existing = weeklyData.get(weekKey) || { duration: 0, count: 0, date: weekKey };
      weeklyData.set(weekKey, {
        duration: existing.duration + (session.duration_seconds || 0),
        count: existing.count + 1,
        date: weekKey
      });
    });

    const processedData = Array.from(weeklyData.values())
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((week, index) => {
        const avgDuration = week.duration / Math.max(week.count, 1);
        return {
          week: new Date(week.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          duration: Math.round(avgDuration),
          sessions: week.count,
          weekIndex: index,
          isPrediction: false,
        };
      });

    // Add prediction point
    if (prediction && processedData.length > 0) {
      const lastWeek = processedData[processedData.length - 1];
      processedData.push({
        week: 'Prediction',
        duration: prediction.predictedDuration,
        sessions: 0,
        weekIndex: lastWeek.weekIndex + 4, // 4 weeks ahead
        isPrediction: true,
      } as any);
    }

    return processedData;
  }, [sessions, prediction]);

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Strength Progression
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-center text-muted-foreground">
          Complete more sessions to see your strength progression chart
        </CardContent>
      </Card>
    );
  }

  // Calculate metrics
  const firstWeek = chartData[0];
  const currentWeek = chartData.filter(d => !d.isPrediction).slice(-1)[0];
  const improvementPercent = firstWeek ? 
    ((currentWeek.duration - firstWeek.duration) / firstWeek.duration) * 100 : 0;

  const getProgressionLevel = (improvement: number): { level: string; color: string } => {
    if (improvement >= 100) return { level: 'Exceptional', color: 'text-purple-600' };
    if (improvement >= 50) return { level: 'Strong', color: 'text-orange-600' };
    if (improvement >= 25) return { level: 'Good', color: 'text-green-600' };
    if (improvement >= 10) return { level: 'Steady', color: 'text-blue-600' };
    return { level: 'Building', color: 'text-gray-600' };
  };

  const progressionLevel = getProgressionLevel(improvementPercent);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-primary" />
              Strength Progression Analysis
            </div>
            <Badge 
              variant="secondary" 
              className={`${progressionLevel.color} bg-primary/10`}
            >
              {progressionLevel.level} Progress
            </Badge>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Weekly average duration with predictive modeling
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Key Metrics */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-lg font-bold text-green-600">
                  +{Math.round(improvementPercent)}%
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Overall Growth</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Target className="w-4 h-4 text-blue-600" />
                <span className="text-lg font-bold text-blue-600">
                  {currentWeek.duration}s
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Current Avg</p>
            </div>

            {prediction && (
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Zap className="w-4 h-4 text-purple-600" />
                  <span className="text-lg font-bold text-purple-600">
                    {prediction.predictedDuration}s
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Prediction ({prediction.confidence}% confidence)
                </p>
              </div>
            )}
          </div>

          {/* Progression Chart */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="week" 
                  tick={{ fontSize: 12 }}
                  interval="preserveStartEnd"
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === 'duration') {
                      return [`${value}s`, 'Avg Duration'];
                    }
                    return [value, name];
                  }}
                  labelFormatter={(label) => `Week: ${label}`}
                />
                
                {/* Actual progression line */}
                <Line
                  type="monotone"
                  dataKey="duration"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={(props) => {
                    if (props.payload?.isPrediction) {
                      return (
                        <circle
                          cx={props.cx}
                          cy={props.cy}
                          r={4}
                          fill="hsl(var(--purple-500))"
                          stroke="hsl(var(--purple-600))"
                          strokeWidth={2}
                          strokeDasharray="4 4"
                        />
                      );
                    }
                    return (
                      <circle
                        cx={props.cx}
                        cy={props.cy}
                        r={3}
                        fill="hsl(var(--primary))"
                        stroke="white"
                        strokeWidth={2}
                      />
                    );
                  }}
                />

                {/* Prediction line */}
                {prediction && (
                  <ReferenceLine
                    x="Prediction"
                    stroke="hsl(var(--purple-500))"
                    strokeDasharray="8 8"
                    strokeWidth={2}
                  />
                )}

                {/* Trend line */}
                <Line
                  type="linear"
                  dataKey="duration"
                  stroke="hsl(var(--secondary))"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  connectNulls={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-green-50 dark:bg-green-900/10 rounded-lg">
              <h4 className="font-medium text-green-700 dark:text-green-300 text-sm mb-1">
                Strength Gains
              </h4>
              <p className="text-xs text-muted-foreground">
                Your {Math.round(improvementPercent)}% improvement shows significant core strength development. 
                {improvementPercent > 50 ? ' Outstanding progress!' : ' Keep building!'}
              </p>
            </div>

            {prediction && prediction.confidence > 60 && (
              <div className="p-3 bg-purple-50 dark:bg-purple-900/10 rounded-lg">
                <h4 className="font-medium text-purple-700 dark:text-purple-300 text-sm mb-1">
                  Future Projection
                </h4>
                <p className="text-xs text-muted-foreground">
                  Based on your current trajectory, you could reach {prediction.predictedDuration}s 
                  in the next month ({prediction.confidence}% confidence).
                </p>
              </div>
            )}
          </div>

          {/* Progress Motivation */}
          <div className="text-center p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg">
            <p className="text-sm font-medium text-primary">
              🚀 {improvementPercent > 0 ? 
                `You're ${Math.round(improvementPercent)}% stronger than when you started!` :
                `You're building the foundation for amazing strength gains!`
              }
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {improvementPercent > 25 ? 
                'Your consistency is creating real transformation' :
                'Every session is making you stronger - keep it up!'
              }
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default StrengthProgressionChart;