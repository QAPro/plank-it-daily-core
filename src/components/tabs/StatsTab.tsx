
import { motion } from "framer-motion";
import StatsDashboard from "@/components/StatsDashboard";
import SessionHistory from "@/components/SessionHistory";

const StatsTab = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 space-y-6"
    >
      {/* Header */}
      <div className="text-center pt-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Progress</h2>
        <p className="text-gray-600">Track your plank journey</p>
      </div>

      {/* Statistics Dashboard */}
      <StatsDashboard />

      {/* Session History */}
      <SessionHistory />
    </motion.div>
  );
};

export default StatsTab;
