
import React from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Calendar, Settings, ArrowLeft, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSubscription } from '@/hooks/useSubscription';
import { formatPrice } from '@/utils/price';

type SubscriptionManagementProps = {
  onBack: () => void;
};

const SubscriptionManagement = ({ onBack }: SubscriptionManagementProps) => {
  const { active, cancel, openPortal, demoMode } = useSubscription();

  if (!active) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 space-y-6"
      >
        <div className="flex items-center mb-6">
          <Button variant="outline" onClick={onBack} className="mr-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h2 className="text-2xl font-bold text-gray-800">Subscription</h2>
        </div>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="mb-4">
              <CreditCard className="w-12 h-12 mx-auto text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Active Subscription</h3>
            <p className="text-gray-600 mb-4">
              You're currently on the free plan. Upgrade to unlock premium features!
            </p>
            <Button onClick={onBack}>
              View Plans
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'canceled': return 'bg-red-500';
      case 'past_due': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'canceled': return 'Canceled';
      case 'past_due': return 'Past Due';
      default: return status;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex items-center mb-6">
        <Button variant="outline" onClick={onBack} className="mr-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h2 className="text-2xl font-bold text-gray-800">Subscription Management</h2>
      </div>

      {demoMode && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center">
              <Settings className="w-5 h-5 text-yellow-600 mr-2" />
              <div>
                <p className="font-medium text-yellow-800">Demo Mode Active</p>
                <p className="text-sm text-yellow-700">
                  This is a simulated subscription for testing purposes
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Subscription */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                Current Plan: {active.plan_name}
                <Badge className={`ml-2 text-white ${getStatusColor(active.status || 'active')}`}>
                  {getStatusText(active.status || 'active')}
                </Badge>
              </CardTitle>
              <CardDescription>
                Your subscription details and billing information
              </CardDescription>
            </div>
            <CreditCard className="w-8 h-8 text-gray-400" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Subscription Details */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <Calendar className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <p className="font-medium">Next Billing Date</p>
                <p className="text-sm text-gray-600">
                  {active.current_period_end ? 
                    new Date(active.current_period_end).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 
                    'N/A'
                  }
                </p>
              </div>
            </div>

            {active.custom_price_cents && (
              <div className="flex items-center">
                <CreditCard className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="font-medium">Monthly Cost</p>
                  <p className="text-sm text-gray-600">
                    {formatPrice(active.custom_price_cents)}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            {!demoMode && (
              <Button 
                variant="outline" 
                onClick={openPortal}
                className="flex items-center"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Manage Billing
              </Button>
            )}
            
            {active.status === 'active' && (
              <Button 
                variant="destructive" 
                onClick={cancel}
                className="flex items-center"
              >
                Cancel Subscription
              </Button>
            )}
          </div>

          {demoMode && (
            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
              <p className="font-medium mb-1">Demo Mode Actions:</p>
              <p>• Cancel subscription will simulate cancellation</p>
              <p>• Billing management is not available in demo mode</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subscription Benefits */}
      <Card>
        <CardHeader>
          <CardTitle>Your Benefits</CardTitle>
          <CardDescription>
            Features included with your {active.plan_name} subscription
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-3">
            {active.plan_name?.toLowerCase().includes('premium') && (
              <>
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Advanced Statistics
                </div>
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Smart Recommendations
                </div>
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Social Challenges
                </div>
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Priority Support
                </div>
              </>
            )}
            {active.plan_name?.toLowerCase().includes('pro') && (
              <>
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                  All Premium Features
                </div>
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                  Custom Workouts
                </div>
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                  Advanced Analytics
                </div>
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                  Unlimited Everything
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SubscriptionManagement;
