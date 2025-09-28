

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, TrendingUp, TrendingDown, Minus, Target, Zap } from 'lucide-react';

type LeagueOverviewProps = {
  league: {
    id: string;
    name: string;
    league_type: string;
    joined: boolean;
    participant?: {
      current_rating: number;
      peak_rating: number;
      matches_played: number;
      matches_won: number;
      current_streak: number;
      season_points: number;
    } | null;
    divisions: Array<{
      id: string;
      division_name: string;
      division_level: number;
      min_rating: number | null;
      max_rating: number | null;
    }>;
  };
};

const LeagueOverview = ({ league }: LeagueOverviewProps) => {
  if (!league.joined || !league.participant) {
    return null;
  }

  const { participant } = league;
  const winRate = participant.matches_played > 0 ? (participant.matches_won / participant.matches_played) * 100 : 0;
  
  // Find current division
  const currentDivision = league.divisions.find(div => 
    (!div.min_rating || participant.current_rating >= div.min_rating) &&
    (!div.max_rating || participant.current_rating <= div.max_rating)
  ) || league.divisions[0];

  // Calculate promotion/relegation progress
  const promotionTarget = currentDivision?.max_rating;
  const relegationThreat = currentDivision?.min_rating;
  
  const getPromotionProgress = () => {
    if (!promotionTarget || !relegationThreat) return 0;
    const range = promotionTarget - relegationThreat;
    const progress = participant.current_rating - relegationThreat;
    return Math.max(0, Math.min(100, (progress / range) * 100));
  };

  const getRatingTrend = () => {
    const diff = participant.current_rating - participant.peak_rating;
    if (diff > 0) return { icon: TrendingUp, color: 'text-green-500', text: 'Peak Rating!' };
    if (diff > -50) return { icon: Minus, color: 'text-yellow-500', text: 'Stable' };
    return { icon: TrendingDown, color: 'text-red-500', text: 'Below Peak' };
  };

  const getTrend = getRatingTrend();
  const TrendIcon = getTrend.icon;

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              {league.name}
            </CardTitle>
            <CardDescription>Your competitive standing</CardDescription>
          </div>
          <Badge variant="outline" className="font-semibold">
            {currentDivision?.division_name || 'Unranked'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {/* Current Rating */}
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{participant.current_rating}</div>
            <div className="text-sm text-blue-700 flex items-center justify-center gap-1">
              <TrendIcon className={`w-3 h-3 ${getTrend.color}`} />
              Current Rating
            </div>
          </div>

          {/* Win Rate */}
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{winRate.toFixed(0)}%</div>
            <div className="text-sm text-green-700">Win Rate</div>
            <div className="text-xs text-gray-500">{participant.matches_won}/{participant.matches_played}</div>
          </div>

          {/* Current Streak */}
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600 flex items-center justify-center gap-1">
              <Zap className="w-5 h-5" />
              {participant.current_streak}
            </div>
            <div className="text-sm text-orange-700">Current Streak</div>
          </div>

          {/* Season Points */}
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{participant.season_points}</div>
            <div className="text-sm text-purple-700">Season Points</div>
          </div>
        </div>

        {/* Division Progress */}
        {promotionTarget && relegationThreat && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium flex items-center gap-1">
                <Target className="w-4 h-4" />
                Division Progress
              </span>
              <span className="text-sm text-gray-600">
                {participant.current_rating} / {promotionTarget} for promotion
              </span>
            </div>
            <Progress value={getPromotionProgress()} className="h-3" />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Relegation: {relegationThreat}</span>
              <span>Promotion: {promotionTarget}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LeagueOverview;
