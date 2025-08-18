
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Brain, Clock, Trophy, TrendingUp, Activity, Target } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { SmartRecommendationsService } from '@/services/smartRecommendationsService';

const SmartRecommendationsPanel = () => {
  const { user } = useAuth();

  const { data: recommendations, isLoading } = useQuery({
    queryKey: ['smart-recommendations', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const service = new SmartRecommendationsService(user.id);
      return await service.generateSmartRecommendations();
    },
    enabled: !!user,
    staleTime: 15 * 60 * 1000, // Cache for 15 minutes
  });

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'progressive_challenge':
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'variety_boost':
        return <Activity className="w-5 h-5 text-purple-500" />;
      case 'optimal_timing':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'streak_recovery':
        return <Target className="w-5 h-5 text-orange-500" />;
      case 'challenge_mode':
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 'active_recovery':
        return <Activity className="w-5 h-5 text-green-400" />;
      case 'rest_day':
        return <Clock className="w-5 h-5 text-gray-500" />;
      default:
        return <Brain className="w-5 h-5 text-gray-500" />;
    }
  };

  const getRecommendationColor = (type: string) => {
    switch (type) {
      case 'progressive_challenge':
        return 'border-green-200 bg-green-50';
      case 'variety_boost':
        return 'border-purple-200 bg-purple-50';
      case 'optimal_timing':
        return 'border-blue-200 bg-blue-50';
      case 'streak_recovery':
        return 'border-orange-200 bg-orange-50';
      case 'challenge_mode':
        return 'border-yellow-200 bg-yellow-50';
      case 'active_recovery':
        return 'border-green-200 bg-green-50';
      case 'rest_day':
        return 'border-gray-200 bg-gray-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const formatRecommendationType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Smart Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Smart Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Brain className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">Complete more workouts to get personalized recommendations</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Check if rest day is recommended
  const restDayRecommendation = recommendations.find(r => r.rest_recommendation);

  if (restDayRecommendation) {
    return (
      <Card className="border-gray-300 bg-gray-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-600" />
            Rest Day Recommended
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Clock className="w-16 h-16 mx-auto text-gray-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Take a Rest Day</h3>
            <p className="text-gray-600 mb-4">{restDayRecommendation.reasoning}</p>
            <Badge variant="secondary" className="mb-4">
              {Math.round(restDayRecommendation.confidence_score * 100)}% Confidence
            </Badge>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• Light stretching or walking is okay</p>
              <p>• Stay hydrated and get good sleep</p>
              <p>• Come back stronger tomorrow!</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5" />
          Smart Recommendations
        </CardTitle>
        <p className="text-sm text-gray-600">AI-powered workout suggestions tailored for you</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recommendations.slice(0, 6).map((recommendation, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-2 ${getRecommendationColor(recommendation.recommendation_type)} transition-all hover:shadow-md`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  {getRecommendationIcon(recommendation.recommendation_type)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold">
                        {formatRecommendationType(recommendation.recommendation_type)}
                      </h4>
                      <Badge variant="outline" className="text-xs">
                        {Math.round(recommendation.confidence_score * 100)}% match
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-700 mb-3">
                      {recommendation.reasoning}
                    </p>
                    {recommendation.optimal_duration && (
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Clock className="w-3 h-3" />
                        <span>Suggested duration: {formatDuration(recommendation.optimal_duration)}</span>
                      </div>
                    )}
                  </div>
                </div>
                <Button 
                  size="sm" 
                  className="bg-orange-500 hover:bg-orange-600 shrink-0"
                >
                  Try Now
                </Button>
              </div>
            </div>
          ))}
        </div>

        {recommendations.length > 6 && (
          <div className="text-center mt-6">
            <Button variant="outline">
              View All {recommendations.length} Recommendations
            </Button>
          </div>
        )}

        {/* Recommendation Stats */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold mb-3 text-blue-800">Why These Recommendations?</h4>
          <div className="space-y-2 text-sm text-blue-700">
            <div>• Based on your workout history and performance patterns</div>
            <div>• Considers your current fitness level and preferences</div>
            <div>• Updated in real-time as you complete more sessions</div>
            <div>• Designed to optimize your progress and prevent plateaus</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SmartRecommendationsPanel;
