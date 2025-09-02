import { secureStorage } from './security';

export interface SecurityEvent {
  id: string;
  type: 'authentication' | 'authorization' | 'data_access' | 'suspicious_activity' | 'security_violation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: number;
  userId?: string;
  details: Record<string, any>;
  userAgent?: string;
  ipAddress?: string;
}

class SecurityMonitor {
  private events: SecurityEvent[] = [];
  private readonly MAX_EVENTS = 1000;
  private readonly CRITICAL_THRESHOLD = 5; // Max critical events per hour

  async logSecurityEvent(event: Omit<SecurityEvent, 'id' | 'timestamp'>): Promise<void> {
    const securityEvent: SecurityEvent = {
      ...event,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      // Note: Can't get real IP from client-side, would need server-side logging
    };

    this.events.push(securityEvent);

    // Keep only recent events
    if (this.events.length > this.MAX_EVENTS) {
      this.events = this.events.slice(-this.MAX_EVENTS);
    }

    // Store critical events persistently
    if (event.severity === 'critical') {
      await this.persistCriticalEvent(securityEvent);
      await this.checkCriticalThreshold();
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[SECURITY] ${event.severity.toUpperCase()}: ${event.type}`, event.details);
    }
  }

  private async persistCriticalEvent(event: SecurityEvent): Promise<void> {
    try {
      const existingEvents = JSON.parse(await secureStorage.getItem('critical_security_events') || '[]');
      existingEvents.push(event);
      
      // Keep only last 50 critical events
      const recentEvents = existingEvents.slice(-50);
      await secureStorage.setItem('critical_security_events', JSON.stringify(recentEvents), true);
    } catch (error) {
      console.error('Failed to persist critical security event:', error);
    }
  }

  private async checkCriticalThreshold(): Promise<void> {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    const recentCriticalEvents = this.events.filter(
      event => event.severity === 'critical' && event.timestamp > oneHourAgo
    );

    if (recentCriticalEvents.length >= this.CRITICAL_THRESHOLD) {
      await this.logSecurityEvent({
        type: 'security_violation',
        severity: 'critical',
        details: {
          reason: 'Critical event threshold exceeded',
          eventCount: recentCriticalEvents.length,
          timeWindow: '1 hour'
        }
      });

      // In a real app, this would trigger alerts, disable account, etc.
      console.error('CRITICAL SECURITY ALERT: Too many critical events detected');
    }
  }

  getRecentEvents(timeWindow: number = 24 * 60 * 60 * 1000): SecurityEvent[] {
    const cutoff = Date.now() - timeWindow;
    return this.events.filter(event => event.timestamp > cutoff);
  }

  async getCriticalEvents(): Promise<SecurityEvent[]> {
    try {
      const events = await secureStorage.getItem('critical_security_events');
      return events ? JSON.parse(events) : [];
    } catch (error) {
      console.error('Failed to retrieve critical security events:', error);
      return [];
    }
  }

  // Detect suspicious patterns
  detectAnomalies(userId?: string): { detected: boolean; anomalies: string[] } {
    const anomalies: string[] = [];
    const recentEvents = this.getRecentEvents(60 * 60 * 1000); // Last hour

    // Check for rapid-fire authentication attempts
    const authEvents = recentEvents.filter(e => e.type === 'authentication' && e.userId === userId);
    if (authEvents.length > 10) {
      anomalies.push('Excessive authentication attempts');
    }

    // Check for suspicious data access patterns
    const dataAccessEvents = recentEvents.filter(e => e.type === 'data_access' && e.userId === userId);
    if (dataAccessEvents.length > 50) {
      anomalies.push('Unusual data access volume');
    }

    // Check for mixed user agents (potential account takeover)
    if (userId) {
      const userEvents = recentEvents.filter(e => e.userId === userId);
      const uniqueUserAgents = new Set(userEvents.map(e => e.userAgent));
      if (uniqueUserAgents.size > 3) {
        anomalies.push('Multiple devices/browsers detected');
      }
    }

    return {
      detected: anomalies.length > 0,
      anomalies
    };
  }
}

// Singleton instance
export const securityMonitor = new SecurityMonitor();

// Convenience functions
export const logAuthEvent = (details: Record<string, any>, severity: SecurityEvent['severity'] = 'low') => {
  return securityMonitor.logSecurityEvent({
    type: 'authentication',
    severity,
    details
  });
};

export const logDataAccess = (details: Record<string, any>, severity: SecurityEvent['severity'] = 'low') => {
  return securityMonitor.logSecurityEvent({
    type: 'data_access',
    severity,
    details
  });
};

export const logSuspiciousActivity = (details: Record<string, any>) => {
  return securityMonitor.logSecurityEvent({
    type: 'suspicious_activity',
    severity: 'high',
    details
  });
};
