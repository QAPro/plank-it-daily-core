import { useState, useEffect } from "react";
import QuickStatsSection from "./QuickStatsSection";
import WhatsNextSection from "./WhatsNextSection";
import TrophyCaseSection from "./TrophyCaseSection";
import EnhancedAchievementCelebration from "./EnhancedAchievementCelebration";
import { WhatsNextErrorBoundary } from "./WhatsNextErrorBoundary";
import { useUserAchievements } from "@/hooks/useUserAchievements";
import { useWhatsNextRecommendations } from "@/hooks/useWhatsNextRecommendations";
import { useRecommendationRefresh } from "@/hooks/useRecommendationRefresh";
import { useActiveAchievements, useAchievementById } from "@/hooks/useAchievements";

const WhatsNextAchievementsView = () => {
  const [selectedAchievement, setSelectedAchievement] = useState<any>(null);
  const [previousAchievementCount, setPreviousAchievementCount] = useState(0);
  
  // Data fetching
  const { achievements, loading: achievementsLoading } = useUserAchievements();
  const { data: activeAchievements = [], isLoading: activeLoading } = useActiveAchievements();
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
  const totalCount = activeAchievements.length;
  
  // Calculate total points from earned achievements using database lookups
  const [totalPoints, setTotalPoints] = useState(0);
  
  useEffect(() => {
    const calculatePoints = async () => {
      let points = 0;
      for (const userAchievement of achievements) {
        const achievement = activeAchievements.find(a => a.id === userAchievement.achievement_type);
        points += achievement?.points || 0;
      }
      setTotalPoints(points);
    };
    
    if (achievements.length > 0 && activeAchievements.length > 0) {
      calculatePoints();
    }
  }, [achievements, activeAchievements]);
  
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
