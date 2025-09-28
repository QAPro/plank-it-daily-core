
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, Share2, Trophy, MessageCircle } from 'lucide-react';
import { formatDuration, intervalToDuration } from 'date-fns';
import type { Tables } from '@/integrations/supabase/types';
import SocialFeatureGuard from '@/components/access/SocialFeatureGuard';
import WorkoutFeedback, { type WorkoutFeedback as WorkoutFeedbackType } from '@/components/feedback/WorkoutFeedback';

// Type definitions based on Supabase schema
type Achievement = Tables<'user_achievements'>;
type PersonalBest = {
  id: string;
  exercise_name: string;
  new_best: string;
};

interface SessionCompletionCelebrationProps {
  session: {
    id?: string;
    exercise_name: string;
    duration_seconds: number;
    completed_at: string;
  };
  achievements?: Achievement[];
  personalBests?: PersonalBest[];
  onContinue: () => void;
  onViewStats: () => void;
  onShare: () => void;
  onFeedbackSubmit?: (feedback: WorkoutFeedbackType) => void;
}

const SessionCompletionCelebration: React.FC<SessionCompletionCelebrationProps> = ({
  session,
  achievements = [],
  personalBests = [],
  onContinue,
  onViewStats,
  onShare,
  onFeedbackSubmit
}) => {
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  
  const duration = intervalToDuration({ start: 0, end: session.duration_seconds * 1000 });
  const formattedDuration = formatDuration(duration, {
    delimiter: ', ',
    format: ['minutes', 'seconds'],
  }).replace('minutes', 'min').replace('seconds', 'sec');

  const handleFeedbackSubmit = (feedback: WorkoutFeedbackType) => {
    setFeedbackSubmitted(true);
    setShowFeedback(false);
    onFeedbackSubmit?.(feedback);
  };

  const handleSkipFeedback = () => {
    setShowFeedback(false);
  };

  if (showFeedback) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.3 }}
      >
        <WorkoutFeedback 
          onSubmit={handleFeedbackSubmit}
          onSkip={handleSkipFeedback}
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="w-full max-w-2xl mx-auto overflow-hidden bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
        <CardHeader className="p-6 pb-0">
          <CardTitle className="text-2xl font-bold text-orange-800">
            Session Complete!
          </CardTitle>
          <p className="text-gray-600">
            Great job on completing your {session.exercise_name} session!
          </p>
          <div className="mt-4 flex items-center space-x-4">
            <div className="text-xl font-semibold text-orange-700">
              {formattedDuration}
            </div>
            <div className="text-gray-500">Duration</div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {achievements.length > 0 && (
            <section className="space-y-3">
              <h4 className="text-lg font-semibold text-gray-800">
                Achievements Unlocked!
              </h4>
              <ul className="list-disc list-inside space-y-1">
                {achievements.map((achievement) => (
                  <li key={achievement.id} className="text-gray-700">
                    {achievement.achievement_name}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {personalBests.length > 0 && (
            <section className="space-y-3">
              <h4 className="text-lg font-semibold text-gray-800">
                New Personal Bests!
              </h4>
              <ul className="list-disc list-inside space-y-1">
                {personalBests.map((pb) => (
                  <li key={pb.id} className="text-gray-700">
                    {pb.exercise_name}: {pb.new_best}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Feedback Prompt */}
          {!feedbackSubmitted && onFeedbackSubmit && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessageCircle className="w-5 h-5 text-blue-600" />
                  <div>
                    <h4 className="font-medium text-blue-800">Share Your Experience</h4>
                    <p className="text-sm text-blue-600">Help us understand how your workout felt</p>
                  </div>
                </div>
                <Button
                  onClick={() => setShowFeedback(true)}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Add Feedback
                </Button>
              </div>
            </div>
          )}

          {feedbackSubmitted && (
            <div className="p-3 bg-green-50 rounded-lg border border-green-200 text-center">
              <p className="text-sm text-green-700">✓ Thanks for sharing your feedback!</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-orange-200">
            <Button
              onClick={onContinue}
              className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
            >
              Continue Training
            </Button>
            
            <Button
              onClick={onViewStats}
              variant="outline"
              className="flex-1 border-orange-300 text-orange-700 hover:bg-orange-50"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              View Stats
            </Button>

            <SocialFeatureGuard>
              <Button
                onClick={onShare}
                variant="outline"
                className="flex-1 border-orange-300 text-orange-700 hover:bg-orange-50"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share Achievement
              </Button>
            </SocialFeatureGuard>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SessionCompletionCelebration;
