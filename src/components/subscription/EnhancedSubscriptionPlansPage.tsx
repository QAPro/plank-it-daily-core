
import React from 'react';
import { motion } from 'framer-motion';
import { Check, Star, Crown, Zap, Users, TrendingUp, Heart } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSubscription } from '@/hooks/useSubscription';
import { formatPrice } from '@/utils/price';
import type { SubscriptionPlan } from '@/services/subscriptionService';

const EnhancedSubscriptionPlansPage = () => {
  const { plans, active, upgrade, loading, demoMode } = useSubscription();

  const testimonials = [
    {
      name: "Sarah M.",
      text: "The smart recommendations helped me break my plateau!",
      tier: "Premium"
    },
    {
      name: "Mike T.",
      text: "Custom workouts and pro analytics are game-changers.",
      tier: "Pro"
    },
    {
      name: "Lisa K.",
      text: "Social challenges keep me motivated every day!",
      tier: "Premium"
    }
  ];

  const getPlanIcon = (planName: string) => {
    if (planName.toLowerCase().includes('pro')) return Crown;
    if (planName.toLowerCase().includes('premium')) return Star;
    return Zap;
  };

  const getPlanColor = (planName: string) => {
    if (planName.toLowerCase().includes('pro')) return 'border-purple-200 bg-purple-50/50';
    if (planName.toLowerCase().includes('premium')) return 'border-blue-200 bg-blue-50/50';
    return 'border-gray-200 bg-gray-50/50';
  };

  const getPlanButtonColor = (planName: string) => {
    if (planName.toLowerCase().includes('pro')) return 'bg-purple-600 hover:bg-purple-700';
    if (planName.toLowerCase().includes('premium')) return 'bg-blue-600 hover:bg-blue-700';
    return 'bg-gray-600 hover:bg-gray-700';
  };

  const isCurrentPlan = (plan: SubscriptionPlan) => {
    return active?.plan_name === plan.name;
  };

  const getEnhancedFeaturesList = (planName: string) => {
    const name = planName.toLowerCase();
    if (name.includes('pro')) {
      return [
        { text: 'All Premium features', icon: Check },
        { text: 'Custom workout builder', icon: Zap },
        { text: 'Priority support', icon: Heart },
        { text: 'Advanced analytics dashboard', icon: TrendingUp },
        { text: 'Unlimited everything', icon: Crown },
        { text: 'Export workout data', icon: Check },
        { text: 'Personal coaching insights', icon: Star }
      ];
    }
    if (name.includes('premium')) {
      return [
        { text: 'Advanced statistics & insights', icon: TrendingUp },
        { text: 'Smart workout recommendations', icon: Star },
        { text: 'Social challenges & leaderboards', icon: Users },
        { text: 'Export your progress data', icon: Check },
        { text: 'No advertisements', icon: Check },
        { text: 'Premium workout variations', icon: Zap }
      ];
    }
    return [
      { text: 'Basic workout tracking', icon: Check },
      { text: 'Simple statistics', icon: TrendingUp },
      { text: 'Community access', icon: Users },
      { text: 'Limited features', icon: Check }
    ];
  };

  const calculateYearlySavings = (plan: SubscriptionPlan) => {
    if (plan.billing_interval !== 'year') return null;
    const monthlyEquivalent = plan.price_cents === 3999 ? 499 : 999; // Assuming monthly prices
    const yearlySavings = (monthlyEquivalent * 12) - plan.price_cents;
    return Math.round((yearlySavings / (monthlyEquivalent * 12)) * 100);
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
      className="p-6 space-y-8"
    >
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-gray-800 mb-2"
        >
          Unlock Your Full Potential
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto"
        >
          Join thousands of users who've transformed their fitness with our premium features
        </motion.p>
        {demoMode && (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            Demo Mode - No real payments will be processed
          </Badge>
        )}
      </div>

      {/* Social Proof */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-center space-y-4"
      >
        <div className="flex justify-center items-center space-x-2 text-sm text-gray-600">
          <Users className="w-4 h-4" />
          <span>Trusted by 10,000+ active users</span>
        </div>
        <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="bg-white p-4 rounded-lg shadow-sm border"
            >
              <p className="text-sm text-gray-700 italic">"{testimonial.text}"</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-800">{testimonial.name}</span>
                <Badge variant="outline" className="text-xs">{testimonial.tier}</Badge>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

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
          const features = getEnhancedFeaturesList(plan.name);
          const yearlySavings = calculateYearlySavings(plan);

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
              
              <Card className={`h-full ${getPlanColor(plan.name)} ${isPopular ? 'ring-2 ring-orange-200 scale-105' : ''} ${isCurrent ? 'ring-2 ring-green-300' : ''} transition-all duration-300 hover:shadow-lg`}>
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
                    {yearlySavings && (
                      <div className="text-xs text-green-600 mt-1 font-semibold">
                        Save {yearlySavings}% vs monthly
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="pt-0 flex flex-col h-full">
                  {/* Features List */}
                  <ul className="space-y-3 mb-6 flex-grow">
                    {features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sm">
                        <feature.icon className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                        <span>{feature.text}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Action Button */}
                  <div className="mt-auto">
                    {isCurrent ? (
                      <Button disabled className="w-full bg-green-600">
                        <Check className="w-4 h-4 mr-2" />
                        Current Plan
                      </Button>
                    ) : plan.price_cents === 0 ? (
                      <Button variant="outline" disabled className="w-full">
                        Free Plan
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => upgrade(plan)}
                        className={`w-full text-white transition-all duration-200 ${getPlanButtonColor(plan.name)} hover:scale-105`}
                      >
                        {active ? 'Switch Plan' : 'Get Started'}
                        {!active && <Star className="w-4 h-4 ml-2" />}
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
        className="text-center space-y-4"
      >
        <div className="bg-white p-6 rounded-lg shadow-sm border max-w-4xl mx-auto">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Why Choose Premium?</h3>
          <div className="grid md:grid-cols-3 gap-6 text-sm text-gray-600">
            <div className="flex flex-col items-center">
              <TrendingUp className="w-8 h-8 text-blue-500 mb-2" />
              <h4 className="font-semibold text-gray-800">Advanced Analytics</h4>
              <p>Track your progress with detailed insights and performance metrics</p>
            </div>
            <div className="flex flex-col items-center">
              <Users className="w-8 h-8 text-green-500 mb-2" />
              <h4 className="font-semibold text-gray-800">Social Features</h4>
              <p>Join challenges, compete with friends, and stay motivated together</p>
            </div>
            <div className="flex flex-col items-center">
              <Star className="w-8 h-8 text-purple-500 mb-2" />
              <h4 className="font-semibold text-gray-800">Smart Recommendations</h4>
              <p>AI-powered workout suggestions tailored to your goals and progress</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-2 text-sm text-gray-600">
          <p>All plans include access to core workout features</p>
          <p>Cancel anytime • No hidden fees • 30-day money-back guarantee</p>
          {demoMode && (
            <p className="text-yellow-600 font-medium">
              Demo mode: Subscriptions are simulated for testing purposes
            </p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default EnhancedSubscriptionPlansPage;
