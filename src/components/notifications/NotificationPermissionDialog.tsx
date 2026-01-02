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
              <CardHeader className="relative pb-4">
                <button
                  onClick={onClose}
                  className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
                
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 shadow-md">
                    <Bell className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-bold">Stay on Track!</CardTitle>
                </div>
                <CardDescription className="text-base font-medium text-gray-700 dark:text-gray-300">
                  Get helpful reminders to build your fitness habit and never miss a workout.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-5">
                {/* Benefits List */}
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800">
                    <div className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm flex-shrink-0">
                      <Flame className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-gray-900 dark:text-gray-100 mb-1">Protect Your Streak</h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        Get reminded before your streak expires
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800">
                    <div className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm flex-shrink-0">
                      <Trophy className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-gray-900 dark:text-gray-100 mb-1">Celebrate Achievements</h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        Get instant alerts when you unlock new milestones
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                    <div className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm flex-shrink-0">
                      <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-gray-900 dark:text-gray-100 mb-1">Track Your Progress</h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        Weekly summaries of your fitness journey
                      </p>
                    </div>
                  </div>
                </div>

                {/* Info Box */}
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    💡 <span className="font-bold">You're in control.</span> Customize notification types and timing in Settings anytime.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3 pt-2">
                  <Button
                    onClick={onEnable}
                    size="lg"
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 text-lg shadow-lg hover:shadow-xl transition-all"
                  >
                    <Bell className="w-5 h-5 mr-2" />
                    Enable Notifications
                  </Button>
                  <Button
                    onClick={onLater}
                    variant="outline"
                    size="lg"
                    className="w-full font-semibold py-3.5 text-base border-2"
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
