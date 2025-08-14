
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";

interface XPGainNotificationProps {
  amount: number;
  description: string;
  isVisible: boolean;
  onHide: () => void;
}

const XPGainNotification = ({ 
  amount, 
  description, 
  isVisible, 
  onHide 
}: XPGainNotificationProps) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onHide();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onHide]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.8 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="fixed top-20 right-4 z-50 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-full shadow-lg border-2 border-green-400"
        >
          <div className="flex items-center space-x-2">
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <Plus className="w-5 h-5" />
            </motion.div>
            <div>
              <span className="font-bold text-lg">+{amount} XP</span>
              <p className="text-sm opacity-90">{description}</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default XPGainNotification;
