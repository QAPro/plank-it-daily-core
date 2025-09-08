import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Calendar, 
  Target, 
  Heart, 
  Award,
  Sparkles 
} from 'lucide-react';

interface ProgressInsight {
  type: 'consistency' | 'improvement' | 'milestone' | 'effort' | 'growth';
  title: string;
  description: string;
  value: string;
  progress?: number;
  icon: React.ReactNode;
  color: string;
}

interface HolisticProgressCardProps {
  insights: ProgressInsight[];
  reflection?: {
    question: string;
    placeholder: string;
  };
  onReflectionSubmit?: (reflection: string) => void;
}

const HolisticProgressCard: React.FC<HolisticProgressCardProps> = ({
  insights,
  reflection,
  onReflectionSubmit
}) => {
  const [reflectionText, setReflectionText] = React.useState('');

  const handleReflectionSubmit = () => {
    if (reflectionText.trim() && onReflectionSubmit) {
      onReflectionSubmit(reflectionText.trim());
      setReflectionText('');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-500" />
          Your Journey Highlights
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Celebrating your effort and growth, not just results
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Insights */}
        <div className="space-y-3">
          {insights.map((insight, index) => (
            <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
              <div className={`p-2 rounded-full ${insight.color}`}>
                {insight.icon}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{insight.title}</h4>
                  <Badge variant="secondary" className="text-xs">
                    {insight.value}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {insight.description}
                </p>
                {insight.progress !== undefined && (
                  <Progress value={insight.progress} className="h-1.5 mt-2" />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Reflection Prompt */}
        {reflection && (
          <div className="border-t pt-4 mt-4">
            <div className="space-y-3">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Heart className="w-4 h-4 text-pink-500" />
                Take a moment to reflect
              </h4>
              <p className="text-sm text-muted-foreground">
                {reflection.question}
              </p>
              <textarea
                value={reflectionText}
                onChange={(e) => setReflectionText(e.target.value)}
                placeholder={reflection.placeholder}
                className="w-full p-3 text-sm border rounded-md resize-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                rows={3}
                maxLength={200}
              />
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">
                  {reflectionText.length}/200
                </span>
                <button
                  onClick={handleReflectionSubmit}
                  disabled={!reflectionText.trim()}
                  className="px-3 py-1 text-xs bg-primary text-primary-foreground rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
                >
                  Save Reflection
                </button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Helper function to generate progress insights
export const generateProgressInsights = (
  sessions: any[],
  streakData: any
): ProgressInsight[] => {
  const insights: ProgressInsight[] = [];
  const recentSessions = sessions.slice(0, 7); // Last 7 sessions
  
  // Consistency insight
  if (recentSessions.length > 0) {
    const weekdays = [...new Set(recentSessions.map(s => 
      new Date(s.completed_at).getDay()
    ))].length;
    
    insights.push({
      type: 'consistency',
      title: 'Building Consistency',
      description: `You've worked out on ${weekdays} different days this week`,
      value: `${weekdays}/7 days`,
      progress: (weekdays / 7) * 100,
      icon: <Calendar className="w-4 h-4" />,
      color: 'bg-blue-100 text-blue-600'
    });
  }

  // Effort-based celebration
  if (sessions.length > 0) {
    const totalSessions = sessions.length;
    let effortMessage = '';
    let effortValue = '';
    
    if (totalSessions >= 50) {
      effortMessage = 'Your dedication is inspiring! You\'ve shown up consistently';
      effortValue = `${totalSessions} sessions`;
    } else if (totalSessions >= 20) {
      effortMessage = 'You\'re building a strong foundation with regular practice';
      effortValue = `${totalSessions} sessions`;
    } else if (totalSessions >= 5) {
      effortMessage = 'Great start! You\'re developing a healthy habit';
      effortValue = `${totalSessions} sessions`;
    } else {
      effortMessage = 'Every session counts! You\'re on your way';
      effortValue = `${totalSessions} sessions`;
    }

    insights.push({
      type: 'effort',
      title: 'Effort Recognition',
      description: effortMessage,
      value: effortValue,
      icon: <Award className="w-4 h-4" />,
      color: 'bg-green-100 text-green-600'
    });
  }

  // Growth-focused insight
  if (sessions.length >= 3) {
    const firstThree = sessions.slice(-3);
    const lastThree = sessions.slice(0, 3);
    const oldAvg = firstThree.reduce((sum, s) => sum + s.duration_seconds, 0) / 3;
    const newAvg = lastThree.reduce((sum, s) => sum + s.duration_seconds, 0) / 3;
    
    if (newAvg > oldAvg) {
      const improvement = Math.round(((newAvg - oldAvg) / oldAvg) * 100);
      insights.push({
        type: 'improvement',
        title: 'Personal Growth',
        description: 'Your endurance has improved compared to when you started',
        value: `+${improvement}%`,
        icon: <TrendingUp className="w-4 h-4" />,
        color: 'bg-purple-100 text-purple-600'
      });
    } else {
      insights.push({
        type: 'growth',
        title: 'Building Strength',
        description: 'Focus on consistency - strength improvements take time',
        value: 'Growing',
        icon: <Target className="w-4 h-4" />,
        color: 'bg-orange-100 text-orange-600'
      });
    }
  }

  return insights;
};

export default HolisticProgressCard;