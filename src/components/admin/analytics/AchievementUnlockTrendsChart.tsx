import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { getAchievementUnlockTrends } from "@/services/adminAnalyticsService";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";

interface AchievementUnlockTrendsChartProps {
  daysBack?: number;
}

const AchievementUnlockTrendsChart = ({ daysBack = 30 }: AchievementUnlockTrendsChartProps) => {
  const { data: trendsData, isLoading, error } = useQuery({
    queryKey: ["admin-analytics", "achievement-unlock-trends", daysBack],
    queryFn: () => getAchievementUnlockTrends(daysBack),
  });

  if (isLoading) {
    return <Skeleton className="h-[500px] w-full" />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[500px] text-muted-foreground">
        <p>Error loading achievement unlock trends data</p>
      </div>
    );
  }

  if (!trendsData || trendsData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[500px] text-muted-foreground">
        <p>No unlock trends data available</p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd');
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      consistency: '#3b82f6',
      performance: '#10b981',
      exploration: '#f59e0b',
      social: '#8b5cf6',
      milestone: '#ef4444',
      category_specific: '#06b6d4',
      cross_category: '#f97316',
    };
    return colors[category as keyof typeof colors] || '#6b7280';
  };

  // Process data for category breakdown visualization
  const processedData = trendsData.map(item => ({
    ...item,
    date_formatted: formatDate(item.date),
    // Extract category breakdown values
    consistency: item.category_breakdown?.consistency || 0,
    performance: item.category_breakdown?.performance || 0,
    exploration: item.category_breakdown?.exploration || 0,
    social: item.category_breakdown?.social || 0,
    milestone: item.category_breakdown?.milestone || 0,
    category_specific: item.category_breakdown?.category_specific || 0,
    cross_category: item.category_breakdown?.cross_category || 0,
  }));

  const totalUnlocks = trendsData.reduce((sum, item) => sum + item.total_unlocks, 0);
  const averageDaily = Math.round(totalUnlocks / trendsData.length);
  const peakDay = trendsData.reduce((max, item) => 
    item.total_unlocks > max.total_unlocks ? item : max
  );

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-md">
          <p className="font-medium">{format(new Date(data.date), 'MMMM dd, yyyy')}</p>
          <div className="space-y-1 text-sm">
            <p>Total Unlocks: <span className="font-medium text-primary">{data.total_unlocks}</span></p>
            <p>Unique Users: <span className="font-medium">{data.unique_users}</span></p>
            {data.most_unlocked_achievement && (
              <p>Most Popular: <span className="font-medium">{data.most_unlocked_achievement}</span></p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  const CategoryTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-md max-w-xs">
          <p className="font-medium">{label}</p>
          <div className="space-y-1 text-sm">
            {payload.map((entry: any, index: number) => (
              <p key={index} style={{ color: entry.color }}>
                {entry.name}: <span className="font-medium">{entry.value}</span>
              </p>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Unlocks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUnlocks.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Last {daysBack} days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Daily Average</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageDaily}</div>
            <p className="text-xs text-muted-foreground">Unlocks per day</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Peak Day</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{peakDay.total_unlocks}</div>
            <p className="text-xs text-muted-foreground">
              {format(new Date(peakDay.date), 'MMM dd')}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="trends" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="trends">Unlock Trends</TabsTrigger>
          <TabsTrigger value="categories">Category Breakdown</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Achievement Unlock Trends</CardTitle>
              <p className="text-sm text-muted-foreground">
                Daily achievement unlocks and unique user engagement over time
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart
                  data={processedData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="date_formatted" 
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="total_unlocks" 
                    stroke="hsl(var(--primary))" 
                    fill="hsl(var(--primary))"
                    fillOpacity={0.3}
                    name="Total Unlocks"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="unique_users" 
                    stroke="hsl(var(--secondary))" 
                    fill="hsl(var(--secondary))"
                    fillOpacity={0.3}
                    name="Unique Users"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Category Breakdown Over Time</CardTitle>
              <p className="text-sm text-muted-foreground">
                Achievement unlocks by category showing engagement patterns
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart
                  data={processedData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="date_formatted" 
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis />
                  <Tooltip content={<CategoryTooltip />} />
                  
                  <Line 
                    type="monotone" 
                    dataKey="consistency" 
                    stroke={getCategoryColor('consistency')}
                    strokeWidth={2}
                    name="Consistency"
                    connectNulls={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="performance" 
                    stroke={getCategoryColor('performance')}
                    strokeWidth={2}
                    name="Performance"
                    connectNulls={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="exploration" 
                    stroke={getCategoryColor('exploration')}
                    strokeWidth={2}
                    name="Exploration"
                    connectNulls={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="social" 
                    stroke={getCategoryColor('social')}
                    strokeWidth={2}
                    name="Social"
                    connectNulls={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="milestone" 
                    stroke={getCategoryColor('milestone')}
                    strokeWidth={2}
                    name="Milestone"
                    connectNulls={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="category_specific" 
                    stroke={getCategoryColor('category_specific')}
                    strokeWidth={2}
                    name="Category Specific"
                    connectNulls={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="cross_category" 
                    stroke={getCategoryColor('cross_category')}
                    strokeWidth={2}
                    name="Cross Category"
                    connectNulls={false}
                  />
                </LineChart>
              </ResponsiveContainer>

              {/* Legend */}
              <div className="flex flex-wrap gap-4 mt-4 text-xs">
                {Object.entries(getCategoryColor).map(([category, color]) => (
                  <div key={category} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded" 
                      style={{ backgroundColor: getCategoryColor(category) }}
                    ></div>
                    <span className="capitalize">
                      {category.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AchievementUnlockTrendsChart;