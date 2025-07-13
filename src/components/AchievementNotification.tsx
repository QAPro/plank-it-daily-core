
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { AchievementService } from "@/services/achievementService";
import type { UserAchievement } from "@/hooks/useUserAchievements";

interface AchievementNotificationProps {
  achievement: UserAchievement;
  onClose: () => void;
  isVisible: boolean;
}

const AchievementNotification = ({ achievement, onClose, isVisible }: AchievementNotificationProps) => {
  const [showConfetti, setShowConfetti] = useState(false);
  
  const metadata = achievement.metadata as any;
  const icon = metadata?.icon || '🏆';
  const rarity = metadata?.rarity || 'common';
  const points = metadata?.points || 0;

  useEffect(() => {
    if (isVisible) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  const getRarityGradient = (rarity: string) => {
    const gradients = {
      common: "from-gray-400 via-gray-500 to-gray-600",
      rare: "from-blue-400 via-blue-500 to-blue-600",
      epic: "from-purple-400 via-purple-500 to-purple-600",
      legendary: "from-yellow-400 via-yellow-500 to-orange-500"
    };
    return gradients[rarity as keyof typeof gradients] || gradients.common;
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ type: "spring", damping: 15, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative"
          >
            {/* Confetti Effect */}
            {showConfetti && (
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                    initial={{
                      x: 0,
                      y: 0,
                      scale: 0,
                    }}
                    animate={{
                      x: (Math.random() - 0.5) * 400,
                      y: (Math.random() - 0.5) * 400,
                      scale: [0, 1, 0],
                      rotate: 360,
                    }}
                    transition={{
                      duration: 2,
                      delay: i * 0.1,
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

            <Card className={`bg-gradient-to-br ${getRarityGradient(rarity)} text-white border-0 shadow-2xl max-w-md`}>
              <CardContent className="p-8 text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="absolute top-2 right-2 text-white hover:bg-white/20"
                >
                  <X className="w-4 h-4" />
                </Button>

                <motion.div
                  animate={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="mb-6"
                >
                  <div className="text-6xl mb-2">{icon}</div>
                  <Trophy className="w-8 h-8 mx-auto text-white/80" />
                </motion.div>

                <motion.h2
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl font-bold mb-2"
                >
                  Achievement Unlocked!
                </motion.h2>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="mb-4"
                >
                  <h3 className="text-2xl font-bold mb-2">{achievement.achievement_name}</h3>
                  <p className="text-lg opacity-95">{achievement.description}</p>
                </motion.div>

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6, type: "spring" }}
                  className="mb-6 space-y-2"
                >
                  <div className="bg-white/20 rounded-full py-2 px-4 inline-block">
                    <span className="text-sm font-medium capitalize">{rarity} Achievement</span>
                  </div>
                  {points > 0 && (
                    <div className="bg-white/20 rounded-full py-2 px-4 inline-block">
                      <span className="text-lg font-bold">+{points} points</span>
                    </div>
                  )}
                </motion.div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <Button
                    onClick={onClose}
                    className="bg-white text-gray-800 hover:bg-gray-100 font-semibold px-8 py-3 rounded-xl"
                  >
                    Awesome! 🎉
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

export default AchievementNotification;
