
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Benchmark = Tables<'performance_benchmarks'>;
type Session = Tables<'user_sessions'>;

interface BenchmarkingResult {
  percentile_duration: number | null;
  percentile_consistency: number | null;
  sample_size: number | null;
  segment: string;
}

function estimatePercentile(value: number, percentiles: Record<string, number>): number {
  // percentiles keys: p10, p25, p50, p75, p90
  const keys = ["p10", "p25", "p50", "p75", "p90"] as const;
  const pts = keys.map(k => ({ p: Number(k.slice(1)), v: Number(percentiles[k] ?? 0) })).sort((a, b) => a.v - b.v);

  if (value <= pts[0].v) return 5;
  if (value >= pts[pts.length - 1].v) return 95;

  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i];
    const b = pts[i + 1];
    if (value >= a.v && value <= b.v) {
      const t = (value - a.v) / Math.max(1, (b.v - a.v));
      return Math.round(a.p + t * (b.p - a.p));
    }
  }
  return 50;
}

export const useBenchmarking = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["benchmarking", user?.id],
    enabled: !!user,
    staleTime: 10 * 60 * 1000,
    queryFn: async (): Promise<BenchmarkingResult | null> => {
      if (!user) return null;

      const start30 = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();
      const { data: sessions, error: sesErr } = await supabase
        .from("user_sessions")
        .select("*")
        .eq("user_id", user.id)
        .gte("completed_at", start30);

      if (sesErr) throw sesErr;

      const totalDuration = (sessions || []).reduce((s, x) => s + (x.duration_seconds || 0), 0);
      const daysSet = new Set<string>();
      (sessions || []).forEach(s => {
        if (s.completed_at) daysSet.add(s.completed_at.split("T")[0]);
      });
      const sessionsCount = sessions?.length || 0;
      const avgDuration = sessionsCount > 0 ? totalDuration / sessionsCount : 0;
      const daysActive = daysSet.size;

      // Pick a simple segment based on activity level
      const segment = sessionsCount > 15 ? "intermediate_30-90_days" : "beginner_0-30_days";

      const { data: durationBench, error: dErr } = await supabase
        .from("performance_benchmarks")
        .select("*")
        .eq("user_segment", segment)
        .eq("metric_type", "duration")
        .limit(1)
        .maybeSingle();

      if (dErr) throw dErr;

      const { data: consistencyBench, error: cErr } = await supabase
        .from("performance_benchmarks")
        .select("*")
        .eq("user_segment", segment)
        .eq("metric_type", "consistency")
        .limit(1)
        .maybeSingle();

      if (cErr) throw cErr;

      const pDuration = durationBench
        ? estimatePercentile(avgDuration, (durationBench.percentile_data as any) || {})
        : null;

      const pConsistency = consistencyBench
        ? estimatePercentile(daysActive, (consistencyBench.percentile_data as any) || {})
        : null;

      return {
        percentile_duration: pDuration,
        percentile_consistency: pConsistency,
        sample_size: (durationBench?.sample_size ?? consistencyBench?.sample_size) || null,
        segment,
      };
    },
  });
};
