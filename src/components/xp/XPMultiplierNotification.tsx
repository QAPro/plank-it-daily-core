import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Gift } from 'lucide-react';
import { EnhancedXPService } from '@/services/enhancedXPService';

const XPMultiplierNotification = () => {
  const [multiplierMessage, setMultiplierMessage] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const checkMultiplier = () => {
      const message = EnhancedXPService.getMultiplierMessage();
      if (message && message !== multiplierMessage) {
        setMultiplierMessage(message);
        setIsVisible(true);

        // Auto-hide after 8 seconds
        setTimeout(() => {
          setIsVisible(false);
        }, 8000);
      }
    };

    // Check on mount and every minute
    checkMultiplier();
    const interval = setInterval(checkMultiplier, 60000);

    return () => clearInterval(interval);
  }, [multiplierMessage]);

  const handleClose = () => {
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && multiplierMessage && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.8 }}
          transition={{ type: "spring", duration: 0.8 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-sm mx-4"
        >
          <motion.div
            initial={{ rotate: -5 }}
            animate={{ rotate: [0, 2, -2, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-4 rounded-xl shadow-2xl border-2 border-yellow-300 relative overflow-hidden"
            onClick={handleClose}
          >
            {/* Sparkle background effect */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-2 left-2 w-1 h-1 bg-white rounded-full animate-ping"></div>
              <div className="absolute top-4 right-4 w-1 h-1 bg-white rounded-full animate-ping" style={{animationDelay: '0.5s'}}></div>
              <div className="absolute bottom-3 left-1/2 w-1 h-1 bg-white rounded-full animate-ping" style={{animationDelay: '1s'}}></div>
            </div>

            <div className="relative flex items-center space-x-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                {multiplierMessage.includes('DOUBLE') ? (
                  <Zap className="w-6 h-6" />
                ) : (
                  <Gift className="w-6 h-6" />
                )}
              </motion.div>
              
              <div className="flex-1">
                <div className="font-bold text-sm leading-tight">
                  {multiplierMessage}
                </div>
                <div className="text-xs opacity-90 mt-1">
                  Tap to dismiss
                </div>
              </div>

              {/* Pulsing border effect */}
              <motion.div
                className="absolute inset-0 border-2 border-white/50 rounded-xl"
                animate={{ 
                  scale: [1, 1.05, 1],
                  opacity: [0.5, 0.8, 0.5]
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default XPMultiplierNotification;