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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-3 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl flex flex-col max-h-[90vh]"
      >
        <Card className="border-2 flex flex-col max-h-full">
          {/* Fixed Header */}
          <CardHeader className="flex-shrink-0 pb-3 sm:pb-4">
            <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
              <div className="p-1.5 sm:p-2 rounded-full bg-primary/10">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <CardTitle className="text-xl sm:text-2xl">Privacy & Data Policy</CardTitle>
            </div>
            <CardDescription className="text-sm">
              Welcome to Inner Fire! Before you continue, please review our privacy practices.
            </CardDescription>
          </CardHeader>

          {/* Scrollable Content */}
          <CardContent className="flex-1 overflow-y-auto pb-3 sm:pb-4">
            <div className="space-y-3 sm:space-y-4">
              <div className="flex gap-2 sm:gap-3">
                <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold mb-0.5 sm:mb-1 text-sm sm:text-base">Your Data is Secure</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    We use industry-standard encryption to protect your personal information and workout data.
                    Your data is never sold to third parties.
                  </p>
                </div>
              </div>

              <div className="flex gap-2 sm:gap-3">
                <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold mb-0.5 sm:mb-1 text-sm sm:text-base">Control Your Visibility</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    You have full control over who can see your profile, activities, and achievements.
                    Adjust your privacy settings anytime in Settings.
                  </p>
                </div>
              </div>

              <div className="flex gap-2 sm:gap-3">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold mb-0.5 sm:mb-1 text-sm sm:text-base">How We Use Your Data</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    We collect workout data to personalize your experience, track your progress, and improve our app.
                    Analytics help us understand how to make Inner Fire better for everyone.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-3 sm:p-4 mt-3 sm:mt-4">
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                By continuing, you agree to our{' '}
                <a href="/privacy-policy" className="text-primary hover:underline font-medium">
                  Privacy Policy
                </a>{' '}
                and{' '}
                <a href="/terms-of-service" className="text-primary hover:underline font-medium">
                  Terms of Service
                </a>
                . You can customize your privacy settings at any time.
              </p>
            </div>
          </CardContent>

          {/* Fixed Footer with Button */}
          <div className="flex-shrink-0 px-6 pb-6 pt-3 border-t bg-card">
            <Button
              onClick={handleAccept}
              disabled={isUpdating}
              className="w-full"
              size="lg"
            >
              {isUpdating ? 'Processing...' : 'I Accept & Continue'}
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default PrivacyConsentBanner;
