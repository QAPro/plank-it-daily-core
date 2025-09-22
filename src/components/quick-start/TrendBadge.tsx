import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTrendAnalysis } from "@/hooks/useTrendAnalysis";
import React, { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TrendBadgeProps {
  exerciseId: string | null;
}

const TrendBadge = ({ exerciseId }: TrendBadgeProps) => {
  const { data: trendData, isLoading } = useTrendAnalysis(exerciseId);
  const [modalOpen, setModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-6 w-16 bg-muted rounded-full"></div>
      </div>
    );
  }

  if (!trendData) return null;

  const { trendPercentage, trendDirection } = trendData;

  const getTrendIcon = () => {
    switch (trendDirection) {
      case 'up':
        return <TrendingUp className="w-3 h-3 mr-1 text-green-600" />;
      case 'down':
        return <TrendingDown className="w-3 h-3 mr-1 text-red-600" />;
      default:
        return <Minus className="w-3 h-3 mr-1 text-muted-foreground" />;
    }
  };

  const getTrendColor = () => {
    switch (trendDirection) {
      case 'up':
        return 'border-green-500/20 hover:border-green-500/40';
      case 'down':
        return 'border-red-500/20 hover:border-red-500/40';
      default:
        return 'border-muted/20 hover:border-muted/40';
    }
  };

  const getTrendText = () => {
    if (trendDirection === 'stable') return 'Stable';
    const sign = trendDirection === 'up' ? '+' : '-';
    return `${sign}${trendPercentage}%`;
  };

  return (
    <Dialog open={modalOpen} onOpenChange={setModalOpen}>
      <DialogTrigger asChild>
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="cursor-pointer"
        >
          <Badge 
            variant="outline" 
            className={`bg-background/80 backdrop-blur-sm ${getTrendColor()} transition-all duration-200 text-xs py-2 px-3`}
          >
            <div className="flex flex-col items-center gap-0.5 min-w-0">
              <div className="flex items-center gap-1">
                {getTrendIcon()}
                <span className="whitespace-nowrap text-xs">Trend</span>
              </div>
              <div className="font-semibold">{getTrendText()}</div>
            </div>
          </Badge>
        </motion.div>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getTrendIcon()}
              Progress Trend
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-2xl font-bold">{getTrendText()}</div>
              <div className="text-muted-foreground">
                {trendDirection === 'up' && 'You\'re improving! Keep it up!'}
                {trendDirection === 'down' && 'Focus on form and consistency'}
                {trendDirection === 'stable' && 'Consistent performance'}
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              Based on your last 10 sessions compared to previous sessions
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default TrendBadge;