import { Globe, Users, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface PrivacyBadgeProps {
  visibility: 'public' | 'friends_only' | 'private';
  size?: 'sm' | 'md';
}

const PrivacyBadge = ({ visibility, size = 'sm' }: PrivacyBadgeProps) => {
  const config = {
    public: {
      icon: Globe,
      label: 'Public',
      description: 'Visible to everyone',
      className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    },
    friends_only: {
      icon: Users,
      label: 'Friends Only',
      description: 'Only visible to your friends',
      className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    },
    private: {
      icon: Lock,
      label: 'Private',
      description: 'Only visible to you',
      className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
    }
  }[visibility];

  const Icon = config.icon;
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="secondary" className={`${config.className} cursor-help`}>
            <Icon className={`${iconSize} mr-1`} />
            {config.label}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{config.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default PrivacyBadge;
