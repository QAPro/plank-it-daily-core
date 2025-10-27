import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Calendar, Gift, Clock, Star } from 'lucide-react';
import { SeasonalAchievementEngine, type SeasonalAchievement } from '@/services/seasonalAchievementService';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface SeasonalAchievementsBannerProps {
  onAchievementClick?: (achievement: SeasonalAchievement) => void;
}

const SeasonalAchievementsBanner = ({ onAchievementClick }: SeasonalAchievementsBannerProps) => {
  const { user } = useAuth();
  const [currentAchievements, setCurrentAchievements] = useState<SeasonalAchievement[]>([]);
  const [userProgress, setUserProgress] = useState<Map<string, number>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSeasonalAchievements = async () => {
      if (!user?.id) return;

      try {
        const achievements = SeasonalAchievementEngine.getCurrentSeasonalAchievements();
        setCurrentAchievements(achievements);

        // Calculate progress for each achievement
        const engine = new SeasonalAchievementEngine(user.id);
        const progressMap = new Map<string, number>();

        for (const achievement of achievements) {
          // Check if user has already earned this achievement
          const { data: earned } = await supabase
            .from('user_achievements')
            .select('id')
            .eq('user_id', user.id)
            .eq('achievement_type', achievement.id)
            .maybeSingle();
          
          // Show 100% if earned, 0% otherwise
          // Real progress tracking can be added based on specific achievement criteria
          progressMap.set(achievement.id, earned ? 100 : 0);
        }

        setUserProgress(progressMap);
      } catch (error) {
        console.error('Error loading seasonal achievements:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSeasonalAchievements();
  }, [user?.id]);

  const getThemeColors = (theme: string) => {
    switch (theme.toLowerCase()) {
      case 'new year resolution':
        return {
          gradient: 'from-purple-600 via-pink-600 to-blue-600',
          accent: 'text-purple-200',
          bg: 'bg-purple-900/20'
        };
      case 'love your body':
        return {
          gradient: 'from-pink-500 via-red-500 to-rose-600',
          accent: 'text-pink-200',
          bg: 'bg-pink-900/20'
        };
      case 'spring into action':
        return {
          gradient: 'from-green-500 via-emerald-500 to-teal-600',
          accent: 'text-green-200',
          bg: 'bg-green-900/20'
        };
      case 'summer body':
        return {
          gradient: 'from-yellow-400 via-orange-500 to-red-500',
          accent: 'text-yellow-200',
          bg: 'bg-orange-900/20'
        };
      case 'halloween horror':
        return {
          gradient: 'from-orange-600 via-red-600 to-purple-600',
          accent: 'text-orange-200',
          bg: 'bg-orange-900/20'
        };
      case 'holiday season':
        return {
          gradient: 'from-red-500 via-green-500 to-red-600',
          accent: 'text-red-200',
          bg: 'bg-red-900/20'
        };
      default:
        return {
          gradient: 'from-blue-500 via-indigo-500 to-purple-600',
          accent: 'text-blue-200',
          bg: 'bg-blue-900/20'
        };
    }
  };

  const getDaysRemaining = (endDate: Date) => {
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="h-48 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  if (currentAchievements.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
          <Calendar className="w-6 h-6" />
          Seasonal Events
        </h2>
        <p className="text-muted-foreground">
          Limited-time achievements available right now!
        </p>
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {currentAchievements.map((achievement) => {
            const colors = getThemeColors(achievement.eventTheme);
            const progress = userProgress.get(achievement.id) || 0;
            const daysLeft = getDaysRemaining(achievement.availableUntil);

            return (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                whileHover={{ scale: 1.01 }}
              >
                <Card 
                  className={`
                    p-6 bg-gradient-to-r ${colors.gradient} text-white 
                    cursor-pointer border-0 shadow-lg hover:shadow-xl 
                    transition-all duration-300
                  `}
                  onClick={() => onAchievementClick?.(achievement)}
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="text-3xl">{achievement.icon}</div>
                        <div>
                          <h3 className="font-bold text-lg mb-1">{achievement.name}</h3>
                          <p className="text-sm opacity-90">{achievement.description}</p>
                        </div>
                      </div>
                      
                      <div className="text-right space-y-1">
                        <Badge variant="secondary" className={`${colors.bg} text-white border-white/20`}>
                          {achievement.eventTheme}
                        </Badge>
                        <div className="flex items-center space-x-1 text-sm opacity-80">
                          <Clock className="w-3 h-3" />
                          <span>{daysLeft} days left</span>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="opacity-90">Progress</span>
                        <span className="font-medium">{progress}%</span>
                      </div>
                      <Progress 
                        value={progress} 
                        className="h-2 bg-white/20"
                      />
                    </div>

                    {/* Rewards */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-1">
                          <Gift className="w-4 h-4" />
                          <span>+{achievement.points} XP</span>
                        </div>
                        {achievement.exclusiveReward && (
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4" />
                            <span>Exclusive Badge</span>
                          </div>
                        )}
                      </div>

                      <Button
                        variant="secondary"
                        size="sm"
                        className={`${colors.bg} text-white border-white/20 hover:bg-white/20`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onAchievementClick?.(achievement);
                        }}
                      >
                        View Details
                      </Button>
                    </div>

                    {/* Exclusive Reward Preview */}
                    {achievement.exclusiveReward && progress < 100 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className={`
                          mt-4 p-3 rounded-lg ${colors.bg} border border-white/20
                        `}
                      >
                        <div className="text-sm">
                          <div className="font-medium mb-1">🎁 Exclusive Reward:</div>
                          <div className="opacity-90">
                            <strong>{achievement.exclusiveReward.title}</strong> badge
                          </div>
                          <div className="text-xs opacity-75 italic mt-1">
                            "{achievement.exclusiveReward.unlockMessage}"
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center"
      >
        <Card className="p-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0">
          <div className="space-y-4">
            <div className="text-2xl">⏰</div>
            <div>
              <h3 className="font-bold text-lg mb-2">Don't Miss Out!</h3>
              <p className="text-sm opacity-90">
                These exclusive achievements are only available for a limited time.
                Start your workout journey today to unlock them!
              </p>
            </div>
            <Button
              variant="secondary"
              className="bg-white/20 text-white border-white/20 hover:bg-white/30"
            >
              Start Workout
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default SeasonalAchievementsBanner;