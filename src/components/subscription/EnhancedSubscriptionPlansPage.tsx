
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Check, 
  Star, 
  Crown, 
  Zap, 
  Users, 
  TrendingUp, 
  Heart, 
  Calculator,
  Gift,
  Clock,
  ArrowDown,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useSubscription } from '@/hooks/useSubscription';
import { formatPrice } from '@/utils/price';
import type { SubscriptionPlan } from '@/services/subscriptionService';

const EnhancedSubscriptionPlansPage = () => {
  const { plans, active, upgrade, loading, demoMode } = useSubscription();
  const [billingCycle, setBillingCycle] = useState<'month' | 'year'>('month');
  const [showComparison, setShowComparison] = useState(false);
  const [selectedPlans, setSelectedPlans] = useState<string[]>([]);
  const [usageSlider, setUsageSlider] = useState([20]); // Sessions per month

  const testimonials = [
    {
      name: "Sarah M.",
      text: "The smart recommendations helped me break my plateau!",
      tier: "Premium",
      avatar: "🏃‍♀️",
      rating: 5
    },
    {
      name: "Mike T.",
      text: "Custom workouts and pro analytics are game-changers.",
      tier: "Pro",
      avatar: "🏋️‍♂️",
      rating: 5
    },
    {
      name: "Lisa K.",
      text: "Social challenges keep me motivated every day!",
      tier: "Premium",
      avatar: "💪",
      rating: 5
    }
  ];

  const faqItems = [
    {
      question: "Can I cancel anytime?",
      answer: "Yes! You can cancel your subscription at any time. Your access will continue until the end of your billing period."
    },
    {
      question: "What's the difference between Premium and Pro?",
      answer: "Premium includes advanced analytics and social features. Pro adds unlimited custom workouts and priority support."
    },
    {
      question: "Do you offer refunds?",
      answer: "We offer a 30-day money-back guarantee if you're not satisfied with your subscription."
    },
    {
      question: "Can I upgrade or downgrade my plan?",
      answer: "Absolutely! You can change your plan at any time through your account settings."
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
        { text: 'All Premium features', icon: Check, highlight: false },
        { text: 'Custom workout builder', icon: Zap, highlight: true },
        { text: 'Priority support', icon: Heart, highlight: true },
        { text: 'Advanced analytics dashboard', icon: TrendingUp, highlight: true },
        { text: 'Unlimited everything', icon: Crown, highlight: false },
        { text: 'Export workout data', icon: Check, highlight: false },
        { text: 'Personal coaching insights', icon: Star, highlight: true }
      ];
    }
    if (name.includes('premium')) {
      return [
        { text: 'Advanced statistics & insights', icon: TrendingUp, highlight: true },
        { text: 'Smart workout recommendations', icon: Star, highlight: true },
        { text: 'Social challenges & leaderboards', icon: Users, highlight: true },
        { text: 'Export your progress data', icon: Check, highlight: false },
        { text: 'No advertisements', icon: Check, highlight: false },
        { text: 'Premium workout variations', icon: Zap, highlight: false }
      ];
    }
    return [
      { text: 'Basic workout tracking', icon: Check, highlight: false },
      { text: 'Simple statistics', icon: TrendingUp, highlight: false },
      { text: 'Community access', icon: Users, highlight: false },
      { text: 'Limited features', icon: Check, highlight: false }
    ];
  };

  const calculateYearlySavings = (plan: SubscriptionPlan) => {
    if (plan.billing_interval !== 'year') return null;
    const monthlyEquivalent = plan.price_cents === 3999 ? 499 : 999; // Assuming monthly prices
    const yearlySavings = (monthlyEquivalent * 12) - plan.price_cents;
    return Math.round((yearlySavings / (monthlyEquivalent * 12)) * 100);
  };

  // Calculate value based on usage
  const calculateValuePerSession = (plan: SubscriptionPlan) => {
    if (plan.price_cents === 0) return 0;
    const monthlyPrice = plan.billing_interval === 'year' ? plan.price_cents / 12 : plan.price_cents;
    return (monthlyPrice / 100) / usageSlider[0];
  };

  const filteredPlans = plans.filter(plan => 
    billingCycle === 'month' ? 
      plan.billing_interval === 'month' : 
      plan.billing_interval === 'year'
  );

  const togglePlanComparison = (planId: string) => {
    setSelectedPlans(prev => 
      prev.includes(planId) 
        ? prev.filter(id => id !== planId)
        : prev.length < 3 ? [...prev, planId] : prev
    );
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

      {/* Interactive Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white p-6 rounded-lg border shadow-sm space-y-6"
      >
        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4">
          <Label htmlFor="billing-toggle" className={billingCycle === 'month' ? 'font-semibold' : 'text-gray-500'}>
            Monthly
          </Label>
          <Switch
            id="billing-toggle"
            checked={billingCycle === 'year'}
            onCheckedChange={(checked) => setBillingCycle(checked ? 'year' : 'month')}
          />
          <Label htmlFor="billing-toggle" className={billingCycle === 'year' ? 'font-semibold' : 'text-gray-500'}>
            Yearly
            <Badge className="ml-2 bg-green-500 text-white text-xs">Save 20%</Badge>
          </Label>
        </div>

        {/* Usage Calculator */}
        <div className="max-w-md mx-auto">
          <Label className="block text-sm font-medium mb-2">
            Expected monthly sessions: {usageSlider[0]}
          </Label>
          <Slider
            value={usageSlider}
            onValueChange={setUsageSlider}
            max={50}
            min={1}
            step={1}
            className="mb-2"
          />
          <p className="text-xs text-gray-500 text-center">
            Adjust to see value per session
          </p>
        </div>

        {/* Comparison Toggle */}
        <div className="flex items-center justify-center gap-2">
          <Switch
            id="comparison-toggle"
            checked={showComparison}
            onCheckedChange={setShowComparison}
          />
          <Label htmlFor="comparison-toggle" className="text-sm">
            Compare Plans Side-by-Side
          </Label>
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
                  <h3 className="font-semibold text-green-800 flex items-center gap-2">
                    <Crown className="w-4 h-4" />
                    Current Plan: {active.plan_name}
                  </h3>
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

      {showComparison && selectedPlans.length > 0 ? (
        /* Comparison Table */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg border shadow-sm overflow-hidden"
        >
          <div className="p-4 bg-gray-50 border-b">
            <h3 className="font-semibold text-gray-800">Plan Comparison</h3>
            <p className="text-sm text-gray-600">Compare features side by side</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium">Features</th>
                  {selectedPlans.map(planId => {
                    const plan = plans.find(p => p.id === planId);
                    return (
                      <th key={planId} className="text-center p-4 font-medium">
                        {plan?.name}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {/* Feature rows would go here */}
                <tr className="border-b">
                  <td className="p-4">Price per session</td>
                  {selectedPlans.map(planId => {
                    const plan = plans.find(p => p.id === planId);
                    const valuePerSession = plan ? calculateValuePerSession(plan) : 0;
                    return (
                      <td key={planId} className="text-center p-4">
                        ${valuePerSession.toFixed(2)}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </motion.div>
      ) : (
        /* Plans Grid */
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlans.map((plan, index) => {
            const PlanIcon = getPlanIcon(plan.name);
            const isPopular = plan.is_popular;
            const isCurrent = isCurrentPlan(plan);
            const features = getEnhancedFeaturesList(plan.name);
            const yearlySavings = calculateYearlySavings(plan);
            const valuePerSession = calculateValuePerSession(plan);
            const isSelected = selectedPlans.includes(plan.id);

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
                    <Badge className="bg-orange-500 text-white px-4 py-1 animate-pulse">
                      🔥 Most Popular
                    </Badge>
                  </div>
                )}
                
                <Card className={`h-full ${getPlanColor(plan.name)} ${
                  isPopular ? 'ring-2 ring-orange-200 scale-105' : ''
                } ${isCurrent ? 'ring-2 ring-green-300' : ''} ${
                  isSelected ? 'ring-2 ring-blue-300' : ''
                } transition-all duration-300 hover:shadow-lg`}>
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
                        <div className="text-xs text-green-600 mt-1 font-semibold animate-pulse">
                          💰 Save {yearlySavings}% vs monthly
                        </div>
                      )}
                      {plan.price_cents > 0 && (
                        <div className="text-xs text-blue-600 mt-1">
                          ${valuePerSession.toFixed(2)} per session
                        </div>
                      )}
                    </div>

                    {/* Trial Offer */}
                    {plan.price_cents > 0 && !isCurrent && (
                      <motion.div
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="mt-2"
                      >
                        <Badge className="bg-blue-100 text-blue-800 text-xs">
                          <Gift className="w-3 h-3 mr-1" />
                          7-day free trial
                        </Badge>
                      </motion.div>
                    )}
                  </CardHeader>

                  <CardContent className="pt-0 flex flex-col h-full">
                    {/* Features List */}
                    <ul className="space-y-3 mb-6 flex-grow">
                      {features.map((feature, idx) => (
                        <motion.li 
                          key={idx} 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * idx + 0.5 }}
                          className="flex items-center text-sm"
                        >
                          <feature.icon className={`w-4 h-4 mr-3 flex-shrink-0 ${
                            feature.highlight ? 'text-orange-500' : 'text-green-500'
                          }`} />
                          <span className={feature.highlight ? 'font-medium' : ''}>
                            {feature.text}
                            {feature.highlight && (
                              <Sparkles className="w-3 h-3 inline ml-1 text-orange-500" />
                            )}
                          </span>
                        </motion.li>
                      ))}
                    </ul>

                    {/* Action Buttons */}
                    <div className="mt-auto space-y-2">
                      {showComparison && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => togglePlanComparison(plan.id)}
                          className={`w-full ${isSelected ? 'bg-blue-50 border-blue-300' : ''}`}
                        >
                          {isSelected ? 'Remove from comparison' : 'Compare'}
                        </Button>
                      )}
                      
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
                          {active ? 'Switch Plan' : 'Start Free Trial'}
                          {!active && <ArrowRight className="w-4 h-4 ml-2" />}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Social Proof & Testimonials */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="text-center space-y-6"
      >
        <div className="flex justify-center items-center space-x-2 text-sm text-gray-600">
          <Users className="w-4 h-4" />
          <span>Trusted by 10,000+ active users</span>
        </div>
        
        {/* Testimonials Carousel */}
        <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
            >
              <div className="flex items-center mb-3">
                <span className="text-2xl mr-3">{testimonial.avatar}</span>
                <div className="text-left">
                  <p className="font-semibold text-gray-800">{testimonial.name}</p>
                  <div className="flex items-center gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-700 italic mb-2">"{testimonial.text}"</p>
              <Badge variant="outline" className="text-xs">{testimonial.tier}</Badge>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* FAQ Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="max-w-3xl mx-auto"
      >
        <h3 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Frequently Asked Questions
        </h3>
        <div className="space-y-4">
          {faqItems.map((item, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{item.question}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">{item.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Why Choose Premium */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.5 }}
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
