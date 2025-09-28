import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Trophy, Zap, Lightbulb, Star, TrendingUp, Calendar } from 'lucide-react';
import { useWorkoutVictoryLogs } from '@/hooks/useWorkoutVictoryLogs';
import { motion, AnimatePresence } from 'framer-motion';

const VictoryChronicles = () => {
  const { victoryLogs, loading, getVictoryInsights } = useWorkoutVictoryLogs();
  const insights = getVictoryInsights();

  const victoryLevelLabels = {
    1: { label: 'Good Start', color: 'bg-blue-100 text-blue-800', emoji: '💪' },
    2: { label: 'Solid Victory', color: 'bg-green-100 text-green-800', emoji: '⭐' },
    3: { label: 'Great Success', color: 'bg-yellow-100 text-yellow-800', emoji: '🌟' },
    4: { label: 'Epic Win', color: 'bg-orange-100 text-orange-800', emoji: '🔥' },
    5: { label: 'Total Victory!', color: 'bg-red-100 text-red-800', emoji: '🏆' },
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BookOpen className="w-5 h-5 mr-2 text-primary" />
            Your Victory Chronicles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-muted rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (victoryLogs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BookOpen className="w-5 h-5 mr-2 text-primary" />
            Your Victory Chronicles
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-12">
          <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Start Your Success Story!</h3>
          <p className="text-muted-foreground mb-6">
            Begin logging your victories, insights, and breakthrough moments to build your personal success chronicle.
          </p>
          <p className="text-sm text-muted-foreground">
            Complete a workout to start recording your victory stories!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Victory Insights Overview */}
      {insights && (
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-primary" />
              Your Victory Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{insights.totalVictoryLogs}</div>
                <div className="text-sm text-muted-foreground">Victory Stories</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{insights.totalBreakthroughs}</div>
                <div className="text-sm text-muted-foreground">Breakthroughs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{insights.avgVictoryLevel}/5</div>
                <div className="text-sm text-muted-foreground">Avg Victory Level</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">+{insights.avgEnergyGain}</div>
                <div className="text-sm text-muted-foreground">Avg Energy Boost</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Victory Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-primary" />
              Success Chronicle
            </div>
            <Badge variant="secondary">{victoryLogs.length} Victory Stories</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <AnimatePresence>
              {victoryLogs.map((log, index) => {
                const victoryLevel = victoryLevelLabels[log.victory_level as keyof typeof victoryLevelLabels];
                return (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border rounded-lg p-4 bg-card hover:bg-accent/50 transition-colors"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-muted-foreground mr-2" />
                        <span className="text-sm text-muted-foreground">
                          {new Date(log.created_at).toLocaleDateString()}
                        </span>
                        {log.breakthrough_achieved && (
                          <Badge className="ml-3 bg-purple-100 text-purple-800">
                            <Star className="w-3 h-3 mr-1" />
                            Breakthrough!
                          </Badge>
                        )}
                      </div>
                      <Badge className={victoryLevel.color}>
                        {victoryLevel.emoji} {victoryLevel.label}
                      </Badge>
                    </div>

                    {/* Today's Win */}
                    {log.todays_win && (
                      <div className="mb-4">
                        <div className="flex items-center mb-2">
                          <Trophy className="w-4 h-4 text-yellow-500 mr-2" />
                          <span className="font-semibold text-sm">Today's Victory</span>
                        </div>
                        <p className="text-sm bg-yellow-50 p-3 rounded border border-yellow-200">
                          {log.todays_win}
                        </p>
                      </div>
                    )}

                    {/* Power Moments */}
                    {log.power_moments && log.power_moments.length > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center mb-2">
                          <Zap className="w-4 h-4 text-orange-500 mr-2" />
                          <span className="font-semibold text-sm">Power Moments</span>
                        </div>
                        <div className="space-y-2">
                          {log.power_moments.map((moment, momentIndex) => (
                            <p key={momentIndex} className="text-sm bg-orange-50 p-2 rounded border border-orange-200">
                              {moment}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Growth Insights */}
                    {log.growth_insights && (
                      <div className="mb-4">
                        <div className="flex items-center mb-2">
                          <Lightbulb className="w-4 h-4 text-blue-500 mr-2" />
                          <span className="font-semibold text-sm">Growth Insights</span>
                        </div>
                        <p className="text-sm bg-blue-50 p-3 rounded border border-blue-200">
                          {log.growth_insights}
                        </p>
                      </div>
                    )}

                    {/* Energy Change */}
                    {log.energy_before && log.energy_after && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center">
                            <TrendingUp className="w-4 h-4 text-green-500 mr-2" />
                            <span className="font-semibold">Energy Transformation</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-muted-foreground">{log.energy_before}/10</span>
                            <span>→</span>
                            <span className="font-semibold text-green-600">{log.energy_after}/10</span>
                            <Badge variant="secondary" className="text-xs">
                              +{log.energy_after - log.energy_before}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Victory Notes */}
                    {log.victory_notes && (
                      <div>
                        <div className="flex items-center mb-2">
                          <BookOpen className="w-4 h-4 text-purple-500 mr-2" />
                          <span className="font-semibold text-sm">Victory Notes</span>
                        </div>
                        <p className="text-sm bg-purple-50 p-3 rounded border border-purple-200">
                          {log.victory_notes}
                        </p>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VictoryChronicles;