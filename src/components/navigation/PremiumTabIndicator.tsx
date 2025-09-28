
import { TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Crown, Lock } from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import type { FeatureName } from '@/constants/featureGating';

type PremiumTabIndicatorProps = {
  feature: FeatureName;
  icon: LucideIcon;
  label: string;
  tabValue: string;
  children?: ReactNode;
};

const PremiumTabIndicator = ({
  feature,
  icon: Icon, 
  label, 
  tabValue,
  children 
}) => {
  const { hasAccess, tier, requiredTierFor } = useFeatureAccess();
  const userHasAccess = hasAccess(feature);
  const requiredTier = requiredTierFor(feature);

  if (userHasAccess) {
    return (
      <TabsTrigger value={tabValue} className="flex items-center gap-2">
        <Icon className="w-4 h-4" />
        <span className="hidden sm:inline">{label}</span>
        {children}
      </TabsTrigger>
    );
  }

  return (
    <TabsTrigger value={tabValue} className="flex items-center gap-2 relative">
      <div className="flex items-center gap-2 opacity-75">
        <Icon className="w-4 h-4" />
        <span className="hidden sm:inline">{label}</span>
        <Crown className="w-3 h-3 text-amber-500" />
      </div>
      <Badge 
        variant="secondary" 
        className="absolute -top-1 -right-1 text-xs px-1 py-0.5 h-auto bg-amber-100 text-amber-700 border-amber-200"
      >
        Premium
      </Badge>
      {children}
    </TabsTrigger>
  );
};

export default PremiumTabIndicator;
