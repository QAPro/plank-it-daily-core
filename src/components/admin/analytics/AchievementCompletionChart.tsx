import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { getAchievementCompletionAnalytics } from "@/services/adminAnalyticsService";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const AchievementCompletionChart = () => {
  const { data: completionData, isLoading, error } = useQuery({
    queryKey: ["admin-analytics", "achievement-completion"],
    queryFn: getAchievementCompletionAnalytics,
  });

  if (isLoading) {
    return <Skeleton className="h-[400px] w-full" />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[400px] text-muted-foreground">
        <p>Error loading achievement completion data</p>
      </div>
    );
  }

  if (!completionData || completionData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px] text-muted-foreground">
        <p>No achievement data available</p>
      </div>
    );
  }

  // Sort by completion rate and take top 20 for visibility
  const sortedData = [...completionData]
    .sort((a, b) => b.completion_rate - a.completion_rate)
    .slice(0, 20)
    .map(item => ({
      ...item,
      name: item.achievement_name.length > 20 
        ? item.achievement_name.substring(0, 20) + '...' 
        : item.achievement_name
    }));

  const getRarityColor = (rarity: string) => {
    const colors = {
      common: 'hsl(var(--muted))',
      uncommon: 'hsl(var(--primary))',
      rare: 'hsl(var(--secondary))',
      epic: 'hsl(var(--accent))',
      legendary: 'hsl(var(--destructive))'
    };
    return colors[rarity as keyof typeof colors] || colors.common;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-md">
          <p className="font-medium">{data.achievement_name}</p>
          <div className="space-y-1 text-sm">
            <p>Completion Rate: <span className="font-medium text-primary">{data.completion_rate}%</span></p>
            <p>Total Unlocks: <span className="font-medium">{data.total_unlocks.toLocaleString()}</span></p>
            <p>Avg Days to Unlock: <span className="font-medium">{data.avg_days_to_unlock}</span></p>
            <div className="flex items-center gap-2">
              <span>Category:</span>
              <Badge variant="outline" className="text-xs">{data.category}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <span>Rarity:</span>
              <Badge 
                variant="outline" 
                className="text-xs"
                style={{ 
                  backgroundColor: getRarityColor(data.rarity) + '20',
                  borderColor: getRarityColor(data.rarity),
                  color: getRarityColor(data.rarity)
                }}
              >
                {data.rarity}
              </Badge>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">
          Top {sortedData.length} Achievements
        </Badge>
        <Badge variant="outline">
          Sorted by Completion Rate
        </Badge>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={sortedData}
          margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="name" 
            angle={-45}
            textAnchor="end"
            height={80}
            interval={0}
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            label={{ value: 'Completion Rate (%)', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="completion_rate" name="Completion Rate">
            {sortedData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={getRarityColor(entry.rarity)}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: getRarityColor('common') }}></div>
          <span>Common</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: getRarityColor('uncommon') }}></div>
          <span>Uncommon</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: getRarityColor('rare') }}></div>
          <span>Rare</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: getRarityColor('epic') }}></div>
          <span>Epic</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: getRarityColor('legendary') }}></div>
          <span>Legendary</span>
        </div>
      </div>
    </div>
  );
};

export default AchievementCompletionChart;