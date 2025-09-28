import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import EnhancedExerciseCard from "@/components/EnhancedExerciseCard";
import { CompactExerciseCard } from "@/components/CompactExerciseCard";
import { ExerciseCounter } from "@/components/ExerciseCounter";
import ExerciseFilters, { FilterState } from "@/components/ExerciseFilters";
import PlankTimer from "@/components/PlankTimer";
import ExerciseDetailsModal from "@/components/ExerciseDetailsModal";
import { useExercises } from "@/hooks/useExercises";
import { useExerciseRecommendations } from "@/hooks/useExerciseRecommendations";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { useScrollDetection } from "@/hooks/useScrollDetection";
import { useSubscription } from "@/hooks/useSubscription";
import { Skeleton } from "@/components/ui/skeleton";
import type { Tables } from "@/integrations/supabase/types";
import FeatureGuard from "@/components/access/FeatureGuard";
import CustomWorkoutManager from "@/components/custom-workouts/CustomWorkoutManager";
import { useQuickStart } from '@/hooks/useQuickStart';
import { QuickStartButton } from '@/components/QuickStartButton';
import { useWorkoutDeepLinking } from '@/hooks/useWorkoutDeepLinking';
import { usePredictiveLoading } from '@/hooks/usePredictiveLoading';
import { useOfflineCapability } from '@/hooks/useOfflineCapability';
import QuickStartOfflineIndicator from '@/components/QuickStartOfflineIndicator';
import PredictiveQuickStart from '@/components/PredictiveQuickStart';
import { BackgroundMusicPlayer } from '@/components/audio/BackgroundMusicPlayer';

type Exercise = Tables<'plank_exercises'>;

interface WorkoutTabProps {
  onStartWorkout?: (exerciseId: string, duration: number) => void;
}

