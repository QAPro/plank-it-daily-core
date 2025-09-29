import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Play, 
  Pause, 
  Square, 
  Plus, 
  TrendingUp, 
  Users, 
  Target,
  Trophy,
  AlertTriangle,
  BarChart3,
  Activity,
  FileText,
  Lightbulb,
  LineChart
} from "lucide-react";
import { useABTestExperiments, useABTestStatistics } from "@/hooks/useABTesting";
import { ABTestExperimentDialog } from "./ABTestExperimentDialog";
import { RealTimeAnalyticsDashboard } from "./RealTimeAnalyticsDashboard";
import { ExperimentTemplatesModal } from "./ExperimentTemplatesModal";
import { ExperimentRecommendations } from "./ExperimentRecommendations";
import { ABTestExperiment } from "@/services/abTestingService";

export const ABTestDashboard = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [selectedExperiment, setSelectedExperiment] = useState<ABTestExperiment | null>(null);
  const [selectedExperimentForAnalytics, setSelectedExperimentForAnalytics] = useState<ABTestExperiment | null>(null);
  const { 
    experiments, 
    loading, 
    create, 
    update, 
    start, 
    pause, 
    stop,
    isCreating,
    isUpdating,
    isStarting,
    isPausing,
    isStopping
  } = useABTestExperiments();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-green-500';
      case 'paused':
        return 'bg-yellow-500';
      case 'completed':
        return 'bg-blue-500';
      case 'stopped':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Activity className="h-3 w-3" />;
      case 'completed':
        return <Trophy className="h-3 w-3" />;
      case 'paused':
        return <Pause className="h-3 w-3" />;
      default:
        return <Square className="h-3 w-3" />;
    }
  };

  const handleSaveExperiment = (experimentData: Partial<ABTestExperiment>) => {
    if (selectedExperiment) {
      update(selectedExperiment.id, experimentData);
    } else {
      create(experimentData);
    }
    setShowCreateDialog(false);
    setSelectedExperiment(null);
  };

  const handleEditExperiment = (experiment: ABTestExperiment) => {
    setSelectedExperiment(experiment);
    setShowCreateDialog(true);
  };

  const handleCreateNew = () => {
    setSelectedExperiment(null);
    setShowCreateDialog(true);
  };

  const handleTemplateSelect = (experiment: Partial<ABTestExperiment>) => {
    setSelectedExperiment(experiment as ABTestExperiment);
    setShowCreateDialog(true);
  };

  const runningExperiments = experiments.filter(exp => exp.status === 'running');
  const completedExperiments = experiments.filter(exp => exp.status === 'completed');
  const draftExperiments = experiments.filter(exp => exp.status === 'draft');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading experiments...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">A/B Testing Dashboard</h2>
          <p className="text-muted-foreground">
            Manage and analyze your feature experiments
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowTemplatesModal(true)} className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Templates
          </Button>
          <Button onClick={handleCreateNew} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Experiment
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-green-500" />
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Running</p>
                <p className="text-2xl font-bold">{runningExperiments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Trophy className="h-4 w-4 text-blue-500" />
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{completedExperiments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-yellow-500" />
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Draft</p>
                <p className="text-2xl font-bold">{draftExperiments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{experiments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Recommendations */}
      <ExperimentRecommendations onCreateExperiment={handleTemplateSelect} />

      {/* Real-Time Analytics for Selected Experiment */}
      {selectedExperimentForAnalytics && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5" />
                Real-Time Analytics: {selectedExperimentForAnalytics.experiment_name}
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedExperimentForAnalytics(null)}
              >
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <RealTimeAnalyticsDashboard experiment={selectedExperimentForAnalytics} />
          </CardContent>
        </Card>
      )}

      {/* Experiments Table */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Experiments</TabsTrigger>
          <TabsTrigger value="running">Running ({runningExperiments.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedExperiments.length})</TabsTrigger>
          <TabsTrigger value="draft">Draft ({draftExperiments.length})</TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center gap-1">
            <Lightbulb className="h-3 w-3" />
            AI Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <ExperimentsList 
            experiments={experiments}
            onEdit={handleEditExperiment}
            onStart={start}
            onPause={pause}
            onStop={stop}
            onViewAnalytics={setSelectedExperimentForAnalytics}
            isStarting={isStarting}
            isPausing={isPausing}
            isStopping={isStopping}
          />
        </TabsContent>

        <TabsContent value="running" className="space-y-4">
          <ExperimentsList 
            experiments={runningExperiments}
            onEdit={handleEditExperiment}
            onStart={start}
            onPause={pause}
            onStop={stop}
            onViewAnalytics={setSelectedExperimentForAnalytics}
            isStarting={isStarting}
            isPausing={isPausing}
            isStopping={isStopping}
          />
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <ExperimentsList 
            experiments={completedExperiments}
            onEdit={handleEditExperiment}
            onStart={start}
            onPause={pause}
            onStop={stop}
            onViewAnalytics={setSelectedExperimentForAnalytics}
            isStarting={isStarting}
            isPausing={isPausing}
            isStopping={isStopping}
          />
        </TabsContent>

        <TabsContent value="draft" className="space-y-4">
          <ExperimentsList 
            experiments={draftExperiments}
            onEdit={handleEditExperiment}
            onStart={start}
            onPause={pause}
            onStop={stop}
            onViewAnalytics={setSelectedExperimentForAnalytics}
            isStarting={isStarting}
            isPausing={isPausing}
            isStopping={isStopping}
          />
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <ExperimentRecommendations onCreateExperiment={handleTemplateSelect} />
        </TabsContent>
      </Tabs>

      {/* Create/Edit Dialog */}
      <ABTestExperimentDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        experiment={selectedExperiment}
        onSave={handleSaveExperiment}
        isLoading={isCreating || isUpdating}
      />

      {/* Templates Modal */}
      <ExperimentTemplatesModal
        open={showTemplatesModal}
        onOpenChange={setShowTemplatesModal}
        onSelectTemplate={handleTemplateSelect}
      />
    </div>
  );
};

