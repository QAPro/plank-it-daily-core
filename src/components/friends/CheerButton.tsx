import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cheerService } from '@/services/cheerService';
import { toast } from 'sonner';

interface CheerButtonProps {
  activityId: string;
  toUserId: string;
  currentUserId: string;
  hasUserCheered: boolean;
  cheerCount: number;
  onCheerUpdate: () => void;
}

const CheerButton = ({
  activityId,
  toUserId,
  currentUserId,
  hasUserCheered,
  cheerCount,
  onCheerUpdate
}: CheerButtonProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCheered, setIsCheered] = useState(hasUserCheered);

  const handleCheer = async () => {
    if (isProcessing) return;

    setIsProcessing(true);
    
    try {
      if (isCheered) {
        const result = await cheerService.removeCheer(currentUserId, activityId);
        if (result.success) {
          setIsCheered(false);
          onCheerUpdate();
        } else {
          toast.error(result.error || 'Failed to remove cheer');
        }
      } else {
        const result = await cheerService.addCheer(currentUserId, toUserId, activityId);
        if (result.success) {
          setIsCheered(true);
          onCheerUpdate();
          toast.success('Cheer sent! 🎉');
        } else {
          toast.error(result.error || 'Failed to send cheer');
        }
      }
    } catch (error) {
      console.error('Error toggling cheer:', error);
      toast.error('Something went wrong');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleCheer}
      disabled={isProcessing}
      className="gap-2 hover:bg-primary/10 transition-colors"
    >
      <motion.div
        animate={isCheered ? { scale: [1, 1.3, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        <Heart
          className={`w-5 h-5 transition-colors ${
            isCheered ? 'fill-primary text-primary' : 'text-muted-foreground'
          }`}
        />
      </motion.div>
      <span className={`text-sm font-medium ${isCheered ? 'text-primary' : 'text-muted-foreground'}`}>
        {cheerCount > 0 ? cheerCount : 'Cheer'}
      </span>
    </Button>
  );
};

export default CheerButton;
