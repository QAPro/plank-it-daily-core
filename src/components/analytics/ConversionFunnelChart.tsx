
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingDown, Users, CreditCard, Target } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface FunnelStage {
  stage: string;
  users: number;
  conversionRate: number;
  dropoffRate: number;
  icon: React.ReactNode;
  color: string;
}

const ConversionFunnelChart = () => {
  const { data: funnelData, isLoading } = useQuery({
    queryKey: ['conversion-funnel'],
    queryFn: async () => {
      // Get total users
      const { count: totalUsers, error: totalError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      if (totalError) throw totalError;

      // Get users who completed onboarding
      const { count: onboardedUsers, error: onboardingError } = await supabase
        .from('user_onboarding')
        .select('*', { count: 'exact', head: true })
        .eq('completed', true);

      if (onboardingError) throw onboardingError;

      // Get users with at least one session
      const { data: activeUsers, error: activeError } = await supabase
        .rpc('get_active_users_metrics');

      if (activeError) throw activeError;

      // Get premium users
      const { count: premiumUsers, error: premiumError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .neq('subscription_tier', 'free');

      if (premiumError) throw premiumError;

      const stages: FunnelStage[] = [
        {
          stage: 'Visitors',
          users: totalUsers || 0,
          conversionRate: 100,
          dropoffRate: 0,
          icon: <Users className="w-5 h-5" />,
          color: 'bg-blue-500'
        },
        {
          stage: 'Signed Up',
          users: totalUsers || 0,
          conversionRate: 100,
          dropoffRate: 0,
          icon: <Target className="w-5 h-5" />,
          color: 'bg-green-500'
        },
        {
          stage: 'Completed Onboarding',
          users: onboardedUsers || 0,
          conversionRate: totalUsers ? Math.round((onboardedUsers || 0) / totalUsers * 100) : 0,
          dropoffRate: totalUsers ? Math.round((1 - (onboardedUsers || 0) / totalUsers) * 100) : 0,
          icon: <Target className="w-5 h-5" />,
          color: 'bg-purple-500'
        },
        {
          stage: 'First Workout',
          users: Math.floor((onboardedUsers || 0) * 0.7), // Simulate 70% completion
          conversionRate: onboardedUsers ? Math.round(Math.floor((onboardedUsers || 0) * 0.7) / onboardedUsers * 100) : 0,
          dropoffRate: 30,
          icon: <Target className="w-5 h-5" />,
          color: 'bg-orange-500'
        },
        {
          stage: 'Premium Conversion',
          users: premiumUsers || 0,
          conversionRate: totalUsers ? Math.round((premiumUsers || 0) / totalUsers * 100) : 0,
          dropoffRate: totalUsers ? Math.round((1 - (premiumUsers || 0) / totalUsers) * 100) : 0,
          icon: <CreditCard className="w-5 h-5" />,
          color: 'bg-yellow-500'
        }
      ];

      return stages;
    },
    refetchInterval: 10 * 60 * 1000, // Refresh every 10 minutes
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Conversion Funnel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!funnelData) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conversion Funnel Analysis</CardTitle>
        <p className="text-sm text-gray-600">Track user journey from signup to premium conversion</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {funnelData.map((stage, index) => {
            const width = Math.max((stage.users / funnelData[0].users) * 100, 10);
            const isLast = index === funnelData.length - 1;
            
            return (
              <div key={stage.stage} className="relative">
                {/* Funnel Stage */}
                <div 
                  className={`${stage.color} text-white rounded-lg p-4 transition-all duration-300 hover:shadow-lg`}
                  style={{ width: `${width}%`, minWidth: '200px' }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {stage.icon}
                      <div>
                        <p className="font-semibold">{stage.stage}</p>
                        <p className="text-sm opacity-90">{stage.users.toLocaleString()} users</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary" className="mb-1">
                        {stage.conversionRate}%
                      </Badge>
                      {stage.dropoffRate > 0 && (
                        <div className="flex items-center gap-1 text-sm opacity-90">
                          <TrendingDown className="w-3 h-3" />
                          <span>{stage.dropoffRate}% drop-off</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Drop-off Indicator */}
                {!isLast && stage.dropoffRate > 0 && (
                  <div className="absolute -bottom-2 left-0 flex items-center gap-2 text-xs text-red-600">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span>{stage.dropoffRate}% drop-off to next stage</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Funnel Insights */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold mb-3">Key Insights</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>
                Overall conversion rate: {funnelData[funnelData.length - 1].conversionRate}% 
                ({funnelData[funnelData.length - 1].users} premium users)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span>
                Biggest drop-off: {Math.max(...funnelData.map(s => s.dropoffRate))}% 
                at {funnelData.find(s => s.dropoffRate === Math.max(...funnelData.map(s => s.dropoffRate)))?.stage}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>
                Onboarding completion: {funnelData[2]?.conversionRate}%
              </span>
            </div>
          </div>
        </div>

        {/* Optimization Suggestions */}
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold mb-3 text-blue-800">Optimization Opportunities</h4>
          <div className="space-y-2 text-sm text-blue-700">
            {funnelData[2]?.dropoffRate > 20 && (
              <div>• Focus on improving onboarding flow - {funnelData[2].dropoffRate}% drop-off rate</div>
            )}
            {funnelData[funnelData.length - 1].conversionRate < 10 && (
              <div>• Consider A/B testing premium upgrade prompts</div>
            )}
            <div>• Implement retargeting campaigns for users who don't complete first workout</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConversionFunnelChart;
