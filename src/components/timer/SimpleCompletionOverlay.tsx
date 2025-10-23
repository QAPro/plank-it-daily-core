import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface SimpleCompletionOverlayProps {
  isOpen: boolean;
  exerciseName: string;
  duration: number;
  onClose: () => void;
}

const SimpleCompletionOverlay = ({ isOpen, exerciseName, duration, onClose }: SimpleCompletionOverlayProps) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 backdrop-blur-sm border-primary/20 max-w-sm">
              <CardContent className="p-8 text-center space-y-6">
                {/* Close Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </Button>

                {/* Trophy Icon */}
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                >
                  <Trophy className="w-16 h-16 mx-auto text-primary" />
                </motion.div>

                {/* Exercise Name */}
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    Great Work!
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    {exerciseName}
                  </p>
                </div>

                {/* Duration */}
                <div className="py-4">
                  <div className="text-sm text-muted-foreground mb-1">Time Completed</div>
                  <div className="text-4xl font-bold text-primary">
                    {formatTime(duration)}
                  </div>
                </div>

                {/* Encouraging Message */}
                <p className="text-sm text-muted-foreground italic">
                  Every workout counts. Keep building your momentum!
                </p>

                {/* Done Button */}
                <Button
                  onClick={onClose}
                  size="lg"
                  className="w-full"
                >
                  Done
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SimpleCompletionOverlay;
