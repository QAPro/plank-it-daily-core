
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { ExerciseDistribution } from '@/utils/analyticsUtils';

interface ExerciseDistributionChartProps {
  data: ExerciseDistribution[];
}

const ExerciseDistributionChart: React.FC<ExerciseDistributionChartProps> = ({ data }) => {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-sm">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-gray-600">
            {data.value} sessions ({data.percentage}%)
          </p>
          <p className="text-xs text-gray-500">
            Difficulty Level: {data.difficulty}
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => (
    <div className="flex flex-wrap gap-2 mt-4 justify-center">
      {payload?.slice(0, 5).map((entry: any, index: number) => (
        <div key={index} className="flex items-center space-x-1 text-xs">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-gray-600 truncate max-w-[100px]">
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Exercise Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={80}
              dataKey="value"
              nameKey="name"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default ExerciseDistributionChart;
