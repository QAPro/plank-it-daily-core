import { motion } from "framer-motion";
import WhatsNextAchievementsView from "@/components/achievements/WhatsNextAchievementsView";

const AchievementsTab = () => {
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

      {/* Single scrollable content - no tabs */}
      <WhatsNextAchievementsView />
    </motion.div>
  );
};

export default AchievementsTab;