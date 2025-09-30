import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, TrendingDown, Users, Activity } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ChurnRiskUser {
  id: string;
  email: string;
  full_name: string;
  risk_score: number;
  last_session: string;
  subscription_tier: string;
  factors: string[];
}

const ChurnPredictionPanel = () => {
  const { data: churnData, isLoading } = useQuery({
    queryKey: ['churn-prediction'],
    queryFn: async () => {
      // Simulate churn prediction data
      // In a real implementation, this would call an ML service
      const { data: users, error } = await supabase
        .from('users')
        .select(`
          id,
          email,
          full_name,
          subscription_tier,
          created_at
        `)
        .limit(50);

      if (error) throw error;

      // Calculate real risk scores based on actual user activity
      const usersWithRisk: ChurnRiskUser[] = await Promise.all(users.map(async (user) => {
        const daysSinceSignup = Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24));
        
        // Get actual user session data
        const { data: sessions } = await supabase
          .from('user_sessions')
          .select('completed_at')
          .eq('user_id', user.id)
          .order('completed_at', { ascending: false })
          .limit(10);

        const lastSession = sessions?.[0]?.completed_at;
        const daysSinceLastActivity = lastSession 
          ? Math.floor((Date.now() - new Date(lastSession).getTime()) / (1000 * 60 * 60 * 24))
          : daysSinceSignup;

        // Calculate risk score based on real metrics
        let riskScore = 0;
        if (daysSinceLastActivity > 14) riskScore += 40;
        else if (daysSinceLastActivity > 7) riskScore += 25;
        
        if (user.subscription_tier === 'free' && daysSinceSignup > 30) riskScore += 20;
        
        const recentSessions = sessions?.filter(s => 
          new Date(s.completed_at) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        ).length || 0;
        
        if (recentSessions === 0) riskScore += 30;
        else if (recentSessions < 2) riskScore += 15;
        
        const factors = [];
        if (riskScore > 70) factors.push('Low activity');
        if (user.subscription_tier === 'free' && daysSinceSignup > 30) factors.push('Long-term free user');
        if (riskScore > 60) factors.push('Declining engagement');
        
        return {
          id: user.id,
          email: user.email,
          full_name: user.full_name || 'Unknown User',
          risk_score: Math.min(100, Math.round(riskScore)),
          last_session: lastSession || user.created_at,
          subscription_tier: user.subscription_tier,
          factors
        };
      }));

      const highRiskUsers = usersWithRisk.filter(user => user.risk_score > 70);
      const mediumRiskUsers = usersWithRisk.filter(user => user.risk_score > 40 && user.risk_score <= 70);
      
      return {
        highRisk: highRiskUsers,
        mediumRisk: mediumRiskUsers,
        totalUsers: users.length,
        avgRiskScore: Math.round(usersWithRisk.reduce((acc, user) => acc + user.risk_score, 0) / usersWithRisk.length)
      };
    },
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });

  const getRiskBadgeVariant = (score: number) => {
    if (score > 70) return 'destructive';
    if (score > 40) return 'default';
    return 'secondary';
  };

  const getRiskLabel = (score: number) => {
    if (score > 70) return 'High Risk';
    if (score > 40) return 'Medium Risk';
    return 'Low Risk';
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!churnData) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Churn Risk Analysis</h3>
        <Button variant="outline" size="sm">
          <Activity className="w-4 h-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      {/* Risk Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <AlertTriangle className="w-8 h-8 mx-auto text-red-500 mb-2" />
            <p className="text-2xl font-bold text-red-600">{churnData.highRisk.length}</p>
            <p className="text-sm text-gray-600">High Risk Users</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingDown className="w-8 h-8 mx-auto text-orange-500 mb-2" />
            <p className="text-2xl font-bold text-orange-600">{churnData.mediumRisk.length}</p>
            <p className="text-sm text-gray-600">Medium Risk Users</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="w-8 h-8 mx-auto text-blue-500 mb-2" />
            <p className="text-2xl font-bold">{churnData.totalUsers}</p>
            <p className="text-sm text-gray-600">Total Users</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Activity className="w-8 h-8 mx-auto text-purple-500 mb-2" />
            <p className="text-2xl font-bold">{churnData.avgRiskScore}%</p>
            <p className="text-sm text-gray-600">Avg Risk Score</p>
          </CardContent>
        </Card>
      </div>

      {/* High Risk Users */}
      {churnData.highRisk.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              High Risk Users (Immediate Action Required)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {churnData.highRisk.slice(0, 5).map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-medium">{user.full_name}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                      <Badge variant={getRiskBadgeVariant(user.risk_score)}>
                        {user.risk_score}% Risk
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {user.subscription_tier}
                      </Badge>
                    </div>
                    <div className="mt-2">
                      <p className="text-xs text-gray-500">
                        Last session: {new Date(user.last_session).toLocaleDateString()}
                      </p>
                      <div className="flex gap-1 mt-1">
                        {user.factors.map((factor, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {factor}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      Send Email
                    </Button>
                    <Button size="sm" className="bg-orange-500 hover:bg-orange-600">
                      Offer Discount
                    </Button>
                  </div>
                </div>
              ))}
              {churnData.highRisk.length > 5 && (
                <div className="text-center pt-2">
                  <Button variant="outline" size="sm">
                    View All {churnData.highRisk.length} High Risk Users
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Medium Risk Users */}
      {churnData.mediumRisk.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <TrendingDown className="w-5 h-5" />
              Medium Risk Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {churnData.mediumRisk.slice(0, 3).map((user) => (
                <div key={user.id} className="flex items-center justify-between p-2 bg-orange-50 rounded border border-orange-200">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-medium text-sm">{user.full_name}</p>
                      <p className="text-xs text-gray-600">{user.email}</p>
                    </div>
                    <Badge variant="default">
                      {user.risk_score}% Risk
                    </Badge>
                  </div>
                  <Button size="sm" variant="outline">
                    Engage
                  </Button>
                </div>
              ))}
              {churnData.mediumRisk.length > 3 && (
                <div className="text-center pt-2">
                  <Button variant="outline" size="sm">
                    View All {churnData.mediumRisk.length} Medium Risk Users
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Recommended Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
              <div>
                <p className="font-medium">Send Re-engagement Campaign</p>
                <p className="text-sm text-gray-600">
                  Target users with 7+ days of inactivity with personalized workout suggestions
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
              <div>
                <p className="font-medium">Offer Premium Trial</p>
                <p className="text-sm text-gray-600">
                  Give high-risk free users a 7-day premium trial to showcase advanced features
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-purple-500 mt-2"></div>
              <div>
                <p className="font-medium">Personal Check-in</p>
                <p className="text-sm text-gray-600">
                  Schedule follow-up calls with premium users showing decline patterns
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChurnPredictionPanel;
