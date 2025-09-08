
import React, { useState, useEffect, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { TrendingUp, Info } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getUserRegistrationTrends, RegistrationTrend } from "@/services/adminAnalyticsService";
import { useAdminAnalytics } from "@/contexts/AdminAnalyticsContext";
import { ChartSkeleton } from "@/components/ui/chart-skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { AccessibleChartWrapper } from "./AccessibleChartWrapper";
import { useRetryWithBackoff } from "@/hooks/useRetryWithBackoff";
import { useDebounce } from "@/hooks/usePerformanceOptimization";

interface EnhancedUserEngagementChartsProps {
  daysBack?: number;
}

const EnhancedUserEngagementCharts = memo(({ daysBack = 30 }: EnhancedUserEngagementChartsProps) => {
  const { setDrillDown } = useAdminAnalytics();
  const { executeWithRetry, isRetrying } = useRetryWithBackoff();
  const [chartData, setChartData] = useState<RegistrationTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredData, setHoveredData] = useState<any>(null);
  const [selectedRange, setSelectedRange] = useState<string>('all');

  const debouncedDaysBack = useDebounce(daysBack, 500);

  useEffect(() => {
    loadData();
  }, [debouncedDaysBack]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await executeWithRetry(
        () => getUserRegistrationTrends(debouncedDaysBack),
        { maxRetries: 3, baseDelay: 1000 }
      );
      setChartData(data);
    } catch (err: any) {
      console.error('Failed to load user engagement data:', err);
      setError(err.message || "Failed to load user engagement data");
    } finally {
      setLoading(false);
    }
  };

  const handleChartClick = (event: any) => {
    if (event && event.activePayload && event.activePayload[0]) {
      const clickedData = event.activePayload[0].payload;
      console.log('Chart clicked:', clickedData);
      
      setDrillDown('timeframe', clickedData.date, {
        registrations: clickedData.new_users,
        cumulativeUsers: clickedData.cumulative_users,
        period: 'daily'
      });
    }
  };

  const handleChartHover = (data: any) => {
    if (data && data.activePayload && data.activePayload[0]) {
      setHoveredData(data.activePayload[0].payload);
    } else {
      setHoveredData(null);
    }
  };

  const filteredData = chartData.filter(item => {
    if (selectedRange === 'all') return true;
    if (selectedRange === 'week') return chartData.indexOf(item) >= chartData.length - 7;
    if (selectedRange === 'month') return chartData.indexOf(item) >= chartData.length - 30;
    return true;
  });

  if (loading) {
    return <ChartSkeleton title={true} lines={2} showLegend={true} />;
  }

  if (error) {
    return (
      <ErrorState
        title="User Engagement Data Error"
        message={error}
        type="server"
        onRetry={loadData}
        retrying={isRetrying}
        showDetails={true}
        details={error}
      />
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

  const chartDescription = `Interactive line chart showing user registration trends over ${daysBack} days. Shows ${filteredData.length} data points with new user registrations and cumulative user growth.`;

  return (
    <Card className="transition-all duration-200 hover:shadow-lg group">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-orange-600" />
            <CardTitle className="group-hover:text-orange-600 transition-colors">
              User Registration Trends
            </CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Click on data points to drill down into specific dates</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700">
              Interactive
            </Badge>
            {hoveredData && (
              <Badge variant="outline" className="text-xs">
                {new Date(hoveredData.date).toLocaleDateString()}
              </Badge>
            )}
          </div>
        </div>
        
        {/* Range selector */}
        <div className="flex gap-2 mt-2">
          {['all', 'month', 'week'].map((range) => (
            <Button
              key={range}
              variant={selectedRange === range ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedRange(range)}
              className="text-xs h-7"
            >
              {range === 'all' ? 'All Time' : range === 'month' ? '30 Days' : '7 Days'}
            </Button>
          ))}
        </div>
      </CardHeader>
      
      <CardContent>
        <AccessibleChartWrapper
          title="User Registration Trends"
          description={chartDescription}
          data={filteredData}
          ariaLabel="User registration trends over time"
        >
          <ChartContainer config={chartConfig} className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart 
                data={filteredData} 
                onClick={handleChartClick}
                onMouseMove={handleChartHover}
                className="cursor-pointer"
              >
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                  className="text-xs"
                />
                <YAxis className="text-xs" />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  cursor={{ stroke: 'var(--color-new_users)', strokeWidth: 1, strokeDasharray: '5 5' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="new_users" 
                  stroke="var(--color-new_users)" 
                  strokeWidth={3}
                  dot={{ fill: "var(--color-new_users)", strokeWidth: 2, r: 5 }}
                  activeDot={{ 
                    r: 8, 
                    stroke: "var(--color-new_users)", 
                    strokeWidth: 3,
                    className: "animate-pulse"
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="cumulative_users" 
                  stroke="var(--color-cumulative_users)" 
                  strokeWidth={3}
                  dot={{ fill: "var(--color-cumulative_users)", strokeWidth: 2, r: 5 }}
                  activeDot={{ 
                    r: 8, 
                    stroke: "var(--color-cumulative_users)", 
                    strokeWidth: 3,
                    className: "animate-pulse"
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </AccessibleChartWrapper>
        
        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>💡 Click data points for detailed analysis</span>
            <span>⌨️ Use Tab + Enter for keyboard navigation</span>
          </div>
          <span>Updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </CardContent>
    </Card>
  );
});

EnhancedUserEngagementCharts.displayName = 'EnhancedUserEngagementCharts';

export default EnhancedUserEngagementCharts;
