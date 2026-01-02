import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Flame, Trophy, TrendingUp, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface NotificationPermissionDialogProps {
  isOpen: boolean;
  onEnable: () => void;
  onLater: () => void;
  onClose: () => void;
}

export const NotificationPermissionDialog = ({
  isOpen,
  onEnable,
  onLater,
  onClose
}: NotificationPermissionDialogProps) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-md"
          >
            <Card className="border-2 border-primary/20 shadow-xl">
              <CardHeader className="relative pb-3">
                <button
                  onClick={onClose}
                  className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
                
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 rounded-full bg-gradient-primary">
                    <Bell className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-2xl">Stay on Track!</CardTitle>
                </div>
                <CardDescription className="text-base">
                  Get helpful reminders to build your fitness habit and never miss a workout.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Benefits List */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-orange-500/10 flex-shrink-0">
                      <Flame className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm mb-0.5">Protect Your Streak</h4>
                      <p className="text-xs text-muted-foreground">
                        Get reminded before your streak expires
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-yellow-500/10 flex-shrink-0">
                      <Trophy className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm mb-0.5">Celebrate Achievements</h4>
                      <p className="text-xs text-muted-foreground">
                        Get instant alerts when you unlock new milestones
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10 flex-shrink-0">
                      <TrendingUp className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm mb-0.5">Track Your Progress</h4>
                      <p className="text-xs text-muted-foreground">
                        Weekly summaries of your fitness journey
                      </p>
                    </div>
                  </div>
                </div>

                {/* Info Box */}
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    💡 <span className="font-medium">You're in control.</span> Customize notification types and timing in Settings anytime.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 pt-2">
                  <Button
                    onClick={onEnable}
                    size="lg"
                    className="w-full"
                  >
                    <Bell className="w-4 h-4 mr-2" />
                    Enable Notifications
                  </Button>
                  <Button
                    onClick={onLater}
                    variant="ghost"
                    size="lg"
                    className="w-full"
                  >
                    Maybe Later
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
