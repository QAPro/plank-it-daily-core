
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Target } from 'lucide-react';

interface WeeklyProgressChartProps {
  data: Array<{ day: string; sessions: number; completed: boolean }>;
  goal?: number;
}

const WeeklyProgressChart: React.FC<WeeklyProgressChartProps> = ({ data, goal = 1 }) => {
  const completedDays = data.filter(d => d.completed).length;
  const completionRate = Math.round((completedDays / data.length) * 100);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Weekly Progress
          <div className="flex items-center space-x-2 text-sm">
            <Target className="w-4 h-4 text-orange-500" />
            <span className="text-muted-foreground">
              {completedDays}/{data.length} days ({completionRate}%)
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="day" 
              stroke="#666"
              fontSize={12}
            />
            <YAxis 
              stroke="#666"
              fontSize={12}
            />
            <Tooltip 
              formatter={(value: number) => [value, 'Sessions']}
              labelStyle={{ color: '#333' }}
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px' }}
            />
            <ReferenceLine y={goal} stroke="#f97316" strokeDasharray="3 3" />
            <Bar 
              dataKey="sessions" 
              fill="#f97316"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default WeeklyProgressChart;
