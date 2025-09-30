
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Trophy, Gift } from "lucide-react";
import type { UserLevel, LevelUnlock } from "@/services/levelProgressionService";

interface LevelUpCelebrationProps {
  isVisible: boolean;
  oldLevel: number;
  newLevel: UserLevel;
  unlocks: LevelUnlock[];
  onClose: () => void;
}

const LevelUpCelebration = ({ 
  isVisible, 
  oldLevel, 
  newLevel, 
  unlocks, 
  onClose 
}: LevelUpCelebrationProps) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0, y: 50 }}
            transition={{ type: "spring", duration: 0.6 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md"
          >
            <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200 shadow-2xl">
              <CardContent className="p-8 text-center">
                {/* Celebration Header */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="mb-6"
                >
                  <div className="relative inline-flex items-center justify-center">
                    <Trophy className="w-16 h-16 text-yellow-500" />
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="absolute -top-2 -right-2"
                    >
                      <Star className="w-8 h-8 text-orange-500" />
                    </motion.div>
                  </div>
                  <h1 className="text-3xl font-bold text-gray-800 mt-4 mb-2">
                    LEVEL UP!
                  </h1>
                  <p className="text-gray-600">Congratulations on your progress!</p>
                </motion.div>

                {/* Level Transition */}
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center justify-center space-x-4 mb-6"
                >
                  <Badge variant="secondary" className="text-lg px-4 py-2">
                    Level {oldLevel}
                  </Badge>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-2xl text-orange-500"
                  >
                    →
                  </motion.div>
                  <Badge className="text-lg px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0">
                    Level {newLevel.current_level}
                  </Badge>
                </motion.div>

                {/* New Title */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="mb-6"
                >
                  <h2 className="text-2xl font-bold text-orange-600 mb-2">
                    {newLevel.level_title}
                  </h2>
                  <p className="text-sm text-gray-600">
                    You've earned a new title!
                  </p>
                </motion.div>

                {/* New Unlocks */}
                {unlocks.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.0 }}
                    className="mb-8"
                  >
                    <div className="flex items-center justify-center mb-4">
                      <Gift className="w-6 h-6 text-orange-500 mr-2" />
                      <h3 className="text-lg font-semibold text-gray-800">
                        New Features Unlocked!
                      </h3>
                    </div>
                    
                    <div className="space-y-3">
                      {unlocks.map((unlock, index) => (
                        <motion.div
                          key={unlock.feature_name}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 1.2 + index * 0.1 }}
                          className="flex items-center p-3 bg-white/60 rounded-lg border border-orange-200"
                        >
                          <span className="text-2xl mr-3">{unlock.icon}</span>
                          <div className="text-left">
                            <h4 className="font-semibold text-gray-800">
                              {unlock.feature_name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {unlock.feature_description}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Continue Button */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5 }}
                >
                  <Button 
                    onClick={onClose}
                    className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white border-0 text-lg py-3"
                  >
                    Continue Your Journey
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

export default LevelUpCelebration;
