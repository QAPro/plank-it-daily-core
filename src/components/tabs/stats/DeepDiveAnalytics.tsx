import { motion } from "framer-motion";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, TrendingUp, Brain, PieChart as PieChartIcon } from "lucide-react";
import { useDeepDiveAnalytics } from "@/hooks/useDeepDiveAnalytics";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { exportSessionsToCSV } from "@/utils/exportSessions";
import { useToast } from "@/hooks/use-toast";

const COLORS = ['#F97316', '#DC2626', '#EA580C', '#FB923C', '#FDBA74'];

type DateRange = 7 | 30 | 90 | 180 | 'all';
type MetricType = 'duration' | 'momentum' | 'workouts' | 'avg_duration' | 'variety';

const METRIC_LABELS: Record<MetricType, { label: string; unit: string; yAxisLabel: string }> = {
  duration: { label: 'Workout Duration', unit: 'min', yAxisLabel: 'Minutes' },
  momentum: { label: 'Momentum Score', unit: 'pts', yAxisLabel: 'Points' },
  workouts: { label: 'Workouts per Week', unit: 'workouts', yAxisLabel: 'Count' },
  avg_duration: { label: 'Average Duration', unit: '', yAxisLabel: 'Duration' },
  variety: { label: 'Variety Score', unit: 'unique exercises', yAxisLabel: 'Unique Exercises' },
};

const DeepDiveAnalytics = () => {
  const [timeRange, setTimeRange] = useState<DateRange>(30);
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('duration');
  const { performanceTrends, aiInsights, exerciseBreakdown, isLoading } = useDeepDiveAnalytics(timeRange, selectedMetric);
  const { toast } = useToast();

  const formatDuration = (minutes: number): string => {
    const totalSeconds = Math.round(minutes * 60);
    
    if (totalSeconds < 60) {
      return `${totalSeconds} sec`;
    }
    
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    
    if (secs === 0) {
      return `${mins} min`;
    }
    
    return `${mins} min ${secs} sec`;
  };

  const handleExport = async () => {
    try {
      await exportSessionsToCSV();
      toast({
        title: "Export Successful",
        description: "Your workout data has been downloaded as CSV.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-64 bg-muted rounded" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-4 lg:p-6 pb-32 space-y-6 max-w-7xl mx-auto"
    >
      {/* Performance Trends */}
      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Performance Trends
              </CardTitle>
              <Tabs value={timeRange.toString()} onValueChange={(v) => setTimeRange(v === 'all' ? 'all' : Number(v) as DateRange)}>
                <TabsList>
                  <TabsTrigger value="7">7 Days</TabsTrigger>
                  <TabsTrigger value="30">30 Days</TabsTrigger>
                  <TabsTrigger value="90">90 Days</TabsTrigger>
                  <TabsTrigger value="180">6 Months</TabsTrigger>
                  <TabsTrigger value="all">All Time</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Metric:</span>
              <Select value={selectedMetric} onValueChange={(v) => setSelectedMetric(v as MetricType)}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="duration">Workout Duration</SelectItem>
                  <SelectItem value="momentum">Momentum Score</SelectItem>
                  <SelectItem value="workouts">Workouts per Week</SelectItem>
                  <SelectItem value="avg_duration">Average Duration</SelectItem>
                  <SelectItem value="variety">Variety Score</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={performanceTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis 
                dataKey="date" 
                stroke="#64748B"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#64748B"
                style={{ fontSize: '12px' }}
                label={{ value: METRIC_LABELS[selectedMetric].yAxisLabel, angle: -90, position: 'insideLeft', style: { fontSize: '12px' } }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
                formatter={(value: number) => {
                  const displayValue = selectedMetric === 'avg_duration' 
                    ? formatDuration(value)
                    : `${value} ${METRIC_LABELS[selectedMetric].unit}`;
                  return [displayValue, METRIC_LABELS[selectedMetric].label];
                }}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#F97316" 
                strokeWidth={2}
                dot={{ fill: '#F97316', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Personalized Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {aiInsights.map((insight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg border border-primary/20"
              >
                <h4 className="font-semibold text-foreground mb-2">{insight.title}</h4>
                <p className="text-sm text-muted-foreground">{insight.description}</p>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Exercise Breakdown */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-primary" />
              Exercise Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={exerciseBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {exerciseBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Most Frequent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {exerciseBreakdown.slice(0, 3).map((exercise, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{exercise.name}</span>
                    <span className="text-sm text-muted-foreground">{exercise.percentage}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${exercise.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CSV Export */}
      <Card>
        <CardHeader>
          <CardTitle>Data Export</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground mb-1">Download your complete workout history</p>
              <p className="text-xs text-muted-foreground">Export all sessions as CSV for external analysis</p>
            </div>
            <Button onClick={handleExport} className="gap-2">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DeepDiveAnalytics;
