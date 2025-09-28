
import { FC } from 'react';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { useSubscription } from '@/hooks/useSubscription';
import EnhancedFeatureGuard from '@/components/access/EnhancedFeatureGuard';
import CompeteTab from './CompeteTab';

const GatedCompeteTab: React.FC = () => {
  const { hasAccess } = useFeatureAccess();
  const { upgrade, plans } = useSubscription();

  const handleUpgrade = () => {
    const premiumPlan = plans.find(p => p.name.toLowerCase().includes('premium'));
    if (premiumPlan) {
      upgrade(premiumPlan);
    }
  };

  return (
    <EnhancedFeatureGuard
      feature="social_challenges"
      mode="tease"
      previewHeight={350}
      showUpgradePrompt={true}
      compact={false}
      fallback={<div>Social challenges require premium access</div>}
      loadingSkeleton={<div>Loading challenges...</div>}
    >
      <CompeteTab />
    </EnhancedFeatureGuard>
  );
};

export default GatedCompeteTab;
