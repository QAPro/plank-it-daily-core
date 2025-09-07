import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/sonner';

interface PushSubscription {
  id?: string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export const usePushNotifications = () => {
  const { user } = useAuth();
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [swReady, setSwReady] = useState(false);

  useEffect(() => {
    
    const supported = 'serviceWorker' in navigator && 'PushManager' in window;
    setIsSupported(supported);
    
    if (supported) {
      waitForServiceWorker();
    } else {
      console.log('[PushNotifications] Not supported in this browser');
    }
  }, []);

  useEffect(() => {
    if (swReady && user) {
      console.log('[PushNotifications] Service worker ready and user authenticated, checking subscription status');
      checkSubscriptionStatus();
    }
  }, [swReady, user]);

  // Monitor permission changes and page visibility
  useEffect(() => {
    console.log('[PushNotifications] Setting up permission and visibility monitoring');
    
    const handlePermissionChange = () => {
      console.log('[PushNotifications] Permission state changed to:', Notification.permission);
      if (Notification.permission === 'granted' && swReady && user) {
        console.log('[PushNotifications] Permission granted, rechecking subscription status');
        checkSubscriptionStatus();
      }
    };

    const handleVisibilityChange = () => {
      if (!document.hidden && swReady && user) {
        console.log('[PushNotifications] Page became visible, rechecking subscription status');
        checkSubscriptionStatus();
      }
    };

    // Listen for permission changes (if supported by browser)
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'notifications' }).then(permission => {
        permission.addEventListener('change', handlePermissionChange);
      }).catch(error => {
        console.log('[PushNotifications] Permission API not available:', error);
      });
    }

