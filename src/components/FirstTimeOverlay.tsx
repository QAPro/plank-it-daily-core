import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface FirstTimeOverlayProps {
  visible: boolean;
  onGoToWorkouts: () => void;
  onDismiss: () => void;
}

const FirstTimeOverlay = ({ visible, onGoToWorkouts, onDismiss }: FirstTimeOverlayProps) => {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          className="relative w-full md:w-1/4 mx-auto rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 px-6 py-4 shadow-sm"
        >
          <button
            onClick={onDismiss}
            className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
          
          <div className="pr-6">
            <p className="text-sm text-foreground mb-4">
              Start your journey with a plank now, or select the workout tab to choose your own starting point.
            </p>
            
            <div className="flex gap-3">
              <Button
                onClick={onGoToWorkouts}
                variant="default"
                size="sm"
                className="flex-1"
              >
                Go to Workouts
              </Button>
              <Button
                onClick={onDismiss}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                Got it
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FirstTimeOverlay;
