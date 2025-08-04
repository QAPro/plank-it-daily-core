
interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp: number;
  userId?: string;
  sessionId: string;
}

class AnalyticsService {
  private sessionId: string;
  private userId?: string;
  private queue: AnalyticsEvent[] = [];
  private isOnline = navigator.onLine;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.setupOnlineListener();
    this.processQueue();
  }

  private generateSessionId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private setupOnlineListener() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  setUser(userId: string) {
    this.userId = userId;
  }

  track(eventName: string, properties?: Record<string, any>) {
    const event: AnalyticsEvent = {
      name: eventName,
      properties: {
        ...properties,
        page: window.location.pathname,
        referrer: document.referrer,
        userAgent: navigator.userAgent,
        screenResolution: `${screen.width}x${screen.height}`,
        timestamp: new Date().toISOString(),
      },
      timestamp: Date.now(),
      userId: this.userId,
      sessionId: this.sessionId,
    };

    this.queue.push(event);
    
    if (this.isOnline) {
      this.processQueue();
    }
  }

  private async processQueue() {
    if (this.queue.length === 0 || !this.isOnline) return;

    const eventsToSend = [...this.queue];
    this.queue = [];

    try {
      // In production, send to your analytics service
      console.log('Analytics events:', eventsToSend);
      
      // Example: Send to analytics service
      // await fetch('/api/analytics', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ events: eventsToSend }),
      // });
    } catch (error) {
      console.error('Failed to send analytics events:', error);
      // Re-add events to queue on failure
      this.queue = [...eventsToSend, ...this.queue];
    }
  }

  // Common event tracking methods
  trackPageView(path: string) {
    this.track('page_view', { path });
  }

  trackWorkoutStarted(exerciseId: string, duration: number) {
    this.track('workout_started', { exerciseId, plannedDuration: duration });
  }

  trackWorkoutCompleted(exerciseId: string, actualDuration: number, plannedDuration: number) {
    this.track('workout_completed', {
      exerciseId,
      actualDuration,
      plannedDuration,
      completionRate: (actualDuration / plannedDuration) * 100,
    });
  }

  trackStreakAchieved(streakDays: number) {
    this.track('streak_achieved', { streakDays });
  }

  trackAchievementUnlocked(achievementName: string, achievementType: string) {
    this.track('achievement_unlocked', { achievementName, achievementType });
  }

  trackError(error: Error, context?: string) {
    this.track('error_occurred', {
      message: error.message,
      stack: error.stack,
      context,
    });
  }

  trackFeatureUsed(feature: string, metadata?: Record<string, any>) {
    this.track('feature_used', { feature, ...metadata });
  }
}

export const analytics = new AnalyticsService();
