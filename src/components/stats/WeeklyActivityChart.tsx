import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts";

interface WeeklyActivityChartProps {
  data: Array<{
    label: string;
    workoutCount: number;
  }>;
}

const WeeklyActivityChart = ({ data }: WeeklyActivityChartProps) => {
  return (
    <Card className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-[#7F8C8D] uppercase" style={{ letterSpacing: '0.5px' }}>
          7-Day Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data}>
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FF6B35" />
                <stop offset="100%" stopColor="#FDB961" />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="label" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#7F8C8D', fontSize: 12 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#7F8C8D', fontSize: 12 }}
              allowDecimals={false}
            />
            <Bar 
              dataKey="workoutCount" 
              fill="url(#barGradient)"
              radius={[8, 8, 0, 0]}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`}
                  fill={entry.workoutCount > 0 ? "url(#barGradient)" : "#E5E7EB"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default WeeklyActivityChart;
