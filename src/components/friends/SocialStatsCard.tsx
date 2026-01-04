import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Users, Share2, Loader2 } from 'lucide-react';
import { cheerService, type UserSocialStats } from '@/services/cheerService';
import { toast } from 'sonner';

interface SocialStatsCardProps {
  userId: string;
}

const SocialStatsCard = ({ userId }: SocialStatsCardProps) => {
  const [stats, setStats] = useState<UserSocialStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    loadStats();
  }, [userId]);

  const loadStats = async () => {
    setLoading(true);
    const data = await cheerService.getUserSocialStats(userId);
    setStats(data);
    setLoading(false);
  };

  const handleInvite = async () => {
    setSharing(true);
    
    try {
      const referralLink = await cheerService.createReferralLink(userId);
      
      // Try Web Share API first
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'Join me on my fitness journey!',
            text: "I'm crushing my fitness goals. Join me!",
            url: referralLink
          });
          toast.success('Invite sent!');
        } catch (error: any) {
          // User cancelled or share failed
          if (error.name !== 'AbortError') {
            throw error;
          }
        }
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(referralLink);
        toast.success('Invite link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing invite:', error);
      toast.error('Failed to create invite link');
    } finally {
      setSharing(false);
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
        <CardTitle>Your Social Impact</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg hover:shadow-md transition-shadow">
            <div className="flex items-center justify-center gap-1 mb-2">
              <span className="text-xl">💖</span>
              <Heart className="w-5 h-5 text-primary" />
            </div>
            <div className="text-2xl font-bold text-foreground">
              {stats?.cheers_given || 0}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Cheers Given
            </div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg hover:shadow-md transition-shadow">
            <div className="flex items-center justify-center gap-1 mb-2">
              <span className="text-xl">🎉</span>
              <Heart className="w-5 h-5 text-primary fill-primary" />
            </div>
            <div className="text-2xl font-bold text-foreground">
              {stats?.cheers_received || 0}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Cheers Received
            </div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg hover:shadow-md transition-shadow">
            <div className="flex items-center justify-center gap-1 mb-2">
              <span className="text-xl">👥</span>
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div className="text-2xl font-bold text-foreground">
              {stats?.friends_count || 0}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Friends
            </div>
          </div>
        </div>


      </CardContent>
    </Card>
  );
};

export default SocialStatsCard;
