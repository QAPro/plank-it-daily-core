import { ReactNode } from 'react';
import { usePrivacySettings } from '@/hooks/usePrivacySettings';
import PrivacyConsentBanner from './PrivacyConsentBanner';

interface PrivacyConsentGateProps {
  children: ReactNode;
}

const PrivacyConsentGate = ({ children }: PrivacyConsentGateProps) => {
  const { privacySettings, isLoading } = usePrivacySettings();

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Show consent banner if consent not given
  if (privacySettings && !privacySettings.privacy_consent_given) {
    return <PrivacyConsentBanner />;
  }

  // Render app
  return <>{children}</>;
};

export default PrivacyConsentGate;
