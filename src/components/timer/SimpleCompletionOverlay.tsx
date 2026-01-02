import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

interface SimpleCompletionOverlayProps {
  isOpen: boolean;
  exerciseName: string;
  duration: number;
  onSkip: () => Promise<void>;
  onSubmit: (notes: string) => Promise<void>;
}

const SimpleCompletionOverlay = ({ isOpen, exerciseName, duration, onSkip, onSubmit }: SimpleCompletionOverlayProps) => {
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSkip = async () => {
    if (isSubmitting) return; // Prevent double-clicks
    
    setIsSubmitting(true);
    try {
      await onSkip();
      setNotes(''); // Clear notes after successful skip
    } catch (error) {
      console.error('Failed to skip workout:', error);
      setIsSubmitting(false); // Re-enable on error
    }
    // Note: Don't set isSubmitting to false on success, modal will close anyway
  };

  const handleSubmit = async () => {
    if (isSubmitting) return; // Prevent double-clicks
    
    setIsSubmitting(true);
    try {
      await onSubmit(notes);
      setNotes(''); // Clear notes after successful submission
    } catch (error) {
      console.error('Failed to submit workout:', error);
      setIsSubmitting(false); // Re-enable on error
    }
    // Note: Don't set isSubmitting to false on success, modal will close anyway
  };

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setIsSubmitting(false);
      setNotes('');
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm my-auto"
          >
            <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 backdrop-blur-sm border-primary/20 relative">


              {/* Scrollable Content */}
              <CardContent className="p-6 sm:p-8 text-center space-y-4 sm:space-y-6">
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
                <div className="py-3">
                  <div className="text-sm text-muted-foreground mb-1">Time Completed</div>
                  <div className="text-4xl font-bold text-primary">
                    {formatTime(duration)}
                  </div>
                </div>

                {/* Encouraging Message */}
                <p className="text-sm text-muted-foreground italic">
                  Every workout counts. Keep building momentum!
                </p>

                {/* Notes Field */}
                <Textarea
                  placeholder="Add notes about your workout (optional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="resize-none"
                />

                {/* Action Buttons - Sticky on small screens */}
                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={handleSkip}
                    variant="outline"
                    size="lg"
                    className="flex-1"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Saving...' : 'Skip'}
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    size="lg"
                    className="flex-1"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Saving...' : 'Submit'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SimpleCompletionOverlay;
