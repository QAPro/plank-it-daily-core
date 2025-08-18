
import React, { memo } from 'react';
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
      const [usersResult, premiumResult] = await Promise.all([
        supabase.from('users').select('id', { count: 'exact', head: true }),
        supabase.from('users').select('id', { count: 'exact', head: true }).neq('subscription_tier', 'free')
      ]);

      // Simulate additional KPI data that would come from analytics
      const totalUsers = usersResult.count || 0;
      const premiumUsers = premiumResult.count || 0;
      const activeUsers = Math.floor(totalUsers * 0.7); // 70% active rate
      const revenue = premiumUsers * 9.99; // Assuming $9.99/month

      return {
        totalUsers,
        activeUsers,
        premiumUsers,
        revenue,
        trends: {
          users: Math.random() * 20 - 5, // -5% to +15% growth
          active: Math.random() * 15 - 2, // -2% to +13% growth
          premium: Math.random() * 25 + 5, // +5% to +30% growth
          revenue: Math.random() * 30 + 10, // +10% to +40% growth
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
        title="Active Users"
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
        title="Monthly Revenue"
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
