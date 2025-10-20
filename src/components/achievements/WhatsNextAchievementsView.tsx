import { useState } from "react";
import QuickStatsSection from "./QuickStatsSection";
import WhatsNextSection from "./WhatsNextSection";
import TrophyCaseSection from "./TrophyCaseSection";
import EnhancedAchievementCelebration from "./EnhancedAchievementCelebration";
import { useUserAchievements } from "@/hooks/useUserAchievements";
import { useWhatsNextRecommendations } from "@/hooks/useWhatsNextRecommendations";
import { getActiveAchievements, getAchievementById } from "@/services/achievementHelpers";

interface WhatsNextAchievementsViewProps {
  onViewAllClick: () => void;
}

const WhatsNextAchievementsView = ({ onViewAllClick }: WhatsNextAchievementsViewProps) => {
  const [selectedAchievement, setSelectedAchievement] = useState<any>(null);
  
  // Data fetching
  const { achievements, loading: achievementsLoading } = useUserAchievements();
  const { data: recommendations, isLoading: recommendationsLoading } = useWhatsNextRecommendations(5);

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
    <div className="space-y-8">
      <QuickStatsSection 
        earnedCount={earnedCount}
        totalCount={totalCount}
        totalPoints={totalPoints}
        completionPercentage={completionPercentage}
      />

      <WhatsNextSection 
        recommendations={recommendations || []}
        loading={recommendationsLoading}
        onAchievementClick={setSelectedAchievement}
      />

      <TrophyCaseSection 
        recentAchievements={achievements}
        loading={achievementsLoading}
        onAchievementClick={setSelectedAchievement}
        onViewAllClick={onViewAllClick}
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