interface ExperimentsListProps {
  experiments: ABTestExperiment[];
  onEdit: (experiment: ABTestExperiment) => void;
  onStart: (id: string) => void;
  onPause: (id: string) => void;
  onStop: (id: string) => void;
  onViewAnalytics: (experiment: ABTestExperiment) => void;
  isStarting: boolean;
  isPausing: boolean;
  isStopping: boolean;
}

const ExperimentsList = ({
  experiments,
  onEdit,
  onStart,
  onPause,
  onStop,
  onViewAnalytics,
  isStarting,
  isPausing,
  isStopping
}: ExperimentsListProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-green-500';
      case 'paused':
        return 'bg-yellow-500';
      case 'completed':
        return 'bg-blue-500';
      case 'stopped':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Activity className="h-3 w-3" />;
      case 'completed':
        return <Trophy className="h-3 w-3" />;
      case 'paused':
        return <Pause className="h-3 w-3" />;
      default:
        return <Square className="h-3 w-3" />;
    }
  };

  if (experiments.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            No experiments found. Create your first A/B test to get started.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {experiments.map((experiment) => (
        <ExperimentCard
          key={experiment.id}
          experiment={experiment}
          onEdit={onEdit}
          onStart={onStart}
          onPause={onPause}
          onStop={onStop}
          onViewAnalytics={onViewAnalytics}
          isStarting={isStarting}
          isPausing={isPausing}
          isStopping={isStopping}
        />
      ))}
    </div>
  );
};

interface ExperimentCardProps {
  experiment: ABTestExperiment;
  onEdit: (experiment: ABTestExperiment) => void;
  onStart: (id: string) => void;
  onPause: (id: string) => void;
  onStop: (id: string) => void;
  onViewAnalytics: (experiment: ABTestExperiment) => void;
  isStarting: boolean;
  isPausing: boolean;
  isStopping: boolean;
}

