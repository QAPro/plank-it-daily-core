import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface PushSubscription {
  id?: string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export const usePushNotifications = () => {
  console.log('[usePushNotifications] Hook called');
  
  const { user } = useAuth();
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [swReady, setSwReady] = useState(false);

  console.log('[usePushNotifications] Current state:', {
    hasUser: !!user,
    isSupported,
    isSubscribed,
    isLoading,
    swReady,
    location: window.location.protocol
  });

  useEffect(() => {
    console.log('[PushNotifications] Initializing...', { user: user?.id });
    
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
      toast({
        title: "Service Worker Error",
        description: "Push notifications require a service worker. Please refresh the page.",
        variant: "destructive"
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
      toast({
        title: "Subscription Check Failed",
        description: "Unable to check push notification status. Please try again.",
        variant: "destructive"
      });
    }
  }, [user, isSupported, swReady]);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    console.log('[PushNotifications] Requesting permission...');
    console.log('[PushNotifications] Current permission status:', Notification.permission);
    
    if (!isSupported) {
      console.log('[PushNotifications] Not supported in this browser');
      toast({
        title: "Not Supported",
        description: "Push notifications are not supported in this browser.",
        variant: "destructive"
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
      toast({
        title: "Permission Denied",
        description: "Push notifications are blocked. Please enable them in your browser settings and refresh the page.",
        variant: "destructive"
      });
      return false;
    }

    try {
      console.log('[PushNotifications] Requesting permission from user...');
      const permission = await Notification.requestPermission();
      console.log('[PushNotifications] Permission request result:', permission);
      
      if (permission === 'denied') {
        console.log('[PushNotifications] User denied permission');
        toast({
          title: "Permission Denied",
          description: "Please enable notifications in your browser settings to receive updates.",
          variant: "destructive"
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
      toast({
        title: "Permission Error",
        description: "Failed to request notification permission. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  }, [isSupported]);

  const forceRequestPermission = useCallback(async (): Promise<boolean> => {
    console.log('[PushNotifications] FORCE requesting permission - ignoring current state...');
    console.log('[PushNotifications] Current permission status:', Notification.permission);
    
    if (!isSupported) {
      console.log('[PushNotifications] Not supported in this browser');
      toast({
        title: "Not Supported",
        description: "Push notifications are not supported in this browser.",
        variant: "destructive"
      });
      return false;
    }

    try {
      console.log('[PushNotifications] FORCE requesting permission from user...');
      const permission = await Notification.requestPermission();
      console.log('[PushNotifications] FORCE permission request result:', permission);
      
      if (permission === 'granted') {
        console.log('[PushNotifications] FORCE permission granted successfully');
        toast({
          title: "Permission Granted!",
          description: "Push notifications are now enabled!",
        });
        return true;
      } else {
        console.log('[PushNotifications] FORCE permission not granted:', permission);
        toast({
          title: "Permission Not Granted",
          description: `Permission status: ${permission}. Please check browser settings.`,
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error('[PushNotifications] FORCE permission request failed:', error);
      toast({
        title: "Permission Error",
        description: "Failed to request notification permission. Please try again.",
        variant: "destructive"
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
        toast({
          title: "Configuration Error", 
          description: "Unable to fetch server configuration for push notifications. Please contact support.",
          variant: "destructive"
        });
        return null;
      }
      
      if (!data?.publicKey) {
        console.error('[PushNotifications] No VAPID public key in response:', data);
        toast({
          title: "Configuration Error",
          description: "Server configuration incomplete. Please contact support.",
          variant: "destructive"
        });
        return null;
      }
      
      console.log('[PushNotifications] VAPID key received successfully, length:', data.publicKey.length);
      return data.publicKey;
    } catch (error) {
      console.error('[PushNotifications] VAPID key fetch exception:', error);
      toast({
        title: "Network Error",
        description: "Failed to connect to notification server. Please check your connection.",
        variant: "destructive"
      });
      return null;
    }
  }, []);

  const subscribe = useCallback(async () => {
    console.log('[PushNotifications] Starting subscription...', { user: !!user, isSupported, swReady });
    console.log('[PushNotifications] Current permission:', Notification.permission);
    
    if (!user) {
      console.log('[PushNotifications] No user authenticated');
      toast({
        title: "Authentication Required", 
        description: "Please sign in to enable push notifications.",
        variant: "destructive"
      });
      return false;
    }

    if (!isSupported) {
      console.log('[PushNotifications] Not supported');
      toast({
        title: "Not Supported",
        description: "Push notifications are not supported in this browser.",
        variant: "destructive"
      });
      return false;
    }

    if (!swReady) {
      console.log('[PushNotifications] Service worker not ready');
      toast({
        title: "Service Worker Not Ready",
        description: "Please wait for the page to fully load and try again.",
        variant: "destructive"
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
        toast({
          title: "Already Subscribed",
          description: "Push notifications are already enabled.",
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
      toast({
        title: "Setting up notifications...",
        description: "Step 1: Requesting permission",
      });
      
      const hasPermission = await requestPermission();
      if (!hasPermission) {
        console.error('[PushNotifications] Permission denied or failed');
        setIsLoading(false);
        return false;
      }

      // Step 2: Get service worker registration
      console.log('[PushNotifications] Step 2: Getting service worker registration...');
      toast({
        title: "Setting up notifications...",
        description: "Step 2: Preparing service worker",
      });
      const registration = await navigator.serviceWorker.ready;
      
      // Step 3: Fetch VAPID public key from server
      console.log('[PushNotifications] Step 3: Fetching VAPID key...');
      toast({
        title: "Setting up notifications...",
        description: "Step 3: Fetching server configuration",
      });
      
      const vapidPublicKey = await fetchVapidPublicKey();
      if (!vapidPublicKey) {
        console.error('[PushNotifications] No VAPID key received');
        toast({
          title: "Configuration Error",
          description: "Unable to retrieve notification configuration. Please check server setup.",
          variant: "destructive"
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
      toast({
        title: "Setting up notifications...",
        description: "Step 5: Creating subscription",
      });
      
      const pushSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey
      });

      console.log('[PushNotifications] Push subscription created successfully');
      console.log('[PushNotifications] Subscription endpoint:', pushSubscription.endpoint.substring(0, 50) + '...');
      
      // Step 6: Save to database
      console.log('[PushNotifications] Step 6: Saving to database...');
      toast({
        title: "Setting up notifications...",
        description: "Step 6: Saving configuration",
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

      // Save subscription to database
      const { error } = await supabase
        .from('push_subscriptions')
        .insert(subscriptionData);

      if (error) {
        console.error('[PushNotifications] Database save error:', error);
        throw new Error(`Database error: ${error.message}`);
      }
      
      console.log('[PushNotifications] Subscription saved successfully to database');

      // Update local state
      setIsSubscribed(true);
      setSubscription({
        endpoint: pushSubscription.endpoint,
        keys: {
          p256dh: pushSubscription.toJSON().keys?.p256dh || '',
          auth: pushSubscription.toJSON().keys?.auth || ''
        }
      });

      toast({
        title: "Notifications Enabled!",
        description: "You'll now receive push notifications for workouts and achievements!"
      });

      console.log('[PushNotifications] Subscription complete successfully!');
      return true;
    } catch (error) {
      console.error('[PushNotifications] Subscription failed with error:', error);
      
      let errorMessage = "Failed to enable push notifications. Please try again.";
      if (error instanceof Error) {
        if (error.message.includes('VAPID')) {
          errorMessage = "Server configuration issue. Please contact support.";
        } else if (error.message.includes('Database')) {
          errorMessage = "Failed to save subscription. Please try again.";
        } else if (error.message.includes('permission')) {
          errorMessage = "Permission denied. Please enable notifications in browser settings.";
        }
      }
      
      toast({
        title: "Subscription Failed",
        description: errorMessage,
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, isSupported, swReady, requestPermission, fetchVapidPublicKey]);

  const unsubscribe = useCallback(async () => {
    console.log('[PushNotifications] Unsubscribing...');
    
    if (!user || !isSupported || !swReady) return false;

    setIsLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        console.log('[PushNotifications] Unsubscribing from push manager...');
        await subscription.unsubscribe();
        
        console.log('[PushNotifications] Removing from database...');
        // Remove subscription from database
        await supabase
          .from('push_subscriptions')
          .delete()
          .eq('user_id', user.id)
          .eq('endpoint', subscription.endpoint);
      }

      setIsSubscribed(false);
      setSubscription(null);

      console.log('[PushNotifications] Unsubscribe complete');
      toast({
        title: "Notifications Disabled",
        description: "You will no longer receive push notifications."
      });

      return true;
    } catch (error) {
      console.error('[PushNotifications] Unsubscribe failed:', error);
      toast({
        title: "Unsubscribe Failed",
        description: "Failed to disable push notifications. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, isSupported, swReady]);

  const resubscribe = useCallback(async () => {
    if (!isSubscribed) return await subscribe();
    
    // First unsubscribe, then subscribe again
    const unsubscribeResult = await unsubscribe();
    if (unsubscribeResult) {
      return await subscribe();
    }
    return false;
  }, [isSubscribed, subscribe, unsubscribe]);

  const forceSubscribeIgnorePermission = useCallback(async () => {
    console.log('[PushNotifications] FORCE SUBSCRIBE - ignoring permission state...');
    console.log('[PushNotifications] Current permission:', Notification.permission);
    
    if (!user) {
      console.log('[PushNotifications] No user authenticated');
      toast({
        title: "Authentication Required", 
        description: "Please sign in to enable push notifications.",
        variant: "destructive"
      });
      return false;
    }

    if (!isSupported) {
      console.log('[PushNotifications] Not supported');
      toast({
        title: "Not Supported",
        description: "Push notifications are not supported in this browser.",
        variant: "destructive"
      });
      return false;
    }

    if (!swReady) {
      console.log('[PushNotifications] Service worker not ready');
      toast({
        title: "Service Worker Not Ready",
        description: "Please wait for the page to fully load and try again.",
        variant: "destructive"
      });
      return false;
    }

    setIsLoading(true);
    try {
      // Step 1: FORCE request permission (even if currently denied)
      console.log('[PushNotifications] FORCE Step 1: Requesting permission...');
      toast({
        title: "FORCE Setting up notifications...",
        description: "Step 1: Force requesting permission",
      });
      
      const hasPermission = await forceRequestPermission();
      if (!hasPermission) {
        console.error('[PushNotifications] FORCE permission denied or failed');
        setIsLoading(false);
        return false;
      }

      // Continue with normal subscription process
      console.log('[PushNotifications] FORCE Step 2: Getting service worker registration...');
      toast({
        title: "FORCE Setting up notifications...",
        description: "Step 2: Preparing service worker",
      });
      const registration = await navigator.serviceWorker.ready;
      
      // Step 3: Fetch VAPID public key from server
      console.log('[PushNotifications] FORCE Step 3: Fetching VAPID key...');
      toast({
        title: "FORCE Setting up notifications...",
        description: "Step 3: Fetching server configuration",
      });
      
      const vapidPublicKey = await fetchVapidPublicKey();
      if (!vapidPublicKey) {
        console.error('[PushNotifications] FORCE No VAPID key received');
        toast({
          title: "Configuration Error",
          description: "Unable to retrieve notification configuration. Please check server setup.",
          variant: "destructive"
        });
        setIsLoading(false);
        return false;
      }
      
      // Step 4: Convert VAPID key
      console.log('[PushNotifications] FORCE Step 4: Converting VAPID key...');
      function urlBase64ToUint8Array(base64String: string): Uint8Array {
        try {
          const padding = '='.repeat((4 - base64String.length % 4) % 4);
          const base64 = (base64String + padding)
            .replace(/\-/g, '+')
            .replace(/_/g, '/');
          const rawData = atob(base64);
          return new Uint8Array([...rawData].map(char => char.charCodeAt(0)));
        } catch (error) {
          console.error('[PushNotifications] FORCE Error converting VAPID key:', error);
          throw new Error('Invalid VAPID key format');
        }
      }
      
      const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);
      
      // Step 5: Subscribe to push manager
      console.log('[PushNotifications] FORCE Step 5: Subscribing to push manager...');
      toast({
        title: "FORCE Setting up notifications...",
        description: "Step 5: Creating subscription",
      });
      
      const pushSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey
      });

      // Step 6: Save to database
      console.log('[PushNotifications] FORCE Step 6: Saving to database...');
      toast({
        title: "FORCE Setting up notifications...",
        description: "Step 6: Saving configuration",
      });
      
      const subscriptionData = {
        user_id: user.id,
        endpoint: pushSubscription.endpoint,
        p256dh_key: pushSubscription.toJSON().keys?.p256dh || '',
        auth_key: pushSubscription.toJSON().keys?.auth || '',
        user_agent: navigator.userAgent
      };

      // Save subscription to database
      const { error } = await supabase
        .from('push_subscriptions')
        .insert(subscriptionData);

      if (error) {
        console.error('[PushNotifications] FORCE Database save error:', error);
        throw new Error(`Database error: ${error.message}`);
      }
      
      // Update local state
      setIsSubscribed(true);
      setSubscription({
        endpoint: pushSubscription.endpoint,
        keys: {
          p256dh: pushSubscription.toJSON().keys?.p256dh || '',
          auth: pushSubscription.toJSON().keys?.auth || ''
        }
      });

      toast({
        title: "FORCE Notifications Enabled!",
        description: "Push notifications forcefully enabled despite previous permission state!"
      });

      console.log('[PushNotifications] FORCE Subscription complete successfully!');
      return true;
    } catch (error) {
      console.error('[PushNotifications] FORCE Subscription failed with error:', error);
      
      toast({
        title: "FORCE Subscription Failed",
        description: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, isSupported, swReady, forceRequestPermission, fetchVapidPublicKey]);

  // Nuclear Reset - Complete cleanup and restart
  const nuclearReset = useCallback(async (): Promise<boolean> => {
    if (!isSupported || !user) return false;

    setIsLoading(true);
    console.log('[PushNotifications] Nuclear reset initiated');

    try {
      // 1. Unsubscribe from current subscription
      try {
        await unsubscribe();
      } catch (e) {
        console.log('[PushNotifications] Unsubscribe during nuclear reset failed (expected):', e);
      }

      // 2. Unregister ALL service workers
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        console.log(`[PushNotifications] Found ${registrations.length} service worker registrations`);
        
        for (const registration of registrations) {
          console.log('[PushNotifications] Unregistering service worker:', registration.scope);
          await registration.unregister();
        }
      }

      // 3. Clear all caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        console.log(`[PushNotifications] Found ${cacheNames.length} caches to clear`);
        
        for (const cacheName of cacheNames) {
          console.log('[PushNotifications] Clearing cache:', cacheName);
          await caches.delete(cacheName);
        }
      }

      // 4. Clear relevant localStorage items
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('push') || key.includes('notification') || key.includes('vapid'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => {
        console.log('[PushNotifications] Removing localStorage key:', key);
        localStorage.removeItem(key);
      });

      // 5. Reset component state
      setIsSubscribed(false);
      setSubscription(null);
      setSwReady(false);

      console.log('[PushNotifications] Nuclear reset completed successfully');
      
      toast({
        title: "Nuclear Reset Complete",
        description: "All push notification data cleared. Please reload the page and try again.",
        variant: "default"
      });

      return true;
    } catch (error) {
      console.error('[PushNotifications] Nuclear reset failed:', error);
      
      toast({
        title: "Nuclear Reset Failed",
        description: error instanceof Error ? error.message : "Failed to perform nuclear reset",
        variant: "destructive"
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, isSupported, unsubscribe]);

  // Alternative permission request methods
  const directPermissionRequest = useCallback(async (): Promise<boolean> => {
    console.log('[PushNotifications] Direct permission request initiated');
    
    try {
      // Method 1: Direct Notification.requestPermission()
      const permission = await Notification.requestPermission();
      console.log('[PushNotifications] Direct permission result:', permission);
      
      if (permission === 'granted') {
        toast({
          title: "Permission Granted",
          description: "Notifications enabled via direct request",
          variant: "default"
        });
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('[PushNotifications] Direct permission request failed:', error);
      return false;
    }
  }, []);

  const alternativeSubscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported || !user) return false;

    setIsLoading(true);
    console.log('[PushNotifications] Alternative subscribe method initiated');

    try {
      // Step 1: Try direct permission first
      const hasPermission = await directPermissionRequest();
      if (!hasPermission) {
        console.log('[PushNotifications] Alternative subscribe: permission denied');
        return false;
      }

      // Step 2: Force service worker registration
      let registration;
      try {
        registration = await navigator.serviceWorker.register('/sw.js', { 
          scope: '/',
          updateViaCache: 'none'
        });
        console.log('[PushNotifications] Alternative: SW registered:', registration.scope);
        
        // Wait for activation
        if (registration.installing) {
          console.log('[PushNotifications] Alternative: Waiting for SW installation...');
          await new Promise((resolve) => {
            registration.installing!.addEventListener('statechange', () => {
              if (registration.installing!.state === 'activated') {
                resolve(true);
              }
            });
          });
        }
      } catch (error) {
        console.error('[PushNotifications] Alternative: SW registration failed:', error);
        return false;
      }

      // Step 3: Get VAPID key and subscribe
      const vapidKey = await fetchVapidPublicKey();
      if (!vapidKey) return false;

      // Step 4: Subscribe to push manager
      const pushSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKey
      });

      // Step 5: Save to database
      const subscriptionData = {
        user_id: user.id,
        endpoint: pushSubscription.endpoint,
        p256dh_key: btoa(String.fromCharCode(...new Uint8Array(pushSubscription.getKey('p256dh')!))),
        auth_key: btoa(String.fromCharCode(...new Uint8Array(pushSubscription.getKey('auth')!))),
        user_agent: navigator.userAgent,
        is_active: true
      };

      const { error: saveError } = await supabase
        .from('push_subscriptions')
        .upsert(subscriptionData, { 
          onConflict: 'user_id',
          ignoreDuplicates: false 
        });

      if (saveError) throw saveError;

      setIsSubscribed(true);
      setSubscription(pushSubscription);

      toast({
        title: "Alternative Subscribe Success",
        description: "Push notifications enabled via alternative method",
        variant: "default"
      });

      return true;
    } catch (error) {
      console.error('[PushNotifications] Alternative subscribe failed:', error);
      
      toast({
        title: "Alternative Subscribe Failed",
        description: error instanceof Error ? error.message : "Failed to subscribe via alternative method",
        variant: "destructive"
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, isSupported, directPermissionRequest, fetchVapidPublicKey]);

  return {
    isSupported,
    isSubscribed,
    subscription,
    isLoading,
    swReady,
    subscribe,
    unsubscribe,
    resubscribe,
    requestPermission,
    forceSubscribeIgnorePermission,
    forceRequestPermission,
    nuclearReset,
    directPermissionRequest,
    alternativeSubscribe
  };
};