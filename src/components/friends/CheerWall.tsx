import { useState, useEffect } from 'react';
import { cheerService, type CheerWithUser } from '@/services/cheerService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, Activity } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Loader2 } from 'lucide-react';

interface CheerWallProps {
  userId: string;
}

const CheerWall = ({ userId }: CheerWallProps) => {
  const [cheers, setCheers] = useState<CheerWithUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCheers();
  }, [userId]);

  const loadCheers = async () => {
    setLoading(true);
    const data = await cheerService.getCheersReceived(userId, 15);
    setCheers(data);
    setLoading(false);
  };

  const getActivityDescription = (cheer: CheerWithUser) => {
    const type = cheer.activity?.activity_type || 'activity';
    
    switch (type) {
      case 'workout':
        return 'completed a workout';
      case 'achievement':
        return 'earned an achievement';
      case 'weekly_goal':
        return 'hit their weekly goal';
      case 'level_up':
        return 'leveled up';
      default:
        return 'did something awesome';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-primary" />
          Cheers Received
        </CardTitle>
      </CardHeader>
      <CardContent>
        {cheers.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-50 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Activity className="w-10 h-10 text-orange-500" />
            </div>
            <p className="text-[#7F8C8D]">
              No cheers yet - share your activities to get support!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {cheers.map((cheer) => (
              <div
                key={cheer.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-all duration-200 hover:scale-[1.02]"
              >
                <Avatar className="w-10 h-10">
                  <AvatarImage src={cheer.from_user?.avatar_url || ''} />
                  <AvatarFallback>
                    {cheer.from_user?.username?.[0]?.toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-semibold">
                      {cheer.from_user?.username || 'Someone'}
                    </span>
                    {' '}cheered you for{' '}
                    <span className="text-muted-foreground">
                      {getActivityDescription(cheer)}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(cheer.created_at), { addSuffix: true })}
                  </p>
                </div>
                <Heart className="w-4 h-4 text-primary fill-primary flex-shrink-0 mt-1" />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CheerWall;
