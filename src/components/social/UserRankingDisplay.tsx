import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Award, Calendar, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { SocialRewardsService, type UserRanking } from '@/services/socialRewardsService';
import { motion } from 'framer-motion';

const UserRankingDisplay = () => {
  const { user } = useAuth();
  const [rankings, setRankings] = useState<UserRanking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRankings = async () => {
      if (!user) return;

      try {
        const categories: Array<'streak' | 'consistency' | 'improvement' | 'total_time'> = [
          'streak',
          'consistency', 
          'total_time'
        ];

        const rankingPromises = categories.map(category =>
          SocialRewardsService.getUserPercentileRank(user.id, category)
        );

        const results = await Promise.all(rankingPromises);
        setRankings(results.filter(Boolean) as UserRanking[]);
      } catch (error) {
        console.error('Failed to fetch user rankings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRankings();
  }, [user]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'streak':
        return <Calendar className="h-4 w-4" />;
      case 'consistency':
        return <TrendingUp className="h-4 w-4" />;
      case 'total_time':
        return <Clock className="h-4 w-4" />;
      default:
        return <Award className="h-4 w-4" />;
    }
  };

  const getBadgeColor = (badgeLevel: string) => {
    switch (badgeLevel) {
      case 'platinum':
        return 'bg-gradient-to-r from-slate-400 to-slate-600 text-white';
      case 'gold':
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 'silver':
        return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
      default:
        return 'bg-gradient-to-r from-amber-600 to-amber-800 text-white';
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-8 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (rankings.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="p-4 text-center">
          <p className="text-sm text-muted-foreground">
            Complete more workouts to see your community rankings!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardContent className="p-4 space-y-3">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          Your Community Rankings
        </h3>

        <div className="space-y-3">
          {rankings.map((ranking, index) => (
            <motion.div
              key={ranking.category}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="text-primary">
                  {getCategoryIcon(ranking.category)}
                </div>
                <div>
                  <div className="text-sm font-medium capitalize">
                    {ranking.category.replace('_', ' ')}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {ranking.message}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge 
                  className={`text-xs ${getBadgeColor(ranking.badgeLevel)}`}
                >
                  {ranking.badgeLevel.toUpperCase()}
                </Badge>
                <div className="text-right">
                  <div className="text-sm font-bold text-primary">
                    {ranking.percentile}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    percentile
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {rankings.some(r => r.percentile >= 90) && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center p-3 bg-primary/10 rounded-lg"
          >
            <p className="text-sm font-medium text-primary">
              🏆 Elite Performer! You're crushing it!
            </p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserRankingDisplay;