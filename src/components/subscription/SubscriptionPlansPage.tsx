
import React from 'react';
import { motion } from 'framer-motion';
import { Check, Star, Crown, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSubscription } from '@/hooks/useSubscription';
import { formatPrice } from '@/utils/price';
import type { SubscriptionPlan } from '@/services/subscriptionService';

const SubscriptionPlansPage = () => {
  const { plans, active, upgrade, loading, demoMode } = useSubscription();

  const getPlanIcon = (planName: string) => {
    if (planName.toLowerCase().includes('premium')) return Star;
    return Zap;
  };

  const getPlanColor = (planName: string) => {
    if (planName.toLowerCase().includes('premium')) return 'border-blue-200 bg-blue-50/50';
    return 'border-gray-200 bg-gray-50/50';
  };

  const getPlanButtonColor = (planName: string) => {
    if (planName.toLowerCase().includes('premium')) return 'bg-blue-600 hover:bg-blue-700';
    return 'bg-gray-600 hover:bg-gray-700';
  };

  const isCurrentPlan = (plan: SubscriptionPlan) => {
    return active?.plan_name === plan.name;
  };

  const getFeaturesList = (planName: string) => {
    const name = planName.toLowerCase();
    if (name.includes('premium')) {
      return [
        'All Free features',
        'Advanced statistics',
        'Smart recommendations',
        'Social challenges',
        'Custom workout builder',
        'Advanced analytics',
        'Priority support',
        'Export data',
        'API access',
        'No ads'
      ];
    }
    return [
      'Basic workout tracking',
      'Simple statistics',
      'Community access',
      'Email support'
    ];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-orange-600 text-lg">Loading plans...</div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 space-y-6"
    >
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Choose Your Plan</h1>
        <p className="text-gray-600 mb-4">Unlock premium features and take your fitness to the next level</p>
        {demoMode && (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            Demo Mode - No real payments will be processed
          </Badge>
        )}
      </div>

      {/* Current Subscription Status */}
      {active && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-green-800">Current Plan: {active.plan_name}</h3>
                  <p className="text-sm text-green-600">
                    {active.current_period_end ? 
                      `Renews on ${new Date(active.current_period_end).toLocaleDateString()}` :
                      'Active subscription'
                    }
                  </p>
                </div>
                <Badge className="bg-green-600 text-white">Active</Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Plans Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan, index) => {
          const PlanIcon = getPlanIcon(plan.name);
          const isPopular = plan.is_popular;
          const isCurrent = isCurrentPlan(plan);
          const features = getFeaturesList(plan.name);

          return (
            <motion.div
              key={plan.id}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
              className="relative"
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                  <Badge className="bg-orange-500 text-white px-4 py-1">Most Popular</Badge>
                </div>
              )}
              
              <Card className={`h-full ${getPlanColor(plan.name)} ${isPopular ? 'ring-2 ring-orange-200' : ''} ${isCurrent ? 'ring-2 ring-green-300' : ''}`}>
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-2">
                    <PlanIcon className="w-6 h-6 text-gray-600" />
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  
                  <div className="mt-4">
                    <div className="text-3xl font-bold text-gray-800">
                      {formatPrice(plan.price_cents)}
                    </div>
                    <div className="text-sm text-gray-600">
                      per {plan.billing_interval}
                    </div>
                    {plan.billing_interval === 'year' && plan.price_cents > 0 && (
                      <div className="text-xs text-green-600 mt-1">
                        Save {Math.round((1 - (plan.price_cents / 12) / (plan.price_cents === 3999 ? 499 : 999)) * 100)}%
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  {/* Features List */}
                  <ul className="space-y-2 mb-6">
                    {features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sm">
                        <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Action Button */}
                  <div className="mt-auto">
                    {isCurrent ? (
                      <Button disabled className="w-full bg-green-600">
                        Current Plan
                      </Button>
                    ) : plan.price_cents === 0 ? (
                      <Button variant="outline" disabled className="w-full">
                        Free Plan
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => upgrade(plan)}
                        className={`w-full text-white ${getPlanButtonColor(plan.name)}`}
                      >
                        {active ? 'Switch Plan' : 'Get Started'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Additional Info */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="text-center text-sm text-gray-600 space-y-2"
      >
        <p>All plans include access to core workout features</p>
        <p>Cancel anytime • No hidden fees • 30-day money-back guarantee</p>
        {demoMode && (
          <p className="text-yellow-600 font-medium">
            Demo mode: Subscriptions are simulated for testing purposes
          </p>
        )}
      </motion.div>
    </motion.div>
  );
};

export default SubscriptionPlansPage;
