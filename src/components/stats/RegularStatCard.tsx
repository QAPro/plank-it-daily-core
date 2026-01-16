import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { format } from 'date-fns';

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
      <Card className="bg-card rounded-xl shadow-soft">
        <CardContent className="p-4 text-center">
          {emoji && (
            <div className="mb-2 flex justify-center items-center" style={{ minHeight: '48px' }}>
              {emoji === '📅' ? (
                <div className="relative w-10 h-10 flex flex-col items-center justify-center bg-gradient-to-b from-red-500 to-red-600 rounded-md shadow-sm">
                  <div className="absolute top-0 left-0 right-0 h-2 bg-red-700 rounded-t-md"></div>
                  <div className="text-[9px] font-bold text-white uppercase mt-0.5">{format(new Date(), 'MMM')}</div>
                  <div className="text-base font-bold text-white leading-none">{format(new Date(), 'd')}</div>
                </div>
              ) : (
                <span className="text-3xl">{emoji}</span>
              )}
            </div>
          )}
          {Icon && !emoji && (
            <div className="flex justify-center mb-2">
              <Icon className="h-8 w-8 text-primary" />
            </div>
          )}
          <p className="text-2xl font-bold text-foreground mb-1">
            {value}
          </p>
          <p className="text-xs font-medium text-muted-foreground">
            {title}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default RegularStatCard;
