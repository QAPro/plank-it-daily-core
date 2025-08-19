
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { ChartSkeleton } from '@/components/ui/chart-skeleton';
import { AccessibleChartWrapper } from './AccessibleChartWrapper';

interface FunnelData {
  stage: string;
  users: number;
  percentage: number;
  color: string;
}

const ConversionFunnelChart = () => {
  const { data: funnelData, isLoading } = useQuery({
    queryKey: ['conversion-funnel-chart'],
    queryFn: async () => {
      console.log('[ConversionFunnelChart] Fetching funnel data');
      
      // Get total users
      const { count: totalUsers, error: usersError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      if (usersError) throw usersError;

      // Get premium users (active subscriptions)
      const { count: premiumUsers, error: subsError } = await supabase
        .from('subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      if (subsError) throw subsError;

      // Get users who have completed at least one workout
      const { data: activeUsers, error: activeError } = await supabase
        .from('user_sessions')
        .select('user_id')
        .not('completed_at', 'is', null);

      if (activeError) throw activeError;

      const uniqueActiveUsers = new Set(activeUsers?.map(session => session.user_id) || []).size;

      return {
        totalUsers: totalUsers || 0,
        activeUsers: uniqueActiveUsers,
        premiumUsers: premiumUsers || 0
      };
    },
    staleTime: 60_000
  });

  if (isLoading) {
    return <ChartSkeleton title height="h-80" bars={4} />;
  }

  if (!funnelData) return null;

  const { totalUsers, activeUsers, premiumUsers } = funnelData;

  const conversionData: FunnelData[] = [
    {
      stage: 'Visitors',
      users: totalUsers,
      percentage: 100,
      color: '#8884d8'
    },
    {
      stage: 'Registered',
      users: totalUsers,
      percentage: totalUsers > 0 ? 100 : 0,
      color: '#82ca9d'
    },
    {
      stage: 'Active Users',
      users: activeUsers,
      percentage: totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0,
      color: '#ffc658'
    },
    {
      stage: 'Premium',
      users: premiumUsers,
      percentage: totalUsers > 0 ? (premiumUsers / totalUsers) * 100 : 0,
      color: '#ff7300'
    }
  ];

  return (
    <AccessibleChartWrapper
      title="Conversion Funnel"
      description={`User conversion funnel showing progression from ${totalUsers} total users to ${premiumUsers} premium subscribers`}
    >
      <Card>
        <CardHeader>
          <CardTitle>Conversion Funnel</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{}} className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={conversionData}
                layout="horizontal"
                margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 'dataMax']} />
                <YAxis dataKey="stage" type="category" width={80} />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  formatter={(value: number, name: string, props: any) => [
                    `${value.toLocaleString()} users (${props.payload.percentage.toFixed(1)}%)`,
                    'Count'
                  ]}
                />
                <Bar 
                  dataKey="users" 
                  fill="#8884d8"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
          
          {/* Conversion metrics */}
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Registration Rate:</span>
                <span className="font-medium">100%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Activation Rate:</span>
                <span className="font-medium">
                  {totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(1) : '0'}%
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Premium Conversion:</span>
                <span className="font-medium">
                  {totalUsers > 0 ? ((premiumUsers / totalUsers) * 100).toFixed(1) : '0'}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Active to Premium:</span>
                <span className="font-medium">
                  {activeUsers > 0 ? ((premiumUsers / activeUsers) * 100).toFixed(1) : '0'}%
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </AccessibleChartWrapper>
  );
};

export default ConversionFunnelChart;
