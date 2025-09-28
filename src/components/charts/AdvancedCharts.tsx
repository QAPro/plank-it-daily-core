import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ChartProps {
  title: string;
  data: any[];
  height?: number;
}

export const ProgressTrendChart = ({ title, data, height = 300 }: ChartProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
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
              formatter={(value: number) => [`${Math.floor(value / 60)}:${(value % 60).toString().padStart(2, '0')}`, 'Duration']}
              labelStyle={{ color: '#333' }}
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px' }}
            />
            <Line 
              type="monotone" 
              dataKey="duration" 
              stroke="#f97316" 
              strokeWidth={3}
              dot={{ fill: '#f97316', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: '#ea580c' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export const ExerciseVarietyChart = ({ title, data, height = 300 }: ChartProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={data} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis type="number" stroke="#666" fontSize={12} />
            <YAxis 
              dataKey="exercise" 
              type="category" 
              stroke="#666"
              fontSize={12}
              width={120}
            />
            <Tooltip 
              formatter={(value: number) => [value, 'Sessions']}
              labelStyle={{ color: '#333' }}
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px' }}
            />
            <Bar 
              dataKey="sessions" 
              fill="#f97316"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export const ConsistencyHeatmap = ({ title, data, height = 200 }: ChartProps) => {
  const getIntensityColor = (intensity: number) => {
    if (intensity === 0) return '#f3f4f6';
    if (intensity === 1) return '#fed7aa';
    if (intensity === 2) return '#fdba74';
    if (intensity === 3) return '#fb923c';
    return '#f97316';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-10 gap-1 p-4">
          {data.map((day: any, index: number) => (
            <div
              key={index}
              className="aspect-square rounded-sm flex items-center justify-center text-xs font-medium"
              style={{ backgroundColor: getIntensityColor(day.intensity) }}
              title={`${day.date}: ${day.sessions} sessions`}
            >
              {day.day}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between text-xs text-gray-500 mt-4">
          <span>Less</span>
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map((intensity) => (
              <div
                key={intensity}
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: getIntensityColor(intensity) }}
              />
            ))}
          </div>
          <span>More</span>
        </div>
      </CardContent>
    </Card>
  );
};

export const PerformanceRadarChart = ({
  title, data, height = 300
}: {
  title: string;
  data: Array<{ metric: string; value: number; fullMark: number }>;
  height?: number;
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <RadarChart data={data}>
            <PolarGrid stroke="#f0f0f0" />
            <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12, fill: '#666' }} />
            <PolarRadiusAxis 
              angle={90} 
              domain={[0, 100]} 
              tick={{ fontSize: 10, fill: '#666' }}
            />
            <Radar
              name="Performance"
              dataKey="value"
              stroke="#f97316"
              fill="#f97316"
              fillOpacity={0.3}
              strokeWidth={2}
            />
            <Tooltip 
              formatter={(value: number) => [`${value}%`, 'Score']}
              labelStyle={{ color: '#333' }}
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px' }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
