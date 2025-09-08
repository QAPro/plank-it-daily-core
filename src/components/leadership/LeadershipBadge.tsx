import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Crown, Shield, Star } from 'lucide-react';
import { useLeadershipRoles, LeadershipRole } from '@/hooks/useLeadershipRoles';

interface LeadershipBadgeProps {
  userId?: string;
  showPerks?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const LeadershipBadge: React.FC<LeadershipBadgeProps> = ({ 
  showPerks = false, 
  size = 'md' 
}) => {
  const { role, getBadgeColor, getSpecialPrivileges } = useLeadershipRoles();

  if (!role) return null;

  const getRoleIcon = (role: LeadershipRole) => {
    const iconSize = size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';
    
    switch (role) {
      case 'expert':
        return <Crown className={iconSize} />;
      case 'community_leader':
        return <Star className={iconSize} />;
      case 'moderator':
        return <Shield className={iconSize} />;
      default:
        return null;
    }
  };

  const getRoleLabel = (role: LeadershipRole) => {
    switch (role) {
      case 'expert':
        return 'Expert';
      case 'community_leader':
        return 'Community Leader';
      case 'moderator':
        return 'Moderator';
      default:
        return '';
    }
  };

  const getBadgeVariant = () => {
    const color = getBadgeColor();
    switch (color) {
      case 'platinum':
        return 'default'; // Will be styled with custom classes
      case 'gold':
        return 'secondary';
      case 'silver':
        return 'outline';
      default:
        return 'default';
    }
  };

  const getBadgeClassName = () => {
    const baseClasses = 'flex items-center gap-1 font-semibold';
    const color = getBadgeColor();
    
    switch (color) {
      case 'platinum':
        return `${baseClasses} bg-gradient-to-r from-gray-300 to-gray-500 text-white border-gray-400`;
      case 'gold':
        return `${baseClasses} bg-gradient-to-r from-yellow-300 to-yellow-500 text-yellow-900 border-yellow-400`;
      case 'silver':
        return `${baseClasses} bg-gradient-to-r from-gray-200 to-gray-300 text-gray-800 border-gray-300`;
      default:
        return baseClasses;
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Badge 
        variant={getBadgeVariant()} 
        className={getBadgeClassName()}
      >
        {getRoleIcon(role)}
        <span className={size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-sm' : 'text-xs'}>
          {getRoleLabel(role)}
        </span>
      </Badge>
      
      {showPerks && (
        <div className="text-xs text-muted-foreground">
          <div className="font-medium mb-1">Special Privileges:</div>
          <ul className="list-disc list-inside space-y-0.5">
            {getSpecialPrivileges().map((privilege, index) => (
              <li key={index}>{privilege}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default LeadershipBadge;