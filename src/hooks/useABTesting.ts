import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { abTestingService, ABTestExperiment } from "@/services/abTestingService";
import { useToast } from "@/hooks/use-toast";

export const useABTestExperiments = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["ab-test-experiments"],
    queryFn: abTestingService.getExperiments,
    staleTime: 60_000,
  });

  const createMutation = useMutation({
    mutationFn: abTestingService.createExperiment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ab-test-experiments"] });
      toast({ title: "Experiment created", description: "The A/B test experiment was created successfully." });
    },
    onError: (err: unknown) => {
      console.error("[useABTestExperiments] create error", err);
      toast({ title: "Creation failed", description: "Could not create the A/B test experiment." });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<ABTestExperiment> }) =>
      abTestingService.updateExperiment(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ab-test-experiments"] });
      toast({ title: "Experiment updated", description: "The A/B test experiment was updated successfully." });
    },
    onError: (err: unknown) => {
      console.error("[useABTestExperiments] update error", err);
      toast({ title: "Update failed", description: "Could not update the A/B test experiment." });
    },
  });

  const startMutation = useMutation({
    mutationFn: abTestingService.startExperiment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ab-test-experiments"] });
      toast({ title: "Experiment started", description: "The A/B test is now running." });
    },
    onError: (err: unknown) => {
      console.error("[useABTestExperiments] start error", err);
      toast({ title: "Start failed", description: "Could not start the A/B test experiment." });
    },
  });

  const pauseMutation = useMutation({
    mutationFn: abTestingService.pauseExperiment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ab-test-experiments"] });
      toast({ title: "Experiment paused", description: "The A/B test has been paused." });
    },
    onError: (err: unknown) => {
      console.error("[useABTestExperiments] pause error", err);
      toast({ title: "Pause failed", description: "Could not pause the A/B test experiment." });
    },
  });

  const stopMutation = useMutation({
    mutationFn: abTestingService.stopExperiment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ab-test-experiments"] });
      toast({ title: "Experiment stopped", description: "The A/B test has been stopped." });
    },
    onError: (err: unknown) => {
      console.error("[useABTestExperiments] stop error", err);
      toast({ title: "Stop failed", description: "Could not stop the A/B test experiment." });
    },
  });

  const experiments = data || [];

  return {
    experiments,
    loading: isLoading,
    error,
    refetch,
    create: (experiment: Partial<ABTestExperiment>) => createMutation.mutate(experiment),
    update: (id: string, updates: Partial<ABTestExperiment>) => updateMutation.mutate({ id, updates }),
    start: (id: string) => startMutation.mutate(id),
    pause: (id: string) => pauseMutation.mutate(id),
    stop: (id: string) => stopMutation.mutate(id),
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isStarting: startMutation.isPending,
    isPausing: pauseMutation.isPending,
    isStopping: stopMutation.isPending,
  };
};

export const useABTestStatistics = (experimentId: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["ab-test-statistics", experimentId],
    queryFn: () => abTestingService.getExperimentStatistics(experimentId),
    enabled: !!experimentId,
    staleTime: 30_000, // Refresh every 30 seconds
  });

  const calculateMutation = useMutation({
    mutationFn: () => abTestingService.calculateStatistics(experimentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ab-test-statistics", experimentId] });
      toast({ title: "Statistics updated", description: "A/B test statistics have been recalculated." });
    },
    onError: (err: unknown) => {
      console.error("[useABTestStatistics] calculate error", err);
      toast({ title: "Calculation failed", description: "Could not calculate A/B test statistics." });
    },
  });

  const detectWinnerMutation = useMutation({
    mutationFn: () => abTestingService.detectWinner(experimentId),
    onSuccess: (winner) => {
      queryClient.invalidateQueries({ queryKey: ["ab-test-statistics", experimentId] });
      queryClient.invalidateQueries({ queryKey: ["ab-test-experiments"] });
      if (winner) {
        toast({ 
          title: "Winner detected", 
          description: `Variant "${winner}" has been detected as the winner with statistical significance.` 
        });
      }
    },
    onError: (err: unknown) => {
      console.error("[useABTestStatistics] detect winner error", err);
      toast({ title: "Detection failed", description: "Could not detect experiment winner." });
    },
  });

  const statistics = data || [];

  return {
    statistics,
    loading: isLoading,
    error,
    refetch,
    calculate: () => calculateMutation.mutate(),
    detectWinner: () => detectWinnerMutation.mutate(),
    isCalculating: calculateMutation.isPending,
    isDetecting: detectWinnerMutation.isPending,
  };
};

export const useABTestVariant = (featureName: string, userId?: string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["ab-test-variant", featureName, userId],
    queryFn: () => abTestingService.getUserVariant(featureName, userId!),
    enabled: !!featureName && !!userId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  return {
    variant: data || 'control',
    loading: isLoading,
    error,
  };
};

export const useABTestConversion = () => {
  const { toast } = useToast();

  const trackConversion = useMutation({
    mutationFn: ({
      experimentId,
      userId,
      variant,
      eventType,
      eventValue = 1,
      sessionId,
      metadata = {}
    }: {
      experimentId: string;
      userId: string;
      variant: string;
      eventType: string;
      eventValue?: number;
      sessionId?: string;
      metadata?: Record<string, any>;
    }) => abTestingService.trackConversion(
      experimentId,
      userId,
      variant,
      eventType,
      eventValue,
      sessionId,
      metadata
    ),
    onError: (err: unknown) => {
      console.error("[useABTestConversion] track error", err);
      // Don't show toast for conversion tracking errors to avoid user disruption
    },
  });

  return {
    track: trackConversion.mutate,
    isTracking: trackConversion.isPending,
  };
};