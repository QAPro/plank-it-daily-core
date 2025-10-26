import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface RegularStatCardProps {
  icon?: LucideIcon;
  title: string;
  value: string | number;
  delay?: number;
}

const RegularStatCard = ({ icon: Icon, title, value, delay = 0, emoji }: RegularStatCardProps & { emoji?: string }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
        <CardContent className="p-4 text-center">
          {emoji && (
            <div className="text-3xl mb-2">
              {emoji}
            </div>
          )}
          {Icon && !emoji && (
            <div className="flex justify-center mb-2">
              <Icon className="h-8 w-8 text-primary" />
            </div>
          )}
          <p className="text-2xl font-bold text-[#2C3E50] mb-1">
            {value}
          </p>
          <p className="text-xs font-medium text-[#7F8C8D]">
            {title}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default RegularStatCard;
