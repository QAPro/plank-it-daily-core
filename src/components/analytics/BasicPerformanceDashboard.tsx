
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useExercisePerformance } from '@/hooks/useExercisePerformance';
import { useExtendedSessionHistory } from '@/hooks/useExtendedSessionHistory';
import { useSessionStats } from '@/hooks/useSessionHistory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PerformanceTrendChart from './charts/PerformanceTrendChart';
import WeeklyProgressChart from './charts/WeeklyProgressChart';
import ExerciseDistributionChart from './charts/ExerciseDistributionChart';
import PersonalRecordsCard from './PersonalRecordsCard';
import MilestonesCard from './MilestonesCard';
import { 
  generateTrendData, 
  generateExerciseDistribution, 
  findPersonalRecords, 
  calculateMilestones 
} from '@/utils/analyticsUtils';
import { logger } from '@/utils/productionLogger';

// Minimal metadata needed for display
type ExerciseMeta = {
  id: string;
  name: string;
  difficulty_level: number;
};

const BasicPerformanceDashboard: React.FC = () => {
  const { performanceData, isLoading: performanceLoading } = useExercisePerformance();
  const { data: extendedSessions, isLoading: sessionsLoading } = useExtendedSessionHistory(30);
  const { data: sessionStats, isLoading: statsLoading } = useSessionStats();

  const [exerciseMap, setExerciseMap] = useState<Record<string, ExerciseMeta>>({});
  const [isLoadingExercises, setIsLoadingExercises] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadExercises = async () => {
      setIsLoadingExercises(true);
      const { data, error } = await supabase
        .from('exercises')
        .select('id,name,difficulty_level');

      if (error) {
        logger.error('Error loading exercises', { error });
        if (isMounted) setExerciseMap({});
      } else if (isMounted) {
        const map: Record<string, ExerciseMeta> = {};
        (data ?? []).forEach((e: any) => {
          map[e.id] = { id: e.id, name: e.name, difficulty_level: e.difficulty_level };
        });
        setExerciseMap(map);
      }
      if (isMounted) setIsLoadingExercises(false);
    };

    loadExercises();
    return () => { isMounted = false; };
  }, []);

  const chartData = useMemo(() => {
    if (!extendedSessions) return {
      trendData: [],
      exerciseDistribution: [],
      personalRecords: [],
      milestones: []
    };

    const trendData = generateTrendData(extendedSessions);
    const exerciseDistribution = generateExerciseDistribution(extendedSessions);
    const personalRecords = findPersonalRecords(extendedSessions);
    const milestones = calculateMilestones(extendedSessions, sessionStats);

    return {
      trendData,
      exerciseDistribution,
      personalRecords,
      milestones
    };
  }, [extendedSessions, sessionStats]);

  const rows = useMemo(() => {
    return (performanceData ?? []).map((p) => {
      const meta = exerciseMap[p.exercise_id];
      return {
        id: p.id,
        exerciseId: p.exercise_id,
        exerciseName: meta?.name ?? 'Unknown exercise',
        difficulty: meta?.difficulty_level ?? undefined,
        best: p.best_duration_seconds,
        avg: p.average_duration_seconds,
        sessions: p.total_sessions,
      };
    });
  }, [performanceData, exerciseMap]);

  if (performanceLoading || sessionsLoading || statsLoading || isLoadingExercises) {
    return (
      <Card className="bg-background">
        <CardHeader>
          <CardTitle className="text-foreground">Performance Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground">Loading performance data...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Performance Trend Chart - Full Width */}
      <PerformanceTrendChart 
        data={chartData.trendData} 
        title="30-Day Performance Trend"
      />

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        <WeeklyProgressChart 
          data={sessionStats?.weeklyProgress || []} 
          goal={1}
        />
        <ExerciseDistributionChart data={chartData.exerciseDistribution} />
      </div>

      {/* Records and Training Stats Row */}
      <div className="grid gap-6 md:grid-cols-2">
        <PersonalRecordsCard records={chartData.personalRecords} />
        
        <Card className="bg-background">
          <CardHeader>
            <CardTitle className="text-foreground">Most Trained Exercises</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {rows
                .sort((a, b) => b.sessions - a.sessions)
                .slice(0, 8)
                .map((r) => (
                  <li key={r.id} className="flex items-center justify-between">
                    <span className="text-foreground">{r.exerciseName}</span>
                    <span className="text-muted-foreground">{r.sessions} sessions</span>
                  </li>
                ))}
              {rows.length === 0 && (
                <li className="text-muted-foreground">No sessions recorded yet.</li>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Milestones - Full Width */}
      <MilestonesCard milestones={chartData.milestones} />
    </div>
  );
};

export default BasicPerformanceDashboard;
