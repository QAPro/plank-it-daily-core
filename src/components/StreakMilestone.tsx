
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Star, Flame, Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

interface StreakMilestoneProps {
  milestone: {
    days: number;
    title: string;
    description: string;
  };
  onClose: () => void;
  isVisible: boolean;
}

const StreakMilestone = ({ milestone, onClose, isVisible }: StreakMilestoneProps) => {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  const getMilestoneIcon = (days: number) => {
    if (days >= 100) return Trophy;
    if (days >= 30) return Star;
    if (days >= 14) return Flame;
    return Target;
  };

  const getMilestoneColor = (days: number) => {
    if (days >= 100) return "from-yellow-400 via-yellow-500 to-orange-500";
    if (days >= 30) return "from-purple-400 via-pink-500 to-red-500";
    if (days >= 14) return "from-orange-400 via-red-500 to-pink-500";
    return "from-blue-400 via-purple-500 to-indigo-500";
  };

  const Icon = getMilestoneIcon(milestone.days);

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

            <Card className={`bg-gradient-to-br ${getMilestoneColor(milestone.days)} text-white border-0 shadow-2xl max-w-md`}>
              <CardContent className="p-8 text-center">
                <motion.div
                  animate={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="mb-6"
                >
                  <Icon className="w-16 h-16 mx-auto text-white drop-shadow-lg" />
                </motion.div>

                <motion.h2
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl font-bold mb-2"
                >
                  🎉 Milestone Achieved!
                </motion.h2>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="mb-4"
                >
                  <h3 className="text-2xl font-bold mb-2">{milestone.title}</h3>
                  <p className="text-lg opacity-95">{milestone.description}</p>
                </motion.div>

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6, type: "spring" }}
                  className="mb-6"
                >
                  <div className="bg-white/20 rounded-full py-3 px-6 inline-block">
                    <span className="text-4xl font-bold">{milestone.days}</span>
                    <span className="text-xl ml-2">days strong!</span>
                  </div>
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
                    Continue Streak! 🚀
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

export default StreakMilestone;
