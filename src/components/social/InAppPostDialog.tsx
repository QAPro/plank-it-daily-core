import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Share2, Users, MessageCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { socialActivityManager } from '@/services/socialActivityService';
import { SocialSharingService } from '@/services/socialSharingService';

interface InAppPostDialogProps {
  isOpen: boolean;
  onClose: () => void;
  shareData: {
    exercise: string;
    duration: number;
    achievement?: string;
    personalBest?: boolean;
    streakDays?: number;
    isFullCompletion?: boolean;
  };
}

const InAppPostDialog: React.FC<InAppPostDialogProps> = ({
  isOpen,
  onClose,
  shareData
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [message, setMessage] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [showExternalOptions, setShowExternalOptions] = useState(false);

  useEffect(() => {
    if (isOpen && shareData) {
      // Auto-generate the default message
      const autoMessage = SocialSharingService.generateShareText(shareData);
      setMessage(autoMessage);
    }
  }, [isOpen, shareData]);

  const handleInAppPost = async () => {
    if (!user || !message.trim()) return;

    setIsPosting(true);
    try {
      // Create a workout activity with the custom message
      await socialActivityManager.createWorkoutActivity(user.id, {
        ...shareData,
        customMessage: message.trim(),
        postType: 'user_generated'
      });

      onClose();
    } catch (error) {
      console.error('Failed to post to activity feed:', error);
      toast({
        title: "Failed to post",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsPosting(false);
    }
  };

  const handleExternalShare = async (platform: 'twitter' | 'facebook' | 'copy') => {
    try {
      switch (platform) {
        case 'twitter':
          await SocialSharingService.shareToTwitter(shareData);
          break;
        case 'facebook':
          await SocialSharingService.shareToFacebook(shareData);
          break;
        case 'copy':
          await SocialSharingService.copyToClipboard(shareData);
          toast({
            title: "Copied to clipboard! 📋",
            description: "Share text has been copied to your clipboard."
          });
          break;
      }
    } catch (error) {
      console.error('Failed to share externally:', error);
      toast({
        title: "Sharing failed",
        description: "Could not share to the selected platform.",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Share your achievement!
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Message Editor */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Tell your friends about your workout:
            </label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Share your workout achievement..."
              className="min-h-[100px]"
              maxLength={280}
            />
            <div className="text-xs text-muted-foreground mt-1">
              {message.length}/280 characters
            </div>
          </div>

          {/* In-App Posting */}
          <div className="space-y-2">
            <Button
              onClick={handleInAppPost}
              disabled={!message.trim() || isPosting}
              className="w-full"
              size="lg"
            >
              <Users className="w-4 h-4 mr-2" />
              {isPosting ? 'Posting...' : 'Post to Activity Feed'}
            </Button>
            
            <p className="text-xs text-muted-foreground text-center">
              Share with your friends in the app
            </p>
          </div>

          {/* External Sharing Toggle */}
          <div className="border-t pt-4">
            <Button
              variant="outline"
              onClick={() => setShowExternalOptions(!showExternalOptions)}
              className="w-full"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              {showExternalOptions ? 'Hide' : 'Show'} External Sharing Options
            </Button>

            {showExternalOptions && (
              <div className="mt-3 space-y-2">
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExternalShare('twitter')}
                    className="text-xs"
                  >
                    Twitter
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExternalShare('facebook')}
                    className="text-xs"
                  >
                    Facebook
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExternalShare('copy')}
                    className="text-xs"
                  >
                    Copy
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Share on social media platforms
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InAppPostDialog;