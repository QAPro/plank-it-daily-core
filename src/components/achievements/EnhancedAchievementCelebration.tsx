
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Share2, X } from "lucide-react";
import { ExpandedAchievementEngine } from "@/services/expandedAchievementService";

interface EnhancedAchievementCelebrationProps {
  achievement: any;
  onClose: () => void;
  onShare?: () => void;
  isVisible: boolean;
}

const EnhancedAchievementCelebration = ({ 
  achievement, 
  onClose, 
  onShare,
  isVisible 
}: EnhancedAchievementCelebrationProps) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const rarityColors = ExpandedAchievementEngine.getRarityColor(achievement.rarity);

  useEffect(() => {
    if (isVisible) {
      setShowConfetti(true);
      
      // Auto-close after 8 seconds for common achievements, longer for rare ones
      const autoCloseDelay = achievement.rarity === 'legendary' ? 12000 : 
                            achievement.rarity === 'epic' ? 10000 : 
                            achievement.rarity === 'rare' ? 8000 : 6000;
      
      const timer = setTimeout(onClose, autoCloseDelay);
      return () => clearTimeout(timer);
    }
  }, [isVisible, achievement.rarity, onClose]);

  const getConfettiCount = () => {
    switch (achievement.rarity) {
      case 'legendary': return 50;
      case 'epic': return 35;
      case 'rare': return 25;
      case 'uncommon': return 15;
      default: return 10;
    }
  };

  const getRarityTitle = () => {
    switch (achievement.rarity) {
      case 'legendary': return '🌟 LEGENDARY ACHIEVEMENT! 🌟';
      case 'epic': return '💜 EPIC ACHIEVEMENT! 💜';
      case 'rare': return '💙 RARE ACHIEVEMENT! 💙';
      case 'uncommon': return '💚 UNCOMMON ACHIEVEMENT! 💚';
      default: return '🎉 Achievement Unlocked! 🎉';
    }
  };

  const getAnimationScale = () => {
    switch (achievement.rarity) {
      case 'legendary': return 1.2;
      case 'epic': return 1.15;
      case 'rare': return 1.1;
      default: return 1.0;
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0, rotate: -180, opacity: 0 }}
            animate={{ 
              scale: getAnimationScale(), 
              rotate: 0, 
              opacity: 1 
            }}
            exit={{ scale: 0, rotate: 180, opacity: 0 }}
            transition={{ 
              type: "spring", 
              damping: 15, 
              stiffness: 300,
              duration: 0.8 
            }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-md w-full"
          >
            {/* Confetti Effect */}
            {showConfetti && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
                {[...Array(getConfettiCount())].map((_, i) => (
                  <motion.div
                    key={i}
                    className={`absolute w-3 h-3 rounded-full ${
                      ['bg-yellow-400', 'bg-orange-400', 'bg-red-400', 'bg-purple-400', 'bg-blue-400'][i % 5]
                    }`}
                    initial={{
                      x: '50%',
                      y: '50%',
                      scale: 0,
                      rotate: 0,
                    }}
                    animate={{
                      x: (Math.random() - 0.5) * 600,
                      y: (Math.random() - 0.5) * 600,
                      scale: [0, 1.5, 0],
                      rotate: Math.random() * 720,
                    }}
                    transition={{
                      duration: 2.5,
                      delay: i * 0.02,
                      ease: "easeOut",
                    }}
                    style={{
                      left: '50%',
                      top: '50%',
                    }}
                  />
                ))}
              </div>
            )}

            {/* Close button */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute -top-2 -right-2 z-10 bg-white/90 hover:bg-white rounded-full w-8 h-8 p-0"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>

            <Card className={`${achievement.badge_color} text-white border-0 shadow-2xl overflow-hidden`}>
              <CardContent className="p-8 text-center relative">
                {/* Rarity Badge */}
                {achievement.rarity !== 'common' && (
                  <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mb-4"
                  >
                    <Badge className="bg-white/20 text-white border-white/30 text-sm font-bold px-3 py-1">
                      {achievement.rarity.toUpperCase()}
                    </Badge>
                  </motion.div>
                )}

                {/* Title */}
                <motion.h1
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl font-bold mb-4"
                >
                  {getRarityTitle()}
                </motion.h1>

                {/* Achievement Icon */}
                <motion.div
                  animate={{ 
                    rotate: [0, -5, 5, -5, 0],
                    scale: [1, 1.1, 1] 
                  }}
                  transition={{ 
                    duration: 0.6, 
                    delay: 0.5,
                    repeat: achievement.rarity === 'legendary' ? 2 : 1
                  }}
                  className="mb-6"
                >
                  <div className="text-6xl mb-2 drop-shadow-lg">
                    {achievement.icon}
                  </div>
                </motion.div>

                {/* Achievement Details */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="mb-6"
                >
                  <h2 className="text-3xl font-bold mb-3">{achievement.name}</h2>
                  <p className="text-lg opacity-95 mb-4">{achievement.unlock_message}</p>
                </motion.div>

                {/* Points Earned */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6, type: "spring" }}
                  className="mb-6"
                >
                  <div className="bg-white/20 rounded-full py-3 px-6 inline-block">
                    <span className="text-2xl font-bold">+{achievement.points}</span>
                    <span className="text-lg ml-2">points!</span>
                  </div>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="flex flex-col sm:flex-row gap-3 justify-center"
                >
                  {onShare && (
                    <Button
                      onClick={onShare}
                      className="bg-white/20 hover:bg-white/30 text-white border-white/30 flex items-center space-x-2"
                      variant="outline"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Share Achievement</span>
                    </Button>
                  )}
                  
                  <Button
                    onClick={onClose}
                    className="bg-white text-gray-800 hover:bg-gray-100 font-semibold px-6"
                  >
                    Continue Journey! 🚀
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EnhancedAchievementCelebration;
