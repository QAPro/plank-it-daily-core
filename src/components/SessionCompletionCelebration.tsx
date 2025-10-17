
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Star, Clock, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import FlagGuard from '@/components/access/FlagGuard';
import type { Tables } from '@/integrations/supabase/types';
import type { UserAchievement } from '@/hooks/useUserAchievements';

// Enhanced components
import EnhancedConfetti from "@/components/celebration/EnhancedConfetti";
import CelebrationStats from "@/components/celebration/CelebrationStats";
import SocialShareButtons from "@/components/celebration/SocialShareButtons";
import CelebrationActions from "@/components/celebration/CelebrationActions";
import { SocialSharingService } from "@/services/socialSharingService";
import InAppPostDialog from "@/components/social/InAppPostDialog";

type Exercise = Tables<'exercises'>;

interface SessionCompletionCelebrationProps {
  isVisible: boolean;
  exercise: Exercise;
  duration: number;
  timeElapsed: number;
  onClose: () => void;
  onDoAgain?: () => void;
  // Enhanced props
  isPersonalBest?: boolean;
  previousBest?: number;
  caloriesEstimate?: number;
  newAchievements?: UserAchievement[];
  streakDays?: number;
  milestoneEvent?: {
    milestone: { days: number; title: string; description: string };
    isNewMilestone: boolean;
  };
}

