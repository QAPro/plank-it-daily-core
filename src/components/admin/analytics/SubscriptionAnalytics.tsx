import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, DollarSign, TrendingUp, CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface SubscriptionMetrics {
  activeSubscribers: number;
  totalRevenue: number;
  monthlyRecurringRevenue: number;
  planDistribution: { plan_name: string; count: number; percentage: number }[];
  recentTransactions: number;
  churnRate: number;
}

const SubscriptionAnalytics = () => {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ["admin", "subscription-metrics"],
    queryFn: async () => {
      const sb: any = supabase;

      // Get active subscriptions
      const { data: activeSubscriptions, error: subError } = await sb
        .from("subscriptions")
        .select(`
          id,
          status,
          plan_id,
          subscription_plans(name, price_cents, billing_interval)
        `)
        .eq("status", "active");

      if (subError) throw subError;

      // Get recent billing transactions (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: transactions, error: txError } = await sb
        .from("billing_transactions")
        .select("amount_cents, status, created_at")
        .gte("created_at", thirtyDaysAgo.toISOString())
        .eq("status", "succeeded");

      if (txError) throw txError;

      // Calculate metrics
      const activeCount = activeSubscriptions?.length || 0;
      const totalRevenue =
        (transactions?.reduce((sum: number, tx: any) => sum + (tx.amount_cents || 0), 0) as number) || 0;

      // Calculate MRR (Monthly Recurring Revenue)
      let mrr = 0;
      activeSubscriptions?.forEach((sub: any) => {
        const plan = sub.subscription_plans;
        if (plan) {
          if (plan.billing_interval === "year") {
            mrr += (plan.price_cents || 0) / 12; // Convert annual to monthly
          } else {
            mrr += plan.price_cents || 0; // Already monthly
          }
        }
      });

      // Plan distribution
      const planCounts: Record<string, number> = {};
      activeSubscriptions?.forEach((sub: any) => {
        const planName = sub.subscription_plans?.name || "Unknown";
        planCounts[planName] = (planCounts[planName] || 0) + 1;
      });

      const planDistribution = Object.entries(planCounts).map(([plan_name, count]) => ({
        plan_name,
        count,
        percentage: activeCount > 0 ? Math.round((count / activeCount) * 100) : 0,
      }));

      // Simple churn rate calculation (cancelled in last 30 days vs active)
      const { data: cancelledSubs } = await sb
        .from("subscriptions")
        .select("id")
        .eq("status", "canceled")
        .gte("canceled_at", thirtyDaysAgo.toISOString());

      const churnRate =
        activeCount > 0 ? Math.round(((cancelledSubs?.length || 0) / activeCount) * 100) : 0;

      const result: SubscriptionMetrics = {
        activeSubscribers: activeCount,
        totalRevenue,
        monthlyRecurringRevenue: mrr,
        planDistribution,
        recentTransactions: transactions?.length || 0,
        churnRate,
      };

      return result;
    },
    staleTime: 60_000, // Cache for 1 minute
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subscription Analytics</CardTitle>
          <CardDescription>Loading subscription metrics...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{metrics?.activeSubscribers || 0}</p>
                <p className="text-sm text-muted-foreground">Active Subscribers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">
                  {formatCurrency(metrics?.monthlyRecurringRevenue || 0)}
                </p>
                <p className="text-sm text-muted-foreground">Monthly Recurring Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{formatCurrency(metrics?.totalRevenue || 0)}</p>
                <p className="text-sm text-muted-foreground">Revenue (30 days)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{metrics?.churnRate || 0}%</p>
                <p className="text-sm text-muted-foreground">Churn Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plan Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Plan Distribution</CardTitle>
          <CardDescription>Breakdown of active subscriptions by plan</CardDescription>
        </CardHeader>
        <CardContent>
          {metrics?.planDistribution?.length ? (
            <div className="space-y-3">
              {metrics.planDistribution.map((plan) => (
                <div key={plan.plan_name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{plan.plan_name}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {plan.count} subscribers
                    </span>
                  </div>
                  <div className="text-sm font-medium">{plan.percentage}%</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No active subscriptions yet</p>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Subscription activity in the last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Successful Transactions:</span>
              <span className="font-medium">{metrics?.recentTransactions || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Total Revenue:</span>
              <span className="font-medium">{formatCurrency(metrics?.totalRevenue || 0)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Active Subscribers:</span>
              <span className="font-medium">{metrics?.activeSubscribers || 0}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionAnalytics;
