
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { getUserRegistrationTrends, RegistrationTrend } from "@/services/adminAnalyticsService";
import { useAdminAnalytics } from "@/contexts/AdminAnalyticsContext";

interface UserEngagementChartsProps {
  daysBack?: number;
}

const UserEngagementCharts = ({ daysBack = 30 }: UserEngagementChartsProps) => {
  const { setDrillDown } = useAdminAnalytics();
  const [chartData, setChartData] = useState<RegistrationTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [daysBack]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUserRegistrationTrends(daysBack);
      setChartData(data);
    } catch (err: any) {
      setError(err.message || "Failed to load user engagement data");
    } finally {
      setLoading(false);
    }
  };

  const handleChartClick = (event: any) => {
    if (event && event.activePayload && event.activePayload[0]) {
      const clickedData = event.activePayload[0].payload;
      console.log('Chart clicked:', clickedData);
      
      // Set drill-down for the clicked date
      setDrillDown('timeframe', clickedData.date, {
        registrations: clickedData.new_users,
        cumulativeUsers: clickedData.cumulative_users,
        period: 'daily'
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Registration Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse h-80 bg-gray-100 rounded-md"></div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Registration Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-500">{error}</div>
        </CardContent>
      </Card>
    );
  }

  const chartConfig = {
    new_users: {
      label: "New Users",
      color: "hsl(var(--chart-1))",
    },
    cumulative_users: {
      label: "Cumulative Users", 
      color: "hsl(var(--chart-2))",
    },
  };

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          User Registration Trends
          <Badge variant="secondary" className="text-xs">Click to drill-down</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={chartData} 
              onClick={handleChartClick}
              className="cursor-pointer"
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line 
                type="monotone" 
                dataKey="new_users" 
                stroke="var(--color-new_users)" 
                strokeWidth={2}
                dot={{ fill: "var(--color-new_users)", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "var(--color-new_users)", strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="cumulative_users" 
                stroke="var(--color-cumulative_users)" 
                strokeWidth={2}
                dot={{ fill: "var(--color-cumulative_users)", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "var(--color-cumulative_users)", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="mt-4 text-xs text-muted-foreground text-center">
          💡 Click on chart points to drill down into specific dates
        </div>
      </CardContent>
    </Card>
  );
};

export default UserEngagementCharts;
