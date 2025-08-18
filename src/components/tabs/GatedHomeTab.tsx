
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Timer, Trophy, TrendingUp, Users, Play, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSessionStats } from '@/hooks/useSessionHistory';
import { useUserAchievements } from '@/hooks/useUserAchievements';
import StreakDisplay from '@/components/StreakDisplay';
import StatsDashboard from '@/components/StatsDashboard';
import GatedRecommendationsDashboard from '@/components/recommendations/GatedRecommendationsDashboard';
import ExerciseDetailsModal from '@/components/ExerciseDetailsModal';
import { useExercises } from '@/hooks/useExercises';
import type { Tables } from '@/integrations/supabase/types';

type Exercise = Tables<'plank_exercises'>;

interface GatedHomeTabProps {
  onStartWorkout?: () => void;
  onExerciseSelect?: (exercise: Exercise) => void;
}

const GatedHomeTab: React.FC<GatedHomeTabProps> = ({ 
  onStartWorkout, 
  onExerciseSelect 
}) => {
  const { user } = useAuth();
  const { data: stats } = useSessionStats();
  const { data: achievements } = useUserAchievements();
  const { data: exercises } = useExercises();
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  const handleExerciseSelect = (exerciseId: string) => {
    const exercise = exercises?.find(ex => ex.id === exerciseId);
    if (exercise) {
      setSelectedExercise(exercise);
      setDetailsModalOpen(true);
    }
  };

  const handleModalStart = (exercise: Exercise) => {
    setDetailsModalOpen(false);
    onExerciseSelect?.(exercise);
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Welcome Header */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={cardVariants}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Welcome back{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ''}!
        </h1>
        <p className="text-gray-600">Ready to strengthen your core today?</p>
      </motion.div>

      {/* Quick Start Section */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={cardVariants}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                  <Timer className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-1">Quick Start</h3>
                  <p className="text-orange-100">Jump into your workout now</p>
                </div>
              </div>
              <Button 
                onClick={onStartWorkout}
                size="lg"
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Play className="w-5 h-5 mr-2" />
                Start Workout
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Trophy className="w-8 h-8 text-yellow-500" />
                <div>
                  <p className="text-sm text-gray-600">This Week</p>
                  <p className="text-2xl font-bold">{stats?.thisWeekSessions || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <TrendingUp className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">Total Sessions</p>
                  <p className="text-2xl font-bold">{stats?.totalSessions || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Users className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">Achievements</p>
                  <p className="text-2xl font-bold">{achievements?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardContent className="p-4">
              <StreakDisplay />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Smart Recommendations - Gated */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={cardVariants}
        transition={{ delay: 0.6 }}
      >
        <GatedRecommendationsDashboard onExerciseSelect={handleExerciseSelect} />
      </motion.div>

      {/* Stats Dashboard */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={cardVariants}
        transition={{ delay: 0.7 }}
      >
        <StatsDashboard />
      </motion.div>

      {/* Exercise Details Modal */}
      <ExerciseDetailsModal
        exercise={selectedExercise}
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        onStart={handleModalStart}
      />
    </div>
  );
};

export default GatedHomeTab;
