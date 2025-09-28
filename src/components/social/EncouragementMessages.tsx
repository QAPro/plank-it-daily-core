import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Zap, Trophy, Target, ThumbsUp, Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface EncouragementOption {
  id: string;
  message: string;
  emoji: string;
  icon: React.ReactNode;
  category: 'motivation' | 'celebration' | 'support' | 'inspiration';
}

interface EncouragementMessagesProps {
  recipientId: string;
  recipientName: string;
  activityType?: 'workout' | 'achievement' | 'streak' | 'general';
  onSent?: () => void;
}

const EncouragementMessages: React.FC<EncouragementMessagesProps> = ({
  recipientId,
  recipientName,
  activityType = 'general',
  onSent
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sending, setSending] = useState<string | null>(null);

  const encouragementOptions: EncouragementOption[] = [
    // Motivation messages
    {
      id: 'keep-going',
      message: "Keep going! You've got this! 💪",
      emoji: '💪',
      icon: <Zap className="w-4 h-4" />,
      category: 'motivation'
    },
    {
      id: 'amazing-work',
      message: "Amazing work! You're crushing it! 🔥",
      emoji: '🔥',
      icon: <Trophy className="w-4 h-4" />,
      category: 'celebration'
    },
    {
      id: 'proud-of-you',
      message: "So proud of your dedication! ⭐",
      emoji: '⭐',
      icon: <Star className="w-4 h-4" />,
      category: 'support'
    },
    {
      id: 'inspiring',
      message: "Your consistency is inspiring! 🌟",
      emoji: '🌟',
      icon: <Target className="w-4 h-4" />,
      category: 'inspiration'
    },
    {
      id: 'unstoppable',
      message: "You're unstoppable! Keep it up! 🚀",
      emoji: '🚀',
      icon: <ThumbsUp className="w-4 h-4" />,
      category: 'motivation'
    },
    {
      id: 'way-to-go',
      message: "Way to go! Every session counts! 👏",
      emoji: '👏',
      icon: <Heart className="w-4 h-4" />,
      category: 'celebration'
    }
  ];

  // Filter messages based on activity type
  const getRelevantMessages = () => {
    switch (activityType) {
      case 'workout':
        return encouragementOptions.filter(opt => 
          ['motivation', 'celebration'].includes(opt.category)
        );
      case 'achievement':
        return encouragementOptions.filter(opt => 
          ['celebration', 'support'].includes(opt.category)
        );
      case 'streak':
        return encouragementOptions.filter(opt => 
          ['inspiration', 'celebration'].includes(opt.category)
        );
      default:
        return encouragementOptions;
    }
  };

  const handleSendEncouragement = async (option: EncouragementOption) => {
    if (!user || sending) return;

    setSending(option.id);
    
    try {
      // Simulate API call - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Encouragement sent!",
        description: `Your message was sent to ${recipientName}`,
      });
      
      onSent?.();
    } catch (error) {
      toast({
        title: "Failed to send",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setSending(null);
    }
  };

  const relevantMessages = getRelevantMessages();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Heart className="w-5 h-5 text-pink-500" />
          Send Encouragement
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Show support to {recipientName} with a quick message
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2">
          {relevantMessages.map((option) => (
            <Button
              key={option.id}
              variant="outline"
              className="justify-start h-auto p-3 text-left"
              onClick={() => handleSendEncouragement(option)}
              disabled={sending !== null}
            >
              <div className="flex items-center gap-3 w-full">
                <div className="flex items-center gap-2">
                  {option.icon}
                  <span className="text-lg">{option.emoji}</span>
                </div>
                <div className="flex-1">
                  <span className="text-sm">{option.message}</span>
                </div>
                <Badge variant="secondary" className="text-xs capitalize">
                  {option.category}
                </Badge>
              </div>
              {sending === option.id && (
                <div className="ml-2">
                  <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                </div>
              )}
            </Button>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-muted/30 rounded-lg">
          <p className="text-xs text-muted-foreground text-center">
            Quick, positive messages help build a supportive community! 
            Your encouragement makes a difference. 💙
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default EncouragementMessages;