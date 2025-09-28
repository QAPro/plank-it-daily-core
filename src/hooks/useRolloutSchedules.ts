import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { featureManagementService } from "@/services/featureManagementService";
import { useToast } from "@/hooks/use-toast";

export interface RolloutSchedule {
  id: string;
  feature_name: string;
  schedule_name: string;
  schedule_data: Array<{
    percentage: number;
    execute_at: string;
    executed: boolean;
  }>;
  current_step: number;
  status: "active" | "paused" | "completed" | "cancelled";
  created_by: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export const useRolloutSchedules = (featureName?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: schedules,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["rollout-schedules", featureName],
    queryFn: () => featureManagementService.getRolloutSchedules(featureName),
    staleTime: 30 * 1000, // 30 seconds
  });

  const createScheduleMutation = useMutation({
    mutationFn: featureManagementService.createRolloutSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rollout-schedules"] });
      toast({
        title: "Schedule Created",
        description: "Rollout schedule created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Create Schedule",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ scheduleId, status }: { scheduleId: string; status: "active" | "paused" | "cancelled" }) =>
      featureManagementService.updateRolloutScheduleStatus(scheduleId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rollout-schedules"] });
      toast({
        title: "Schedule Updated",
        description: "Schedule status updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Update Schedule",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const executeSchedulesMutation = useMutation({
    mutationFn: featureManagementService.executeScheduledRollouts,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["rollout-schedules"] });
      queryClient.invalidateQueries({ queryKey: ["feature-flags"] });
      toast({
        title: "Schedules Executed",
        description: `${data.executedCount} rollout steps executed successfully`,
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Execute Schedules",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    schedules: (schedules as RolloutSchedule[]) || [],
    isLoading,
    error,
    refetch,
    createSchedule: createScheduleMutation.mutate,
    updateStatus: updateStatusMutation.mutate,
    executeSchedules: executeSchedulesMutation.mutate,
    isCreating: createScheduleMutation.isPending,
    isUpdating: updateStatusMutation.isPending,
    isExecuting: executeSchedulesMutation.isPending,
  };
};