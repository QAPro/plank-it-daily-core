// No React imports needed
import { useStatusTracks } from '@/hooks/useStatusTracks';
import { TrackName } from '@/services/statusTrackService';

interface StatusProgressGuardProps {
  requiredTrack: TrackName;
  requiredLevel: number;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showRequirement?: boolean;
}

const StatusProgressGuard: React.FC<StatusProgressGuardProps> = ({
  requiredTrack,
  requiredLevel,
  children,
  fallback = null,
  showRequirement = false
}) => {
  const { getTrackByName, loading } = useStatusTracks();

  if (loading) {
    return null; // or loading skeleton
  }

  const userTrack = getTrackByName(requiredTrack);
  const hasAccess = userTrack && userTrack.track_level >= requiredLevel;

  if (!hasAccess) {
    if (showRequirement && fallback) {
      return <>{fallback}</>;
    }
    return null;
  }

  return <>{children}</>;
};

export default StatusProgressGuard;