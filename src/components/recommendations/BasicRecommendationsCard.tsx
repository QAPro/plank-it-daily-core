
// No imports needed - using default export
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Clock, Target, Crown, Brain } from 'lucide-react';
import { useExercises } from '@/hooks/useExercises';
import { useSubscription } from '@/hooks/useSubscription';
import AIFeatureGuard from '@/components/access/AIFeatureGuard';

interface BasicRecommendationsCardProps {
  onExerciseSelect?: (exerciseId: string) => void;
}

const BasicRecommendationsCard: React.FC<BasicRecommendationsCardProps> = ({ 
  onExerciseSelect 
}) => {
  const { data: exercises } = useExercises();
  const { upgrade, plans } = useSubscription();

  const handleUpgrade = () => {
    const premiumPlan = plans.find(p => p.name.toLowerCase().includes('premium'));
    if (premiumPlan) {
      upgrade(premiumPlan);
    }
  };

  // Show basic beginner-friendly exercises for free users
  const basicRecommendations = exercises
    ?.filter(ex => ex.is_beginner_friendly && ex.difficulty_level <= 2)
    ?.slice(0, 3) || [];

  return (
    <div className="space-y-6">
      {/* Basic Daily Suggestion */}
      <Card className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <Heart className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Start Your Journey</h3>
                <p className="text-blue-100">Perfect exercises for beginners</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Basic Recommendations */}
      <Card className="bg-white/80 backdrop-blur-sm border-blue-100">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Target className="w-5 h-5 mr-2 text-blue-500" />
              Basic Recommendations
            </span>
            <Badge variant="secondary">Free</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {basicRecommendations.map((exercise, index) => (
              <div 
                key={exercise.id}
                className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:border-blue-200 transition-all cursor-pointer group"
                onClick={() => onExerciseSelect?.(exercise.id)}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-semibold text-gray-800">{exercise.name}</h4>
                      <Badge variant="outline" className="text-green-600 bg-green-50">
                        Level {exercise.difficulty_level}
                      </Badge>
                      <Badge variant="secondary">Beginner</Badge>
                    </div>
                    <p className="text-sm text-gray-600">{exercise.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Upgrade Teaser - Only show when AI is enabled */}
          <AIFeatureGuard>
            <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-orange-50 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Brain className="w-8 h-8 text-purple-500" />
                  <div>
                    <h4 className="font-semibold text-gray-800">Want Smarter Recommendations?</h4>
                    <p className="text-sm text-gray-600">Get AI-powered, personalized workout suggestions</p>
                  </div>
                </div>
                <Button onClick={handleUpgrade} size="sm">
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade
                </Button>
              </div>
            </div>
          </AIFeatureGuard>
        </CardContent>
      </Card>
    </div>
  );
};

export default BasicRecommendationsCard;
