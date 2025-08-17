
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award, Star, Target } from 'lucide-react';

type RankingBadgeProps = {
  rank: number;
  total?: number;
  rating?: number;
  showRating?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'rank' | 'rating' | 'percentile';
};

const RankingBadge: React.FC<RankingBadgeProps> = ({
  rank,
  total,
  rating,
  showRating = false,
  size = 'md',
  variant = 'rank'
}) => {
  const getRankIcon = (position: number) => {
    if (position === 1) return Trophy;
    if (position === 2) return Medal;
    if (position === 3) return Award;
    if (position <= 10) return Star;
    return Target;
  };

  const getRankColor = (position: number) => {
    if (position === 1) return 'bg-yellow-500 text-white border-yellow-600';
    if (position === 2) return 'bg-gray-400 text-white border-gray-500';
    if (position === 3) return 'bg-amber-600 text-white border-amber-700';
    if (position <= 10) return 'bg-blue-500 text-white border-blue-600';
    if (position <= 50) return 'bg-green-500 text-white border-green-600';
    return 'bg-gray-500 text-white border-gray-600';
  };

  const getRatingColor = (ratingValue: number) => {
    if (ratingValue >= 2000) return 'bg-purple-500 text-white border-purple-600';
    if (ratingValue >= 1800) return 'bg-red-500 text-white border-red-600';
    if (ratingValue >= 1600) return 'bg-orange-500 text-white border-orange-600';
    if (ratingValue >= 1400) return 'bg-yellow-500 text-white border-yellow-600';
    if (ratingValue >= 1200) return 'bg-green-500 text-white border-green-600';
    if (ratingValue >= 1000) return 'bg-blue-500 text-white border-blue-600';
    return 'bg-gray-500 text-white border-gray-600';
  };

  const getSizeClasses = (sizeVariant: string) => {
    switch (sizeVariant) {
      case 'sm': return 'text-xs px-2 py-1';
      case 'lg': return 'text-sm px-3 py-2';
      default: return 'text-xs px-2.5 py-1.5';
    }
  };

  const RankIcon = getRankIcon(rank);

  if (variant === 'rating' && rating) {
    return (
      <Badge 
        className={`${getRatingColor(rating)} ${getSizeClasses(size)} font-semibold border-2`}
      >
        <Target className="w-3 h-3 mr-1" />
        {rating}
      </Badge>
    );
  }

  if (variant === 'percentile' && total) {
    const percentile = Math.round(((total - rank + 1) / total) * 100);
    return (
      <Badge 
        className={`${getRankColor(rank)} ${getSizeClasses(size)} font-semibold border-2`}
      >
        <RankIcon className="w-3 h-3 mr-1" />
        Top {percentile}%
      </Badge>
    );
  }

  return (
    <Badge 
      className={`${getRankColor(rank)} ${getSizeClasses(size)} font-semibold border-2`}
    >
      <RankIcon className="w-3 h-3 mr-1" />
      #{rank}
      {total && <span className="ml-1 opacity-75">/ {total}</span>}
      {showRating && rating && <span className="ml-1">({rating})</span>}
    </Badge>
  );
};

export default RankingBadge;
