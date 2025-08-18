
import React from 'react';
import { motion } from 'framer-motion';
import { Crown, Star, ArrowRight, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSubscription } from '@/hooks/useSubscription';

type SubscriptionStatusCardProps = {
  onManageClick: () => void;
  onUpgradeClick: () => void;
};

const SubscriptionStatusCard = ({ onManageClick, onUpgradeClick }: SubscriptionStatusCardProps) => {
  const { active, demoMode } = useSubscription();

  const getPlanIcon = (planName: string) => {
    if (planName?.toLowerCase().includes('pro')) return Crown;
    if (planName?.toLowerCase().includes('premium')) return Star;
    return null;
  };

  const getPlanColor = (planName: string) => {
    if (planName?.toLowerCase().includes('pro')) return 'from-purple-500 to-purple-600';
    if (planName?.toLowerCase().includes('premium')) return 'from-blue-500 to-blue-600';
    return 'from-gray-500 to-gray-600';
  };

  if (!active) {
    return (
      <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-100">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-800">Free Plan</h3>
              <p className="text-sm text-gray-600">
                Upgrade to unlock premium features
              </p>
            </div>
            <Button size="sm" onClick={onUpgradeClick}>
              Upgrade
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const Icon = getPlanIcon(active.plan_name || '');
  const gradientColor = getPlanColor(active.plan_name || '');
  const daysUntilRenewal = active.current_period_end ? 
    Math.ceil((new Date(active.current_period_end).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 
    null;

  return (
    <Card className={`bg-gradient-to-r ${gradientColor} text-white border-0`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {Icon && <Icon className="w-6 h-6 mr-3" />}
            <div>
              <div className="flex items-center">
                <h3 className="font-semibold">{active.plan_name}</h3>
                {demoMode && (
                  <Badge variant="outline" className="ml-2 text-xs bg-white/20 border-white/30 text-white">
                    Demo
                  </Badge>
                )}
              </div>
              <div className="flex items-center text-sm opacity-90">
                <Calendar className="w-3 h-3 mr-1" />
                {daysUntilRenewal && daysUntilRenewal > 0 ? (
                  <span>Renews in {daysUntilRenewal} days</span>
                ) : (
                  <span>Active subscription</span>
                )}
              </div>
            </div>
          </div>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={onManageClick}
            className="bg-white/10 border-white/30 text-white hover:bg-white/20"
          >
            Manage
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionStatusCard;
