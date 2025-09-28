
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Moon, 
  Coffee, 
  Bath, 
  Book, 
  Heart, 
  Calendar,
  Clock,
  CheckCircle
} from 'lucide-react';

interface RestRecommendation {
  type: 'needed' | 'optional' | 'scheduled';
  title: string;
  reason: string;
  daysSinceRest: number;
  suggestions: RestActivity[];
}

interface RestActivity {
  id: string;
  name: string;
  duration: string;
  icon: React.ReactNode;
  benefits: string[];
}

interface RestDayRecommendationProps {
  recommendation: RestRecommendation;
  onLogRestDay?: () => void;
  onScheduleRest?: () => void;
}

const RestDayRecommendation: React.FC<RestDayRecommendationProps> = ({
  recommendation,
  onLogRestDay,
  onScheduleRest
}) => {
  const restActivities: RestActivity[] = [
    {
      id: 'gentle-walk',
      name: 'Gentle Walk',
      duration: '15-20 min',
      icon: <Moon className="w-4 h-4" />,
      benefits: ['Light movement', 'Fresh air', 'Mental clarity']
    },
    {
      id: 'reading',
      name: 'Reading Time',
      duration: '30-60 min',
      icon: <Book className="w-4 h-4" />,
      benefits: ['Mental relaxation', 'Stress relief', 'Learning']
    },
    {
      id: 'warm-bath',
      name: 'Warm Bath',
      duration: '20-30 min',
      icon: <Bath className="w-4 h-4" />,
      benefits: ['Muscle relaxation', 'Better sleep', 'Stress relief']
    },
    {
      id: 'coffee-time',
      name: 'Mindful Coffee/Tea',
      duration: '10-15 min',
      icon: <Coffee className="w-4 h-4" />,
      benefits: ['Mindfulness', 'Moment of peace', 'Reflection']
    }
  ];

  const getTypeColor = () => {
    switch (recommendation.type) {
      case 'needed':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'optional':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'scheduled':
        return 'bg-green-100 text-green-700 border-green-200';
    }
  };

  const getTypeIcon = () => {
    switch (recommendation.type) {
      case 'needed':
        return <Clock className="w-4 h-4" />;
      case 'optional':
        return <Calendar className="w-4 h-4" />;
      case 'scheduled':
        return <CheckCircle className="w-4 h-4" />;
    }
  };

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Heart className="w-5 h-5 text-blue-500" />
            {recommendation.title}
          </CardTitle>
          <Badge className={getTypeColor()}>
            {getTypeIcon()}
            <span className="ml-1 capitalize">{recommendation.type}</span>
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {recommendation.reason}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm">
          <span className="font-medium">Days since rest: </span>
          <Badge variant="outline">{recommendation.daysSinceRest}</Badge>
        </div>

        {/* Rest Activity Suggestions */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Suggested rest activities:</h4>
          <div className="grid gap-2">
            {restActivities.map((activity) => (
              <div 
                key={activity.id} 
                className="p-3 rounded-lg border bg-muted/20 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                    {activity.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h5 className="font-medium text-sm">{activity.name}</h5>
                      <Badge variant="secondary" className="text-xs">
                        {activity.duration}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {activity.benefits.map((benefit, index) => (
                        <span 
                          key={index} 
                          className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded"
                        >
                          {benefit}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t">
          {onLogRestDay && (
            <Button 
              variant="outline" 
              onClick={onLogRestDay}
              className="flex-1"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Log Rest Day
            </Button>
          )}
          {onScheduleRest && (
            <Button 
              onClick={onScheduleRest}
              className="flex-1"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Rest
            </Button>
          )}
        </div>

        <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
          <strong>Remember:</strong> Rest is part of progress! Your body and mind need time to recover and grow stronger. 💙
        </div>
      </CardContent>
    </Card>
  );
};

// Helper function to determine rest recommendation
export const generateRestRecommendation = (
  sessions: any[], 
  lastRestDay?: string
): RestRecommendation | null => {
  if (!sessions.length) return null;

  const recentSessions = sessions.slice(0, 7); // Last 7 sessions
  const lastRestDate = lastRestDay ? new Date(lastRestDay) : null;
  const lastSessionDate = new Date(sessions[0].completed_at);
  
  // Calculate days since last rest
  const daysSinceRest = lastRestDate 
    ? Math.floor((Date.now() - lastRestDate.getTime()) / (1000 * 60 * 60 * 24))
    : 7; // Default to 7 if no rest tracked

  // Determine recommendation type
  if (daysSinceRest >= 6) {
    return {
      type: 'needed',
      title: 'Rest Day Recommended',
      reason: 'You\'ve been consistent with your workouts! Time for some well-deserved rest.',
      daysSinceRest,
      suggestions: []
    };
  } else if (daysSinceRest >= 4) {
    return {
      type: 'optional',
      title: 'Consider a Rest Day',
      reason: 'You might benefit from some recovery time to keep building strength.',
      daysSinceRest,
      suggestions: []
    };
  } else if (recentSessions.length === 0) {
    return {
      type: 'scheduled',
      title: 'Rest Day Active',
      reason: 'Taking time to recover - this is part of your healthy routine!',
      daysSinceRest: 0,
      suggestions: []
    };
  }

  return null;
};

export default RestDayRecommendation;