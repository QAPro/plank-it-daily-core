import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import EnhancedExerciseCard from "@/components/EnhancedExerciseCard";
import ExerciseFilters from "@/components/ExerciseFilters";
import PlankTimer from "@/components/PlankTimer";
import ExerciseDetailsModal from "@/components/ExerciseDetailsModal";
import { useExercises } from "@/hooks/useExercises";
import { useExerciseRecommendations } from "@/hooks/useExerciseRecommendations";
import { Skeleton } from "@/components/ui/skeleton";
import type { Tables } from "@/integrations/supabase/types";
import FeatureGuard from "@/components/access/FeatureGuard";
import CustomWorkoutManager from "@/components/custom-workouts/CustomWorkoutManager";

type Exercise = Tables<'plank_exercises'>;

// Define a simple filter state that matches what we actually use
interface SimpleFilters {
  difficulty: string;
  category: string;
  searchTerm: string;
}

const WorkoutTab = () => {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [showTimer, setShowTimer] = useState(false);
  const [selectedDetailsExercise, setSelectedDetailsExercise] = useState<Exercise | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [filters, setFilters] = useState<SimpleFilters>({
    difficulty: 'all',
    category: 'all',
    searchTerm: '',
  });

  const { data: exercises, isLoading: exercisesLoading } = useExercises();
  const { recommendations, isLoading: recommendationsLoading, generateRecommendations, isGenerating } = useExerciseRecommendations();

  const filteredExercises = useMemo(() => {
    if (!exercises) return [];
    
    return exercises.filter((exercise) => {
      const matchesDifficulty = filters.difficulty === 'all' || exercise.difficulty_level.toString() === filters.difficulty;
      const matchesCategory = filters.category === 'all' || exercise.category === filters.category;
      const matchesSearch = filters.searchTerm === '' || 
        exercise.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        exercise.description?.toLowerCase().includes(filters.searchTerm.toLowerCase());
      
      return matchesDifficulty && matchesCategory && matchesSearch;
    });
  }, [exercises, filters]);

  const recommendedExerciseIds = useMemo(() => {
    if (!recommendations) return new Set<string>();
    return new Set(recommendations.map(rec => rec.exercise_id));
  }, [recommendations]);

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

  // Convert simple filters to the format expected by ExerciseFilters
  const convertToFilterState = (simpleFilters: SimpleFilters) => ({
    search: simpleFilters.searchTerm,
    difficulty: simpleFilters.difficulty === 'all' ? [] : [parseInt(simpleFilters.difficulty)],
    categories: simpleFilters.category === 'all' ? [] : [simpleFilters.category],
    tags: [],
    showFavoritesOnly: false,
    showRecommendedOnly: false,
    hasPerformanceData: null,
    sortBy: 'name' as const,
    sortOrder: 'asc' as const
  });

  const handleFiltersChange = (newFilters: any) => {
    setFilters({
      difficulty: newFilters.difficulty?.length > 0 ? newFilters.difficulty[0].toString() : 'all',
      category: newFilters.categories?.length > 0 ? newFilters.categories[0] : 'all',
      searchTerm: newFilters.search || '',
    });
  };

  const availableCategories = useMemo(() => {
    if (!exercises) return [];
    const categories = new Set(exercises.map(ex => ex.category).filter(Boolean));
    return Array.from(categories);
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

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <ExerciseFilters 
              exercises={exercises || []}
              filters={convertToFilterState(filters)} 
              onFiltersChange={handleFiltersChange}
              availableCategories={availableCategories}
              availableTags={availableTags}
              hasRecommendations={!!recommendations && recommendations.length > 0}
            />
          </motion.div>

          {/* Exercise Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {filteredExercises.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-500 mb-4">No exercises found matching your criteria.</p>
                <Button 
                  onClick={() => setFilters({ difficulty: 'all', category: 'all', searchTerm: '' })}
                  variant="outline"
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              filteredExercises.map((exercise, index) => (
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
                  />
                </motion.div>
              ))
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
