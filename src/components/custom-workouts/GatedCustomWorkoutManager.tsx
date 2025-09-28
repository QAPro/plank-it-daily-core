
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { useCustomWorkouts } from '@/hooks/useCustomWorkouts';
import EnhancedFeatureGuard from '@/components/access/EnhancedFeatureGuard';
import UsageLimiter from '@/components/access/UsageLimiter';
import CustomWorkoutManager from './CustomWorkoutManager';
import { useSubscription } from '@/hooks/useSubscription';

const FREE_WORKOUT_LIMIT = 3;

const GatedCustomWorkoutManager = () => {
  const { hasAccess, tier } = useFeatureAccess();
  const { listQuery } = useCustomWorkouts();
  const { upgrade, plans } = useSubscription();

  const workoutCount = listQuery.data?.length || 0;
  const hasCustomWorkoutAccess = hasAccess('custom_workouts');
  const isAtLimit = !hasCustomWorkoutAccess && workoutCount >= FREE_WORKOUT_LIMIT;

  const handleUpgrade = () => {
    const premiumPlan = plans.find(p => p.name.toLowerCase().includes('premium'));
    if (premiumPlan) {
      upgrade(premiumPlan);
    }
  };

  // Free users get limited access
  if (tier === 'free') {
    return (
      <div className="space-y-6">
        {/* Usage limiter for free users */}
        <UsageLimiter
          feature="Custom Workouts"
          current={workoutCount}
          limit={FREE_WORKOUT_LIMIT}
          unit="workouts"
          onUpgrade={handleUpgrade}
          resetPeriod="total"
        />

        {/* Show custom workout manager with limits */}
        {isAtLimit ? (
        <EnhancedFeatureGuard
          feature="custom_workouts"
          mode="block"
          showUpgradePrompt={true}
          fallback={<div>Custom workouts require premium access</div>}
          loadingSkeleton={<div>Loading...</div>}
        >
            <CustomWorkoutManager />
          </EnhancedFeatureGuard>
        ) : (
          <CustomWorkoutManager />
        )}
      </div>
    );
  }

  // Premium/Pro users get full access
  return <CustomWorkoutManager />;
};

export default GatedCustomWorkoutManager;
