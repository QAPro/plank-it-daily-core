import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface PrivacyHierarchyWarningProps {
  visibility: 'private' | 'friends_only';
}

const PrivacyHierarchyWarning = ({ visibility }: PrivacyHierarchyWarningProps) => {
  if (visibility === 'private') {
    return (
      <Alert className="border-warning bg-warning/10">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Privacy Settings Will Be Adjusted</AlertTitle>
        <AlertDescription>
          Setting your profile to <strong>Private</strong> will automatically:
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Set activity visibility to Private</li>
            <li>Disable friend requests (set to "No One")</li>
            <li>Hide all profile fields (achievements, statistics, streak)</li>
          </ul>
        </AlertDescription>
      </Alert>
    );
  }

  if (visibility === 'friends_only') {
    return (
      <Alert className="border-primary/50 bg-primary/5">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Activity Visibility Limited</AlertTitle>
        <AlertDescription>
          With a <strong>Friends Only</strong> profile, your activity visibility cannot be more permissive than "Friends Only".
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};

export default PrivacyHierarchyWarning;
