// No React imports needed
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Star, Trophy, Crown, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import type { FeaturedUser } from '@/services/statusTrackService';

interface FeaturedUsersCardProps {
  type: 'weekly' | 'monthly' | 'hall_of_fame';
  featuredUsers: FeaturedUser[];
  title: string;
  description: string;
  icon: React.ReactNode;
}

const FeaturedUsersCard: React.FC<FeaturedUsersCardProps> = ({
  type,
  featuredUsers,
  title,
  description,
  icon
}) => {
  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'weekly':
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 'monthly':
        return 'bg-gradient-to-r from-blue-400 to-blue-600 text-white';
      case 'hall_of_fame':
        return 'bg-gradient-to-r from-purple-400 to-purple-600 text-white';
      default:
        return 'bg-gradient-to-r from-gray-400 to-gray-600 text-white';
    }
  };

  const getBadgeText = (type: string) => {
    switch (type) {
      case 'weekly':
        return 'Featured';
      case 'monthly':
        return 'Rising Star';
      case 'hall_of_fame':
        return 'Legend';
      default:
        return 'Featured';
    }
  };

  if (!featuredUsers || featuredUsers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {icon}
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <div className="text-4xl mb-2">🌟</div>
            <p>Featured users coming soon!</p>
            <p className="text-sm">Keep working hard to be featured here.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {featuredUsers.map((featured, index) => (
            <motion.div
              key={featured.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-4 p-4 rounded-lg bg-muted/30 border border-border/50"
            >
              <Avatar className="w-12 h-12">
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold">
                  {featured.user_id.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge className={getBadgeColor(featured.feature_type)}>
                    {getBadgeText(featured.feature_type)}
                  </Badge>
                  {type === 'hall_of_fame' && (
                    <Crown className="w-4 h-4 text-yellow-500" />
                  )}
                </div>
                
                <div className="font-medium text-foreground mb-1">
                  {featured.featured_for}
                </div>
                
                <div className="text-sm text-muted-foreground">
                  {featured.featured_data?.track_name && (
                    <span className="mr-3">
                      Track: {featured.featured_data.track_name}
                    </span>
                  )}
                  {featured.featured_data?.level && (
                    <span className="mr-3">
                      Level: {featured.featured_data.level}
                    </span>
                  )}
                  {featured.featured_data?.experience_points && (
                    <span className="mr-3">
                      XP: {featured.featured_data.experience_points}
                    </span>
                  )}
                </div>
                
                <div className="text-xs text-muted-foreground mt-1">
                  {type !== 'hall_of_fame' && (
                    <>Since {new Date(featured.start_date).toLocaleDateString()}</>
                  )}
                  {type === 'hall_of_fame' && (
                    <>Achieved {new Date(featured.start_date).toLocaleDateString()}</>
                  )}
                </div>
              </div>
              
              {type === 'weekly' && <TrendingUp className="w-5 h-5 text-green-500" />}
              {type === 'monthly' && <Star className="w-5 h-5 text-blue-500" />}
              {type === 'hall_of_fame' && <Trophy className="w-5 h-5 text-yellow-500" />}
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default FeaturedUsersCard;