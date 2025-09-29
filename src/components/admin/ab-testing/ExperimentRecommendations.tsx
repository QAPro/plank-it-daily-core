import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Lightbulb, 
  TrendingUp, 
  Target,
  Clock,
  Users,
  Zap,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { ExperimentRecommendation, enhancedABTestingService } from "@/services/enhancedABTestingService";
import { ABTestExperiment } from "@/services/abTestingService";

interface ExperimentRecommendationsProps {
  onCreateExperiment: (experiment: Partial<ABTestExperiment>) => void;
}

export const ExperimentRecommendations = ({ onCreateExperiment }: ExperimentRecommendationsProps) => {
  const [recommendations, setRecommendations] = useState<ExperimentRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissedRecommendations, setDismissedRecommendations] = useState<Set<string>>(new Set());

  useEffect(() => {
    // AI recommendations disabled - requires ML integration
    setLoading(false);
    setRecommendations([]);
  }, []);

  const getPriorityColor = (score: number) => {
    if (score >= 80) return 'bg-red-500';
    if (score >= 60) return 'bg-orange-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPriorityLabel = (score: number) => {
    if (score >= 80) return 'High';
    if (score >= 60) return 'Medium';
    if (score >= 40) return 'Low';
    return 'Very Low';
  };

  const getTestTypeIcon = (testType: string) => {
    switch (testType) {
      case 'button-optimization':
        return <Target className="h-4 w-4" />;
      case 'pricing-test':
        return <TrendingUp className="h-4 w-4" />;
      case 'feature-adoption':
        return <Zap className="h-4 w-4" />;
      default:
        return <Lightbulb className="h-4 w-4" />;
    }
  };

  const handleCreateFromRecommendation = (recommendation: ExperimentRecommendation) => {
    const experiment: Partial<ABTestExperiment> = {
      experiment_name: `${recommendation.feature_name.replace('_', ' ')} Optimization`,
      experiment_description: `${recommendation.reasoning}. Expected impact: ${recommendation.estimated_impact}% improvement.`,
      hypothesis: `Optimizing ${recommendation.feature_name.replace('_', ' ')} will improve ${recommendation.recommended_metrics[0].replace('_', ' ')} because ${recommendation.reasoning.toLowerCase()}`,
      success_metric: recommendation.recommended_metrics[0],
      traffic_split: { control: 50, variant_a: 50 },
      minimum_sample_size: recommendation.priority_score * 50, // Scale based on priority
      test_duration_days: 14,
      significance_threshold: 0.95,
      status: 'draft'
    };

    onCreateExperiment(experiment);
  };

  const handleDismiss = (featureName: string) => {
    setDismissedRecommendations(prev => new Set([...prev, featureName]));
  };

  const visibleRecommendations = recommendations.filter(
    rec => !dismissedRecommendations.has(rec.feature_name)
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">Loading recommendations...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          AI Experiment Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <div className="bg-muted rounded-lg p-6">
            <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">AI Recommendations Not Yet Implemented</h3>
            <p className="text-muted-foreground mb-4">
              This feature requires machine learning models and user behavior analytics integration.
            </p>
            <div className="text-sm text-muted-foreground space-y-1">
              <p><strong>Required integrations:</strong></p>
              <p>• Machine learning recommendation engine</p>
              <p>• User behavior analytics platform</p>
              <p>• Feature usage pattern analysis</p>
              <p>• Historical experiment performance database</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Lightbulb className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">AI Experiment Recommendations</h3>
        <Badge variant="outline">{visibleRecommendations.length} suggestions</Badge>
      </div>

      {visibleRecommendations.map((recommendation) => (
        <Card key={recommendation.feature_name} className="border-l-4" style={{
          borderLeftColor: getPriorityColor(recommendation.priority_score) === 'bg-red-500' ? '#ef4444' :
                          getPriorityColor(recommendation.priority_score) === 'bg-orange-500' ? '#f97316' :
                          getPriorityColor(recommendation.priority_score) === 'bg-yellow-500' ? '#eab308' : '#22c55e'
        }}>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getTestTypeIcon(recommendation.recommended_test_type)}
                <div>
                  <CardTitle className="text-lg capitalize">
                    {recommendation.feature_name.replace('_', ' ')} Optimization
                  </CardTitle>
                  <CardDescription>
                    {recommendation.recommended_test_type.replace('-', ' ').replace('_', ' ')}
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge 
                  className={`${getPriorityColor(recommendation.priority_score)} text-white`}
                >
                  {getPriorityLabel(recommendation.priority_score)} Priority
                </Badge>
                <Badge variant="outline">
                  {recommendation.priority_score}/100
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">AI Analysis</h4>
              <p className="text-sm text-muted-foreground">{recommendation.reasoning}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Estimated Impact</span>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  +{recommendation.estimated_impact}%
                </div>
                <Progress 
                  value={Math.min(recommendation.estimated_impact, 50)} 
                  className="h-2" 
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Success Metrics</span>
                </div>
                <div className="space-y-1">
                  {recommendation.recommended_metrics.slice(0, 2).map((metric) => (
                    <Badge key={metric} variant="secondary" className="text-xs">
                      {metric.replace('_', ' ')}
                    </Badge>
                  ))}
                  {recommendation.recommended_metrics.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{recommendation.recommended_metrics.length - 2} more
                    </Badge>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium">Effort Level</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {recommendation.priority_score > 80 ? 'Quick win - 1-2 days' :
                   recommendation.priority_score > 60 ? 'Medium - 3-5 days' :
                   'Complex - 1-2 weeks'}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <AlertTriangle className="h-4 w-4" />
                <span>Based on recent user behavior patterns</span>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDismiss(recommendation.feature_name)}
                >
                  Dismiss
                </Button>
                <Button 
                  size="sm"
                  onClick={() => handleCreateFromRecommendation(recommendation)}
                  className="flex items-center gap-1"
                >
                  <Zap className="h-3 w-3" />
                  Create Experiment
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {dismissedRecommendations.size > 0 && (
        <Card className="bg-muted">
          <CardContent className="pt-6">
            <div className="text-center text-sm text-muted-foreground">
              {dismissedRecommendations.size} recommendation{dismissedRecommendations.size > 1 ? 's' : ''} dismissed.
              <Button 
                variant="link" 
                size="sm" 
                onClick={() => setDismissedRecommendations(new Set())}
                className="ml-2"
              >
                Show all
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};