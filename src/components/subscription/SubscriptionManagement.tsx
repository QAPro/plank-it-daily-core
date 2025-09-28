
import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCard, 
  Calendar, 
  Settings, 
  ArrowLeft, 
  ExternalLink, 
  Receipt, 
  Download,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Pause,
  RefreshCw,
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSubscription } from '@/hooks/useSubscription';
import { formatPrice } from '@/utils/price';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { subscriptionService, BillingTransaction } from '@/services/subscriptionService';
import BillingManagement from './BillingManagement';
import UserSubscriptionAnalytics from './UserSubscriptionAnalytics';
import UsageDashboard from './UsageDashboard';

type SubscriptionManagementProps = {
  onBack: () => void;
};

const SubscriptionManagement = ({ onBack }: SubscriptionManagementProps) => {
  const { active, cancel, openPortal, demoMode, plans } = useSubscription();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

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

  const currentPlan = plans.find(p => p.name === active.plan_name);
  const nextBillingDate = active.current_period_end ? 
    new Date(active.current_period_end) : null;
  const daysUntilBilling = nextBillingDate ? 
    Math.ceil((nextBillingDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;

  // Subscription health indicators
  const healthIndicators = [
    {
      label: 'Payment Status',
      status: active.status === 'active' ? 'healthy' : 'warning',
      value: active.status === 'active' ? 'Up to date' : 'Needs attention',
      icon: active.status === 'active' ? CheckCircle : AlertTriangle
    },
    {
      label: 'Next Billing',
      status: daysUntilBilling && daysUntilBilling > 7 ? 'healthy' : 'warning',
      value: daysUntilBilling ? `${daysUntilBilling} days` : 'Unknown',
      icon: Calendar
    },
    {
      label: 'Usage Level',
      status: 'healthy',
      value: 'Moderate',
      icon: BarChart3
    }
  ];

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
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Subscription Management</h2>
          <p className="text-gray-600">Manage your subscription, billing, and usage</p>
        </div>
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

      {/* Subscription Overview Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-600" />
                {active.plan_name}
                <Badge className={`ml-2 text-white ${getStatusColor(active.status || 'active')}`}>
                  {getStatusText(active.status || 'active')}
                </Badge>
              </CardTitle>
              <CardDescription className="mt-1">
                Your premium subscription details and quick actions
              </CardDescription>
            </div>
            {currentPlan && (
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600">
                  {formatPrice(currentPlan.price_cents)}
                </p>
                <p className="text-sm text-gray-600">per {currentPlan.billing_interval}</p>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Health Indicators */}
          <div className="grid md:grid-cols-3 gap-4">
            {healthIndicators.map((indicator, index) => {
              const Icon = indicator.icon;
              return (
                <div 
                  key={indicator.label}
                  className="flex items-center gap-3 p-3 bg-white/60 rounded-lg"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    indicator.status === 'healthy' ? 'bg-green-100' : 'bg-yellow-100'
                  }`}>
                    <Icon className={`w-4 h-4 ${
                      indicator.status === 'healthy' ? 'text-green-600' : 'text-yellow-600'
                    }`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">{indicator.label}</p>
                    <p className="text-xs text-gray-600">{indicator.value}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-3 pt-2 border-t border-blue-200">
            {!demoMode && (
              <Button variant="outline" onClick={openPortal} className="bg-white/60">
                <ExternalLink className="w-4 h-4 mr-2" />
                Billing Portal
              </Button>
            )}
            <Button variant="outline" className="bg-white/60">
              <Pause className="w-4 h-4 mr-2" />
              Pause Subscription
            </Button>
            <Button variant="outline" className="bg-white/60">
              <RefreshCw className="w-4 h-4 mr-2" />
              Change Plan
            </Button>
            {active.status === 'active' && (
              <Button variant="destructive" onClick={cancel}>
                Cancel Subscription
              </Button>
            )}
          </div>

          {demoMode && (
            <div className="text-sm text-gray-600 bg-white/60 p-3 rounded border-t border-blue-200">
              <p className="font-medium mb-1">Demo Mode Actions:</p>
              <p>• Cancel subscription will simulate cancellation</p>
              <p>• Billing management is not available in demo mode</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabbed Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Subscription Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Subscription Timeline
              </CardTitle>
              <CardDescription>Key dates and milestones for your subscription</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Subscription Started</p>
                      <p className="text-sm text-gray-600">Welcome to premium!</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">
                    {new Date().toLocaleDateString()}
                  </p>
                </div>

                {nextBillingDate && (
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Clock className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">Next Billing Date</p>
                        <p className="text-sm text-gray-600">
                          {formatPrice(currentPlan?.price_cents || 0)} will be charged
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">
                      {nextBillingDate.toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Billing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="w-5 h-5" />
                Recent Billing Activity
              </CardTitle>
              <CardDescription>Your latest transactions and payments</CardDescription>
            </CardHeader>
            <CardContent>
              {historyLoading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="animate-pulse h-16 bg-gray-100 rounded" />
                  ))}
                </div>
              ) : history.slice(0, 3).length === 0 ? (
                <p className="text-sm text-gray-500">No recent transactions</p>
              ) : (
                <div className="space-y-3">
                  {(history as BillingTransaction[]).slice(0, 3).map((t) => (
                    <div key={t.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Receipt className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{t.description || 'Subscription Payment'}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(t.processed_at || t.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatPrice(t.amount_cents)}</p>
                        <Badge variant={t.status === "succeeded" ? "default" : t.status === "pending" ? "secondary" : "destructive"}>
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
                {active.plan_name?.toLowerCase().includes('premium') && (
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
        </TabsContent>

        <TabsContent value="usage" className="mt-6">
          <UsageDashboard />
        </TabsContent>

        <TabsContent value="billing" className="mt-6">
          <BillingManagement />
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <UserSubscriptionAnalytics />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default SubscriptionManagement;
