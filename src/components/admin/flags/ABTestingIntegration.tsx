import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, FlaskConical, TrendingUp, Users, Target } from "lucide-react";
import { FeatureFlag } from "@/services/featureManagementService";
import { ABTestDashboard } from "../ab-testing/ABTestDashboard";
import { useABTestExperiments } from "@/hooks/useABTesting";

interface ABTestingIntegrationProps {
  featureFlag: FeatureFlag;
  onUpdate: () => void;
}

export const ABTestingIntegration = ({ featureFlag, onUpdate }: ABTestingIntegrationProps) => {
  const [activeTab, setActiveTab] = useState("overview");
  const { experiments } = useABTestExperiments();

  // Find experiments for this feature flag
  const relatedExperiments = experiments.filter(exp => exp.feature_flag_id === featureFlag.id);
  const activeExperiment = relatedExperiments.find(exp => exp.status === 'running');
  const completedExperiments = relatedExperiments.filter(exp => exp.status === 'completed');

  const isAbTestEnabled = (featureFlag as any).ab_test_enabled || false;

  return (
    <div className="space-y-6">
      {/* A/B Testing Status Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FlaskConical className="h-5 w-5 text-primary" />
              <div>
                <CardTitle className="text-lg">A/B Testing</CardTitle>
                <CardDescription>
                  Experiment with different variants of this feature
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isAbTestEnabled ? (
                <Badge className="bg-green-500">
                  <FlaskConical className="h-3 w-3 mr-1" />
                  A/B Testing Active
                </Badge>
              ) : (
                <Badge variant="outline">
                  A/B Testing Disabled
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        {isAbTestEnabled && activeExperiment && (
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-l-4 border-l-green-500">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-700">Running Experiment</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{activeExperiment.experiment_name}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">Traffic Split</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Control: {activeExperiment.traffic_split.control}% | 
                    Variant: {activeExperiment.traffic_split.variant_a}%
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-purple-600" />
                    <span className="font-medium">Success Metric</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{activeExperiment.success_metric}</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        )}
      </Card>

      {/* A/B Testing Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="dashboard">
            Experiments Dashboard ({relatedExperiments.length})
          </TabsTrigger>
          {completedExperiments.length > 0 && (
            <TabsTrigger value="insights">
              Insights ({completedExperiments.length})
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <ExperimentOverview 
            featureFlag={featureFlag}
            relatedExperiments={relatedExperiments}
            activeExperiment={activeExperiment}
            onUpdate={onUpdate}
          />
        </TabsContent>

        <TabsContent value="dashboard">
          <ABTestDashboard />
        </TabsContent>

        {completedExperiments.length > 0 && (
          <TabsContent value="insights" className="space-y-4">
            <ExperimentInsights experiments={completedExperiments} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

interface ExperimentOverviewProps {
  featureFlag: FeatureFlag;
  relatedExperiments: any[];
  activeExperiment?: any;
  onUpdate: () => void;
}

const ExperimentOverview = ({ 
  featureFlag, 
  relatedExperiments, 
  activeExperiment,
  onUpdate 
}: ExperimentOverviewProps) => {
  if (!(featureFlag as any).ab_test_enabled) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <FlaskConical className="h-12 w-12 text-muted-foreground mx-auto" />
            <div>
              <h3 className="text-lg font-medium">A/B Testing Not Enabled</h3>
              <p className="text-muted-foreground">
                Enable A/B testing to create experiments for this feature flag.
              </p>
            </div>
            <Button onClick={() => {
              // This would typically call a service to enable A/B testing
              console.log("Enable A/B testing for", featureFlag.feature_name);
            }}>
              Enable A/B Testing
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (relatedExperiments.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <Target className="h-12 w-12 text-muted-foreground mx-auto" />
            <div>
              <h3 className="text-lg font-medium">No Experiments Yet</h3>
              <p className="text-muted-foreground">
                Create your first A/B test experiment to start optimizing this feature.
              </p>
            </div>
            <Button>
              Create First Experiment
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Active Experiment Details */}
      {activeExperiment && (
        <Card className="border-l-4 border-l-green-500">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FlaskConical className="h-5 w-5 text-green-600" />
                  {activeExperiment.experiment_name}
                </CardTitle>
                <CardDescription>{activeExperiment.experiment_description}</CardDescription>
              </div>
              <Badge className="bg-green-500">Running</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Started:</span>
                <div className="font-medium">
                  {activeExperiment.started_at ? 
                    new Date(activeExperiment.started_at).toLocaleDateString() : 
                    'Not started'
                  }
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Duration:</span>
                <div className="font-medium">{activeExperiment.test_duration_days} days</div>
              </div>
              <div>
                <span className="text-muted-foreground">Sample Size:</span>
                <div className="font-medium">{activeExperiment.minimum_sample_size.toLocaleString()}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Confidence:</span>
                <div className="font-medium">{(activeExperiment.significance_threshold * 100).toFixed(0)}%</div>
              </div>
            </div>

            {activeExperiment.hypothesis && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <span className="text-sm font-medium">Hypothesis:</span>
                <p className="text-sm text-muted-foreground mt-1">{activeExperiment.hypothesis}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Experiment History */}
      <Card>
        <CardHeader>
          <CardTitle>Experiment History</CardTitle>
          <CardDescription>
            Past and current experiments for this feature flag
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {relatedExperiments.map((experiment) => (
              <div key={experiment.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{experiment.experiment_name}</div>
                  <div className="text-sm text-muted-foreground">
                    {experiment.experiment_description}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {experiment.winner_variant && (
                    <Badge variant="outline" className="bg-blue-50">
                      Winner: {experiment.winner_variant}
                    </Badge>
                  )}
                  <Badge 
                    variant="outline" 
                    className={
                      experiment.status === 'running' ? 'bg-green-50' :
                      experiment.status === 'completed' ? 'bg-blue-50' :
                      experiment.status === 'paused' ? 'bg-yellow-50' :
                      'bg-gray-50'
                    }
                  >
                    {experiment.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

interface ExperimentInsightsProps {
  experiments: any[];
}

const ExperimentInsights = ({ experiments }: ExperimentInsightsProps) => {
  const successfulExperiments = experiments.filter(exp => exp.winner_variant && exp.winner_variant !== 'control');
  const successRate = experiments.length > 0 ? (successfulExperiments.length / experiments.length) * 100 : 0;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Experiment Insights</CardTitle>
          <CardDescription>
            Key learnings from completed experiments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{experiments.length}</div>
              <div className="text-sm text-muted-foreground">Total Experiments</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{successfulExperiments.length}</div>
              <div className="text-sm text-muted-foreground">Successful Variants</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{successRate.toFixed(0)}%</div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </div>
          </div>

          {successfulExperiments.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">Winning Experiments</h4>
              {successfulExperiments.map((experiment) => (
                <div key={experiment.id} className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-green-800 dark:text-green-200">
                        {experiment.experiment_name}
                      </div>
                      <div className="text-sm text-green-600 dark:text-green-400">
                        Winner: {experiment.winner_variant} 
                        {experiment.confidence_level && 
                          ` (${(experiment.confidence_level * 100).toFixed(1)}% confidence)`
                        }
                      </div>
                    </div>
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};