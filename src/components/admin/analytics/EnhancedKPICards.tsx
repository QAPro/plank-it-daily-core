
import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Users, Activity, Target, DollarSign } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { KPICardSkeleton } from '@/components/ui/chart-skeleton';
import { ErrorState } from '@/components/ui/error-state';
import { useRetryWithBackoff } from '@/hooks/useRetryWithBackoff';
import { useAdminAnalytics } from '@/contexts/AdminAnalyticsContext';

interface KPIData {
  totalUsers: number;
  activeUsers: number;
  premiumUsers: number;
  revenue: number;
  trends: {
    users: number;
    active: number;
    premium: number;
    revenue: number;
  };
}

const KPICard = memo(({ 
  title, 
  value, 
  trend, 
  icon: Icon, 
  format = 'number',
  onClick 
}: {
  title: string;
  value: number;
  trend: number;
  icon: any;
  format?: 'number' | 'currency' | 'percentage';
  onClick?: () => void;
}) => {
  const formatValue = (val: number) => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(val);
      case 'percentage':
        return `${val.toFixed(1)}%`;
      default:
        return val.toLocaleString();
    }
  };

  const isPositive = trend >= 0;

  return (
    <Card 
      className={`transition-all duration-200 hover:shadow-md ${onClick ? 'cursor-pointer hover:scale-105' : ''}`}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{formatValue(value)}</p>
          </div>
          <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
            <Icon className="h-6 w-6 text-orange-600" />
          </div>
        </div>
        <div className="mt-4 flex items-center">
          {isPositive ? (
            <TrendingUp className="h-4 w-4 text-green-600" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-600" />
          )}
          <span className={`ml-2 text-sm font-medium ${
            isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            {isPositive ? '+' : ''}{trend.toFixed(1)}%
          </span>
          <span className="ml-2 text-sm text-muted-foreground">vs last month</span>
        </div>
      </CardContent>
    </Card>
  );
});

const EnhancedKPICards = () => {
  const { setDrillDown } = useAdminAnalytics();
  const { executeWithRetry, isRetrying } = useRetryWithBackoff();

  const { data: kpiData, isLoading, error, refetch } = useQuery({
    queryKey: ['enhanced-kpi-data'],
    queryFn: () => executeWithRetry(async () => {
      const [usersResult, premiumResult, billingResult, sessionsResult] = await Promise.all([
        supabase.from('users').select('id', { count: 'exact', head: true }),
        supabase.from('users').select('id', { count: 'exact', head: true }).neq('subscription_tier', 'free'),
        supabase.from('billing_transactions').select('amount_cents').eq('status', 'completed'),
        supabase.from('user_sessions').select('user_id').gte('completed_at', new Date(Date.now() - 24*60*60*1000).toISOString())
      ]);

      const totalUsers = usersResult.count || 0;
      const premiumUsers = premiumResult.count || 0;
      
      // Real active users from sessions in last 24h
      const activeUsers = new Set(sessionsResult.data?.map(s => s.user_id) || []).size;
      
      // Real revenue from billing transactions
      const totalRevenueCents = billingResult.data?.reduce((sum, t) => sum + t.amount_cents, 0) || 0;
      const revenue = totalRevenueCents / 100; // Convert cents to dollars

      return {
        totalUsers,
        activeUsers,
        premiumUsers,
        revenue,
        trends: {
          users: 0, // Historical trend analysis requires time-series data collection
          active: 0, // Historical trend analysis requires time-series data collection
          premium: 0, // Historical trend analysis requires time-series data collection
          revenue: 0, // Historical trend analysis requires time-series data collection
        }
      } as KPIData;
    }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <KPICardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="KPI Data Error"
        message={error.message}
        type="server"
        onRetry={() => refetch()}
        retrying={isRetrying}
      />
    );
  }

  if (!kpiData) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <KPICard
        title="Total Users"
        value={kpiData.totalUsers}
        trend={kpiData.trends.users}
        icon={Users}
        onClick={() => setDrillDown('user', 'all', { metric: 'total_users' })}
      />
      <KPICard
        title="Active Users (24h)"
        value={kpiData.activeUsers}
        trend={kpiData.trends.active}
        icon={Activity}
        onClick={() => setDrillDown('user', 'active', { metric: 'active_users' })}
      />
      <KPICard
        title="Premium Users"
        value={kpiData.premiumUsers}
        trend={kpiData.trends.premium}
        icon={Target}
        onClick={() => setDrillDown('user', 'premium', { metric: 'premium_users' })}
      />
      <KPICard
        title="Total Revenue"
        value={kpiData.revenue}
        trend={kpiData.trends.revenue}
        icon={DollarSign}
        format="currency"
        onClick={() => setDrillDown('timeframe', 'monthly', { metric: 'revenue' })}
      />
    </div>
  );
};

export default memo(EnhancedKPICards);
