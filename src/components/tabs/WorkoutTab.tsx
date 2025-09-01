import { useState, useMemo } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import type { Tables } from "@/integrations/supabase/types";
import FeatureGuard from "@/components/access/FeatureGuard";
import CustomWorkoutManager from "@/components/custom-workouts/CustomWorkoutManager";

type Exercise = Tables<'plank_exercises'>;

const WorkoutTab = () => {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [showTimer, setShowTimer] = useState(false);
  const [selectedDetailsExercise, setSelectedDetailsExercise] = useState<Exercise | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [isCompactView, setIsCompactView] = useState(false);
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

  const { hasScrollableContent, containerRef } = useScrollDetection();

  const { data: exercises, isLoading: exercisesLoading } = useExercises();
  const { recommendations, isLoading: recommendationsLoading, generateRecommendations, isGenerating } = useExerciseRecommendations();
  const { preferences, updatePreferences } = useUserPreferences();

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

  const handleExerciseSelect = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setShowTimer(true);
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
          {/* Header with Smart Recommendations */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-center mb-6"
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <h2 className="text-2xl font-bold text-gray-800">Smart Workout Selection</h2>
              <Button
                onClick={handleRefreshRecommendations}
                disabled={isGenerating}
                size="sm"
                variant="outline"
                className="ml-2"
              >
                {isGenerating ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-gray-600">
              Personalized exercises tailored to your progress and preferences
            </p>
          </motion.div>

          {/* Top Recommendations */}
          {topRecommendedExercises.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mb-8"
            >
              <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Sparkles className="w-5 h-5 mr-2 text-orange-500" />
                    Recommended for You
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {topRecommendedExercises.map((item, index) => {
                      if (!item) return null;
                      const { recommendation, ...exercise } = item;
                      return (
                        <motion.div
                          key={exercise.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * index, duration: 0.3 }}
                          className="flex items-center justify-between p-4 bg-white rounded-lg border border-orange-100 hover:border-orange-300 transition-all cursor-pointer group"
                          onClick={() => handleExerciseSelect(exercise as any)}
                        >
                          <div className="flex items-center space-x-4 flex-1">
                            <div className="w-12 h-12 rounded-lg bg-orange-500 flex items-center justify-center">
                              <Play className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h4 className="font-semibold text-gray-800">{(exercise as any).name}</h4>
                                <Badge variant="outline">
                                  Level {(exercise as any).difficulty_level}
                                </Badge>
                                <Badge className="bg-orange-100 text-orange-800">
                                  {Math.round((recommendation as any).confidence_score * 100)}% match
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 mb-1">{(exercise as any).description}</p>
                              <p className="text-xs text-orange-600 font-medium">
                                {(recommendation as any).reasoning}
                              </p>
                            </div>
                          </div>
                          <Button 
                            size="sm"
                            className="bg-orange-500 hover:bg-orange-600 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExerciseSelect(exercise as any);
                            }}
                          >
                            <Play className="w-4 h-4 mr-1" />
                            Start
                          </Button>
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Pro-Gated Custom Workout Manager */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <FeatureGuard
              feature="custom_workouts"
              fallback={
                <Card className="border-dashed">
                  <CardHeader>
                    <CardTitle>Custom Workouts (Pro)</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    Create, edit, and save your own workouts with Pro. Upgrade to unlock this feature.
                  </CardContent>
                </Card>
              }
            >
              <Card>
                <CardHeader>
                  <CardTitle>Custom Workouts (Pro)</CardTitle>
                </CardHeader>
                <CardContent>
                  <CustomWorkoutManager />
                </CardContent>
              </Card>
            </FeatureGuard>
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
                    sortBy: 'name',
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
