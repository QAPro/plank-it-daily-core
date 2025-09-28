import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAdmin } from '@/hooks/useAdmin';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

interface NotificationMetrics {
  totalSent: number;
  totalDelivered: number;
  totalClicked: number;
  deliveryRate: number;
  clickThroughRate: number;
  optOutRate: number;
}

interface NotificationTypeStats {
  type: string;
  sent: number;
  clicked: number;
  ctr: number;
}

interface DailyStats {
  date: string;
  sent: number;
  clicked: number;
}

const NotificationAnalyticsDashboard = () => {
  const { isAdmin } = useAdmin();
  const [metrics, setMetrics] = useState<NotificationMetrics | null>(null);
  const [typeStats, setTypeStats] = useState<NotificationTypeStats[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    if (isAdmin) {
      fetchAnalytics();
    }
  }, [isAdmin, timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const daysBack = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysBack);

      // Fetch overall metrics
      const { data: logsData } = await supabase
        .from('notification_logs')
        .select('*')
        .gte('sent_at', startDate.toISOString());

      const { data: interactionsData } = await supabase
        .from('notification_interactions')
        .select('*')
        .gte('clicked_at', startDate.toISOString());

      const { data: prefsData } = await supabase
        .from('user_preferences')
        .select('push_notifications_enabled')
        .eq('push_notifications_enabled', false);

      // Calculate metrics
      const totalSent = logsData?.length || 0;
      const totalDelivered = logsData?.filter(log => log.delivery_status === 'sent').length || 0;
      const totalClicked = interactionsData?.length || 0;
      const optedOutUsers = prefsData?.length || 0;

      const deliveryRate = totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0;
      const clickThroughRate = totalDelivered > 0 ? (totalClicked / totalDelivered) * 100 : 0;

      setMetrics({
        totalSent,
        totalDelivered,
        totalClicked,
        deliveryRate,
        clickThroughRate,
        optOutRate: optedOutUsers
      });

      // Calculate type stats
      const typeStatsMap = new Map<string, { sent: number; clicked: number }>();
      
      logsData?.forEach(log => {
        if (log.delivery_status === 'sent') {
          const current = typeStatsMap.get(log.notification_type) || { sent: 0, clicked: 0 };
          typeStatsMap.set(log.notification_type, { ...current, sent: current.sent + 1 });
        }
      });

      interactionsData?.forEach(interaction => {
        const current = typeStatsMap.get(interaction.notification_type) || { sent: 0, clicked: 0 };
        typeStatsMap.set(interaction.notification_type, { ...current, clicked: current.clicked + 1 });
      });

      const typeStatsArray = Array.from(typeStatsMap.entries()).map(([type, stats]) => ({
        type: type.charAt(0).toUpperCase() + type.slice(1),
        sent: stats.sent,
        clicked: stats.clicked,
        ctr: stats.sent > 0 ? (stats.clicked / stats.sent) * 100 : 0
      }));

      setTypeStats(typeStatsArray);

      // Calculate daily stats
      const dailyStatsMap = new Map<string, { sent: number; clicked: number }>();
      
      logsData?.forEach(log => {
        if (log.delivery_status === 'sent') {
          const date = new Date(log.sent_at).toLocaleDateString();
          const current = dailyStatsMap.get(date) || { sent: 0, clicked: 0 };
          dailyStatsMap.set(date, { ...current, sent: current.sent + 1 });
        }
      });

      interactionsData?.forEach(interaction => {
        const date = new Date(interaction.clicked_at).toLocaleDateString();
        const current = dailyStatsMap.get(date) || { sent: 0, clicked: 0 };
        dailyStatsMap.set(date, { ...current, clicked: current.clicked + 1 });
      });

      const dailyStatsArray = Array.from(dailyStatsMap.entries())
        .map(([date, stats]) => ({ date, ...stats }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(-14); // Last 14 days max

      setDailyStats(dailyStatsArray);

    } catch (error) {
      console.error('Error fetching notification analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Admin access required to view notification analytics.</p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <span>Loading analytics...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Notification Analytics</h2>
        <div className="flex gap-2">
          {['7d', '30d', '90d'].map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(range)}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
            </Button>
          ))}
          <Button onClick={fetchAnalytics} variant="outline" size="sm">
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Total Sent</div>
            <div className="text-2xl font-bold">{metrics?.totalSent || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Delivered</div>
            <div className="text-2xl font-bold">{metrics?.totalDelivered || 0}</div>
            <div className="text-xs text-green-600">{metrics?.deliveryRate.toFixed(1)}% rate</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Clicked</div>
            <div className="text-2xl font-bold">{metrics?.totalClicked || 0}</div>
            <div className="text-xs text-blue-600">{metrics?.clickThroughRate.toFixed(1)}% CTR</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Opt-outs</div>
            <div className="text-2xl font-bold">{metrics?.optOutRate || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Engagement</div>
            <div className="text-2xl font-bold">
              {metrics?.clickThroughRate ? (
                <Badge variant={metrics.clickThroughRate > 5 ? 'default' : metrics.clickThroughRate > 2 ? 'secondary' : 'destructive'}>
                  {metrics.clickThroughRate > 5 ? 'High' : metrics.clickThroughRate > 2 ? 'Medium' : 'Low'}
                </Badge>
              ) : 'N/A'}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="types" className="space-y-4">
        <TabsList>
          <TabsTrigger value="types">By Type</TabsTrigger>
          <TabsTrigger value="daily">Daily Trends</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="types" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Notifications by Type</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={typeStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="sent" fill="#8884d8" name="Sent" />
                    <Bar dataKey="clicked" fill="#82ca9d" name="Clicked" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Click-Through Rates</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={typeStats}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="ctr"
                      label={({ type, ctr }) => `${type}: ${ctr.toFixed(1)}%`}
                    >
                      {typeStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${Number(value).toFixed(1)}%`, 'CTR']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="daily" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Notification Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={dailyStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="sent" stroke="#8884d8" name="Sent" />
                  <Line type="monotone" dataKey="clicked" stroke="#82ca9d" name="Clicked" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {typeStats.map((stat, index) => (
              <Card key={stat.type}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {stat.type}
                    <Badge variant={stat.ctr > 5 ? 'default' : stat.ctr > 2 ? 'secondary' : 'destructive'}>
                      {stat.ctr.toFixed(1)}% CTR
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Sent</span>
                      <span className="font-medium">{stat.sent}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Clicked</span>
                      <span className="font-medium">{stat.clicked}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${Math.min(stat.ctr * 10, 100)}%` }}
                      ></div>
                    </div>
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

export default NotificationAnalyticsDashboard;