const ExperimentCard = ({
  experiment,
  onEdit,
  onStart,
  onPause,
  onStop,
  onViewAnalytics,
  isStarting,
  isPausing,
  isStopping
}: ExperimentCardProps) => {
  const { statistics, loading: statsLoading } = useABTestStatistics(experiment.id);

  const controlStats = statistics.find(s => s.variant === 'control');
  const variantStats = statistics.find(s => s.variant === 'variant_a');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-green-500';
      case 'paused':
        return 'bg-yellow-500';
      case 'completed':
        return 'bg-blue-500';
      case 'stopped':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Activity className="h-3 w-3" />;
      case 'completed':
        return <Trophy className="h-3 w-3" />;
      case 'paused':
        return <Pause className="h-3 w-3" />;
      default:
        return <Square className="h-3 w-3" />;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{experiment.experiment_name}</CardTitle>
            <CardDescription>{experiment.experiment_description}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`${getStatusColor(experiment.status)} text-white`}>
              {getStatusIcon(experiment.status)}
              {experiment.status}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Traffic Split */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Control</span>
              <span>{experiment.traffic_split.control}%</span>
            </div>
            <Progress 
              value={experiment.traffic_split.control} 
              className="h-2" 
            />
            {controlStats && (
              <div className="text-xs text-muted-foreground space-y-1">
                <div>Users: {controlStats.total_users.toLocaleString()}</div>
                <div>Conversions: {controlStats.conversions}</div>
                <div>Rate: {(controlStats.conversion_rate * 100).toFixed(2)}%</div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Variant A</span>
              <span>{experiment.traffic_split.variant_a}%</span>
            </div>
            <Progress 
              value={experiment.traffic_split.variant_a} 
              className="h-2" 
            />
            {variantStats && (
              <div className="text-xs text-muted-foreground space-y-1">
                <div>Users: {variantStats.total_users.toLocaleString()}</div>
                <div>Conversions: {variantStats.conversions}</div>
                <div>Rate: {(variantStats.conversion_rate * 100).toFixed(2)}%</div>
              </div>
            )}
          </div>
        </div>

        {/* Winner Display */}
        {experiment.winner_variant && experiment.confidence_level && (
          <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
            <Trophy className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-700 dark:text-green-300">
              Winner: {experiment.winner_variant === 'control' ? 'Control' : 'Variant A'} 
              ({(experiment.confidence_level * 100).toFixed(1)}% confidence)
            </span>
          </div>
        )}

        {/* Statistical Significance */}
        {variantStats?.statistical_significance && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-blue-700 dark:text-blue-300">
              Statistically significant (p = {variantStats.p_value?.toFixed(3)})
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>Min. sample: {experiment.minimum_sample_size.toLocaleString()}</span>
            <Target className="h-4 w-4 ml-4" />
            <span>Metric: {experiment.success_metric}</span>
          </div>

          <div className="flex items-center gap-2">
            {experiment.status === 'running' && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onViewAnalytics(experiment)}
                className="flex items-center gap-1"
              >
                <BarChart3 className="h-3 w-3" />
                Analytics
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => onEdit(experiment)}>
              Edit
            </Button>

            {experiment.status === 'draft' && (
              <Button 
                size="sm" 
                onClick={() => onStart(experiment.id)}
                disabled={isStarting}
                className="flex items-center gap-1"
              >
                <Play className="h-3 w-3" />
                Start
              </Button>
            )}

            {experiment.status === 'running' && (
              <>
                <Button 
                  variant="outline"
                  size="sm" 
                  onClick={() => onPause(experiment.id)}
                  disabled={isPausing}
                  className="flex items-center gap-1"
                >
                  <Pause className="h-3 w-3" />
                  Pause
                </Button>
                <Button 
                  variant="destructive"
                  size="sm" 
                  onClick={() => onStop(experiment.id)}
                  disabled={isStopping}
                  className="flex items-center gap-1"
                >
                  <Square className="h-3 w-3" />
                  Stop
                </Button>
              </>
            )}

            {experiment.status === 'paused' && (
              <Button 
                size="sm" 
                onClick={() => onStart(experiment.id)}
                disabled={isStarting}
                className="flex items-center gap-1"
              >
                <Play className="h-3 w-3" />
                Resume
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};