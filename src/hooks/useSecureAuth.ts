import { useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { secureStorage } from '@/utils/security';
import { supabase } from '@/integrations/supabase/client';
import { securityMonitor, logAuthEvent, logSuspiciousActivity } from '@/utils/securityMonitoring';

// Enhanced authentication security hook
export const useSecureAuth = () => {
  const { user } = useAuth();

  // Enhanced security monitoring
  const logSecurityEvent = useCallback(async (event: string, details?: any) => {
    await logAuthEvent({
      event,
      userId: user?.id,
      url: window.location.href,
      details
    }, details?.severity || 'low');
  }, [user?.id]);

  // Enhanced session validation with anomaly detection
  const validateSession = useCallback(async () => {
    if (!user) return;

    // Check for multiple tabs with different users (basic detection)
    const storedUserId = await secureStorage.getItem('current_user_id');
    if (storedUserId && storedUserId !== user.id) {
      await logSuspiciousActivity({ 
        reason: 'Session user mismatch',
        storedUserId, 
        currentUserId: user.id 
      });
      await supabase.auth.signOut();
      return;
    }

    // Detect suspicious patterns
    const { detected, anomalies } = securityMonitor.detectAnomalies(user.id);
    if (detected) {
      await logSuspiciousActivity({
        reason: 'Anomaly detection triggered',
        anomalies,
        userId: user.id
      });
    }

    // Update stored user ID
    await secureStorage.setItem('current_user_id', user.id);

    // Log successful session validation
    await logSecurityEvent('session_validated');
  }, [user, logSecurityEvent]);

  // Monitor for tab visibility changes (potential session hijacking)
  const handleVisibilityChange = useCallback(() => {
    if (document.visibilityState === 'visible' && user) {
      validateSession();
    }
  }, [user, validateSession]);

  // Cleanup on logout
  const handleLogout = useCallback(async () => {
    await logSecurityEvent('user_logout');
    secureStorage.clear();
  }, [logSecurityEvent]);

  useEffect(() => {
    if (user) {
      validateSession();
      document.addEventListener('visibilitychange', handleVisibilityChange);
    } else {
      handleLogout();
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, validateSession, handleVisibilityChange, handleLogout]);

  // Report suspicious activity
  const reportSuspiciousActivity = useCallback(async (activity: string, details?: any) => {
    await logSuspiciousActivity({ activity, ...details });
    console.warn(`Suspicious activity detected: ${activity}`, details);
  }, []);

  // Get security events for admin review
  const getSecurityEvents = useCallback(async () => {
    return securityMonitor.getRecentEvents();
  }, []);

  // Get critical security events
  const getCriticalEvents = useCallback(async () => {
    return securityMonitor.getCriticalEvents();
  }, []);

  return {
    validateSession,
    reportSuspiciousActivity,
    getSecurityEvents,
    getCriticalEvents,
    logSecurityEvent
  };
};
