import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, TrendingUp, Users, Zap, AlertTriangle, CheckCircle } from "lucide-react";
import { useAdmin } from "@/hooks/useAdmin";
import { hookModelAnalytics } from "@/services/hookModelAnalytics";
import { hookOptimizationEngine } from "@/services/hookOptimizationEngine";
import { toast } from "sonner";
import { useEffect, useState } from "react";

export const HookModelDashboard = () => {
  const { isAdmin, loading } = useAdmin();
  const [analytics, setAnalytics] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Early return if not admin - defensive check
  if (loading) {
    return <div className="p-4">Checking permissions...</div>;
  }

  if (!isAdmin) {
    return (
      <Card className="p-6">
        <CardContent>
          <div className="text-center text-muted-foreground">
            Access denied. Admin privileges required.
          </div>
        </CardContent>
      </Card>
    );
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Load analytics data
        const [triggerAnalysis, actionInsights, rewardAnalysis] = await Promise.all([
          hookModelAnalytics.analyzeTriggerEffectiveness(),
          hookModelAnalytics.analyzeActionOptimization(),
          hookModelAnalytics.analyzeRewardImpact()
        ]);

        setAnalytics({
          triggers: triggerAnalysis,
          actions: actionInsights,
          rewards: rewardAnalysis
        });

        // Load optimization recommendations
        const recs = await hookOptimizationEngine.generatePersonalizedRecommendations('system');
        setRecommendations(recs);
        
      } catch (error) {
        console.error('Failed to load hook model data:', error);
        toast.error('Failed to load analytics data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleApplyRecommendation = async (rec: any) => {
    try {
      // Apply the recommendation
      await hookOptimizationEngine.applyAutoOptimization(rec.userId || 'system');
      
      // Log admin action
      console.log('Admin applied optimization recommendation:', rec);
      
      toast.success('Recommendation applied successfully');
      
      // Refresh recommendations
      const updatedRecs = recommendations.filter(r => r.id !== rec.id);
      setRecommendations(updatedRecs);
      
    } catch (error) {
      console.error('Failed to apply recommendation:', error);
      toast.error('Failed to apply recommendation');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Hook Model Analytics</CardTitle>
            <CardDescription>Loading analytics data...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">Loading...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trigger Effectiveness</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.triggers?.overall_effectiveness ? 
                `${(analytics.triggers.overall_effectiveness * 100).toFixed(1)}%` : 
                'N/A'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Overall conversion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.actions?.active_users || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Users in hook cycles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Optimization Opportunities</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recommendations.length}</div>
            <p className="text-xs text-muted-foreground">
              Pending recommendations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Trigger Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Trigger Performance</CardTitle>
          <CardDescription>
            Analysis of notification triggers and their effectiveness
          </CardDescription>
        </CardHeader>
        <CardContent>
          {analytics?.triggers?.trigger_performance?.length > 0 ? (
            <div className="space-y-4">
              {analytics.triggers.trigger_performance.slice(0, 5).map((trigger: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{trigger.trigger_type}</div>
                    <div className="text-sm text-muted-foreground">
                      {trigger.total_sent} sent • {trigger.responses} responses
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={trigger.response_rate > 0.2 ? "default" : "secondary"}>
                      {(trigger.response_rate * 100).toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No trigger data available yet. Data will appear as users interact with the app.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Optimization Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Optimization Recommendations</CardTitle>
          <CardDescription>
            AI-generated recommendations to improve user engagement
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recommendations.length > 0 ? (
            <div className="space-y-4">
              {recommendations.slice(0, 5).map((rec, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={rec.priority === 'high' ? 'destructive' : 'default'}>
                          {rec.priority}
                        </Badge>
                        <Badge variant="outline">
                          {rec.confidence ? `${(rec.confidence * 100).toFixed(0)}% confidence` : 'Low confidence'}
                        </Badge>
                      </div>
                      <div className="font-medium mb-1">{rec.type.replace('_', ' ').toUpperCase()}</div>
                      <div className="text-sm text-muted-foreground mb-2">
                        {rec.recommendation}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Expected impact: {rec.expected_impact || 'Unknown'}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleApplyRecommendation(rec)}
                      disabled={rec.confidence && rec.confidence < 0.7}
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No recommendations available. The system is still learning user patterns.
            </div>
          )}
        </CardContent>
      </Card>

      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle>System Health</CardTitle>
          <CardDescription>
            Hook model system status and data collection health
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Data collection active</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Analytics processing</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span className="text-sm">Auto-optimization ready</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-500" />
              <span className="text-sm">Real-time tracking</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};