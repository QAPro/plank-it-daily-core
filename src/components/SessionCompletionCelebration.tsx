
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Star, Clock, Target, CheckCircle, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import type { Tables } from '@/integrations/supabase/types';

type Exercise = Tables<'plank_exercises'>;

interface SessionCompletionCelebrationProps {
  isVisible: boolean;
  exercise: Exercise;
  duration: number;
  timeElapsed: number;
  onClose: () => void;
  onDoAgain?: () => void;
}

const SessionCompletionCelebration = ({ 
  isVisible, 
  exercise, 
  duration, 
  timeElapsed, 
  onClose,
  onDoAgain 
}: SessionCompletionCelebrationProps) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(0);

  const completionPercentage = Math.min((timeElapsed / duration) * 100, 100);
  const isFullCompletion = timeElapsed >= duration;
  
  const celebrationMessages = [
    isFullCompletion ? "Amazing! You did it! 🎉" : "Great effort! 💪",
    isFullCompletion ? "Perfect form and focus!" : "You're building strength!",
    isFullCompletion ? "You're a plank champion!" : "Progress over perfection!"
  ];

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (isVisible) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 4000);
      
      // Cycle through celebration messages
      const messageInterval = setInterval(() => {
        setCurrentMessage((prev) => (prev + 1) % celebrationMessages.length);
      }, 2000);

      return () => {
        clearTimeout(timer);
        clearInterval(messageInterval);
      };
    }
  }, [isVisible, celebrationMessages.length]);

  const getCompletionGradient = () => {
    if (isFullCompletion) {
      return "from-green-400 via-emerald-500 to-teal-500";
    } else if (completionPercentage >= 75) {
      return "from-blue-400 via-cyan-500 to-blue-600";
    } else if (completionPercentage >= 50) {
      return "from-yellow-400 via-orange-500 to-amber-500";
    } else {
      return "from-purple-400 via-pink-500 to-rose-500";
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 10 }}
            transition={{ type: "spring", damping: 15, stiffness: 300 }}
            className="relative max-w-md w-full"
          >
            {/* Confetti Effect */}
            {showConfetti && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
                {[...Array(30)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: [
                        '#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', 
                        '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'
                      ][i % 8],
                      left: '50%',
                      top: '50%',
                    }}
                    initial={{
                      x: 0,
                      y: 0,
                      scale: 0,
                      rotate: 0,
                    }}
                    animate={{
                      x: (Math.random() - 0.5) * 600,
                      y: (Math.random() - 0.5) * 600,
                      scale: [0, 1, 0.5, 0],
                      rotate: 360 * 3,
                    }}
                    transition={{
                      duration: 3,
                      delay: i * 0.05,
                      ease: "easeOut",
                    }}
                  />
                ))}
              </div>
            )}

            <Card className={`bg-gradient-to-br ${getCompletionGradient()} text-white border-0 shadow-2xl`}>
              <CardContent className="p-8 text-center relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="absolute top-4 right-4 text-white hover:bg-white/20"
                >
                  <X className="w-4 h-4" />
                </Button>

                {/* Main Icon */}
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                  className="mb-6"
                >
                  {isFullCompletion ? (
                    <Trophy className="w-16 h-16 mx-auto text-yellow-200" />
                  ) : (
                    <Star className="w-16 h-16 mx-auto text-yellow-200" />
                  )}
                </motion.div>

                {/* Dynamic Celebration Message */}
                <motion.h2
                  key={currentMessage}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="text-3xl font-bold mb-4"
                >
                  {celebrationMessages[currentMessage]}
                </motion.h2>

                {/* Exercise Name */}
                <p className="text-xl font-semibold mb-6 opacity-90">
                  {exercise.name} Complete!
                </p>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white/20 rounded-xl p-3"
                  >
                    <Clock className="w-6 h-6 mx-auto mb-2" />
                    <div className="text-lg font-bold">{formatTime(timeElapsed)}</div>
                    <div className="text-xs opacity-80">Time</div>
                  </motion.div>

                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white/20 rounded-xl p-3"
                  >
                    <Target className="w-6 h-6 mx-auto mb-2" />
                    <div className="text-lg font-bold">{Math.round(completionPercentage)}%</div>
                    <div className="text-xs opacity-80">Complete</div>
                  </motion.div>

                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white/20 rounded-xl p-3"
                  >
                    <CheckCircle className="w-6 h-6 mx-auto mb-2" />
                    <div className="text-lg font-bold">L{exercise.difficulty_level}</div>
                    <div className="text-xs opacity-80">Level</div>
                  </motion.div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-white/20 rounded-full h-3 mb-6">
                  <motion.div
                    className="bg-white rounded-full h-3"
                    initial={{ width: 0 }}
                    animate={{ width: `${completionPercentage}%` }}
                    transition={{ duration: 1, delay: 0.6 }}
                  />
                </div>

                {/* Motivational Quote */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="bg-white/10 rounded-lg p-4 mb-6"
                >
                  <p className="text-sm italic">
                    {isFullCompletion 
                      ? "\"Strength doesn't come from what you can do. It comes from overcoming the things you once thought you couldn't.\"" 
                      : "\"Every second you held that plank was a victory. Keep building on it!\""}
                  </p>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1.2 }}
                  className="space-y-3"
                >
                  <Button
                    onClick={onClose}
                    className="w-full bg-white text-gray-800 hover:bg-gray-100 font-semibold py-3 rounded-xl text-lg"
                  >
                    Awesome! 🎉
                  </Button>
                  
                  {onDoAgain && (
                    <Button
                      onClick={onDoAgain}
                      variant="outline"
                      className="w-full border-white text-white hover:bg-white/20 py-3 rounded-xl"
                    >
                      Do it Again
                    </Button>
                  )}
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SessionCompletionCelebration;
