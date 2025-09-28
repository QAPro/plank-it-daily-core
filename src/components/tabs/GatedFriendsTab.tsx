
import { FC } from 'react';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { useSubscription } from '@/hooks/useSubscription';
import CrossSystemGuard from '@/components/access/CrossSystemGuard';
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

  // Cross-system requirements for social features
  const socialRequirements = [
    {
      type: 'track_level' as const,
      track: 'consistency',
      level: 3,
      description: 'Reach Consistency Level 3 to unlock social features'
    },
    {
      type: 'social_activity' as const,
      socialActions: 5,
      description: 'Complete 5 social interactions (posts, reactions, etc.)'
    }
  ];

  return (
    <CrossSystemGuard
      requirements={socialRequirements}
      fallbackTitle="Social Features Locked"
      fallbackDescription="Build your fitness foundation before accessing social features. Progress in multiple areas to unlock advanced social capabilities."
      upgradeAction={handleUpgrade}
    >
      <FriendsTab />
    </CrossSystemGuard>
  );
};

export default GatedFriendsTab;
