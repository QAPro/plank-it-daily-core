
import React from 'react';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { useSubscription } from '@/hooks/useSubscription';
import EnhancedFeatureGuard from '@/components/access/EnhancedFeatureGuard';
import RecommendationsDashboard from '@/components/RecommendationsDashboard';
import BasicRecommendationsCard from './BasicRecommendationsCard';

interface GatedRecommendationsDashboardProps {
  onExerciseSelect?: (exerciseId: string) => void;
}

const GatedRecommendationsDashboard: React.FC<GatedRecommendationsDashboardProps> = ({ 
  onExerciseSelect 
}) => {
  const { hasAccess } = useFeatureAccess();
  const { upgrade, plans } = useSubscription();

  const handleUpgrade = () => {
    const premiumPlan = plans.find(p => p.name.toLowerCase().includes('premium'));
    if (premiumPlan) {
      upgrade(premiumPlan);
    }
  };

  const hasSmartRecommendations = hasAccess('smart_recommendations');

  if (hasSmartRecommendations) {
    return <RecommendationsDashboard onExerciseSelect={onExerciseSelect} />;
  }

  return (
    <EnhancedFeatureGuard
      feature="smart_recommendations"
      mode="block"
      showUpgradePrompt={true}
      compact={false}
      fallback={<BasicRecommendationsCard onExerciseSelect={onExerciseSelect} />}
    >
      <RecommendationsDashboard onExerciseSelect={onExerciseSelect} />
    </EnhancedFeatureGuard>
  );
};

export default GatedRecommendationsDashboard;
