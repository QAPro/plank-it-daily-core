
import { motion } from "framer-motion";
import AchievementsGallery from "@/components/AchievementsGallery";

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
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Achievements</h2>
        <p className="text-gray-600">Track your progress and unlock rewards</p>
      </div>

      {/* Achievements Gallery */}
      <AchievementsGallery />
    </motion.div>
  );
};

export default AchievementsTab;
