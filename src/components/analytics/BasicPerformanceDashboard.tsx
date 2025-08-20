
import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useExercisePerformance } from '@/hooks/useExercisePerformance';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Minimal metadata needed for display
type ExerciseMeta = {
  id: string;
  name: string;
  difficulty_level: number;
};

const BasicPerformanceDashboard: React.FC = () => {
  const { performanceData, isLoading } = useExercisePerformance();

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
        console.error('Error loading exercises:', error);
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

  if (isLoading || isLoadingExercises) {
    return (
      <Card className="bg-background">
        <CardHeader>
          <CardTitle className="text-foreground">Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="bg-background">
        <CardHeader>
          <CardTitle className="text-foreground">Top Personal Bests</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {rows
              .sort((a, b) => b.best - a.best)
              .slice(0, 8)
              .map((r) => (
                <li key={r.id} className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">{r.exerciseName}</span>
                    {typeof r.difficulty === 'number' && (
                      <span className="text-xs text-muted-foreground">Difficulty: {r.difficulty}</span>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-foreground">{r.best}s</div>
                    <div className="text-xs text-muted-foreground">Avg {r.avg}s • {r.sessions} sessions</div>
                  </div>
                </li>
              ))}
            {rows.length === 0 && (
              <li className="text-muted-foreground">No performance data yet.</li>
            )}
          </ul>
        </CardContent>
      </Card>

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
  );
};

export default BasicPerformanceDashboard;
