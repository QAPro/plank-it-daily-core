import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface RegularStatCardProps {
  icon?: LucideIcon;
  title: string;
  value: string | number;
  delay?: number;
}

const RegularStatCard = ({ icon: Icon, title, value, delay = 0 }: RegularStatCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
        <CardContent className="p-6">
          {Icon && (
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Icon className="h-5 w-5 text-primary" />
              </div>
            </div>
          )}
          <p className="text-base font-semibold text-[#7F8C8D] uppercase mb-3" style={{ letterSpacing: '0.5px' }}>
            {title}
          </p>
          <p className="text-[32px] font-bold text-[#2C3E50]">
            {value}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default RegularStatCard;
