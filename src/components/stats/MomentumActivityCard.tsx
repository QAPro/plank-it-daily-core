import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import { useMomentumScore } from "@/hooks/useMomentumScore";

interface MomentumActivityCardProps {
  weeklyActivity: Array<{
    label: string;
    workoutCount: number;
  }>;
}

const MomentumActivityCard = ({ weeklyActivity }: MomentumActivityCardProps) => {
  const { data, isLoading } = useMomentumScore();
  const score = data?.score || 0;

  if (isLoading) {
    return (
      <Card className="bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
        <CardContent className="p-6">
          <div className="animate-pulse h-24 bg-muted rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-gradient-to-r from-[#FF6B35] to-[#3B82F6] shadow-[0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center justify-between gap-6">
            {/* Left side - Momentum Score */}
            <div className="flex-1">
              <p className="text-white/90 text-sm font-medium mb-1">Weekly Momentum</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-white">{Math.round(score)}</span>
                <span className="text-white/80 text-sm">points</span>
              </div>
            </div>

            {/* Right side - 7-Day Activity */}
            <div className="flex-1 relative">
              <div className="flex items-center justify-between mb-2">
                <p className="text-white/90 text-xs font-medium">7-Day Activity</p>
                <Trophy className="w-4 h-4 text-white/80" />
              </div>
              <div className="flex items-center justify-end gap-0.5 sm:gap-1">
                {weeklyActivity.map((day, index) => (
                  <div
                    key={index}
                    className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 ${
                      day.workoutCount > 0
                        ? "bg-white border-white"
                        : "bg-transparent border-white/40"
                    } transition-all flex-shrink-0`}
                    title={`${day.label}: ${day.workoutCount} workout${day.workoutCount !== 1 ? 's' : ''}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default MomentumActivityCard;
