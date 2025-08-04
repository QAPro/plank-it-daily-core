import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useExercises } from "@/hooks/useExercises";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { useExerciseRecommendations } from "@/hooks/useExerciseRecommendations";
import { useExercisePerformance } from "@/hooks/useExercisePerformance";
import { useEnhancedSessionTracking } from "@/hooks/useEnhancedSessionTracking";
import EnhancedExerciseCard from "@/components/EnhancedExerciseCard";
import ExerciseDetailsModal from "@/components/ExerciseDetailsModal";
import ExerciseFilters, { FilterState } from "@/components/ExerciseFilters";
import TimerSetup from "@/components/TimerSetup";
import PlankTimer from "@/components/PlankTimer";
import StreakMilestone from "@/components/StreakMilestone";
import AchievementNotification from "@/components/AchievementNotification";
import type { Tables } from '@/integrations/supabase/types';
import type { UserAchievement } from "@/hooks/useUserAchievements";

type Exercise = Tables<'plank_exercises'>;
type WorkoutState = 'selection' | 'setup' | 'timer';

interface MilestoneEvent {
  milestone: {
    days: number;
    title: string;
    description: string;
  };
  isNewMilestone: boolean;
}

const WorkoutTab = () => {
  const [workoutState, setWorkoutState] = useState<WorkoutState>('selection');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [timerDuration, setTimerDuration] = useState<number>(0);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [detailsExercise, setDetailsExercise] = useState<Exercise | null>(null);
  
  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    difficulty: [],
    categories: [],
    tags: [],
    showFavoritesOnly: false,
    showRecommendedOnly: false,
    hasPerformanceData: null,
    sortBy: 'name',
    sortOrder: 'asc',
  });
  
  // Notification states
  const [milestoneToShow, setMilestoneToShow] = useState<MilestoneEvent | null>(null);
  const [achievementQueue, setAchievementQueue] = useState<UserAchievement[]>([]);
  const [currentAchievement, setCurrentAchievement] = useState<UserAchievement | null>(null);

  const { data: exercises, isLoading: exercisesLoading, error: exercisesError } = useExercises();
  const { preferences, updatePreferences } = useUserPreferences();
  const { recommendations, isLoading: recommendationsLoading, generateRecommendations, isGenerating } = useExerciseRecommendations();
  const { performanceData, updatePerformance } = useExercisePerformance();
  const { saveEnhancedSession } = useEnhancedSessionTracking();

  // Memoized filtered and sorted exercises
  const { filteredExercises, availableCategories, availableTags } = useMemo(() => {
    if (!exercises) return { filteredExercises: [], availableCategories: [], availableTags: [] };

    const recommendationMap = new Map(recommendations?.map(r => [r.exercise_id, r]) || []);
    const performanceMap = new Map(performanceData?.map(p => [p.exercise_id, p]) || []);
    const favorites = preferences?.favorite_exercises || [];

    // Get available filter options
    const categories = [...new Set(exercises.map(e => e.category).filter(Boolean))];
    const tags = [...new Set(exercises.flatMap(e => e.tags || []))];

    // Apply filters
    let filtered = exercises.filter(exercise => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          exercise.name.toLowerCase().includes(searchLower) ||
          exercise.description?.toLowerCase().includes(searchLower) ||
          exercise.tags?.some(tag => tag.toLowerCase().includes(searchLower));
        if (!matchesSearch) return false;
      }

      // Difficulty filter
      if (filters.difficulty.length > 0) {
        if (!filters.difficulty.includes(exercise.difficulty_level)) return false;
      }

      // Category filter
      if (filters.categories.length > 0) {
        if (!exercise.category || !filters.categories.includes(exercise.category)) return false;
      }

      // Tags filter
      if (filters.tags.length > 0) {
        if (!exercise.tags || !filters.tags.some(tag => exercise.tags?.includes(tag))) return false;
      }

      // Favorites filter
      if (filters.showFavoritesOnly) {
        if (!favorites.includes(exercise.id)) return false;
      }

      // Recommendations filter
      if (filters.showRecommendedOnly) {
        if (!recommendationMap.has(exercise.id)) return false;
      }

      // Performance data filter
      if (filters.hasPerformanceData !== null) {
        const hasPerformance = performanceMap.has(exercise.id);
        if (filters.hasPerformanceData !== hasPerformance) return false;
      }

      return true;
    });

    // Apply sorting
    filtered.sort((a, b) => {
      let compareValue = 0;
      
      switch (filters.sortBy) {
        case 'name':
          compareValue = a.name.localeCompare(b.name);
          break;
        case 'difficulty':
          compareValue = a.difficulty_level - b.difficulty_level;
          break;
        case 'recommendation':
          const aRec = recommendationMap.get(a.id);
          const bRec = recommendationMap.get(b.id);
          compareValue = (bRec?.confidence_score || 0) - (aRec?.confidence_score || 0);
          break;
        case 'performance':
          const aPerf = performanceMap.get(a.id);
          const bPerf = performanceMap.get(b.id);
          compareValue = (bPerf?.best_duration_seconds || 0) - (aPerf?.best_duration_seconds || 0);
          break;
      }

      return filters.sortOrder === 'desc' ? -compareValue : compareValue;
    });

    return {
      filteredExercises: filtered,
      availableCategories: categories,
      availableTags: tags,
    };
  }, [exercises, recommendations, performanceData, preferences, filters]);

  const handleStartExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setWorkoutState('setup');
  };

  const handleViewDetails = (exercise: Exercise) => {
    setDetailsExercise(exercise);
    setDetailsModalOpen(true);
  };

  const handleStartTimer = (duration: number) => {
    setTimerDuration(duration);
    setWorkoutState('timer');
  };

  const handleTimerComplete = async (timeElapsed: number) => {
    if (selectedExercise) {
      const result = await saveEnhancedSession({
        exercise: selectedExercise,
        durationSeconds: timeElapsed,
        notes: `Completed ${selectedExercise.name} workout`
      });
      
      // Update performance tracking
      updatePerformance({
        exerciseId: selectedExercise.id,
        durationSeconds: timeElapsed,
      });
      
      // Handle milestone notification
      if (result.milestoneEvent) {
        setMilestoneToShow(result.milestoneEvent);
      }
      
      // Handle achievement notifications
      if (result.newAchievements.length > 0) {
        setAchievementQueue(result.newAchievements);
        setCurrentAchievement(result.newAchievements[0]);
      }
    }
    
    // Return to selection after a short delay
    setTimeout(() => {
      setWorkoutState('selection');
      setSelectedExercise(null);
      setTimerDuration(0);
    }, 3000);
  };

  const handleToggleFavorite = async (exerciseId: string) => {
    if (!preferences) return;
    
    const currentFavorites = preferences.favorite_exercises || [];
    const isFavorite = currentFavorites.includes(exerciseId);
    
    const newFavorites = isFavorite
      ? currentFavorites.filter(id => id !== exerciseId)
      : [...currentFavorites, exerciseId];
    
    await updatePreferences({ favorite_exercises: newFavorites });
  };

  const handleMilestoneClose = () => {
    setMilestoneToShow(null);
    if (achievementQueue.length > 0 && !currentAchievement) {
      setCurrentAchievement(achievementQueue[0]);
    }
  };

  const handleAchievementClose = () => {
    const remaining = achievementQueue.slice(1);
    setAchievementQueue(remaining);
    
    if (remaining.length > 0) {
      setCurrentAchievement(remaining[0]);
    } else {
      setCurrentAchievement(null);
    }
  };

  const handleBack = () => {
    if (workoutState === 'timer') {
      setWorkoutState('setup');
    } else if (workoutState === 'setup') {
      setWorkoutState('selection');
      setSelectedExercise(null);
    }
  };

  const handleQuickStart = () => {
    const forearmPlank = exercises?.find(ex => ex.name.toLowerCase().includes('forearm'));
    if (forearmPlank) {
      setSelectedExercise(forearmPlank);
      setTimerDuration(60);
      setWorkoutState('timer');
    }
  };

  const handleRefreshRecommendations = () => {
    generateRecommendations();
  };

  if (exercisesLoading || recommendationsLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-orange-600 text-lg">Loading exercises...</div>
      </div>
    );
  }

  if (exercisesError) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-red-600 text-lg">Error loading exercises. Please try again.</div>
      </div>
    );
  }

  return (
    <div className="min-h-full">
      <AnimatePresence mode="wait">
        {workoutState === 'selection' && (
          <motion.div
            key="selection"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="p-6 space-y-6"
          >
            {/* Header with Smart Recommendations */}
            <div className="text-center pt-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <h2 className="text-2xl font-bold text-gray-800">Smart Workout Selection</h2>
                <Button
                  onClick={handleRefreshRecommendations}
                  disabled={isGenerating}
                  size="sm"
                  variant="outline"
                  className="text-xs"
                >
                  {isGenerating ? (
                    <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                  ) : (
                    <Sparkles className="w-3 h-3 mr-1" />
                  )}
                  Refresh Recommendations
                </Button>
              </div>
              <p className="text-gray-600">Personalized exercises based on your progress and preferences</p>
            </div>

            {/* Filters */}
            <ExerciseFilters
              exercises={exercises || []}
              filters={filters}
              onFiltersChange={setFilters}
              availableCategories={availableCategories}
              availableTags={availableTags}
              hasRecommendations={!!recommendations?.length}
            />

            {/* Exercise Cards */}
            <div className="space-y-4">
              {filteredExercises.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No exercises match your current filters.</p>
                  <Button
                    variant="outline"
                    onClick={() => setFilters({
                      search: '',
                      difficulty: [],
                      categories: [],
                      tags: [],
                      showFavoritesOnly: false,
                      showRecommendedOnly: false,
                      hasPerformanceData: null,
                      sortBy: 'name',
                      sortOrder: 'asc',
                    })}
                    className="mt-2"
                  >
                    Clear Filters
                  </Button>
                </div>
              ) : (
                filteredExercises.map((exercise, index) => {
                  const recommendation = recommendations?.find(r => r.exercise_id === exercise.id);
                  const performance = performanceData?.find(p => p.exercise_id === exercise.id);
                  const isFavorite = preferences?.favorite_exercises?.includes(exercise.id) || false;

                  return (
                    <EnhancedExerciseCard
                      key={exercise.id}
                      exercise={exercise}
                      index={index}
                      onStart={handleStartExercise}
                      onViewDetails={handleViewDetails}
                      performance={performance}
                      recommendationType={recommendation?.recommendation_type}
                      confidenceScore={recommendation?.confidence_score}
                      isFavorite={isFavorite}
                      onToggleFavorite={handleToggleFavorite}
                    />
                  );
                })
              )}
            </div>

            {/* Quick Start */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <Card className="bg-gradient-to-br from-gray-800 to-gray-900 text-white border-0">
                <CardContent className="p-6 text-center">
                  <h3 className="text-lg font-bold mb-2">Quick 1-Minute Session</h3>
                  <p className="text-gray-300 mb-4">Not sure what to choose? Start with our recommended daily routine</p>
                  <Button 
                    onClick={handleQuickStart}
                    className="bg-white text-gray-800 hover:bg-gray-100 font-semibold py-2 px-6 rounded-lg"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Quick Start
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}

        {workoutState === 'setup' && selectedExercise && (
          <motion.div
            key="setup"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <TimerSetup
              exercise={selectedExercise}
              onStart={handleStartTimer}
              onBack={handleBack}
            />
          </motion.div>
        )}

        {workoutState === 'timer' && selectedExercise && (
          <motion.div
            key="timer"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <PlankTimer
              exercise={selectedExercise}
              duration={timerDuration}
              onComplete={handleTimerComplete}
              onBack={handleBack}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exercise Details Modal */}
      <ExerciseDetailsModal
        exercise={detailsExercise}
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        onStart={(exercise) => {
          setDetailsModalOpen(false);
          handleStartExercise(exercise);
        }}
      />

      {/* Milestone Notification */}
      <StreakMilestone
        milestone={milestoneToShow?.milestone || { days: 0, title: '', description: '' }}
        onClose={handleMilestoneClose}
        isVisible={!!milestoneToShow}
      />

      {/* Achievement Notification */}
      {currentAchievement && (
        <AchievementNotification
          achievement={currentAchievement}
          onClose={handleAchievementClose}
          isVisible={!!currentAchievement}
        />
      )}
    </div>
  );
};

export default WorkoutTab;
