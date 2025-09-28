
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  CreditCard, 
  AlertTriangle,
  Target,
  Activity,
  PieChart
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart as RechartsPieChart, Cell } from 'recharts';
import { ChartSkeleton, KPICardSkeleton } from '@/components/ui/chart-skeleton';
import { AccessibleChartWrapper } from './AccessibleChartWrapper';
import ConversionFunnelChart from './ConversionFunnelChart';

interface SubscriptionMetrics {
  activeSubscribers: number;
  mrr: number;
  arpu: number;
  churnRate30d: number;
  ltv: number;
  revenue30d: number;
  paymentFailureRate: number;
  atRiskSubscribers: number;
  mrrGrowthRate: number;
}

interface RevenueDataPoint {
  date: string;
  revenue: number;
  activations: number;
  cancellations: number;
}

interface PlanPerformance {
  planName: string;
  subscribers: number;
  mrr: number;
  avgPrice: number;
}

interface CohortData {
  cohortMonth: string;
  cohortSize: number;
  retention30d: number;
  retention60d: number;
  retention90d: number;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe'];

const EnhancedSubscriptionAnalyticsDashboard = () => {
  const { data: subscriptionData, isLoading: loadingSubscriptions } = useQuery({
    queryKey: ['enhanced-subscription-analytics'],
    queryFn: async () => {
      console.log('[Enhanced Subscription Analytics] Fetching subscription data');
      
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
      const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);

      // Get active subscriptions with plan details
      const { data: activeSubscriptions, error: subError } = await supabase
        .from('subscriptions')
        .select(`
          id,
          user_id,
          plan_id,
          status,
          current_period_end,
          cancel_at_period_end,
          created_at,
          canceled_at,
          subscription_plans!inner(
            name,
            price_cents,
            billing_interval
          )
        `)
        .eq('status', 'active');

      if (subError) throw subError;

      // Get billing transactions
      const { data: transactions, error: txError } = await supabase
        .from('billing_transactions')
        .select('amount_cents, status, created_at')
        .gte('created_at', sixtyDaysAgo.toISOString());

      if (txError) throw txError;

      // Get subscription creation/cancellation history
      const { data: subscriptionHistory, error: histError } = await supabase
        .from('subscriptions')
        .select(`
          id,
          status,
          created_at,
          canceled_at,
          subscription_plans!inner(name, price_cents, billing_interval)
        `)
        .gte('created_at', sixMonthsAgo.toISOString());

      if (histError) throw histError;

      return {
        activeSubscriptions: activeSubscriptions || [],
        transactions: transactions || [],
        subscriptionHistory: subscriptionHistory || []
      };
    },
    staleTime: 30_000
  });

