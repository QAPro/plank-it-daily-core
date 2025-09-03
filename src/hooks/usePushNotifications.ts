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

  const waitForServiceWorker = useCallback(async () => {
    try {
      console.log('[PushNotifications] Waiting for service worker...');
      
      if (navigator.serviceWorker.controller) {
        console.log('[PushNotifications] Service worker already active');
        setSwReady(true);
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      console.log('[PushNotifications] Service worker ready:', registration.scope);
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
      console.log('[PushNotifications] Skipping subscription check:', { user: !!user, isSupported, swReady });
      return;
    }

    console.log('[PushNotifications] Checking subscription status...');
    
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      console.log('[PushNotifications] Current subscription:', !!subscription);
      
      if (subscription) {
        setIsSubscribed(true);
        setSubscription({
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.toJSON().keys?.p256dh || '',
            auth: subscription.toJSON().keys?.auth || ''
          }
        });
      } else {
        setIsSubscribed(false);
        setSubscription(null);
      }
    } catch (error) {
      console.error('[PushNotifications] Error checking subscription status:', error);
      toast({
        title: "Subscription Check Failed",
        description: "Unable to check push notification status. Please try again.",
        variant: "destructive"
      });
    }
  }, [user, isSupported, swReady]);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    console.log('[PushNotifications] Requesting permission...');
    
    if (!isSupported) {
      console.log('[PushNotifications] Not supported');
      toast({
        title: "Not Supported",
        description: "Push notifications are not supported in this browser.",
        variant: "destructive"
      });
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      console.log('[PushNotifications] Permission result:', permission);
      
      if (permission === 'denied') {
        toast({
          title: "Permission Denied",
          description: "Please enable notifications in your browser settings.",
          variant: "destructive"
        });
        return false;
      }

      return permission === 'granted';
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

  const fetchVapidPublicKey = useCallback(async (): Promise<string | null> => {
    console.log('[PushNotifications] Fetching VAPID public key...');
    
    try {
      const { data, error } = await supabase.functions.invoke('get-vapid-public-key');
      
      if (error) {
        console.error('[PushNotifications] VAPID key fetch error:', error);
        return null;
      }
      
      console.log('[PushNotifications] VAPID key received:', !!data?.publicKey);
      return data?.publicKey || null;
    } catch (error) {
      console.error('[PushNotifications] VAPID key fetch exception:', error);
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

  return {
    isSupported,
    isSubscribed,
    subscription,
    isLoading,
    subscribe,
    unsubscribe,
    resubscribe,
    requestPermission
  };
};