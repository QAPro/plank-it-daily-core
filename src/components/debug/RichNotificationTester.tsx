import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { NotificationService } from '@/services/notificationService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export const RichNotificationTester = () => {
  const { user } = useAuth();
  const [testing, setTesting] = useState<Record<string, boolean>>({});

  const testNotification = async (type: string, testFunction: () => Promise<any>) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Please log in to test notifications",
        variant: "destructive"
      });
      return;
    }

    setTesting(prev => ({ ...prev, [type]: true }));
    
    try {
      const result = await testFunction();
      console.log(`${type} notification result:`, result);
      
      toast({
        title: "Notification Sent",
        description: `${type} notification sent successfully! Check your browser notifications.`,
      });
    } catch (error) {
      console.error(`Error sending ${type} notification:`, error);
      toast({
        title: "Error",
        description: `Failed to send ${type} notification: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setTesting(prev => ({ ...prev, [type]: false }));
    }
  };

  const notificationTests = [
    {
      id: 'workout-reminder',
      name: 'Workout Reminder',
      description: 'Tests workout reminder with Start Now & Remind Later actions',
      color: 'bg-blue-500',
      icon: '💪',
      test: () => NotificationService.sendWorkoutReminder(user?.id || '')
    },
    {
      id: 'achievement',
      name: 'Achievement Unlocked',
      description: 'Tests achievement notification with View & Share actions',
      color: 'bg-yellow-500',
      icon: '🏆',
      test: () => NotificationService.sendAchievementUnlocked(user?.id || '', 'Plank Master')
    },
    {
      id: 'streak-alert',
      name: 'Streak Alert',
      description: 'Tests streak maintenance with Quick & Full workout actions',
      color: 'bg-orange-500',
      icon: '🔥',
      test: () => NotificationService.sendStreakAlert(user?.id || '', 7)
    },
    {
      id: 'weekly-progress',
      name: 'Weekly Progress',
      description: 'Tests progress summary with View Stats & Plan Week actions',
      color: 'bg-green-500',
      icon: '📊',
      test: () => NotificationService.sendWeeklyProgress(user?.id || '', 5, 1800)
    },
    {
      id: 'milestone',
      name: 'Milestone Reached',
      description: 'Tests milestone celebration with progress & goal actions',
      color: 'bg-purple-500',
      icon: '🎉',
      test: () => NotificationService.sendMilestoneReached(user?.id || '', 'total sessions', 50)
    }
  ];

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🧪 Rich Notification Tester
          <Badge variant="secondary">Dev Only</Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Test different notification types with custom icons, actions, and behaviors.
          Each notification will use appropriate icons, vibration patterns, and action buttons.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notificationTests.map((test) => (
            <Card key={test.id} className="relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-full h-1 ${test.color}`} />
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{test.icon}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{test.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {test.description}
                    </p>
                    <Button
                      onClick={() => testNotification(test.name, test.test)}
                      disabled={testing[test.name]}
                      className="w-full mt-3"
                      size="sm"
                    >
                      {testing[test.name] ? 'Sending...' : 'Test Notification'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">🔍 What to Test:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Custom icons appear for each notification type</li>
            <li>• Action buttons work correctly and navigate to the right pages</li>
            <li>• Different vibration patterns for different categories</li>
            <li>• Notification click behavior (without action buttons)</li>
            <li>• Share action triggers app message handling</li>
            <li>• Notifications respect user preferences and quiet hours</li>
          </ul>
        </div>

        <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">⚠️ Testing Notes:</h4>
          <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
            <li>• Browser must grant notification permission</li>
            <li>• Push subscriptions must be active</li>
            <li>• Test in different browsers for compatibility</li>
            <li>• Check browser console for detailed service worker logs</li>
            <li>• Some mobile browsers may limit notification features</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default RichNotificationTester;