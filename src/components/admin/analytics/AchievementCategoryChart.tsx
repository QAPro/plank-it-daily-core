import { useQuery } from "@tanstack/react-query";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { getAchievementCategoryAnalytics } from "@/services/adminAnalyticsService";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AchievementCategoryChart = () => {
  const { data: categoryData, isLoading, error } = useQuery({
    queryKey: ["admin-analytics", "achievement-categories"],
    queryFn: getAchievementCategoryAnalytics,
  });

  if (isLoading) {
    return <Skeleton className="h-[500px] w-full" />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[500px] text-muted-foreground">
        <p>Error loading achievement category data</p>
      </div>
    );
  }

  if (!categoryData || categoryData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[500px] text-muted-foreground">
        <p>No category data available</p>
      </div>
    );
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      consistency: 'hsl(var(--primary))',
      performance: 'hsl(var(--secondary))',
      exploration: 'hsl(var(--accent))',
      social: 'hsl(var(--muted-foreground))',
      milestone: 'hsl(var(--destructive))',
      category_specific: 'hsl(var(--success))',
      cross_category: 'hsl(var(--warning))',
    };
    return colors[category as keyof typeof colors] || 'hsl(var(--muted))';
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      consistency: '🔥',
      performance: '⚡',
      exploration: '🔍',
      social: '👥',
      milestone: '🏆',
      category_specific: '🎯',
      cross_category: '🌟',
    };
    return icons[category as keyof typeof icons] || '📊';
  };

  const formatCategoryName = (category: string) => {
    return category.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const pieData = categoryData.map(item => ({
    name: formatCategoryName(item.category),
    value: item.total_unlocks,
    engagement_score: item.category_engagement_score,
    raw_category: item.category
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-md">
          <p className="font-medium flex items-center gap-2">
            <span>{getCategoryIcon(data.raw_category)}</span>
            {data.name}
          </p>
          <div className="space-y-1 text-sm">
            <p>Total Unlocks: <span className="font-medium text-primary">{data.value.toLocaleString()}</span></p>
            <p>Engagement Score: <span className="font-medium">{data.engagement_score}</span></p>
          </div>
        </div>
      );
    }
    return null;
  };

  const EngagementTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-md">
          <p className="font-medium flex items-center gap-2">
            <span>{getCategoryIcon(data.category)}</span>
            {formatCategoryName(data.category)}
          </p>
          <div className="space-y-1 text-sm">
            <p>Engagement Score: <span className="font-medium text-primary">{data.category_engagement_score}</span></p>
            <p>Total Achievements: <span className="font-medium">{data.total_achievements}</span></p>
            <p>Unique Users: <span className="font-medium">{data.unique_users_unlocked.toLocaleString()}</span></p>
            <p>Avg Completion: <span className="font-medium">{data.avg_completion_rate}%</span></p>
            <p>Most Popular: <span className="font-medium">{data.most_popular_achievement}</span></p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="distribution" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>

        <TabsContent value="distribution" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Achievement Category Distribution</CardTitle>
              <p className="text-sm text-muted-foreground">
                Total unlocks by achievement category
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={getCategoryColor(entry.raw_category)}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Category Engagement Scores</CardTitle>
              <p className="text-sm text-muted-foreground">
                Engagement scoring based on user participation and achievement diversity
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={categoryData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="category"
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    interval={0}
                    tick={{ fontSize: 12 }}
                    tickFormatter={formatCategoryName}
                  />
                  <YAxis 
                    label={{ value: 'Engagement Score', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip content={<EngagementTooltip />} />
                  <Bar dataKey="category_engagement_score" name="Engagement Score">
                    {categoryData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={getCategoryColor(entry.category)}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {categoryData.map((category) => (
              <Card key={category.category}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <span>{getCategoryIcon(category.category)}</span>
                    {formatCategoryName(category.category)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Total Achievements:</span>
                      <p className="font-semibold">{category.total_achievements}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Total Unlocks:</span>
                      <p className="font-semibold">{category.total_unlocks.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Unique Users:</span>
                      <p className="font-semibold">{category.unique_users_unlocked.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Avg Completion:</span>
                      <p className="font-semibold">{category.avg_completion_rate}%</p>
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t">
                    <span className="text-sm text-muted-foreground">Most Popular Achievement:</span>
                    <p className="font-medium text-sm">{category.most_popular_achievement}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <Badge 
                      variant="outline"
                      style={{ 
                        backgroundColor: getCategoryColor(category.category) + '20',
                        borderColor: getCategoryColor(category.category),
                        color: getCategoryColor(category.category)
                      }}
                    >
                      Engagement: {category.category_engagement_score}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AchievementCategoryChart;