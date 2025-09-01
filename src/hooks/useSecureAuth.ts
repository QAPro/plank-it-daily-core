import { useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { secureStorage } from '@/utils/security';
import { supabase } from '@/integrations/supabase/client';

// Enhanced authentication security hook
export const useSecureAuth = () => {
  const { user } = useAuth();

  // Monitor for suspicious activity
  const logSecurityEvent = useCallback((event: string, details?: any) => {
    const securityLog = {
      timestamp: Date.now(),
      event,
      userId: user?.id,
      userAgent: navigator.userAgent,
      url: window.location.href,
      details
    };
    
    // Store security events (encrypted)
    const existingLogs = JSON.parse(secureStorage.getItem('security_events') || '[]');
    existingLogs.push(securityLog);
    
    // Keep only last 50 events
    const recentLogs = existingLogs.slice(-50);
    secureStorage.setItem('security_events', JSON.stringify(recentLogs), true);
  }, [user?.id]);

  // Check for session anomalies
  const validateSession = useCallback(async () => {
    if (!user) return;

    // Check for multiple tabs with different users (basic detection)
    const storedUserId = secureStorage.getItem('current_user_id');
    if (storedUserId && storedUserId !== user.id) {
      logSecurityEvent('session_anomaly', { 
        storedUserId, 
        currentUserId: user.id 
      });
      await supabase.auth.signOut();
      return;
    }

    // Update stored user ID
    secureStorage.setItem('current_user_id', user.id);

    // Log successful session validation
    logSecurityEvent('session_validated');
  }, [user, logSecurityEvent]);

  // Monitor for tab visibility changes (potential session hijacking)
  const handleVisibilityChange = useCallback(() => {
    if (document.visibilityState === 'visible' && user) {
      validateSession();
    }
  }, [user, validateSession]);

  // Cleanup on logout
  const handleLogout = useCallback(() => {
    logSecurityEvent('user_logout');
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
  const reportSuspiciousActivity = useCallback((activity: string, details?: any) => {
    logSecurityEvent('suspicious_activity', { activity, details });
    console.warn(`Suspicious activity detected: ${activity}`, details);
  }, [logSecurityEvent]);

  // Get security events for admin review
  const getSecurityEvents = useCallback(() => {
    return JSON.parse(secureStorage.getItem('security_events') || '[]');
  }, []);

  return {
    validateSession,
    reportSuspiciousActivity,
    getSecurityEvents,
    logSecurityEvent
  };
};