  const metrics = useMemo((): SubscriptionMetrics | null => {
    if (!subscriptionData) return null;

    const { activeSubscriptions, transactions, subscriptionHistory } = subscriptionData;
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    // Calculate MRR (Monthly Recurring Revenue)
    const mrr = activeSubscriptions.reduce((total, sub) => {
      const plan = sub.subscription_plans;
      if (!plan) return total;
      
      const monthlyPrice = plan.billing_interval === 'year' 
        ? (plan.price_cents || 0) / 12 
        : (plan.price_cents || 0);
      
      return total + monthlyPrice;
    }, 0);

    const activeCount = activeSubscriptions.length;
    const arpu = activeCount > 0 ? mrr / activeCount : 0;

    // Calculate churn rate (last 30 days)
    const canceledInLast30Days = subscriptionHistory.filter(sub => 
      sub.canceled_at && 
      new Date(sub.canceled_at) >= thirtyDaysAgo
    ).length;
    
    const churnRate30d = activeCount > 0 ? (canceledInLast30Days / activeCount) * 100 : 0;

    // Estimate LTV (simple calculation: ARPU / monthly churn rate)
    const monthlyChurnRate = churnRate30d / 100;
    const ltv = monthlyChurnRate > 0 ? arpu / monthlyChurnRate : arpu * 12; // Cap at 12 months if churn is 0

    // Revenue in last 30 days
    const revenue30d = transactions
      .filter(tx => 
        tx.status === 'succeeded' && 
        new Date(tx.created_at) >= thirtyDaysAgo
      )
      .reduce((total, tx) => total + (tx.amount_cents || 0), 0);

    // Payment failure rate
    const recentTransactions = transactions.filter(tx => new Date(tx.created_at) >= thirtyDaysAgo);
    const failedTransactions = recentTransactions.filter(tx => tx.status === 'failed').length;
    const paymentFailureRate = recentTransactions.length > 0 ? (failedTransactions / recentTransactions.length) * 100 : 0;

    // At-risk subscribers (cancel at period end or expiring soon)
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const atRiskSubscribers = activeSubscriptions.filter(sub => 
      sub.cancel_at_period_end || 
      (sub.current_period_end && new Date(sub.current_period_end) <= sevenDaysFromNow)
    ).length;

    // MRR growth rate (current vs previous 30 days)
    const previousPeriodSubs = subscriptionHistory.filter(sub => 
      sub.status === 'active' && 
      new Date(sub.created_at) >= sixtyDaysAgo && 
      new Date(sub.created_at) < thirtyDaysAgo
    );
    
    const previousMrr = previousPeriodSubs.reduce((total, sub) => {
      const plan = sub.subscription_plans;
      if (!plan) return total;
      const monthlyPrice = plan.billing_interval === 'year' ? (plan.price_cents || 0) / 12 : (plan.price_cents || 0);
      return total + monthlyPrice;
    }, 0);

    const mrrGrowthRate = previousMrr > 0 ? ((mrr - previousMrr) / previousMrr) * 100 : 0;

    return {
      activeSubscribers: activeCount,
      mrr,
      arpu,
      churnRate30d,
      ltv: Math.min(ltv, arpu * 24), // Cap LTV at 24 months for sanity
      revenue30d,
      paymentFailureRate,
      atRiskSubscribers,
      mrrGrowthRate
    };
  }, [subscriptionData]);

