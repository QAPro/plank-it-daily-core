import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { NotificationService } from '@/services/notificationService';
import { NotificationTestService } from '@/services/notificationTestService';
import { toast } from 'sonner';

interface DevToolsNotificationsProps {
  onClose?: () => void;
}

export function DevToolsNotifications({ onClose }: DevToolsNotificationsProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [customTitle, setCustomTitle] = useState('Test Notification');
  const [customBody, setCustomBody] = useState('This is a test push notification from Inner Fire!');
  const [notificationType, setNotificationType] = useState('test');

  const handleTestNotification = async (type: string) => {
    if (!user) {
      toast.error('Please log in to test notifications');
      return;
    }

    setIsLoading(true);
    try {
      switch (type) {
        case 'achievement':
          await NotificationTestService.testAchievementNotification(user.id);
          break;
        case 'streak':
          await NotificationTestService.testStreakMilestone(user.id, 7);
          break;
        case 'session':
          await NotificationTestService.testSessionCompletion(user.id);
          break;
        case 'reminder':
          await NotificationTestService.testDailyReminders();
          break;
        case 'custom':
          await NotificationService.sendToUser(user.id, notificationType, {
            title: customTitle,
            body: customBody,
          });
          break;
        default:
          throw new Error('Unknown notification type');
      }
      toast.success(`${type} notification sent!`);
    } catch (error) {
      console.error('Failed to send notification:', error);
      toast.error('Failed to send notification');
    } finally {
      setIsLoading(false);
    }
  };

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Notification Testing</CardTitle>
        <Button
          onClick={onClose}
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={() => handleTestNotification('achievement')}
            disabled={isLoading}
            variant="outline"
          >
            Test Achievement
          </Button>
          <Button
            onClick={() => handleTestNotification('streak')}
            disabled={isLoading}
            variant="outline"
          >
            Test Streak Milestone
          </Button>
          <Button
            onClick={() => handleTestNotification('session')}
            disabled={isLoading}
            variant="outline"
          >
            Test Session Complete
          </Button>
          <Button
            onClick={() => handleTestNotification('reminder')}
            disabled={isLoading}
            variant="outline"
          >
            Test Daily Reminder
          </Button>
        </div>

        <div className="space-y-4 border-t pt-4">
          <h3 className="text-lg font-semibold">Custom Notification</h3>
          
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="Notification title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">Body</Label>
            <Textarea
              id="body"
              value={customBody}
              onChange={(e) => setCustomBody(e.target.value)}
              placeholder="Notification message"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select value={notificationType} onValueChange={setNotificationType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="test">Test</SelectItem>
                <SelectItem value="reminder">Reminder</SelectItem>
                <SelectItem value="achievement">Achievement</SelectItem>
                <SelectItem value="streak">Streak</SelectItem>
                <SelectItem value="milestone">Milestone</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={() => handleTestNotification('custom')}
            disabled={isLoading}
            className="w-full"
          >
            Send Custom Notification
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}