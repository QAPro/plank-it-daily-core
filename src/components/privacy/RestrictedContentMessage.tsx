import { Lock, UserPlus, Users, Shield } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

type RestrictionType = 'private' | 'friends_only' | 'no_requests' | 'friends_of_friends';

interface RestrictedContentMessageProps {
  type: RestrictionType;
  customMessage?: string;
}

const messages = {
  private: {
    icon: Lock,
    title: 'This content is private',
    description: 'This user has chosen to keep their profile private'
  },
  friends_only: {
    icon: Users,
    title: 'Friends only',
    description: 'You need to be friends to see this content'
  },
  no_requests: {
    icon: Shield,
    title: 'Not accepting friend requests',
    description: 'This user is not accepting friend requests at this time'
  },
  friends_of_friends: {
    icon: UserPlus,
    title: 'Friend requests limited',
    description: 'This user only accepts requests from friends of friends'
  }
};

const RestrictedContentMessage = ({ 
  type, 
  customMessage 
}: RestrictedContentMessageProps) => {
  const config = messages[type];
  const Icon = config.icon;

  return (
    <Card className="border-dashed bg-muted/50">
      <CardContent className="py-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mx-auto mb-3">
            <Icon className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-base font-semibold mb-1 text-foreground">
            {config.title}
          </h3>
          <p className="text-sm text-muted-foreground">
            {customMessage || config.description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default RestrictedContentMessage;
