import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { getBadgeUrl } from '@/utils/badgeAssets';

interface AchievementDetailModalProps {
  achievement: any;
  onClose: () => void;
  isVisible: boolean;
}

const getCategoryGradient = (category: string) => {
  switch(category) {
    case 'Consistency':
      return 'bg-gradient-to-br from-purple-600 via-purple-700 to-purple-900';
    case 'Milestones':
      return 'bg-gradient-to-br from-orange-500 via-orange-600 to-yellow-600';
    case 'Momentum':
      return 'bg-gradient-to-br from-slate-400 via-slate-500 to-slate-600';
    case 'Performance':
      return 'bg-gradient-to-br from-purple-600 via-purple-700 to-amber-600';
    case 'Social':
      return 'bg-gradient-to-br from-slate-200 via-slate-300 to-white';
    case 'Special':
      return 'bg-gradient-to-br from-purple-600 via-purple-700 to-amber-500';
    default:
      return 'bg-gradient-to-br from-slate-600 to-slate-800';
  }
};

const getCategoryTextColor = (category: string) => {
  return category === 'Social' ? 'text-slate-800' : 'text-white';
};

const getCategoryPillStyle = (category: string) => {
  return category === 'Social' ? 'bg-slate-800/20 text-slate-800' : 'bg-white/20 text-white';
};

const AchievementDetailModal = ({ achievement, onClose, isVisible }: AchievementDetailModalProps) => {
  const badgeUrl = achievement.badge_file_name ? getBadgeUrl(achievement.badge_file_name) : '';
  const textColor = getCategoryTextColor(achievement.category);
  const pillStyle = getCategoryPillStyle(achievement.category);

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]"
          >
            {/* Modal Card */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
              className={`relative max-w-2xl w-full max-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom)-2rem)] overflow-y-auto rounded-2xl ${getCategoryGradient(achievement.category)} p-6 sm:p-8 shadow-2xl`}
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className={`absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors ${textColor}`}
              >
                <X size={24} />
              </button>

              {/* Circular Points Pill - Top Left */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className={`absolute top-4 left-4 w-16 h-16 rounded-full ${pillStyle} flex items-center justify-center`}
              >
                <div className="text-center">
                  <div className="text-lg font-bold">{achievement.points}</div>
                  <div className="text-[10px] leading-none">pts</div>
                </div>
              </motion.div>

              {/* Content */}
              <div className="flex flex-col items-center text-center space-y-4">
                {/* Achievement Name - Top */}
                <motion.h2
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className={`text-3xl font-bold ${textColor} mt-16 px-20`}
                >
                  {achievement.name}
                </motion.h2>

                {/* Large Badge Image - Center */}
                {badgeUrl && (
                  <motion.img
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.4, type: "spring", duration: 0.6 }}
                    src={badgeUrl}
                    alt={achievement.name}
                    className="w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 object-contain drop-shadow-2xl"
                  />
                )}

                {/* Achievement Description - Below Badge */}
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className={`text-base ${textColor} opacity-90 max-w-lg`}
                >
                  {achievement.description}
                </motion.p>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AchievementDetailModal;
