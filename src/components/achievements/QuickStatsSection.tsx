import { motion } from "framer-motion";
import { Trophy, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface QuickStatsSectionProps {
  earnedCount: number;
  totalPoints: number;
}

const QuickStatsSection = ({ 
  earnedCount, 
  totalPoints 
}: QuickStatsSectionProps) => {
  const stats = [
    {
      icon: Trophy,
      label: "Achievements Earned",
      value: earnedCount.toLocaleString(),
      gradient: "from-orange-500/10 to-red-500/10",
      iconColor: "text-orange-500",
    },
    {
      icon: Star,
      label: "Total Points",
      value: totalPoints.toLocaleString(),
      gradient: "from-purple-500/10 to-pink-500/10",
      iconColor: "text-purple-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className={`bg-gradient-to-br ${stat.gradient} border-border/50`}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg bg-background/50 ${stat.iconColor}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default QuickStatsSection;
