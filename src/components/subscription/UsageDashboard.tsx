
import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Timer, Users, Zap, ArrowUp, Crown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { useSubscription } from '@/hooks/useSubscription';

type UsageItem = {
  feature: string;
  current: number;
  limit: number;
  unit: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  upgradeFeature?: string;
};

const UsageDashboard = () => {
  const { tier } = useFeatureAccess();
  const { upgrade, plans } = useSubscription();

  // Mock usage data - in real app, this would come from your analytics
  const usageData: UsageItem[] = [
    {
      feature: 'Workout Sessions',
      current: 8,
      limit: 10,
      unit: 'sessions',
      icon: Timer,
      color: 'text-blue-600',
      upgradeFeature: 'unlimited_workouts'
    },
    {
      feature: 'Advanced Stats',
      current: 0,
      limit: 0,
      unit: 'views',
      icon: BarChart3,
      color: 'text-purple-600',
      upgradeFeature: 'advanced_stats'
    },
    {
      feature: 'Social Challenges',
      current: 0,
      limit: 0,
      unit: 'challenges',
      icon: Users,
      color: 'text-green-600',
      upgradeFeature: 'social_challenges'
    },
    {
      feature: 'Smart Recommendations',
      current: 0,
      limit: 0,
      unit: 'recommendations',
      icon: Zap,
      color: 'text-orange-600',
      upgradeFeature: 'smart_recommendations'
    }
  ];

  const getUsageColor = (current: number, limit: number) => {
    if (limit === 0) return 'text-gray-400'; // Premium feature
    const percentage = (current / limit) * 100;
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getProgressColor = (current: number, limit: number) => {
    if (limit === 0) return 'bg-gray-200'; // Premium feature
    const percentage = (current / limit) * 100;
    if (percentage >= 90) return 'bg-red-100';
    if (percentage >= 70) return 'bg-yellow-100';
    return 'bg-green-100';
  };

  const handleUpgrade = () => {
    const premiumPlan = plans.find(plan => 
      plan.name.toLowerCase().includes('premium') && 
      plan.name.toLowerCase().includes('monthly')
    );
    if (premiumPlan) {
      upgrade(premiumPlan);
    }
  };

  if (tier !== 'free') {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Crown className="w-5 h-5 mr-2 text-purple-600" />
              Premium Account
            </CardTitle>
            <Badge className="bg-purple-600 text-white">
              {tier.charAt(0).toUpperCase() + tier.slice(1)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Crown className="w-12 h-12 mx-auto text-purple-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Unlimited Access
            </h3>
            <p className="text-gray-600">
              You have full access to all premium features with no limits!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                Your Usage Dashboard
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Track your current usage and discover premium features
              </p>
            </div>
            <Badge variant="outline" className="bg-white">
              Free Plan
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Usage Items */}
      <div className="grid md:grid-cols-2 gap-4">
        {usageData.map((item, index) => {
          const Icon = item.icon;
          const percentage = item.limit > 0 ? (item.current / item.limit) * 100 : 0;
          const isLimited = item.limit === 0;
          const isNearLimit = percentage >= 80 && !isLimited;

          return (
            <motion.div
              key={item.feature}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`${isLimited ? 'border-purple-200 bg-purple-50/30' : isNearLimit ? 'border-orange-200 bg-orange-50/30' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Icon className={`w-5 h-5 mr-2 ${item.color}`} />
                      <CardTitle className="text-base">{item.feature}</CardTitle>
                    </div>
                    {isLimited && (
                      <Badge className="bg-purple-600 text-white text-xs">
                        Premium
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {isLimited ? (
                    <div className="text-center py-4">
                      <Crown className="w-8 h-8 mx-auto text-purple-400 mb-2" />
                      <p className="text-sm text-gray-600 mb-2">
                        Upgrade to unlock this feature
                      </p>
                      <Button size="sm" onClick={handleUpgrade} className="w-full">
                        <ArrowUp className="w-3 h-3 mr-1" />
                        Upgrade Now
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Usage</span>
                        <span className={`font-medium ${getUsageColor(item.current, item.limit)}`}>
                          {item.current} / {item.limit} {item.unit}
                        </span>
                      </div>
                      <Progress 
                        value={percentage} 
                        className={`h-2 ${getProgressColor(item.current, item.limit)}`}
                      />
                      {isNearLimit && (
                        <div className="flex items-center justify-between pt-2">
                          <p className="text-xs text-orange-600">
                            Running low on {item.unit}
                          </p>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={handleUpgrade}
                            className="text-xs h-7"
                          >
                            Upgrade
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Upgrade CTA */}
      <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0">
        <CardContent className="p-6 text-center">
          <Crown className="w-12 h-12 mx-auto mb-4 text-yellow-300" />
          <h3 className="text-xl font-bold mb-2">Ready to Go Premium?</h3>
          <p className="mb-4 opacity-90">
            Unlock unlimited access to all features and take your fitness to the next level
          </p>
          <Button 
            onClick={handleUpgrade}
            className="bg-white text-purple-600 hover:bg-gray-100"
          >
            <Crown className="w-4 h-4 mr-2" />
            Upgrade to Premium
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default UsageDashboard;
