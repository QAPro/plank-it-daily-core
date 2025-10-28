import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface FeaturedStatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
}

const FeaturedStatCard = ({ icon: Icon, label, value }: FeaturedStatCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-gradient-primary rounded-2xl p-8 mx-5 mb-6 shadow-glow text-center text-white"
    >
      <Icon className="w-12 h-12 mx-auto mb-3" />
      <p className="text-base font-medium opacity-90 mb-2">
        {label}
      </p>
      <p className="text-4xl font-bold" style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)' }}>
        {value}
      </p>
    </motion.div>
  );
};

export default FeaturedStatCard;
