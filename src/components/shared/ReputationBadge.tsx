import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Star, Trophy, Award, Medal } from 'lucide-react';
import { ReputationService } from '@/services/reputationService';

interface ReputationBadgeProps {
  karmaScore: number;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

const ReputationBadge = ({ 
  karmaScore, 
  size = 'md', 
  showIcon = true, 
  className = '' 
}: ReputationBadgeProps) => {
  const level = ReputationService.getReputationLevel(karmaScore);
  const badgeColor = ReputationService.getReputationBadgeColor(level);
  
  const getIcon = () => {
    switch (level) {
      case 'Expert': return <Trophy className="w-3 h-3" />;
      case 'Advanced': return <Award className="w-3 h-3" />;
      case 'Intermediate': return <Medal className="w-3 h-3" />;
      case 'Novice': return <Star className="w-3 h-3" />;
      default: return <Star className="w-3 h-3" />;
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'text-xs px-2 py-1';
      case 'lg': return 'text-sm px-3 py-1.5';
      default: return 'text-xs px-2.5 py-1';
    }
  };

  return (
    <Badge 
      className={`
        ${badgeColor} 
        text-white 
        border-0 
        font-medium 
        ${getSizeClasses()} 
        flex items-center gap-1 
        ${className}
      `}
    >
      {showIcon && getIcon()}
      <span>{level}</span>
      {karmaScore > 0 && (
        <span className="ml-1 text-white/90">
          ({karmaScore})
        </span>
      )}
    </Badge>
  );
};

export default ReputationBadge;