const WorkoutTab = ({ onStartWorkout }: WorkoutTabProps) => {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [showTimer, setShowTimer] = useState(false);
  const [selectedDetailsExercise, setSelectedDetailsExercise] = useState<Exercise | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [isCompactView, setIsCompactView] = useState(false);
  const quickStartDurationRef = useRef<number | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    difficulty: [],
    categories: [],
    tags: [],
    showFavoritesOnly: false,
    showRecommendedOnly: false,
    hasPerformanceData: null,
    sortBy: 'difficulty',
    sortOrder: 'asc',
  });

  const { hasScrollableContent, containerRef } = useScrollDetection();

  const { data: exercises, isLoading: exercisesLoading } = useExercises();
  const { recommendations, isLoading: recommendationsLoading, generateRecommendations, isGenerating } = useExerciseRecommendations();
  const { preferences, updatePreferences } = useUserPreferences();
  const { quickStartData, isLoading: quickStartLoading } = useQuickStart();
  const { deepLinkData, clearDeepLinkData } = useWorkoutDeepLinking();
  const { plans, upgrade } = useSubscription();

  // Handle deep link data when available
  useEffect(() => {
    if (deepLinkData && exercises && exercises.length > 0) {
      const exercise = exercises.find(e => e.id === deepLinkData.exerciseId);
      if (exercise) {
        handleExerciseSelect(exercise, { quickStartDuration: deepLinkData.duration });
        clearDeepLinkData();
      }
    }
  }, [deepLinkData, exercises, clearDeepLinkData]);

  const recommendedExerciseIds = useMemo(() => {
    if (!recommendations) return new Set<string>();
    return new Set(recommendations.map(rec => rec.exercise_id));
  }, [recommendations]);

  const filteredExercises = useMemo(() => {
    if (!exercises) return [];
    
    let filtered = exercises.filter((exercise) => {
      // Search filter
      const matchesSearch = filters.search === '' || 
        exercise.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        exercise.description?.toLowerCase().includes(filters.search.toLowerCase());
      
      // Difficulty filter
      const matchesDifficulty = filters.difficulty.length === 0 || 
        filters.difficulty.includes(exercise.difficulty_level);
      
      // Category filter
      const matchesCategory = filters.categories.length === 0 || 
        filters.categories.includes(exercise.category || '');
      
      // Favorites filter
      const matchesFavorites = !filters.showFavoritesOnly || 
        (preferences?.favorite_exercises || []).includes(exercise.id);
      
      // Recommendations filter
      const matchesRecommended = !filters.showRecommendedOnly || 
        recommendedExerciseIds.has(exercise.id);
      
      return matchesSearch && matchesDifficulty && matchesCategory && matchesFavorites && matchesRecommended;
    });

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (filters.sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'difficulty':
          comparison = a.difficulty_level - b.difficulty_level;
          break;
        case 'recommendation':
          const aRec = recommendations?.find(r => r.exercise_id === a.id);
          const bRec = recommendations?.find(r => r.exercise_id === b.id);
          const aScore = aRec?.confidence_score || 0;
          const bScore = bRec?.confidence_score || 0;
          comparison = bScore - aScore; // Higher scores first
          break;
        case 'performance':
          // Sort by whether user has performance data, then by best time
          const aHasPerf = (preferences?.favorite_exercises || []).includes(a.id);
          const bHasPerf = (preferences?.favorite_exercises || []).includes(b.id);
          if (aHasPerf && !bHasPerf) comparison = -1;
          else if (!aHasPerf && bHasPerf) comparison = 1;
          else comparison = 0;
          break;
      }
      
      return filters.sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [exercises, filters, preferences, recommendations, recommendedExerciseIds]);

  const topRecommendedExercises = useMemo(() => {
    if (!recommendations || !exercises) return [];
    
    return recommendations
      .slice(0, 3)
      .map(rec => {
        const exercise = exercises.find(ex => ex.id === rec.exercise_id);
        return exercise ? { ...exercise, recommendation: rec } : null;
      })
      .filter(Boolean);
  }, [recommendations, exercises]);

  const handleExerciseSelect = (exercise: Exercise, opts?: { quickStartDuration?: number }) => {
    // Get duration from options, user preferences, or default to 60 seconds
    const duration = opts?.quickStartDuration || preferences?.last_duration || 60;
    
    // Navigate to Home tab with selected exercise and duration
    if (onStartWorkout) {
      onStartWorkout(exercise.id, duration);
    } else {
      // Fallback to local timer if no onStartWorkout provided
      setSelectedExercise(exercise);
      if (opts?.quickStartDuration) {
        quickStartDurationRef.current = opts.quickStartDuration;
      } else {
        quickStartDurationRef.current = null;
      }
      setShowTimer(true);
    }
  };

  const handleViewDetails = (exercise: Exercise) => {
    setSelectedDetailsExercise(exercise);
    setShowDetailsModal(true);
  };

  const handleCloseDetails = () => {
    setShowDetailsModal(false);
    setSelectedDetailsExercise(null);
  };

  const handleStartFromDetails = (exercise: Exercise) => {
    setShowDetailsModal(false);
    setSelectedDetailsExercise(null);
    handleExerciseSelect(exercise);
  };

  const handleBackToList = () => {
    setShowTimer(false);
    setSelectedExercise(null);
    quickStartDurationRef.current = null;
  };

  const handleRefreshRecommendations = () => {
    generateRecommendations();
  };

  const handleToggleView = () => {
    setIsCompactView(prev => !prev);
  };

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const handleToggleFavorite = async (exerciseId: string) => {
    if (!preferences) return;
    
    const currentFavorites = preferences.favorite_exercises || [];
    const isFavorite = currentFavorites.includes(exerciseId);
    
    const updatedFavorites = isFavorite
      ? currentFavorites.filter(id => id !== exerciseId)
      : [...currentFavorites, exerciseId];
    
    await updatePreferences({ favorite_exercises: updatedFavorites });
  };

  const handleUpgradeClick = () => {
    const premiumPlan = plans?.find(plan => plan.name.toLowerCase().includes('premium'));
    if (premiumPlan) {
      upgrade(premiumPlan);
    }
  };

  const availableCategories = useMemo(() => {
    if (!exercises) return [];
    const categories = new Set(exercises.map(ex => ex.category).filter(Boolean));
    // Hide categories if there's only one unique category (all exercises are the same category)
    return categories.size > 1 ? Array.from(categories) : [];
  }, [exercises]);

  const availableTags = useMemo(() => {
    if (!exercises) return [];
    const tags = new Set(exercises.flatMap(ex => ex.tags || []).filter(Boolean));
    return Array.from(tags);
  }, [exercises]);

  if (exercisesLoading || recommendationsLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
          <p className="text-gray-600">Loading exercises...</p>
        </div>
      </div>
    );
  }

  if (showTimer && selectedExercise) {
    return (
      <div className="h-full">
        <PlankTimer 
          selectedExercise={selectedExercise}
          onExerciseChange={setSelectedExercise}
          onBack={handleBackToList}
          quickStartDuration={quickStartDurationRef.current || undefined}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {/* Smart Workout Selection */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-6 p-6 rounded-lg bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 cursor-pointer hover:bg-primary/15 transition-colors"
            onClick={handleUpgradeClick}
          >
            <h3 className="text-lg font-semibold text-primary hover:underline">
              Smart Workout Selection (Premium)
            </h3>
          </motion.div>

          {/* Background Music Player */}
          {preferences?.background_music && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="mb-6 flex justify-center"
            >
              <BackgroundMusicPlayer 
                isWorkoutActive={showTimer}
                className="w-full max-w-md"
              />
            </motion.div>
          )}

          {/* Custom Workouts */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-6 p-6 rounded-lg bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 cursor-pointer hover:bg-primary/15 transition-colors"
            onClick={handleUpgradeClick}
          >
            <h3 className="text-lg font-semibold text-primary hover:underline mb-2">
              Custom Workouts (Premium)
            </h3>
            <p className="text-sm text-muted-foreground">
              Create, edit, and save your own workouts
            </p>
          </motion.div>

          {/* Exercise Counter and View Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
          >
            <ExerciseCounter
              totalExercises={exercises?.length || 0}
              filteredCount={filteredExercises.length}
              isCompact={isCompactView}
              onToggleView={handleToggleView}
              hasScrollableContent={hasScrollableContent}
            />
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <ExerciseFilters 
              exercises={exercises || []}
              filters={filters} 
              onFiltersChange={handleFiltersChange}
              availableCategories={availableCategories}
              availableTags={availableTags}
              hasRecommendations={!!recommendations && recommendations.length > 0}
            />
          </motion.div>

          {/* Exercise Grid */}
          <motion.div
            ref={containerRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className={`relative ${
              isCompactView 
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3" 
                : "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4"
            }`}
          >
            {filteredExercises.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <p className="text-muted-foreground mb-4">No exercises found matching your criteria.</p>
                <Button 
                  onClick={() => setFilters({
                    search: '',
                    difficulty: [],
                    categories: [],
                    tags: [],
                    showFavoritesOnly: false,
                    showRecommendedOnly: false,
                    hasPerformanceData: null,
                    sortBy: 'difficulty',
                    sortOrder: 'asc',
                  })}
                  variant="outline"
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              filteredExercises.map((exercise, index) => (
                isCompactView ? (
                  <CompactExerciseCard
                    key={exercise.id}
                    exercise={exercise}
                    index={index}
                    onStart={() => handleExerciseSelect(exercise)}
                    onViewDetails={handleViewDetails}
                    recommendationType={recommendations?.find(rec => rec.exercise_id === exercise.id)?.recommendation_type}
                    confidenceScore={recommendations?.find(rec => rec.exercise_id === exercise.id)?.confidence_score}
                    isFavorite={(preferences?.favorite_exercises || []).includes(exercise.id)}
                    onToggleFavorite={() => handleToggleFavorite(exercise.id)}
                  />
                ) : (
                  <motion.div
                    key={exercise.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * index, duration: 0.3 }}
                  >
                    <EnhancedExerciseCard
                      exercise={exercise}
                      index={index}
                      onStart={() => handleExerciseSelect(exercise)}
                      onViewDetails={handleViewDetails}
                      recommendationType={recommendations?.find(rec => rec.exercise_id === exercise.id)?.recommendation_type}
                      confidenceScore={recommendations?.find(rec => rec.exercise_id === exercise.id)?.confidence_score}
                      isFavorite={(preferences?.favorite_exercises || []).includes(exercise.id)}
                      onToggleFavorite={() => handleToggleFavorite(exercise.id)}
                    />
                  </motion.div>
                )
              ))
            )}
            
            {/* Scroll gradient fade */}
            {hasScrollableContent && (
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent pointer-events-none" />
            )}
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Exercise Details Modal */}
      <ExerciseDetailsModal
        exercise={selectedDetailsExercise}
        isOpen={showDetailsModal}
        onClose={handleCloseDetails}
        onStart={handleStartFromDetails}
      />
    </div>
  );
};

export default WorkoutTab;
