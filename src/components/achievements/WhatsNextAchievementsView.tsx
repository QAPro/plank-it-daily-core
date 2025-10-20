import { useState, useEffect } from "react";
import QuickStatsSection from "./QuickStatsSection";
import WhatsNextSection from "./WhatsNextSection";
import TrophyCaseSection from "./TrophyCaseSection";
import EnhancedAchievementCelebration from "./EnhancedAchievementCelebration";
import { WhatsNextErrorBoundary } from "./WhatsNextErrorBoundary";
import { useUserAchievements } from "@/hooks/useUserAchievements";
import { useWhatsNextRecommendations } from "@/hooks/useWhatsNextRecommendations";
import { useRecommendationRefresh } from "@/hooks/useRecommendationRefresh";
import { getActiveAchievements, getAchievementById } from "@/services/achievementHelpers";

const WhatsNextAchievementsView = () => {
  const [selectedAchievement, setSelectedAchievement] = useState<any>(null);
  const [previousAchievementCount, setPreviousAchievementCount] = useState(0);
  
  // Data fetching
  const { achievements, loading: achievementsLoading } = useUserAchievements();
  const { 
    data: recommendations, 
    isLoading: recommendationsLoading,
    error: recommendationsError,
    isRefetching: recommendationsRefetching,
  } = useWhatsNextRecommendations(5);
  
  // Auto-refresh recommendations when component mounts or achievements change
  useRecommendationRefresh({ enabled: true });
  
  // Track achievement count changes for visual updates
  useEffect(() => {
    if (achievements.length > previousAchievementCount && previousAchievementCount > 0) {
      // New achievement earned - recommendations will auto-refresh via event system
    }
    setPreviousAchievementCount(achievements.length);
  }, [achievements.length, previousAchievementCount]);

  // Calculate stats
  const earnedCount = achievements.length;
  const totalCount = getActiveAchievements().length;
  
  // Calculate total points from earned achievements
  const totalPoints = achievements.reduce((sum, userAchievement) => {
    const achievement = getAchievementById(userAchievement.achievement_type);
    return sum + (achievement?.points || 0);
  }, 0);
  
  const completionPercentage = totalCount > 0 ? Math.round((earnedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-8 pb-24">
      <QuickStatsSection
        earnedCount={earnedCount}
        totalCount={totalCount}
        totalPoints={totalPoints}
        completionPercentage={completionPercentage}
      />

      <WhatsNextErrorBoundary>
        <WhatsNextSection 
          recommendations={recommendations || []}
          loading={recommendationsLoading}
          onAchievementClick={setSelectedAchievement}
          error={recommendationsError as Error | undefined}
          isRefetching={recommendationsRefetching}
          totalAchievements={totalCount}
          earnedCount={earnedCount}
        />
      </WhatsNextErrorBoundary>

      <TrophyCaseSection 
        recentAchievements={achievements}
        loading={achievementsLoading}
        onAchievementClick={setSelectedAchievement}
      />

      {selectedAchievement && (
        <EnhancedAchievementCelebration
          achievement={selectedAchievement}
          onClose={() => setSelectedAchievement(null)}
          isVisible={!!selectedAchievement}
        />
      )}
    </div>
  );
};

export default WhatsNextAchievementsView;