const SessionCompletionCelebration = ({ 
  isVisible, 
  exercise, 
  duration, 
  timeElapsed, 
  onClose,
  onDoAgain,
  isPersonalBest = false,
  previousBest,
  caloriesEstimate = 0,
  newAchievements = [],
  streakDays = 0,
  milestoneEvent
}: SessionCompletionCelebrationProps) => {
  const [animationPhase, setAnimationPhase] = useState<'initial' | 'stats' | 'achievements' | 'social'>('initial');
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showInAppPost, setShowInAppPost] = useState(false);
  const { toast } = useToast();

  const completionPercentage = Math.min((timeElapsed / duration) * 100, 100);
  const isFullCompletion = timeElapsed >= duration;

  // Enhanced celebration messages based on performance
  const getCelebrationMessages = () => {
    if (isPersonalBest) {
      return [
        "🏆 NEW PERSONAL BEST! 🏆",
        "You absolutely crushed it! 💪",
        "Your dedication is paying off! 🌟"
      ];
    } else if (isFullCompletion) {
      return [
        "Amazing! You completed the full time! 🎉",
        "Perfect form and focus! ⭐",
        "You're getting stronger every day! 💪"
      ];
    } else if (completionPercentage >= 75) {
      return [
        "Great effort! You're building strength! 💪",
        "Progress over perfection! 🎯",
        "Every second counts! Keep going! 🚀"
      ];
    } else {
      return [
        "Good start! Every journey begins with one step! 🌱",
        "You showed up - that's what matters! ⭐",
        "Building the habit is key! 💪"
      ];
    }
  };

  const celebrationMessages = getCelebrationMessages();

  // Enhanced motivational quote system
  const getMotivationalQuote = () => {
    if (isPersonalBest) {
      return "\"Champions don't become champions in the ring. They become champions in their training, miles away from any crowd.\" - Muhammad Ali";
    } else if (milestoneEvent) {
      return `\"Success is the sum of small efforts repeated day in and day out.\" You've proven this for ${milestoneEvent.milestone.days} days!`;
    } else if (completionPercentage >= 75) {
      return "\"Strength doesn't come from what you can do. It comes from overcoming what you thought you couldn't.\"";
    } else {
      return "\"It's not about perfect. It's about effort. And when you bring that effort every single day, that's where transformation happens.\"";
    }
  };

  // Animation sequence management
  useEffect(() => {
    if (isVisible) {
      // Phase 1: Initial celebration (0-3s)
      setAnimationPhase('initial');
      
      const timer1 = setTimeout(() => {
        // Phase 2: Show detailed stats (3-6s)
        setAnimationPhase('stats');
        
        // Show achievements if any
        if (newAchievements.length > 0 || milestoneEvent) {
          setTimeout(() => {
            setShowAchievements(true);
          }, 1000);
        }
      }, 3000);

      const timer2 = setTimeout(() => {
        // Phase 3: Show achievements prominently (6-9s)
        setAnimationPhase('achievements');
      }, 6000);

      const timer3 = setTimeout(() => {
        // Phase 4: Show social sharing options (9s+)
        setAnimationPhase('social');
      }, 9000);

      // Message cycling
      const messageInterval = setInterval(() => {
        setCurrentMessageIndex((prev) => (prev + 1) % celebrationMessages.length);
      }, 2500);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
        clearInterval(messageInterval);
      };
    }
  }, [isVisible, celebrationMessages.length, newAchievements.length, milestoneEvent]);

  const getConfettiIntensity = () => {
    if (isPersonalBest) return 'epic';
    if (isFullCompletion) return 'high';
    if (completionPercentage >= 75) return 'medium';
    return 'low';
  };

  const getCompletionGradient = () => {
    if (isPersonalBest) {
      return "from-yellow-400 via-orange-500 to-red-500";
    } else if (isFullCompletion) {
      return "from-green-400 via-emerald-500 to-teal-500";
    } else if (completionPercentage >= 75) {
      return "from-blue-400 via-cyan-500 to-blue-600";
    } else if (completionPercentage >= 50) {
      return "from-purple-400 via-pink-500 to-rose-500";
    } else {
      return "from-indigo-400 via-purple-500 to-pink-500";
    }
  };

  // Create share data
  const shareData = {
    exercise: exercise.name,
    duration: timeElapsed,
    achievement: newAchievements[0]?.achievement_name,
    personalBest: isPersonalBest,
    streakDays,
    isFullCompletion
  };

  return (
    <FlagGuard featureName="session_celebration">
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
          >
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 10 }}
              transition={{ type: "spring", damping: 15, stiffness: 300 }}
              className="relative max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Enhanced Confetti */}
              <EnhancedConfetti 
                isActive={animationPhase === 'initial'} 
                intensity={getConfettiIntensity()}
                duration={6000}
              />

              <Card className={`bg-gradient-to-br ${getCompletionGradient()} text-white border-0 shadow-2xl relative overflow-hidden`}>
                {/* Animated background pattern */}
                <div className="absolute inset-0 opacity-10">
                  <motion.div
                    animate={{
                      rotate: 360,
                      scale: [1, 1.1, 1]
                    }}
                    transition={{
                      rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                      scale: { duration: 4, repeat: Infinity }
                    }}
                    className="w-full h-full"
                    style={{
                      backgroundImage: `radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
                                       radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
                                       radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.3) 0%, transparent 50%)`
                    }}
                  />
                </div>

                <CardContent className="p-6 text-center relative z-10">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="absolute top-2 right-2 text-white hover:bg-white/20 z-20"
                  >
                    <X className="w-4 h-4" />
                  </Button>

                  {/* Dynamic Main Icon with enhanced animation */}
                  <motion.div
                    animate={{ 
                      scale: animationPhase === 'initial' ? [1, 1.3, 1] : [1, 1.1, 1],
                      rotate: animationPhase === 'initial' ? [0, 15, -15, 0] : [0, 5, -5, 0]
                    }}
                    transition={{ 
                      duration: animationPhase === 'initial' ? 1 : 2, 
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                    className="mb-4"
                  >
                    {isPersonalBest ? (
                      <div className="relative">
                        <Trophy className="w-16 h-16 mx-auto text-yellow-200" />
                        <motion.div
                          animate={{ scale: [0, 1.5, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="absolute inset-0 border-4 border-yellow-300 rounded-full opacity-30"
                        />
                      </div>
                    ) : isFullCompletion ? (
                      <Trophy className="w-16 h-16 mx-auto text-yellow-200" />
                    ) : (
                      <Star className="w-16 h-16 mx-auto text-yellow-200" />
                    )}
                  </motion.div>

                  {/* Dynamic Celebration Message */}
                  <motion.h2
                    key={currentMessageIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="text-2xl md:text-3xl font-bold mb-3"
                  >
                    {celebrationMessages[currentMessageIndex]}
                  </motion.h2>

                  {/* Exercise Name with level */}
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-lg font-semibold mb-4 opacity-90"
                  >
                    {exercise.name} • Level {exercise.difficulty_level} Complete!
                  </motion.p>

                  {/* Enhanced Stats Display */}
                  <AnimatePresence>
                    {animationPhase !== 'initial' && (
                      <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                      >
                        <CelebrationStats
                          duration={timeElapsed}
                          exercise={exercise}
                          isPersonalBest={isPersonalBest}
                          previousBest={previousBest}
                          caloriesEstimate={caloriesEstimate}
                          completionPercentage={completionPercentage}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Progress Bar - Enhanced */}
                  <div className="w-full bg-white/20 rounded-full h-3 mb-4 overflow-hidden">
                    <motion.div
                      className="bg-white rounded-full h-3 relative"
                      initial={{ width: 0 }}
                      animate={{ width: `${completionPercentage}%` }}
                      transition={{ duration: 1.5, delay: 0.6 }}
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-50"
                        animate={{ x: [-100, 200] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                      />
                    </motion.div>
                  </div>

                  {/* Milestone Event */}
                  <AnimatePresence>
                    {milestoneEvent && showAchievements && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="bg-yellow-400/20 border border-yellow-300/30 rounded-lg p-3 mb-4"
                      >
                        <div className="text-yellow-100 font-bold text-lg">
                          🎉 {milestoneEvent.milestone.title}!
                        </div>
                        <div className="text-yellow-200 text-sm">
                          {milestoneEvent.milestone.description}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* New Achievements Display */}
                  <AnimatePresence>
                    {newAchievements.length > 0 && showAchievements && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="mb-4"
                      >
                        {newAchievements.slice(0, 3).map((achievement, index) => (
                          <motion.div
                            key={achievement.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.2 }}
                            className="bg-white/10 rounded-lg p-3 mb-2 border border-white/20"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-semibold text-sm">
                                  🏆 {achievement.achievement_name}
                                </div>
                                <div className="text-xs opacity-80">
                                  {achievement.description}
                                </div>
                              </div>
                              <div className="text-2xl">
                                {achievement.metadata?.icon || '🎖️'}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Enhanced Motivational Quote */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: animationPhase === 'achievements' ? 1 : 0.7 }}
                    transition={{ delay: animationPhase === 'achievements' ? 0.5 : 1 }}
                    className="bg-white/10 rounded-lg p-4 mb-4 border border-white/20"
                  >
                    <p className="text-sm italic leading-relaxed">
                      {getMotivationalQuote()}
                    </p>
                  </motion.div>

                  {/* Social Sharing - In-App First */}
                  <AnimatePresence>
                    {animationPhase === 'social' && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-4"
                      >
                        <Button
                          onClick={() => setShowInAppPost(true)}
                          className="w-full bg-white/20 hover:bg-white/30 text-white border border-white/30 mb-3"
                          size="lg"
                        >
                          📢 Share your achievement!
                        </Button>
                        <SocialShareButtons shareData={shareData} />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Enhanced Action Buttons */}
                  <CelebrationActions
                    onClose={onClose}
                    onDoAgain={onDoAgain}
                    exerciseName={exercise.name}
                  />
                </CardContent>
              </Card>
            </motion.div>

            {/* In-App Post Dialog */}
            <InAppPostDialog
              isOpen={showInAppPost}
              onClose={() => setShowInAppPost(false)}
              shareData={shareData}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </FlagGuard>
  );
};

export default SessionCompletionCelebration;
