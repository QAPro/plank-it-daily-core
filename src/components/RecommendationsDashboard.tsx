
import { motion } from "framer-motion";
import { Sparkles, Clock, Target, Calendar, Trophy, RefreshCw, Heart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useExerciseRecommendations } from "@/hooks/useExerciseRecommendations";
import { useSessionStats } from "@/hooks/useSessionHistory";
import { useAuth } from "@/contexts/AuthContext";
import FlagGuard from '@/components/access/FlagGuard';
import type { Tables } from "@/integrations/supabase/types";

interface RecommendationsDashboardProps {
  onExerciseSelect?: (exerciseId: string) => void;
}

const RecommendationsDashboard = ({ onExerciseSelect }: RecommendationsDashboardProps) => {
  const { user } = useAuth();
  const { recommendations, isLoading, generateRecommendations, isGenerating } = useExerciseRecommendations();
  const { data: stats } = useSessionStats();

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'progressive_challenge': return Target;
      case 'beginner_friendly': return Heart;
      case 'variety_boost': return Sparkles;
      case 'skill_building': return Trophy;
      case 'streak_recovery': return Calendar;
      default: return Clock;
    }
  };

  const getRecommendationColor = (type: string) => {
    switch (type) {
      case 'progressive_challenge': return 'bg-red-500';
      case 'beginner_friendly': return 'bg-green-500';
      case 'variety_boost': return 'bg-purple-500';
      case 'skill_building': return 'bg-blue-500';
      case 'streak_recovery': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getRecommendationLabel = (type: string) => {
    switch (type) {
      case 'progressive_challenge': return 'Level Up';
      case 'beginner_friendly': return 'Beginner';
      case 'variety_boost': return 'Variety';
      case 'skill_building': return 'Skill Build';
      case 'streak_recovery': return 'Recovery';
      default: return 'Recommended';
    }
  };

  const getDifficultyColor = (level: number) => {
    switch (level) {
      case 1: return "text-green-600 bg-green-50";
      case 2: return "text-yellow-600 bg-yellow-50";
      case 3: return "text-orange-600 bg-orange-50";
      case 4: return "text-red-600 bg-red-50";
      case 5: return "text-purple-600 bg-purple-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  // Get daily workout suggestion
  const getDailyWorkoutSuggestion = () => {
    if (!stats || stats.thisWeekSessions === 0) {
      return {
        title: "Start Your Journey",
        description: "Begin with a gentle exercise to build your foundation",
        icon: Heart,
        color: "bg-green-500"
      };
    }

    const weeklyProgress = stats.thisWeekSessions / stats.weeklyGoal;
    
    if (weeklyProgress >= 1) {
      return {
        title: "Excellent Progress!",
        description: "You've reached your weekly goal. Try a challenge exercise!",
        icon: Trophy,
        color: "bg-gold-500"
      };
    } else if (weeklyProgress >= 0.7) {
      return {
        title: "Almost There!",
        description: "You're close to your weekly goal. Keep it up!",
        icon: Target,
        color: "bg-orange-500"
      };
    } else {
      return {
        title: "Build Your Streak",
        description: "Consistency is key. Let's get back on track!",
        icon: Calendar,
        color: "bg-blue-500"
      };
    }
  };

  const dailySuggestion = getDailyWorkoutSuggestion();
  const DailySuggestionIcon = dailySuggestion.icon;

  const handleGenerateRecommendations = () => {
    generateRecommendations();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="bg-white/80 backdrop-blur-sm border-orange-100">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <FlagGuard featureName="recommendations_dashboard">
      <div className="space-y-6">
        {/* Daily Suggestion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-gradient-to-br from-orange-500 to-amber-500 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                    <DailySuggestionIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{dailySuggestion.title}</h3>
                    <p className="text-orange-100">{dailySuggestion.description}</p>
                  </div>
                </div>
                <Button
                  onClick={handleGenerateRecommendations}
                  disabled={isGenerating}
                  size="sm"
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  {isGenerating ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Personalized Recommendations */}
        <Card className="bg-white/80 backdrop-blur-sm border-orange-100">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-orange-500" />
                Your Personalized Recommendations
              </span>
              {recommendations && recommendations.length > 0 && (
                <Badge variant="secondary">{recommendations.length} suggestions</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!recommendations || recommendations.length === 0 ? (
              <div className="text-center py-8">
                <Sparkles className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500 mb-4">No recommendations available yet</p>
                <Button onClick={handleGenerateRecommendations} disabled={isGenerating}>
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Get Recommendations
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recommendations.slice(0, 5).map((recommendation, index) => {
                  // Handle the case where exercises might be null or an error
                  const exercise = recommendation.exercises;
                  if (!exercise || typeof exercise !== 'object' || !('id' in exercise)) {
                    console.warn('Invalid exercise data:', exercise);
                    return null;
                  }
                  
                  const RecommendationIcon = getRecommendationIcon(recommendation.recommendation_type);
                  
                  return (
                    <motion.div
                      key={recommendation.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:border-orange-200 transition-all cursor-pointer group"
                      onClick={() => onExerciseSelect?.(exercise.id)}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-lg ${getRecommendationColor(recommendation.recommendation_type)} flex items-center justify-center`}>
                          <RecommendationIcon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-semibold text-gray-800">{exercise.name}</h4>
                            <Badge variant="outline" className={getDifficultyColor(exercise.difficulty_level)}>
                              Level {exercise.difficulty_level}
                            </Badge>
                            <Badge variant="secondary">
                              {getRecommendationLabel(recommendation.recommendation_type)}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">{exercise.description}</p>
                          <p className="text-xs text-gray-500">{recommendation.reasoning}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="text-right">
                          <div className="w-12 h-2 bg-gray-200 rounded-full">
                            <div 
                              className="h-2 bg-orange-500 rounded-full transition-all"
                              style={{ width: `${Math.round(recommendation.confidence_score * 100)}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {Math.round(recommendation.confidence_score * 100)}% match
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </FlagGuard>
  );
};

export default RecommendationsDashboard;
