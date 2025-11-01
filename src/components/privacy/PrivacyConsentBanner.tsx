import { motion } from 'framer-motion';
import { Shield, Lock, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { usePrivacySettings } from '@/hooks/usePrivacySettings';

interface PrivacyConsentBannerProps {
  onAccept?: () => void;
}

const PrivacyConsentBanner = ({ onAccept }: PrivacyConsentBannerProps) => {
  const { giveConsent, isUpdating } = usePrivacySettings();

  const handleAccept = () => {
    giveConsent();
    onAccept?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl"
      >
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-full bg-primary/10">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">Privacy & Data Policy</CardTitle>
            </div>
            <CardDescription>
              Welcome to Inner Fire! Before you continue, please review our privacy practices.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex gap-3">
                <Lock className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold mb-1">Your Data is Secure</h4>
                  <p className="text-sm text-muted-foreground">
                    We use industry-standard encryption to protect your personal information and workout data.
                    Your data is never sold to third parties.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Eye className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold mb-1">Control Your Visibility</h4>
                  <p className="text-sm text-muted-foreground">
                    You have full control over who can see your profile, activities, and achievements.
                    Adjust your privacy settings anytime in Settings.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Shield className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold mb-1">How We Use Your Data</h4>
                  <p className="text-sm text-muted-foreground">
                    We collect workout data to personalize your experience, track your progress, and improve our app.
                    Analytics help us understand how to make Inner Fire better for everyone.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">
                By continuing, you agree to our{' '}
                <a href="/privacy-policy" className="text-primary hover:underline">
                  Privacy Policy
                </a>{' '}
                and{' '}
                <a href="/terms-of-service" className="text-primary hover:underline">
                  Terms of Service
                </a>
                . You can customize your privacy settings at any time.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleAccept}
                disabled={isUpdating}
                className="flex-1"
              >
                {isUpdating ? 'Processing...' : 'I Accept & Continue'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default PrivacyConsentBanner;
