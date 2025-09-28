import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { useRewardTiming } from '@/hooks/useRewardTiming';
import { RewardTimingService } from '@/services/rewardTimingService';
import { Clock, Zap, Target, Gamepad2, RefreshCw, Play } from 'lucide-react';
import { logError } from '@/utils/productionLogger';

export const IntelligentRewardDebugger = () => {
  const { user } = useAuth();
  const rewardTiming = useRewardTiming();
  const [isManualTesting, setIsManualTesting] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);

  const runManualTest = async () => {
    if (!user?.id) return;

    setIsManualTesting(true);
    try {
      // Gather context
      const context = await RewardTimingService.gatherUserContext(user.id);
      
      // Request decision
      const decision = await RewardTimingService.requestRewardDecision(context);
      
      setTestResults(prev => [
        {
          timestamp: new Date(),
          context,
          decision,
          triggered: decision.shouldSendReward
        },
        ...prev.slice(0, 9) // Keep last 10 tests
      ]);

      // If reward should be sent, trigger it
      if (decision.shouldSendReward && decision.rewardType) {
        await RewardTimingService.triggerInAppNudge(decision.rewardType, decision.xpAmount);
      }

    } catch (error) {
      logError('Manual test failed:', { error });
    } finally {
      setIsManualTesting(false);
    }
  };

  const triggerTestReward = async (rewardType: string) => {
    await RewardTimingService.triggerInAppNudge(rewardType, 75);
  };

  const getRewardTypeIcon = (type?: string) => {
    switch (type) {
      case 'surprise_xp': return <Zap className="h-4 w-4" />;
      case 'milestone_nudge': return <Target className="h-4 w-4" />;
      case 'comeback_encourage': return <RefreshCw className="h-4 w-4" />;
      case 'streak_boost': return <Gamepad2 className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getEngagementColor = (engagement?: string) => {
    switch (engagement) {
      case 'high': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Intelligent Reward Timing Debugger
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* System Status */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-sm text-muted-foreground">Status</div>
              <Badge variant={rewardTiming.isActive ? "default" : "secondary"}>
                {rewardTiming.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-sm text-muted-foreground">Last Check</div>
              <div className="text-sm font-medium">
                {rewardTiming.lastCheckTime?.toLocaleTimeString() || 'Never'}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-sm text-muted-foreground">Pending</div>
              <div className="text-lg font-bold">{rewardTiming.pendingRewards.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-sm text-muted-foreground">User ID</div>
              <div className="text-xs font-mono truncate">
                {user?.id?.slice(-8) || 'None'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Current Context */}
        {rewardTiming.debugInfo?.context && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Current Context</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Time of Day</div>
                  <Badge variant="outline">{rewardTiming.debugInfo.context.timeOfDay}</Badge>
                </div>
                <div>
                  <div className="text-muted-foreground">Days Since Workout</div>
                  <div className="font-medium">{rewardTiming.debugInfo.context.daysSinceLastWorkout || 0}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Current Streak</div>
                  <div className="font-medium">{rewardTiming.debugInfo.context.currentStreak || 0}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Engagement</div>
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${getEngagementColor(rewardTiming.debugInfo.context.recentEngagement)}`} />
                    <span className="capitalize">{rewardTiming.debugInfo.context.recentEngagement}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Manual Testing */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Manual Testing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              <Button 
                onClick={runManualTest}
                disabled={isManualTesting}
                size="sm"
              >
                <Play className="h-4 w-4 mr-1" />
                {isManualTesting ? 'Testing...' : 'Run Decision Test'}
              </Button>
              
              <Button 
                onClick={rewardTiming.triggerManualCheck}
                variant="outline"
                size="sm"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Force Check
              </Button>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Test Reward Types:</div>
              <div className="flex gap-2 flex-wrap">
                <Button onClick={() => triggerTestReward('surprise_xp')} size="sm" variant="outline">
                  <Zap className="h-3 w-3 mr-1" />Surprise XP
                </Button>
                <Button onClick={() => triggerTestReward('milestone_nudge')} size="sm" variant="outline">
                  <Target className="h-3 w-3 mr-1" />Milestone
                </Button>
                <Button onClick={() => triggerTestReward('comeback_encourage')} size="sm" variant="outline">
                  <RefreshCw className="h-3 w-3 mr-1" />Comeback
                </Button>
                <Button onClick={() => triggerTestReward('streak_boost')} size="sm" variant="outline">
                  <Gamepad2 className="h-3 w-3 mr-1" />Streak Boost
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Results */}
        {testResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-3">
                  {testResults.map((result, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-medium">
                          {result.timestamp.toLocaleTimeString()}
                        </div>
                        <div className="flex items-center gap-2">
                          {result.decision.shouldSendReward ? (
                            <>
                              {getRewardTypeIcon(result.decision.rewardType)}
                              <Badge variant="default">{result.decision.rewardType}</Badge>
                            </>
                          ) : (
                            <Badge variant="secondary">No Reward</Badge>
                          )}
                        </div>
                      </div>
                      
                      {result.decision.shouldSendReward && (
                        <div className="text-sm text-muted-foreground">
                          <div>Priority: {result.decision.priority}</div>
                          <div>Message: {result.decision.message}</div>
                          {result.decision.xpAmount && (
                            <div>XP Amount: {result.decision.xpAmount}</div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* Pending Rewards */}
        {rewardTiming.pendingRewards.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                Pending Rewards
                <Button onClick={rewardTiming.clearPendingRewards} size="sm" variant="outline">
                  Clear All
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {rewardTiming.pendingRewards.map((reward, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 bg-muted/50 rounded-md">
                    {getRewardTypeIcon(reward.rewardType)}
                    <div className="flex-1">
                      <div className="text-sm font-medium">{reward.rewardType}</div>
                      <div className="text-xs text-muted-foreground">{reward.message}</div>
                    </div>
                    {reward.xpAmount && (
                      <Badge variant="outline">{reward.xpAmount} XP</Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};