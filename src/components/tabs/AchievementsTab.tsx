
import { motion } from "framer-motion";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OptimizedAchievementsGallery from "@/components/achievements/OptimizedAchievementsGallery";
import SkillTreeDisplay from "@/components/achievements/SkillTreeDisplay";
import SeasonalAchievementsBanner from "@/components/achievements/SeasonalAchievementsBanner";
import HiddenAchievementCelebration from "@/components/achievements/HiddenAchievementCelebration";
import { Trophy, TreePine, Calendar, Sparkles } from "lucide-react";

const AchievementsTab = () => {
  const [celebratingAchievement, setCelebratingAchievement] = useState<any>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 space-y-6"
    >
      {/* Header */}
      <div className="text-center pt-4">
        <h2 className="text-3xl font-bold text-foreground mb-2">🏆 Achievements</h2>
        <p className="text-muted-foreground">Track your progress and unlock rewards on your fitness journey</p>
      </div>

      {/* Achievement Tabs */}
      <Tabs defaultValue="gallery" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="gallery" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Gallery
          </TabsTrigger>
          <TabsTrigger value="seasonal" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Seasonal
          </TabsTrigger>
          <TabsTrigger value="skills" className="flex items-center gap-2">
            <TreePine className="w-4 h-4" />
            Skill Trees
          </TabsTrigger>
          <TabsTrigger value="hidden" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Discoveries
          </TabsTrigger>
        </TabsList>

        <TabsContent value="gallery">
          <OptimizedAchievementsGallery />
        </TabsContent>

        <TabsContent value="seasonal">
          <SeasonalAchievementsBanner onAchievementClick={setCelebratingAchievement} />
        </TabsContent>

        <TabsContent value="skills">
          <SkillTreeDisplay />
        </TabsContent>

        <TabsContent value="hidden">
          <div className="text-center space-y-4">
            <div className="text-6xl">🕵️‍♂️</div>
            <div>
              <h3 className="text-2xl font-bold mb-2">Hidden Discoveries</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Secret achievements unlock as you naturally use the app. Keep working out and discover amazing surprises!
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {celebratingAchievement && (
        <HiddenAchievementCelebration
          achievement={celebratingAchievement}
          isVisible={!!celebratingAchievement}
          onClose={() => setCelebratingAchievement(null)}
        />
      )}
    </motion.div>
  );
};

export default AchievementsTab;
