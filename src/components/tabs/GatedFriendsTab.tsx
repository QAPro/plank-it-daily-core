
import React from 'react';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { useSubscription } from '@/hooks/useSubscription';
import EnhancedFeatureGuard from '@/components/access/EnhancedFeatureGuard';
import FriendsTab from './FriendsTab';

const GatedFriendsTab: React.FC = () => {
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
      mode="preview"
      previewHeight={400}
      showUpgradePrompt={true}
      compact={false}
    >
      <FriendsTab />
    </EnhancedFeatureGuard>
  );
};

export default GatedFriendsTab;
