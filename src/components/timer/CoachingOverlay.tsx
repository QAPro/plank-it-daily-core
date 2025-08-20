
import { motion, AnimatePresence } from 'framer-motion';
import AIFeatureGuard from '@/components/access/AIFeatureGuard';

interface CoachingOverlayProps {
  message: string | null;
  visible: boolean;
}

const CoachingOverlay = ({ message, visible }: CoachingOverlayProps) => {
  return (
    <AIFeatureGuard>
      <AnimatePresence>
        {visible && message && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="w-full rounded-lg bg-muted text-muted-foreground px-4 py-3 text-center shadow-sm"
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>
    </AIFeatureGuard>
  );
};

export default CoachingOverlay;
