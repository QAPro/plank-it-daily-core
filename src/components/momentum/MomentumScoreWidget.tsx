import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Dumbbell, Trophy, Layers, Activity } from 'lucide-react';
import { useMomentumScore } from '@/hooks/useMomentumScore';

const MomentumScoreWidget = () => {
  const { data, isLoading } = useMomentumScore();

  if (isLoading) {
    return (
      <Card className="bg-white/60 backdrop-blur-sm border-white/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Weekly Momentum
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-16 bg-gray-200 rounded-lg mb-3"></div>
            <div className="grid grid-cols-3 gap-2">
              <div className="h-8 bg-gray-200 rounded"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const score = data?.score || 0;
  const breakdown = data?.breakdown as {
    workout_count: number;
    personal_bests: number;
    categories_explored: number;
    avg_difficulty: number;
  } | undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-gradient-to-br from-primary/10 to-purple-500/10 backdrop-blur-sm border-white/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Weekly Momentum
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-primary">{Math.round(score)}</span>
            <span className="text-sm text-muted-foreground">points</span>
          </div>

          {breakdown && (
            <div className="grid grid-cols-3 gap-2">
              <div className="flex items-center gap-1 text-xs">
                <Dumbbell className="w-3 h-3 text-blue-500" />
                <span className="text-muted-foreground">{breakdown.workout_count} workouts</span>
              </div>
              <div className="flex items-center gap-1 text-xs">
                <Trophy className="w-3 h-3 text-yellow-500" />
                <span className="text-muted-foreground">{breakdown.personal_bests} PBs</span>
              </div>
              <div className="flex items-center gap-1 text-xs">
                <Layers className="w-3 h-3 text-purple-500" />
                <span className="text-muted-foreground">{breakdown.categories_explored} types</span>
              </div>
            </div>
          )}

          {score === 0 && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Activity className="w-3 h-3" />
              Complete workouts this week to build momentum!
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default MomentumScoreWidget;
