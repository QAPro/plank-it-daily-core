import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Heart, Target, Calendar, Award } from 'lucide-react';

interface ProgressHighlight {
  type: 'consistency' | 'improvement' | 'effort' | 'growth';
  title: string;
  description: string;
  value: string;
  trend: 'up' | 'stable' | 'building';
  color: string;
}

interface ProgressAppreciationCardProps {
  highlights: ProgressHighlight[];
  totalSessions: number;
  recentStreak: number;
}

const ProgressAppreciationCard: React.FC<ProgressAppreciationCardProps> = ({
  highlights,
  totalSessions,
  recentStreak
}) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'consistency': return <Calendar className="w-4 h-4" />;
      case 'improvement': return <TrendingUp className="w-4 h-4" />;
      case 'effort': return <Award className="w-4 h-4" />;
      case 'growth': return <Target className="w-4 h-4" />;
      default: return <Heart className="w-4 h-4" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '📈';
      case 'stable': return '🎯';
      case 'building': return '🏗️';
      default: return '✨';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-pink-500" />
          Progress Appreciation
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Your journey matters - celebrating growth over perfection
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Progress Summary */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{totalSessions}</div>
            <div className="text-xs text-muted-foreground">Sessions Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{recentStreak}</div>
            <div className="text-xs text-muted-foreground">Current Streak</div>
          </div>
        </div>

        {/* Progress Highlights */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">What's going well:</h4>
          {highlights.map((highlight, index) => (
            <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/20">
              <div className={`p-2 rounded-full ${highlight.color}`}>
                {getIcon(highlight.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h5 className="font-medium text-sm">{highlight.title}</h5>
                  <div className="flex items-center gap-1">
                    <span className="text-lg">{getTrendIcon(highlight.trend)}</span>
                    <Badge variant="secondary" className="text-xs">
                      {highlight.value}
                    </Badge>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {highlight.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Motivational Message */}
        <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-4 h-4 text-green-600" />
            <span className="font-medium text-sm text-green-800">Keep Growing</span>
          </div>
          <p className="text-sm text-green-700">
            Every session is progress. Every effort counts. You're building something meaningful - a healthier, stronger you. 💪
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

// Helper function to generate progress highlights
export const generateProgressHighlights = (
  sessions: any[],
  streakData: any
): ProgressHighlight[] => {
  const highlights: ProgressHighlight[] = [];
  
  // Consistency highlight
  if (sessions.length >= 5) {
    const recentDays = [...new Set(sessions.slice(0, 7).map(s => 
      new Date(s.completed_at).toDateString()
    ))].length;
    
    highlights.push({
      type: 'consistency',
      title: 'Building Consistency',
      description: `You've worked out on ${recentDays} different days recently`,
      value: `${recentDays} days`,
      trend: recentDays >= 4 ? 'up' : 'building',
      color: 'bg-blue-100 text-blue-600'
    });
  }

  // Effort highlight
  highlights.push({
    type: 'effort',
    title: 'Commitment Recognized',
    description: 'You keep showing up, and that\'s what creates lasting change',
    value: `${sessions.length} total`,
    trend: 'stable',
    color: 'bg-purple-100 text-purple-600'
  });

  return highlights;
};

export default ProgressAppreciationCard;