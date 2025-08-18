
import React from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Calendar, Settings, ArrowLeft, ExternalLink, Receipt } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSubscription } from '@/hooks/useSubscription';
import { formatPrice } from '@/utils/price';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { subscriptionService, BillingTransaction } from '@/services/subscriptionService';

type SubscriptionManagementProps = {
  onBack: () => void;
};

const SubscriptionManagement = ({ onBack }: SubscriptionManagementProps) => {
  const { active, cancel, openPortal, demoMode } = useSubscription();
  const { user } = useAuth();

  const { data: history = [], isLoading: historyLoading } = useQuery({
    queryKey: ["billing-history", user?.id],
    enabled: !!user?.id,
    queryFn: () => subscriptionService.getBillingHistory(user!.id),
    staleTime: 10_000,
  });

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

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            Billing History
          </CardTitle>
          <CardDescription>Your past subscription charges and actions</CardDescription>
        </CardHeader>
        <CardContent>
          {historyLoading ? (
            <div className="text-sm text-muted-foreground">Loading history...</div>
          ) : history.length === 0 ? (
            <div className="text-sm text-muted-foreground">No billing history yet.</div>
          ) : (
            <div className="space-y-2">
              {(history as BillingTransaction[]).map((t) => (
                <div key={t.id} className="flex items-center justify-between rounded border p-3">
                  <div>
                    <div className="font-medium">
                      {t.transaction_type === "subscription" ? "Subscription" : t.transaction_type === "one_time" ? "One-time Payment" : "Refund"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {t.processed_at ? new Date(t.processed_at).toLocaleString() : new Date(t.created_at).toLocaleString()}
                    </div>
                    {t.description && <div className="text-xs mt-1">{t.description}</div>}
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatPrice(t.amount_cents)}</div>
                    <Badge variant={t.status === "succeeded" ? "default" : t.status === "pending" ? "secondary" : "destructive"} className="mt-1">
                      {t.status}
                    </Badge>
                  </div>
                </div>
              ))}
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
