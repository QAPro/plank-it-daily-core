
import React from "react";
import { useMLInsights } from "@/hooks/useMLInsights";
import { useBenchmarking } from "@/hooks/useBenchmarking";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Activity, AlertTriangle, Target, Trophy } from "lucide-react";

const RiskPill = ({ label, value, tone }: { label: string; value: number; tone: "green" | "yellow" | "red" }) => {
  const cls =
    tone === "green"
      ? "bg-green-100 text-green-800 border-green-200"
      : tone === "yellow"
      ? "bg-yellow-100 text-yellow-800 border-yellow-200"
      : "bg-red-100 text-red-800 border-red-200";
  return (
    <Badge variant="outline" className={`${cls} text-xs font-medium`}>
      {label}: {Math.round(value)}%
    </Badge>
  );
};

const formatMins = (sec: number) => {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}m ${s}s`;
};

const MLInsightsPanel: React.FC = () => {
  const { data: insights, isLoading, error } = useMLInsights();
  const { data: bench, isLoading: bLoading } = useBenchmarking();

  if (isLoading || bLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>ML Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-2/3" />
        </CardContent>
      </Card>
    );
  }

  if (error || !insights) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>ML Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No insights available yet. Complete a few sessions to get predictions.</p>
        </CardContent>
      </Card>
    );
  }

  const plateauTone = insights.plateau_risk > 70 ? "red" : insights.plateau_risk > 50 ? "yellow" : "green";
  const injuryTone = insights.injury_risk > 70 ? "red" : insights.injury_risk > 50 ? "yellow" : "green";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          ML Insights & Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Predictions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 rounded-lg border bg-card">
            <div className="text-xs text-muted-foreground">Predicted Avg (7d)</div>
            <div className="text-xl font-semibold">{formatMins(insights.performance_prediction.next_7_day_avg)}</div>
          </div>
          <div className="p-3 rounded-lg border bg-card">
            <div className="text-xs text-muted-foreground">Predicted Avg (30d)</div>
            <div className="text-xl font-semibold">{formatMins(insights.performance_prediction.next_30_day_avg)}</div>
          </div>
          <div className="p-3 rounded-lg border bg-card">
            <div className="text-xs text-muted-foreground">Confidence</div>
            <div className="text-xl font-semibold">{Math.round(insights.performance_prediction.confidence * 100)}%</div>
          </div>
        </div>

        {/* Risks */}
        <div className="flex flex-wrap gap-2">
          <RiskPill label="Plateau risk" value={insights.plateau_risk} tone={plateauTone as any} />
          <RiskPill label="Injury risk" value={insights.injury_risk} tone={injuryTone as any} />
        </div>

        {/* Training Load */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 rounded-lg border bg-card">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Activity className="w-4 h-4" /> Recommended Sessions/Week
            </div>
            <div className="text-xl font-semibold">{insights.optimal_training_load.sessions_per_week}</div>
          </div>
          <div className="p-3 rounded-lg border bg-card">
            <div className="text-xs text-muted-foreground">Target Avg Duration</div>
            <div className="text-xl font-semibold">{formatMins(insights.optimal_training_load.avg_duration)}</div>
          </div>
          <div className="p-3 rounded-lg border bg-card">
            <div className="text-xs text-muted-foreground">Load Score</div>
            <div className="text-xl font-semibold">{insights.optimal_training_load.load_score}</div>
          </div>
        </div>

        {/* Benchmarking */}
        {bench && (
          <div className="p-3 rounded-lg border bg-card">
            <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
              <Trophy className="w-4 h-4" /> Comparative Benchmarking ({bench.segment})
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-xs">
                Duration percentile: {bench.percentile_duration ?? "-"}{bench.percentile_duration != null ? "th" : ""}
              </Badge>
              <Badge variant="outline" className="text-xs">
                Consistency percentile: {bench.percentile_consistency ?? "-"}{bench.percentile_consistency != null ? "th" : ""}
              </Badge>
              {bench.sample_size && (
                <Badge variant="secondary" className="text-xs">
                  Sample size: {bench.sample_size}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Goal Suggestions */}
        <div className="p-3 rounded-lg border bg-card">
          <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
            <Target className="w-4 h-4" /> Suggested Goals
          </div>
          {insights.goal_suggestions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No suggestions yet.</p>
          ) : (
            <ul className="space-y-2">
              {insights.goal_suggestions.map((g, i) => (
                <li key={i} className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="text-xs">{g.title}</Badge>
                  <span className="text-xs text-muted-foreground">
                    Target: {g.measurement_unit === "seconds" ? formatMins(g.target_value) : g.target_value} by {g.target_date}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Advisory */}
        {plateauTone !== "green" && (
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <AlertTriangle className="w-4 h-4 mt-0.5 text-amber-500" />
            Consider adding variety and progressive overload to avoid plateaus.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MLInsightsPanel;
