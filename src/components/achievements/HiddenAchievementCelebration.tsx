import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Share2, Sparkles } from 'lucide-react';

interface HiddenAchievementCelebrationProps {
  achievement: {
    name: string;
    description: string;
    icon: string;
    rarity: string;
    points: number;
    metadata?: {
      unlockMessage?: string;
      shareMessage?: string;
      hidden?: boolean;
    };
  };
  onClose: () => void;
  onShare?: () => void;
  isVisible: boolean;
}

const HiddenAchievementCelebration = ({ 
  achievement, 
  onClose, 
  onShare, 
  isVisible 
}: HiddenAchievementCelebrationProps) => {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShowConfetti(true);
      // Auto-close after delay based on rarity
      const delay = achievement.rarity === 'legendary' ? 8000 : 
                   achievement.rarity === 'epic' ? 6000 : 4000;
      
      const timer = setTimeout(() => {
        onClose();
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [isVisible, achievement.rarity, onClose]);

  const getConfettiCount = () => {
    switch (achievement.rarity) {
      case 'legendary': return 100;
      case 'epic': return 75;
      case 'rare': return 50;
      default: return 30;
    }
  };

  const getRarityColors = () => {
    switch (achievement.rarity) {
      case 'legendary':
        return {
          gradient: 'from-yellow-400 via-orange-500 to-red-500',
          glow: 'shadow-[0_0_50px_rgba(251,191,36,0.5)]',
          text: 'text-yellow-300'
        };
      case 'epic':
        return {
          gradient: 'from-purple-400 via-pink-500 to-red-500',
          glow: 'shadow-[0_0_40px_rgba(168,85,247,0.5)]',
          text: 'text-purple-300'
        };
      case 'rare':
        return {
          gradient: 'from-blue-400 via-purple-500 to-pink-500',
          glow: 'shadow-[0_0_30px_rgba(59,130,246,0.5)]',
          text: 'text-blue-300'
        };
      default:
        return {
          gradient: 'from-green-400 to-blue-500',
          glow: 'shadow-[0_0_20px_rgba(34,197,94,0.5)]',
          text: 'text-green-300'
        };
    }
  };

  const colors = getRarityColors();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          {/* Confetti Effect */}
          {showConfetti && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(getConfettiCount())].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-gradient-to-r from-yellow-400 to-pink-500 rounded-full"
                  initial={{
                    x: '50vw',
                    y: '50vh',
                    scale: 0,
                    rotate: 0,
                  }}
                  animate={{
                    x: Math.random() * window.innerWidth,
                    y: Math.random() * window.innerHeight,
                    scale: [0, 1, 0],
                    rotate: 360,
                  }}
                  transition={{
                    duration: 3,
                    delay: Math.random() * 0.5,
                    ease: "easeOut",
                  }}
                />
              ))}
            </div>
          )}

          {/* Main Achievement Card */}
          <motion.div
            initial={{ scale: 0, rotate: -180, y: -100 }}
            animate={{ scale: 1, rotate: 0, y: 0 }}
            exit={{ scale: 0, rotate: 180, y: 100 }}
            transition={{ 
              type: "spring", 
              stiffness: 200, 
              damping: 15,
              duration: 0.8 
            }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-md mx-4"
          >
            <Card className={`
              relative p-8 text-center bg-gradient-to-br ${colors.gradient} 
              border-0 ${colors.glow} overflow-hidden
            `}>
              {/* Background Pattern */}
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5" />
              </div>

              {/* Close Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="absolute top-2 right-2 text-white/70 hover:text-white hover:bg-white/20"
              >
                <X className="w-4 h-4" />
              </Button>

              {/* Hidden Achievement Indicator */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 }}
                className="flex justify-center mb-4"
              >
                <div className="flex items-center space-x-2 bg-black/30 rounded-full px-4 py-2">
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  <span className="text-sm font-medium text-white">Hidden Achievement</span>
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                </div>
              </motion.div>

              {/* Achievement Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                className="text-6xl mb-4"
              >
                {achievement.icon}
              </motion.div>

              {/* Achievement Info */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <h2 className="text-2xl font-bold text-white mb-2">
                  {achievement.name}
                </h2>
                <p className="text-white/90 text-sm mb-4">
                  {achievement.description}
                </p>

                {/* Special Unlock Message */}
                {achievement.metadata?.unlockMessage && (
                  <motion.div
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="bg-black/30 rounded-lg p-4 mb-4"
                  >
                    <p className="text-white italic text-sm">
                      "{achievement.metadata.unlockMessage}"
                    </p>
                  </motion.div>
                )}

                {/* Points Display */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.2, type: "spring" }}
                  className="flex justify-center items-center space-x-2 mb-6"
                >
                  <span className="text-3xl font-bold text-yellow-300">
                    +{achievement.points}
                  </span>
                  <span className="text-white/80 text-sm">XP</span>
                </motion.div>

                {/* Rarity Badge */}
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1.4 }}
                  className="mb-6"
                >
                  <span className={`
                    px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider
                    bg-black/30 border border-white/30 ${colors.text}
                  `}>
                    {achievement.rarity} Discovery
                  </span>
                </motion.div>

                {/* Share Button */}
                {onShare && achievement.metadata?.shareMessage && (
                  <motion.div
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1.6 }}
                  >
                    <Button
                      onClick={onShare}
                      className="bg-white/20 hover:bg-white/30 text-white border border-white/30"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share Discovery
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            </Card>

            {/* Pulsing Glow Effect */}
            <motion.div
              className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} rounded-lg -z-10`}
              animate={{ 
                scale: [1, 1.05, 1],
                opacity: [0.5, 0.8, 0.5]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default HiddenAchievementCelebration;