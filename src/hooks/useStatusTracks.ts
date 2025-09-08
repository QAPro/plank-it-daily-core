import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { StatusTrackService, StatusTrack, TrackName, LevelUnlock } from '@/services/statusTrackService';

export const useStatusTracks = (userId?: string) => {
  const { user } = useAuth();
  const targetUserId = userId || user?.id;
  const queryClient = useQueryClient();

  const {
    data: statusTracks = [],
    isLoading: tracksLoading,
    error: tracksError,
    refetch: refetchTracks
  } = useQuery({
    queryKey: ['status-tracks', targetUserId],
    queryFn: () => StatusTrackService.getUserStatusTracks(targetUserId!),
    enabled: !!targetUserId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const {
    data: unlockedFeatures = [],
    isLoading: featuresLoading,
    error: featuresError
  } = useQuery({
    queryKey: ['unlocked-features', targetUserId],
    queryFn: () => StatusTrackService.getUserUnlockedFeatures(targetUserId!),
    enabled: !!targetUserId,
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: allUnlocks = [],
    isLoading: unlocksLoading
  } = useQuery({
    queryKey: ['all-level-unlocks'],
    queryFn: () => StatusTrackService.getAllLevelUnlocks(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const updateTrackMutation = useMutation({
    mutationFn: ({
      trackName,
      experienceGained,
      activityType
    }: {
      trackName: TrackName;
      experienceGained: number;
      activityType: string;
    }) => StatusTrackService.updateTrackProgress(targetUserId!, trackName, experienceGained, activityType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['status-tracks', targetUserId] });
      queryClient.invalidateQueries({ queryKey: ['unlocked-features', targetUserId] });
    },
  });

  const checkFeatureAccessMutation = useMutation({
    mutationFn: (featureName: string) => 
      StatusTrackService.checkFeatureAccess(targetUserId!, featureName),
  });

  // Helper functions
  const getTrackByName = (trackName: TrackName): StatusTrack | undefined => {
    return statusTracks.find(track => track.track_name === trackName);
  };

  const getHighestLevelTrack = (): StatusTrack | undefined => {
    return statusTracks.reduce((highest, current) => {
      return !highest || current.track_level > highest.track_level ? current : highest;
    }, undefined as StatusTrack | undefined);
  };

  const getTotalExperience = (): number => {
    return statusTracks.reduce((total, track) => total + track.experience_points, 0);
  };

  const getUnlockedFeaturesForTrack = (trackName: TrackName): LevelUnlock[] => {
    return unlockedFeatures.filter(unlock => unlock.track_name === trackName);
  };

  const getNextUnlockForTrack = (trackName: TrackName): LevelUnlock | undefined => {
    const track = getTrackByName(trackName);
    if (!track) return undefined;

    return allUnlocks
      .filter(unlock => unlock.track_name === trackName && unlock.level_required > track.track_level)
      .sort((a, b) => a.level_required - b.level_required)[0];
  };

  const hasFeature = (featureName: string): boolean => {
    return unlockedFeatures.some(unlock => unlock.feature_name === featureName);
  };

  const awardExperience = (trackName: TrackName, experienceGained: number, activityType: string = 'default') => {
    updateTrackMutation.mutate({ trackName, experienceGained, activityType });
  };

  const checkFeatureAccess = (featureName: string) => {
    return checkFeatureAccessMutation.mutateAsync(featureName);
  };

  return {
    // Data
    statusTracks,
    unlockedFeatures,
    allUnlocks,
    
    // Loading states
    loading: tracksLoading || featuresLoading || unlocksLoading,
    tracksLoading,
    featuresLoading,
    unlocksLoading,
    
    // Errors
    error: tracksError || featuresError,
    tracksError,
    featuresError,
    
    // Actions
    awardExperience,
    checkFeatureAccess,
    refetchTracks,
    
    // Helper functions
    getTrackByName,
    getHighestLevelTrack,
    getTotalExperience,
    getUnlockedFeaturesForTrack,
    getNextUnlockForTrack,
    hasFeature,
    
    // Mutation states
    isUpdating: updateTrackMutation.isPending,
    updateError: updateTrackMutation.error
  };
};

export const useFeaturedUsers = (type: 'weekly' | 'monthly' | 'hall_of_fame') => {
  return useQuery({
    queryKey: ['featured-users', type],
    queryFn: () => StatusTrackService.getFeaturedUsers(type),
    staleTime: 5 * 60 * 1000,
  });
};