  const revenueData = useMemo((): RevenueDataPoint[] => {
    if (!subscriptionData) return [];

    const { transactions, subscriptionHistory } = subscriptionData;
    const last30Days = [];
    const now = new Date();

    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayRevenue = transactions
        .filter(tx => 
          tx.status === 'succeeded' && 
          tx.created_at.startsWith(dateStr)
        )
        .reduce((sum, tx) => sum + (tx.amount_cents || 0), 0);

      const dayActivations = subscriptionHistory
        .filter(sub => sub.created_at.startsWith(dateStr))
        .length;

      const dayCancellations = subscriptionHistory
        .filter(sub => sub.canceled_at && sub.canceled_at.startsWith(dateStr))
        .length;

      last30Days.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: dayRevenue / 100, // Convert cents to dollars
        activations: dayActivations,
        cancellations: dayCancellations
      });
    }

    return last30Days;
  }, [subscriptionData]);

  const planPerformance = useMemo((): PlanPerformance[] => {
    if (!subscriptionData) return [];

    const { activeSubscriptions } = subscriptionData;
    const planMap = new Map();

    activeSubscriptions.forEach(sub => {
      const plan = sub.subscription_plans;
      if (!plan) return;

      const planName = plan.name;
      const monthlyPrice = plan.billing_interval === 'year' ? (plan.price_cents || 0) / 12 : (plan.price_cents || 0);

      if (!planMap.has(planName)) {
        planMap.set(planName, { subscribers: 0, totalMrr: 0 });
      }

      const data = planMap.get(planName);
      data.subscribers += 1;
      data.totalMrr += monthlyPrice;
    });

    return Array.from(planMap.entries()).map(([planName, data]) => ({
      planName,
      subscribers: data.subscribers,
      mrr: data.totalMrr / 100, // Convert to dollars
      avgPrice: data.subscribers > 0 ? (data.totalMrr / data.subscribers) / 100 : 0
    }));
  }, [subscriptionData]);

  const cohortData = useMemo((): CohortData[] => {
    if (!subscriptionData) return [];

    const { subscriptionHistory } = subscriptionData;
    const cohorts = new Map();
    const now = new Date();

    // Group subscriptions by creation month
    subscriptionHistory.forEach(sub => {
      const createdDate = new Date(sub.created_at);
      const cohortKey = `${createdDate.getFullYear()}-${String(createdDate.getMonth() + 1).padStart(2, '0')}`;
      
      if (!cohorts.has(cohortKey)) {
        cohorts.set(cohortKey, []);
      }
      cohorts.get(cohortKey).push(sub);
    });

    // Calculate retention rates for each cohort
    return Array.from(cohorts.entries())
      .map(([cohortMonth, subs]) => {
        const cohortSize = subs.length;
        const cohortStartDate = new Date(`${cohortMonth}-01`);
        
        // Calculate retention at 30, 60, 90 days
        const retention30d = subs.filter(sub => {
          if (sub.status !== 'active' && !sub.canceled_at) return false;
          if (!sub.canceled_at) return true; // Still active
          const cancelDate = new Date(sub.canceled_at);
          const retentionCheckDate = new Date(cohortStartDate.getTime() + 30 * 24 * 60 * 60 * 1000);
          return cancelDate > retentionCheckDate;
        }).length;

        const retention60d = subs.filter(sub => {
          if (sub.status !== 'active' && !sub.canceled_at) return false;
          if (!sub.canceled_at) return true;
          const cancelDate = new Date(sub.canceled_at);
          const retentionCheckDate = new Date(cohortStartDate.getTime() + 60 * 24 * 60 * 60 * 1000);
          return cancelDate > retentionCheckDate;
        }).length;

        const retention90d = subs.filter(sub => {
          if (sub.status !== 'active' && !sub.canceled_at) return false;
          if (!sub.canceled_at) return true;
          const cancelDate = new Date(sub.canceled_at);
          const retentionCheckDate = new Date(cohortStartDate.getTime() + 90 * 24 * 60 * 60 * 1000);
          return cancelDate > retentionCheckDate;
        }).length;

        return {
          cohortMonth,
          cohortSize,
          retention30d: cohortSize > 0 ? (retention30d / cohortSize) * 100 : 0,
          retention60d: cohortSize > 0 ? (retention60d / cohortSize) * 100 : 0,
          retention90d: cohortSize > 0 ? (retention90d / cohortSize) * 100 : 0
        };
      })
      .sort((a, b) => b.cohortMonth.localeCompare(a.cohortMonth))
      .slice(0, 6); // Last 6 months
  }, [subscriptionData]);

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cents / 100);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (loadingSubscriptions) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <KPICardSkeleton key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartSkeleton title height="h-80" lines={2} />
          <ChartSkeleton title height="h-80" bars={8} />
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  const healthAlerts = [
    ...(metrics.churnRate30d > 5 ? [{ 
      type: 'warning' as const, 
      message: `High churn rate: ${formatPercentage(metrics.churnRate30d)}`,
      action: 'Review customer feedback and improve retention strategies'
    }] : []),
    ...(metrics.paymentFailureRate > 10 ? [{
      type: 'error' as const,
      message: `High payment failure rate: ${formatPercentage(metrics.paymentFailureRate)}`,
      action: 'Check payment processing and notify affected customers'
    }] : []),
    ...(metrics.mrrGrowthRate < -5 ? [{
      type: 'error' as const,
      message: `Negative MRR growth: ${formatPercentage(metrics.mrrGrowthRate)}`,
      action: 'Focus on acquisition and reducing churn'
    }] : []),
    ...(metrics.atRiskSubscribers > metrics.activeSubscribers * 0.1 ? [{
      type: 'warning' as const,
      message: `${metrics.atRiskSubscribers} subscribers at risk of churning`,
      action: 'Engage with at-risk customers proactively'
    }] : [])
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{metrics.activeSubscribers.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Active Subscribers</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{formatCurrency(metrics.mrr)}</p>
                <p className="text-sm text-muted-foreground">Monthly Recurring Revenue</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
            <div className="mt-2">
              <Badge variant={metrics.mrrGrowthRate >= 0 ? "default" : "destructive"} className="text-xs">
                {metrics.mrrGrowthRate >= 0 ? '↗' : '↘'} {formatPercentage(Math.abs(metrics.mrrGrowthRate))}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{formatCurrency(metrics.revenue30d)}</p>
                <p className="text-sm text-muted-foreground">Revenue (30d)</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{formatPercentage(metrics.churnRate30d)}</p>
                <p className="text-sm text-muted-foreground">Churn Rate (30d)</p>
              </div>
              <Activity className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{formatCurrency(metrics.arpu)}</p>
                <p className="text-sm text-muted-foreground">ARPU</p>
              </div>
              <Target className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{formatCurrency(metrics.ltv)}</p>
                <p className="text-sm text-muted-foreground">Est. LTV</p>
              </div>
              <CreditCard className="w-8 h-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Health Alerts */}
      {healthAlerts.length > 0 && (
        <Card className="border-orange-200 bg-orange-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              Health Alerts & Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {healthAlerts.map((alert, index) => (
              <Alert key={index} className={alert.type === 'error' ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'}>
                <AlertDescription>
                  <div className="space-y-1">
                    <p className="font-medium">{alert.message}</p>
                    <p className="text-sm text-muted-foreground">{alert.action}</p>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Charts Row 1: Revenue Trend & Activations vs Cancellations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AccessibleChartWrapper
          title="Revenue Trend (30 Days)"
          description={`Daily revenue trend showing ${formatCurrency(metrics.revenue30d)} total revenue over the last 30 days`}
        >
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend (30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip 
                      content={<ChartTooltipContent />}
                      formatter={(value: number) => [formatCurrency(value * 100), 'Revenue']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </AccessibleChartWrapper>

        <AccessibleChartWrapper
          title="Activations vs Cancellations"
          description="Daily comparison of new subscriptions vs cancellations over the last 30 days"
        >
          <Card>
            <CardHeader>
              <CardTitle>Activations vs Cancellations</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area 
                      type="monotone" 
                      dataKey="activations" 
                      stackId="1"
                      stroke="#82ca9d" 
                      fill="#82ca9d"
                      fillOpacity={0.6}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="cancellations" 
                      stackId="2"
                      stroke="#ff7300" 
                      fill="#ff7300"
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </AccessibleChartWrapper>
      </div>

      {/* Charts Row 2: Plan Performance & Conversion Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AccessibleChartWrapper
          title="Plan Performance"
          description="Comparison of subscriber count and MRR contribution by subscription plan"
        >
          <Card>
            <CardHeader>
              <CardTitle>Plan Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={planPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="planName" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <ChartTooltip 
                      content={<ChartTooltipContent />}
                      formatter={(value: number, name: string) => [
                        name === 'mrr' ? formatCurrency(value * 100) : value.toLocaleString(),
                        name === 'mrr' ? 'MRR' : 'Subscribers'
                      ]}
                    />
                    <Bar yAxisId="left" dataKey="subscribers" fill="#8884d8" name="subscribers" />
                    <Bar yAxisId="right" dataKey="mrr" fill="#82ca9d" name="mrr" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </AccessibleChartWrapper>

        <ConversionFunnelChart />
      </div>

      {/* Subscription Cohorts */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription Cohorts (Last 6 Months)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Cohort Month</th>
                  <th className="text-center p-2">Cohort Size</th>
                  <th className="text-center p-2">30-Day Retention</th>
                  <th className="text-center p-2">60-Day Retention</th>
                  <th className="text-center p-2">90-Day Retention</th>
                </tr>
              </thead>
              <tbody>
                {cohortData.map((cohort) => (
                  <tr key={cohort.cohortMonth} className="border-b">
                    <td className="p-2 font-medium">{cohort.cohortMonth}</td>
                    <td className="p-2 text-center">{cohort.cohortSize}</td>
                    <td className="p-2 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Progress 
                          value={cohort.retention30d} 
                          className="w-16 h-2" 
                        />
                        <span className="text-sm">{formatPercentage(cohort.retention30d)}</span>
                      </div>
                    </td>
                    <td className="p-2 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Progress 
                          value={cohort.retention60d} 
                          className="w-16 h-2" 
                        />
                        <span className="text-sm">{formatPercentage(cohort.retention60d)}</span>
                      </div>
                    </td>
                    <td className="p-2 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Progress 
                          value={cohort.retention90d} 
                          className="w-16 h-2" 
                        />
                        <span className="text-sm">{formatPercentage(cohort.retention90d)}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {cohortData.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No cohort data available yet. Cohorts will appear as subscriptions are created.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedSubscriptionAnalyticsDashboard;
