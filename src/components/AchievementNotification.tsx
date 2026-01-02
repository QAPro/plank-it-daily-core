
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import type { UserAchievement } from "@/hooks/useUserAchievements";

interface AchievementNotificationProps {
  achievement: UserAchievement;
  onClose: () => void;
  isVisible: boolean;
}

const getCategoryGradient = (category: string) => {
  switch(category) {
    case 'Consistency':
      return 'from-purple-600 via-purple-700 to-purple-900';
    case 'Milestones':
      return 'from-orange-500 via-orange-600 to-yellow-600';
    case 'Momentum':
      return 'from-slate-400 via-slate-500 to-slate-600';
    case 'Performance':
      return 'from-purple-600 via-purple-700 to-amber-600';
    case 'Social':
      return 'from-slate-200 via-slate-300 to-white';
    case 'Special':
      return 'from-purple-600 via-purple-700 to-amber-500';
    default:
      return 'from-slate-600 to-slate-800';
  }
};

const getCategoryTextColor = (category: string) => {
  return category === 'Social' ? 'text-slate-800' : 'text-white';
};

const AchievementNotification = ({ achievement, onClose, isVisible }: AchievementNotificationProps) => {
  const [showConfetti, setShowConfetti] = useState(false);
  
  const metadata = achievement.metadata as any;
  const icon = metadata?.icon || '🏆';
  const category = achievement.category || 'Milestones';
  const rarity = metadata?.rarity || 'common';
  const points = metadata?.points || 0;
  const textColor = getCategoryTextColor(category);

  useEffect(() => {
    if (isVisible) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  return (
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6"
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: "spring", damping: 15, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md"
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

              <Card className={`bg-gradient-to-br ${getCategoryGradient(category)} ${textColor} border-0 shadow-2xl`}>
                <CardContent className="p-6 sm:p-8 text-center relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className={`absolute top-2 right-2 ${category === 'Social' ? 'text-slate-800 hover:bg-slate-800/20' : 'text-white hover:bg-white/20'} min-h-[44px] min-w-[44px] touch-manipulation`}
                    aria-label="Close achievement notification"
                  >
                    <X className="w-4 h-4" />
                  </Button>

                  <motion.div
                    animate={{ rotate: [0, -10, 10, -10, 0] }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="mb-4 sm:mb-6"
                  >
                    <div className="text-5xl sm:text-6xl mb-2">{icon}</div>
                    <Trophy className={`w-6 h-6 sm:w-8 sm:h-8 mx-auto ${category === 'Social' ? 'text-slate-800/80' : 'text-white/80'}`} />
                  </motion.div>

                  <motion.h2
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-2xl sm:text-3xl font-bold mb-2"
                  >
                    Achievement Unlocked!
                  </motion.h2>

                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mb-4"
                  >
                    <h3 className="text-xl sm:text-2xl font-bold mb-2">{achievement.achievement_name}</h3>
                    <p className="text-base sm:text-lg opacity-95">{achievement.description}</p>
                  </motion.div>

                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.6, type: "spring" }}
                    className="mb-4 sm:mb-6 space-y-2"
                  >
                    <div className={`${category === 'Social' ? 'bg-slate-800/20' : 'bg-white/20'} rounded-full py-2 px-4 inline-block`}>
                      <span className="text-sm font-medium">{category}</span>
                    </div>
                    <div className={`${category === 'Social' ? 'bg-slate-800/20' : 'bg-white/20'} rounded-full py-2 px-4 inline-block ml-2`}>
                      <span className="text-sm font-medium capitalize">{rarity}</span>
                    </div>
                    {points > 0 && (
                      <div className={`${category === 'Social' ? 'bg-slate-800/20' : 'bg-white/20'} rounded-full py-2 px-4 inline-block block mt-2`}>
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
                      className={`${category === 'Social' ? 'bg-slate-800 text-white hover:bg-slate-900' : 'bg-white text-gray-800 hover:bg-gray-100'} font-semibold px-6 sm:px-8 py-3 rounded-xl min-h-[48px] touch-manipulation text-base sm:text-lg`}
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
