
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { TrendDataPoint } from '@/utils/analyticsUtils';
import FlagGuard from '@/components/access/FlagGuard';

interface PerformanceTrendChartProps {
  data: TrendDataPoint[];
  title?: string;
}

const PerformanceTrendChart: React.FC<PerformanceTrendChartProps> = ({ 
  data, 
  title = "Performance Trend" 
}) => {
  const trend = data.length > 1 ? data[data.length - 1].duration - data[0].duration : 0;
  const isImproving = trend > 0;
  
  return (
    <FlagGuard featureName="progress_charts">
      <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {title}
          <div className="flex items-center space-x-2 text-sm">
            {isImproving ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" />
            )}
            <span className={isImproving ? 'text-green-600' : 'text-red-600'}>
              {Math.abs(trend)}s {isImproving ? 'improvement' : 'decline'}
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              stroke="#666"
              fontSize={12}
            />
            <YAxis 
              stroke="#666"
              fontSize={12}
              tickFormatter={(value) => `${Math.floor(value / 60)}:${(value % 60).toString().padStart(2, '0')}`}
            />
            <Tooltip 
              formatter={(value: number, name: string) => [
                `${Math.floor(value / 60)}:${(value % 60).toString().padStart(2, '0')}`,
                name === 'duration' ? 'Average Duration' : 'Moving Average'
              ]}
              labelStyle={{ color: '#333' }}
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px' }}
            />
            <Line 
              type="monotone" 
              dataKey="duration" 
              stroke="#f97316" 
              strokeWidth={2}
              dot={{ fill: '#f97316', strokeWidth: 2, r: 3 }}
              name="duration"
            />
            <Line 
              type="monotone" 
              dataKey="movingAverage" 
              stroke="#6366f1" 
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              name="movingAverage"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
    </FlagGuard>
  );
};

export default PerformanceTrendChart;