    // Listen for page visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handlePermissionChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handlePermissionChange);
    };
  }, [swReady, user]);

  const waitForServiceWorker = useCallback(async () => {
    try {
      console.log('[PushNotifications] Waiting for service worker...');
      console.log('[PushNotifications] Current controller:', navigator.serviceWorker.controller);
      
      if (navigator.serviceWorker.controller) {
        console.log('[PushNotifications] Service worker already active with scope:', navigator.serviceWorker.controller.scriptURL);
        setSwReady(true);
        return;
      }

      console.log('[PushNotifications] Waiting for service worker registration to be ready...');
      const registration = await navigator.serviceWorker.ready;
      console.log('[PushNotifications] Service worker ready with details:', {
        scope: registration.scope,
        active: !!registration.active,
        installing: !!registration.installing,
        waiting: !!registration.waiting,
        updateViaCache: registration.updateViaCache
      });
      setSwReady(true);
    } catch (error) {
      console.error('[PushNotifications] Service worker not ready:', error);
      toast.error("Service Worker Error", { 
        description: "Push notifications require a service worker. Please refresh the page."
      });
    }
  }, []);

  const checkSubscriptionStatus = useCallback(async () => {
    if (!user || !isSupported || !swReady) {
      console.log('[PushNotifications] Skipping subscription check - missing requirements:', { 
        hasUser: !!user, 
        isSupported, 
        swReady 
      });
      return;
    }

    console.log('[PushNotifications] Checking subscription status...');
    console.log('[PushNotifications] Current Notification permission:', Notification.permission);
    
    try {
      const registration = await navigator.serviceWorker.ready;
      console.log('[PushNotifications] Got registration for subscription check:', {
        scope: registration.scope,
        active: !!registration.active
      });
      
      const subscription = await registration.pushManager.getSubscription();
      console.log('[PushNotifications] Push manager subscription check result:', !!subscription);
      
      if (subscription) {
        console.log('[PushNotifications] Found existing subscription:', {
          endpoint: subscription.endpoint.substring(0, 50) + '...',
          expirationTime: subscription.expirationTime,
          hasKeys: !!(subscription.getKey && subscription.getKey('p256dh'))
        });
        
        setIsSubscribed(true);
        setSubscription({
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.toJSON().keys?.p256dh || '',
            auth: subscription.toJSON().keys?.auth || ''
          }
        });
      } else {
        console.log('[PushNotifications] No existing subscription found');
        setIsSubscribed(false);
        setSubscription(null);
      }
    } catch (error) {
      console.error('[PushNotifications] Error checking subscription status:', error);
      setIsSubscribed(false);
      setSubscription(null);
      toast.error("Subscription Check Failed", { 
        description: "Unable to check push notification status. Please try again."
      });
    }
  }, [user, isSupported, swReady]);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    console.log('[PushNotifications] Requesting permission...');
    console.log('[PushNotifications] Current permission status:', Notification.permission);
    
    if (!isSupported) {
      console.log('[PushNotifications] Not supported in this browser');
      toast.error("Not Supported", { 
        description: "Push notifications are not supported in this browser."
      });
      return false;
    }

    // Check current permission status
    if (Notification.permission === 'granted') {
      console.log('[PushNotifications] Permission already granted');
      return true;
    }

    if (Notification.permission === 'denied') {
      console.log('[PushNotifications] Permission previously denied - cannot request again');
      toast.error("Permission Denied", { 
        description: "Push notifications are blocked. Please enable them in your browser settings and refresh the page."
      });
      return false;
    }

    try {
      console.log('[PushNotifications] Requesting permission from user...');
      const permission = await Notification.requestPermission();
      console.log('[PushNotifications] Permission request result:', permission);
      
      if (permission === 'denied') {
        console.log('[PushNotifications] User denied permission');
        toast.error("Permission Denied", { 
          description: "Please enable notifications in your browser settings to receive updates."
        });
        return false;
      }

      if (permission === 'granted') {
        console.log('[PushNotifications] Permission granted successfully');
        return true;
      }

      console.log('[PushNotifications] Permission request returned:', permission);
      return false;
    } catch (error) {
      console.error('[PushNotifications] Permission request failed:', error);
      toast.error("Permission Error", { 
        description: "Failed to request notification permission. Please try again."
      });
      return false;
    }
  }, [isSupported]);

  const forceRequestPermission = useCallback(async (): Promise<boolean> => {
    console.log('[PushNotifications] FORCE requesting permission - ignoring current state...');
    console.log('[PushNotifications] Current permission status:', Notification.permission);
    
    if (!isSupported) {
      console.log('[PushNotifications] Not supported in this browser');
      toast.error("Not Supported", { 
        description: "Push notifications are not supported in this browser."
      });
      return false;
    }

    try {
      console.log('[PushNotifications] FORCE requesting permission from user...');
      const permission = await Notification.requestPermission();
      console.log('[PushNotifications] FORCE permission request result:', permission);
      
      if (permission === 'granted') {
        console.log('[PushNotifications] FORCE permission granted successfully');
        toast.success("Permission Granted!", { 
          description: "Push notifications are now enabled!"
        });
        return true;
      } else {
        console.log('[PushNotifications] FORCE permission not granted:', permission);
        toast.error("Permission Not Granted", { 
          description: `Permission status: ${permission}. Please check browser settings.`
        });
        return false;
      }
    } catch (error) {
      console.error('[PushNotifications] FORCE permission request failed:', error);
      toast.error("Permission Error", { 
        description: "Failed to request notification permission. Please try again."
      });
      return false;
    }
  }, [isSupported]);

  const fetchVapidPublicKey = useCallback(async (): Promise<string | null> => {
    console.log('[PushNotifications] Fetching VAPID public key...');
    
    try {
      const { data, error } = await supabase.functions.invoke('get-vapid-public-key');
      
      console.log('[PushNotifications] VAPID key response received:', {
        hasData: !!data,
        hasError: !!error,
        hasPublicKey: !!data?.publicKey,
        publicKeyLength: data?.publicKey?.length || 0
      });
      
      if (error) {
        console.error('[PushNotifications] VAPID key fetch error:', error);
        toast.error("Configuration Error", { 
          description: "Unable to fetch server configuration for push notifications. Please contact support."
        });
        return null;
      }
      
      if (!data?.publicKey) {
        console.error('[PushNotifications] No VAPID public key in response:', data);
        toast.error("Configuration Error", { 
          description: "Server configuration incomplete. Please contact support."
        });
        return null;
      }
      
      console.log('[PushNotifications] VAPID key received successfully, length:', data.publicKey.length);
      return data.publicKey;
    } catch (error) {
      console.error('[PushNotifications] VAPID key fetch exception:', error);
      toast.error("Network Error", { 
        description: "Failed to connect to notification server. Please check your connection."
      });
      return null;
    }
  }, []);

  const subscribe = useCallback(async () => {
    console.log('[PushNotifications] Starting subscription...', { user: !!user, isSupported, swReady });
    console.log('[PushNotifications] Current permission:', Notification.permission);
    
    if (!user) {
      console.log('[PushNotifications] No user authenticated');
      toast.error("Authentication Required", { 
        description: "Please sign in to enable push notifications."
      });
      return false;
    }

    if (!isSupported) {
      console.log('[PushNotifications] Not supported');
      toast.error("Not Supported", { 
        description: "Push notifications are not supported in this browser."
      });
      return false;
    }

    if (!swReady) {
      console.log('[PushNotifications] Service worker not ready');
      toast.error("Service Worker Not Ready", { 
        description: "Please wait for the page to fully load and try again."
      });
      return false;
    }

    // Check if already subscribed
    try {
      const registration = await navigator.serviceWorker.ready;
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        console.log('[PushNotifications] Already subscribed, updating state');
        setIsSubscribed(true);
        toast.success("Already Subscribed", { 
          description: "Push notifications are already enabled."
        });
        return true;
      }
    } catch (error) {
      console.error('[PushNotifications] Error checking existing subscription:', error);
    }

    setIsLoading(true);
    try {
      // Step 1: Request permission
      console.log('[PushNotifications] Step 1: Requesting permission...');
      toast("Setting up notifications...", { 
        description: "Step 1: Requesting permission"
      });
      
      const hasPermission = await requestPermission();
      if (!hasPermission) {
        console.error('[PushNotifications] Permission denied or failed');
        setIsLoading(false);
        return false;
      }

      // Step 2: Get service worker registration
      console.log('[PushNotifications] Step 2: Getting service worker registration...');
      toast("Setting up notifications...", { 
        description: "Step 2: Preparing service worker"
      });
      const registration = await navigator.serviceWorker.ready;
      
      // Step 3: Fetch VAPID public key from server
      console.log('[PushNotifications] Step 3: Fetching VAPID key...');
      toast("Setting up notifications...", { 
        description: "Step 3: Fetching server configuration"
      });
      
      const vapidPublicKey = await fetchVapidPublicKey();
      if (!vapidPublicKey) {
        console.error('[PushNotifications] No VAPID key received');
        toast.error("Configuration Error", { 
          description: "Unable to retrieve notification configuration. Please check server setup."
        });
        setIsLoading(false);
        return false;
      }
      console.log('[PushNotifications] VAPID key received, length:', vapidPublicKey.length);
      
      // Step 4: Convert base64 to Uint8Array for VAPID key
      console.log('[PushNotifications] Step 4: Converting VAPID key...');
      function urlBase64ToUint8Array(base64String: string): Uint8Array {
        try {
          const padding = '='.repeat((4 - base64String.length % 4) % 4);
          const base64 = (base64String + padding)
            .replace(/\-/g, '+')
            .replace(/_/g, '/');
          const rawData = atob(base64);
          return new Uint8Array([...rawData].map(char => char.charCodeAt(0)));
        } catch (error) {
          console.error('[PushNotifications] Error converting VAPID key:', error);
          throw new Error('Invalid VAPID key format');
        }
      }
      
      const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);
      console.log('[PushNotifications] VAPID key converted, array length:', applicationServerKey.length);
      
      // Step 5: Subscribe to push manager
      console.log('[PushNotifications] Step 5: Subscribing to push manager...');
      toast("Setting up notifications...", { 
        description: "Step 5: Creating subscription"
      });
      
      const pushSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey
      });

      console.log('[PushNotifications] Push subscription created successfully');
      console.log('[PushNotifications] Subscription endpoint:', pushSubscription.endpoint.substring(0, 50) + '...');
      
      // Step 6: Save to database
      console.log('[PushNotifications] Step 6: Saving to database...');
      toast("Setting up notifications...", { 
        description: "Step 6: Saving configuration"
      });
      
      const subscriptionData = {
        user_id: user.id,
        endpoint: pushSubscription.endpoint,
        p256dh_key: pushSubscription.toJSON().keys?.p256dh || '',
        auth_key: pushSubscription.toJSON().keys?.auth || '',
        user_agent: navigator.userAgent
      };

      console.log('[PushNotifications] Subscription data prepared:', {
        user_id: subscriptionData.user_id,
        endpoint_length: subscriptionData.endpoint.length,
        has_p256dh: !!subscriptionData.p256dh_key,
        has_auth: !!subscriptionData.auth_key
      });

      const { error: dbError } = await supabase
        .from('push_subscriptions')
        .upsert(subscriptionData, {
          onConflict: 'user_id,endpoint'
        });

      if (dbError) {
        console.error('[PushNotifications] Database save error:', dbError);
        toast.error("Save Error", { 
          description: "Failed to save notification settings. Please try again."
        });
        setIsLoading(false);
        return false;
      }

      console.log('[PushNotifications] Subscription saved successfully');
      
      // Update state
      setIsSubscribed(true);
      setSubscription({
        endpoint: pushSubscription.endpoint,
        keys: {
          p256dh: subscriptionData.p256dh_key,
          auth: subscriptionData.auth_key
        }
      });

      toast.success("Notifications Enabled!", { 
        description: "Push notifications have been set up successfully."
      });
      
      setIsLoading(false);
      return true;

    } catch (error) {
      console.error('[PushNotifications] Subscription failed:', error);
      toast.error("Subscription Failed", { 
        description: error instanceof Error ? error.message : "Unable to set up push notifications. Please try again."
      });
      setIsLoading(false);
      return false;
    }
  }, [user, isSupported, swReady, requestPermission, fetchVapidPublicKey]);

  const unsubscribe = useCallback(async () => {
    console.log('[PushNotifications] Starting unsubscribe...');
    
    if (!user) {
      console.log('[PushNotifications] No user authenticated');
      toast.error("Authentication Required", { 
        description: "Please sign in to manage notifications."
      });
      return false;
    }

    if (!isSupported || !swReady) {
      console.log('[PushNotifications] Service worker not available');
      toast.error("Service Worker Error", { 
        description: "Unable to manage notifications. Please refresh the page."
      });
      return false;
    }

    setIsLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        console.log('[PushNotifications] Unsubscribing from push manager...');
        await subscription.unsubscribe();
        console.log('[PushNotifications] Successfully unsubscribed from push manager');
      }

      // Remove from database
      console.log('[PushNotifications] Removing from database...');
      const { error: dbError } = await supabase
        .from('push_subscriptions')
        .delete()
        .eq('user_id', user.id);

      if (dbError) {
        console.error('[PushNotifications] Database removal error:', dbError);
        toast.error("Database Error", { 
          description: "Failed to remove notification settings from server."
        });
      } else {
        console.log('[PushNotifications] Successfully removed from database');
      }

      // Update state
      setIsSubscribed(false);
      setSubscription(null);
      
      toast.success("Notifications Disabled", { 
        description: "Push notifications have been turned off."
      });
      
      setIsLoading(false);
      return true;

    } catch (error) {
      console.error('[PushNotifications] Unsubscribe failed:', error);
      toast.error("Unsubscribe Failed", { 
        description: error instanceof Error ? error.message : "Unable to disable notifications. Please try again."
      });
      setIsLoading(false);
      return false;
    }
  }, [user, isSupported, swReady]);

  const resubscribe = useCallback(async () => {
    console.log('[PushNotifications] Starting resubscribe...');
    const unsubscribeResult = await unsubscribe();
    if (unsubscribeResult) {
      // Small delay to ensure cleanup
      await new Promise(resolve => setTimeout(resolve, 500));
      return await subscribe();
    }
    return false;
  }, [unsubscribe, subscribe]);

  const sendTestNotification = useCallback(async () => {
    console.log('[PushNotifications] Sending test notification...');
    
    if (!user) {
      toast.error("Authentication Required", { 
        description: "Please sign in to send test notifications."
      });
      return;
    }

    if (!isSubscribed) {
      toast.error("No Subscription", { 
        description: "Please enable notifications first."
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          userIds: [user.id],
          title: 'Test Notification',
          body: 'This is a test push notification from your fitness app!',
          type: 'test'
        }
      });

      if (error) {
        console.error('[PushNotifications] Test notification error:', error);
        toast.error("Test Failed", { 
          description: error.message || "Failed to send test notification."
        });
        return;
      }

      console.log('[PushNotifications] Test notification sent:', data);
      toast.success("Test Sent!", { 
        description: "Check your device for the test notification."
      });

    } catch (error) {
      console.error('[PushNotifications] Test notification exception:', error);
      toast.error("Test Failed", { 
        description: error instanceof Error ? error.message : "Unable to send test notification."
      });
    }
  }, [user, isSubscribed]);

  return {
    isSupported,
    isSubscribed,
    subscription,
    isLoading,
    swReady,
    subscribe,
    unsubscribe,
    resubscribe,
    sendTestNotification,
    requestPermission: forceRequestPermission,
    forceRequestPermission,
    forceSubscribeIgnorePermission: subscribe, // alias for compatibility
    nuclearReset: resubscribe, // alias for compatibility
    directPermissionRequest: forceRequestPermission, // alias for compatibility
    alternativeSubscribe: subscribe // alias for compatibility
  };
};