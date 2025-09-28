
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useExercisePerformance } from '@/hooks/useExercisePerformance';
import { useExtendedSessionHistory } from '@/hooks/useExtendedSessionHistory';
import { useSessionStats } from '@/hooks/useSessionHistory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PerformanceTrendChart from './charts/PerformanceTrendChart';
import PersonalRecordsCard from './PersonalRecordsCard';
import { 
  generateTrendData, 
  findPersonalRecords
} from '@/utils/analyticsUtils';
import { logger } from '@/utils/productionLogger';

// Minimal metadata needed for display
type ExerciseMeta = {
  id: string;
  name: string;
  difficulty_level: number;
};

const CondensedPerformanceDashboard: React.FC = () => {
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
        .from('plank_exercises')
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
      personalRecords: []
    };

    const trendData = generateTrendData(extendedSessions);
    const personalRecords = findPersonalRecords(extendedSessions);

    return {
      trendData,
      personalRecords
    };
  }, [extendedSessions]);

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
          <CardTitle className="text-foreground">Performance Overview</CardTitle>
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
        title="Recent Performance Trend"
      />

      {/* Condensed Summary Row */}
      <div className="grid gap-6 md:grid-cols-2">
        <PersonalRecordsCard records={chartData.personalRecords} />
        
        <Card className="bg-background">
          <CardHeader>
            <CardTitle className="text-foreground">Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Sessions</span>
                <span className="text-foreground font-semibold">{sessionStats?.totalSessions || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">This Week</span>
                <span className="text-foreground font-semibold">{sessionStats?.thisWeekSessions || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Weekly Goal Progress</span>
                <span className="text-foreground font-semibold">
                  {sessionStats?.thisWeekSessions || 0}/{sessionStats?.weeklyGoal || 7}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Top Exercise</span>
                <span className="text-foreground font-semibold">
                  {rows.length > 0 
                    ? rows.sort((a, b) => b.sessions - a.sessions)[0]?.exerciseName || 'None'
                    : 'None'
                  }
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CondensedPerformanceDashboard;
