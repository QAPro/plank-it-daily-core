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
  const { user } = useAuth();
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsSupported('serviceWorker' in navigator && 'PushManager' in window);
    checkSubscriptionStatus();
  }, [user]);

  const checkSubscriptionStatus = useCallback(async () => {
    if (!user || !isSupported) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
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
      console.error('Error checking subscription status:', error);
    }
  }, [user, isSupported]);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      toast({
        title: "Not Supported",
        description: "Push notifications are not supported in this browser.",
        variant: "destructive"
      });
      return false;
    }

    const permission = await Notification.requestPermission();
    
    if (permission === 'denied') {
      toast({
        title: "Permission Denied",
        description: "Please enable notifications in your browser settings.",
        variant: "destructive"
      });
      return false;
    }

    return permission === 'granted';
  }, [isSupported]);

  const fetchVapidPublicKey = useCallback(async (): Promise<string | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('get-vapid-public-key');
      
      if (error) {
        console.error('Error fetching VAPID public key:', error);
        return null;
      }
      
      return data?.publicKey || null;
    } catch (error) {
      console.error('Error fetching VAPID public key:', error);
      return null;
    }
  }, []);

  const subscribe = useCallback(async () => {
    if (!user || !isSupported) return false;

    setIsLoading(true);
    try {
      const hasPermission = await requestPermission();
      if (!hasPermission) {
        setIsLoading(false);
        return false;
      }

      const registration = await navigator.serviceWorker.ready;
      
      // Fetch VAPID public key from server
      const vapidPublicKey = await fetchVapidPublicKey();
      if (!vapidPublicKey) {
        toast({
          title: "Configuration Error",
          description: "Unable to retrieve notification configuration. Please try again later.",
          variant: "destructive"
        });
        setIsLoading(false);
        return false;
      }
      
      // Convert base64 to Uint8Array for VAPID key
      function urlBase64ToUint8Array(base64String: string): Uint8Array {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
          .replace(/\-/g, '+')
          .replace(/_/g, '/');
        const rawData = atob(base64);
        return new Uint8Array([...rawData].map(char => char.charCodeAt(0)));
      }
      
      const pushSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
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
        console.error('Error saving subscription:', error);
        throw error;
      }

      setIsSubscribed(true);
      setSubscription({
        endpoint: pushSubscription.endpoint,
        keys: {
          p256dh: pushSubscription.toJSON().keys?.p256dh || '',
          auth: pushSubscription.toJSON().keys?.auth || ''
        }
      });

      toast({
        title: "Notifications Enabled",
        description: "You'll now receive push notifications for workouts and achievements!"
      });

      return true;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      toast({
        title: "Subscription Failed",
        description: "Failed to enable push notifications. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, isSupported, requestPermission, fetchVapidPublicKey]);

  const unsubscribe = useCallback(async () => {
    if (!user || !isSupported) return false;

    setIsLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        
        // Remove subscription from database
        await supabase
          .from('push_subscriptions')
          .delete()
          .eq('user_id', user.id)
          .eq('endpoint', subscription.endpoint);
      }

      setIsSubscribed(false);
      setSubscription(null);

      toast({
        title: "Notifications Disabled",
        description: "You will no longer receive push notifications."
      });

      return true;
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      toast({
        title: "Unsubscribe Failed",
        description: "Failed to disable push notifications. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, isSupported]);

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