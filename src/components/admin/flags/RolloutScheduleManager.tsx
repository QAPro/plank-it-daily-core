import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useRolloutSchedules, RolloutSchedule } from "@/hooks/useRolloutSchedules";
import { Calendar, Clock, Pause, Play, Square, RefreshCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface RolloutScheduleManagerProps {
  featureName: string;
}

export const RolloutScheduleManager = ({ featureName }: RolloutScheduleManagerProps) => {
  const { schedules, isLoading, updateStatus, executeSchedules, isUpdating, isExecuting } = useRolloutSchedules(featureName);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Rollout Schedules
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (schedules.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Rollout Schedules
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            No rollout schedules found for this feature.
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'paused': return 'secondary';
      case 'completed': return 'outline';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Play className="h-3 w-3" />;
      case 'paused': return <Pause className="h-3 w-3" />;
      case 'completed': return <Square className="h-3 w-3" />;
      case 'cancelled': return <Square className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  const calculateProgress = (schedule: RolloutSchedule) => {
    if (schedule.status === 'completed') return 100;
    if (schedule.status === 'cancelled') return 0;
    
    const totalSteps = schedule.schedule_data.length;
    if (totalSteps === 0) return 0;
    
    return Math.round((schedule.current_step / totalSteps) * 100);
  };

  const getNextStep = (schedule: RolloutSchedule) => {
    if (schedule.current_step >= schedule.schedule_data.length) return null;
    return schedule.schedule_data[schedule.current_step];
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Rollout Schedules ({schedules.length})
          </CardTitle>
          <Button 
            onClick={() => executeSchedules()} 
            disabled={isExecuting}
            size="sm"
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isExecuting ? 'animate-spin' : ''}`} />
            Execute Pending
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {schedules.map((schedule) => {
          const progress = calculateProgress(schedule);
          const nextStep = getNextStep(schedule);
          
          return (
            <div key={schedule.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium">{schedule.schedule_name}</h4>
                  <p className="text-sm text-muted-foreground">
                    Created {formatDistanceToNow(new Date(schedule.created_at))} ago
                  </p>
                </div>
                <Badge variant={getStatusColor(schedule.status)} className="flex items-center gap-1">
                  {getStatusIcon(schedule.status)}
                  {schedule.status}
                </Badge>
              </div>

              {/* Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Progress</span>
                  <span>{schedule.current_step} / {schedule.schedule_data.length} steps</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              {/* Next Step */}
              {nextStep && schedule.status === 'active' && (
                <div className="bg-accent/50 p-3 rounded-md">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4" />
                    <span className="font-medium">
                      Next: {nextStep.percentage}% at {new Date(nextStep.execute_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(nextStep.execute_at), { addSuffix: true })}
                  </div>
                </div>
              )}

              {/* Completed Info */}
              {schedule.status === 'completed' && schedule.completed_at && (
                <div className="bg-green-50 p-3 rounded-md">
                  <div className="text-sm text-green-800">
                    Completed {formatDistanceToNow(new Date(schedule.completed_at))} ago
                  </div>
                </div>
              )}

              {/* Schedule Steps Preview */}
              <div className="space-y-2">
                <div className="text-sm font-medium">Schedule Steps:</div>
                <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
                  {schedule.schedule_data.map((step, index) => (
                    <div 
                      key={index} 
                      className={`flex items-center justify-between text-xs p-2 rounded ${
                        index < schedule.current_step 
                          ? 'bg-green-50 text-green-800' 
                          : index === schedule.current_step && schedule.status === 'active'
                          ? 'bg-blue-50 text-blue-800'
                          : 'bg-muted/50'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs px-1">
                          {step.percentage}%
                        </Badge>
                        {new Date(step.execute_at).toLocaleString()}
                      </span>
                      {step.executed && <Badge variant="outline" className="text-xs">✓</Badge>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              {schedule.status === 'active' && (
                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    onClick={() => updateStatus({ scheduleId: schedule.id, status: 'paused' })}
                    disabled={isUpdating}
                    size="sm"
                    variant="outline"
                  >
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </Button>
                  <Button
                    onClick={() => updateStatus({ scheduleId: schedule.id, status: 'cancelled' })}
                    disabled={isUpdating}
                    size="sm"
                    variant="destructive"
                  >
                    <Square className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              )}

              {schedule.status === 'paused' && (
                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    onClick={() => updateStatus({ scheduleId: schedule.id, status: 'active' })}
                    disabled={isUpdating}
                    size="sm"
                    variant="default"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Resume
                  </Button>
                  <Button
                    onClick={() => updateStatus({ scheduleId: schedule.id, status: 'cancelled' })}
                    disabled={isUpdating}
                    size="sm"
                    variant="destructive"
                  >
                    <Square className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};