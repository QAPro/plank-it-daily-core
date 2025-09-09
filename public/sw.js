// Service Worker for Plank Coach PWA
const CACHE_NAME = 'plank-coach-v2';
const OFFLINE_URL = '/';

// Enhanced cache with workout essentials
const ESSENTIAL_RESOURCES = [
  OFFLINE_URL,
  '/favicon.ico',
  '/placeholder.svg',
  '/icons/notification-workout.png',
  '/icons/notification-achievement.png',
  '/icons/notification-streak.png',
  '/icons/notification-progress.png',
  '/sounds/notification-achievement.mp3'
];

// Install event - cache essential resources including workout data
self.addEventListener('install', (event) => {
  console.log('[SW] Installing enhanced service worker');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching essential resources for offline workouts');
      return cache.addAll(ESSENTIAL_RESOURCES);
    }).then(() => {
      console.log('[SW] Skip waiting on install');
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Claiming clients');
      return self.clients.claim();
    })
  );
});

// Enhanced fetch event - comprehensive offline support
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .catch(() => {
          return caches.open(CACHE_NAME).then((cache) => {
            return cache.match(OFFLINE_URL);
          });
        })
    );
    return;
  }

  // Handle Supabase API requests with strict caching rules
  if (url.hostname.includes('supabase.co') && request.method === 'GET') {
    const hasAuth = request.headers.has('Authorization');

    // Never cache or intercept authenticated or auth endpoints
    if (hasAuth || url.pathname.startsWith('/auth/v1')) {
      event.respondWith(fetch(request));
      return;
    }

    // Cache only safe, non-user-specific endpoints
    if (/^\/rest\/v1\/plank_exercises/.test(url.pathname)) {
      event.respondWith(
        fetch(request)
          .then(response => {
            if (response.ok) {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(request, responseToCache);
              });
            }
            return response;
          })
          .catch(() => caches.match(request))
      );
      return;
    }

    if (/^\/storage\/v1\/object\/public\//.test(url.pathname)) {
      event.respondWith(
        caches.match(request).then(cached => {
          return cached || fetch(request).then(response => {
            if (response.ok) {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME).then(cache => cache.put(request, responseToCache));
            }
            return response;
          });
        })
      );
      return;
    }

    // Default: network first, fall back to cache if available, but do not cache
    event.respondWith(
      fetch(request).catch(() => caches.match(request))
    );
    return;
  }

  // Handle static resources
  if (request.destination === 'image' || request.destination === 'script' || request.destination === 'style') {
    event.respondWith(
      caches.match(request).then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        return fetch(request).then(response => {
          if (response.ok) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        });
      })
    );
  }
});

// Helper function to select appropriate icon based on notification type
function getNotificationIcon(notificationType, category) {
  switch (category || notificationType) {
    case 'achievement':
    case 'achievements':
      return '/icons/notification-achievement.png';
    case 'streak':
    case 'streaks':
      return '/icons/notification-streak.png';
    case 'progress':
    case 'milestone':
    case 'milestones':
      return '/icons/notification-progress.png';
    case 'reminder':
    case 'reminders':
    case 'workout':
      return '/icons/notification-workout.png';
    default:
      return '/icons/notification-workout.png';
  }
}

// Helper function to get appropriate vibration pattern
function getVibrationPattern(category) {
  switch (category) {
    case 'achievement':
      return [200, 150, 300, 150, 400]; // Celebratory pattern
    case 'streak':
      return [150, 100, 150, 100, 150]; // Urgent pattern
    case 'progress':
      return [100, 50, 100]; // Gentle pattern
    case 'reminder':
    default:
      return [200, 100, 200]; // Standard pattern
  }
}

// Helper function to get appropriate sound (for future implementation)
function getNotificationSound(category) {
  // Browser notification API doesn't support custom sounds directly
  // This could be used for future web audio implementation
  switch (category) {
    case 'achievement':
      return 'achievement.mp3';
    case 'streak':
      return 'streak.mp3';
    case 'progress':
      return 'progress.mp3';
    case 'reminder':
    default:
      return 'default.mp3';
  }
}

// Push event - handle push notifications
self.addEventListener('push', (event) => {
  const timestamp = new Date().toISOString();
  const pushId = Math.random().toString(36).substr(2, 9);
  
  console.log(`[SW] Push received at ${timestamp} (ID: ${pushId}):`, {
    hasData: !!event.data,
    dataText: event.data ? event.data.text() : 'no data',
    registration: !!self.registration
  });
  
  let title = 'Plank Coach';
  let notificationType = 'reminder';
  let category = 'reminder';
  
  let options = {
    body: 'Time for your workout!',
    icon: '/icons/notification-workout.png',
    badge: '/icons/notification-workout.png',
    vibrate: [200, 100, 200],
    requireInteraction: true,
    tag: 'plank-coach-notification',
    data: { pushId, timestamp },
    actions: [
      {
        action: 'start-workout',
        title: '💪 Start Workout'
      },
      {
        action: 'view-progress',  
        title: '📊 View Progress'
      }
    ]
  };
  
  // Parse notification data if available
  if (event.data) {
    try {
      const rawText = event.data.text();
      console.log(`[SW] Raw push data (${pushId}):`, rawText);
      
      const data = JSON.parse(rawText);
      console.log(`[SW] Parsed push data (${pushId}):`, data);
      
      title = data.title || title;
      options.body = data.body || options.body;
      notificationType = data.notification_type || data.data?.notification_type || notificationType;
      category = data.data?.category || notificationType;
      
      // Set custom icon and badge based on notification type
      const customIcon = getNotificationIcon(notificationType, category);
      options.icon = customIcon;
      options.badge = customIcon;
      
      // Set custom vibration pattern
      options.vibrate = getVibrationPattern(category);
      
      // Handle other notification options
      if (data.tag) options.tag = data.tag;
      if (data.actions) options.actions = data.actions;
      if (data.data) options.data = { ...options.data, ...data.data, category };
      if (data.requireInteraction !== undefined) options.requireInteraction = data.requireInteraction;
      
      // Add custom action buttons based on category
      if (category === 'achievement') {
        options.actions = [
          { action: 'view-achievement', title: '🏆 View Achievement' },
          { action: 'share', title: '📤 Share' }
        ];
      } else if (category === 'streak') {
        options.actions = [
          { action: 'quick-workout', title: '⚡ Quick Plank' },
          { action: 'full-workout', title: '💪 Full Workout' }
        ];
      } else if (category === 'progress') {
        options.actions = [
          { action: 'view-stats', title: '📈 View Stats' },
          { action: 'set-goal', title: '🎯 Set Goal' }
        ];
      }
      
    } catch (error) {
      console.error(`[SW] Error parsing push data (${pushId}):`, error);
      console.log(`[SW] Falling back to default notification (${pushId})`);
    }
  }
  
  console.log(`[SW] Showing notification (${pushId}) with category ${category}:`, { title, options });
  
  event.waitUntil(
    self.registration.showNotification(title, options)
      .then(() => {
        console.log(`[SW] Notification displayed successfully (${pushId}) with icon: ${options.icon}`);
      })
      .catch((error) => {
        console.error(`[SW] Failed to display notification (${pushId}):`, error);
      })
  );
});

// Notification click event - Enhanced with better action handling
self.addEventListener('notificationclick', (event) => {
  const pushId = event.notification.data?.pushId || 'unknown';
  const category = event.notification.data?.category || 'reminder';
  const timestamp = new Date().toISOString();
  
  console.log(`[SW] Notification clicked at ${timestamp} (${pushId}):`, {
    action: event.action,
    category: category,
    tag: event.notification.tag,
    data: event.notification.data
  });
  
  event.notification.close();
  
  const action = event.action;
  let urlToOpen = '/';
  
  // Enhanced action handling based on notification category and action
  switch (action) {
    // Workout actions
    case 'start-workout':
    case 'quick-workout':
    case 'full-workout':
      urlToOpen = '/?tab=workout';
      break;
    
    // Progress/Stats actions
    case 'view-progress':
    case 'view-stats':
    case 'plan-week':
      urlToOpen = '/?tab=stats';
      break;
    
    // Achievement actions
    case 'view-achievement':
      urlToOpen = '/?tab=achievements';
      break;
    
    // Goal actions
    case 'set-goal':
    case 'next-goal':
      urlToOpen = '/?tab=stats'; // Could be dedicated goals page
      break;
    
    // Share actions (handle differently)
    case 'share':
      // For share actions, we'll post a message to the app
      event.waitUntil(
        clients.matchAll({ type: 'window' }).then((clientList) => {
          if (clientList.length > 0) {
            clientList[0].postMessage({
              type: 'SHARE_ACHIEVEMENT',
              data: event.notification.data
            });
            return clientList[0].focus();
          } else {
            return clients.openWindow('/?tab=achievements&share=true');
          }
        })
      );
      return;
    
    // Default actions
    case 'dismiss':
      // Just close the notification, no navigation needed
      console.log(`[SW] Notification dismissed (${pushId})`);
      return;
    
    default:
      // Default click (no action button) - navigate based on category
      switch (category) {
        case 'achievement':
          urlToOpen = '/?tab=achievements';
          break;
        case 'streak':
        case 'reminder':
          urlToOpen = '/?tab=workout';
          break;
        case 'progress':
        case 'milestone':
          urlToOpen = '/?tab=stats';
          break;
        default:
          urlToOpen = '/';
      }
  }
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      console.log(`[SW] Found ${clientList.length} open windows (${pushId})`);
      
      // Log the click interaction
      logNotificationInteraction(pushId, action, category, event.notification.data);
      
      // Try to focus existing window with same base URL
      const baseUrl = urlToOpen.split('?')[0];
      for (const client of clientList) {
        if (client.url.includes(baseUrl) && 'focus' in client) {
          console.log(`[SW] Focusing existing window (${pushId}):`, client.url);
          // If the window is already on the right page, just focus it
          if (client.url.includes(urlToOpen)) {
            return client.focus();
          }
          // Otherwise, navigate to the new URL
          return client.focus().then(() => {
            client.postMessage({
              type: 'NAVIGATE',
              url: urlToOpen
            });
          });
        }
      }
      
      // Open new window if no existing one found
      if (clients.openWindow) {
        console.log(`[SW] Opening new window (${pushId}):`, urlToOpen);
        return clients.openWindow(urlToOpen);
      }
    })
    .catch((error) => {
      console.error(`[SW] Error handling notification click (${pushId}):`, error);
    })
  );
});

// Function to log notification interactions
async function logNotificationInteraction(pushId, action, category, notificationData) {
  try {
    const interactionData = {
      notification_type: notificationData?.notification_type || 'unknown',
      category: category || 'unknown',
      action: action || 'click',
      data: {
        pushId,
        timestamp: new Date().toISOString(),
        ...notificationData
      }
    };

    console.log(`[SW] Logging notification interaction (${pushId}):`, interactionData);

    // Send to edge function for logging
    const response = await fetch('https://kgwmplptoctmoaefnpfg.supabase.co/functions/v1/log-notification-interaction', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(interactionData)
    });

    if (!response.ok) {
      console.error(`[SW] Failed to log interaction (${pushId}):`, response.status);
    } else {
      console.log(`[SW] Interaction logged successfully (${pushId})`);
    }
  } catch (error) {
    console.error(`[SW] Error logging interaction (${pushId}):`, error);
  }
}

// Enhanced background sync for offline session saving
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'sync-sessions') {
    event.waitUntil(syncOfflineSessions());
  } else if (event.tag === 'cache-workout-data') {
    event.waitUntil(cacheWorkoutDataForOffline());
  }
});

async function syncOfflineSessions() {
  try {
    console.log('[SW] Starting offline session sync...');
    
    // Get offline sessions from localStorage
    const offlineSessionsData = await getFromStorage('offline_workout_sessions');
    if (!offlineSessionsData) {
      console.log('[SW] No offline sessions to sync');
      return;
    }

    const sessions = JSON.parse(offlineSessionsData);
    const unsynced = sessions.filter(s => !s.synced);
    
    if (unsynced.length === 0) {
      console.log('[SW] All sessions already synced');
      return;
    }

    console.log(`[SW] Syncing ${unsynced.length} offline sessions...`);
    
    let syncedCount = 0;
    let failedCount = 0;

    for (const session of unsynced) {
      try {
        const response = await fetch('https://kgwmplptoctmoaefnpfg.supabase.co/rest/v1/user_sessions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtnd21wbHB0b2N0bW9hZWZucGZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwODgyMjMsImV4cCI6MjA2NzY2NDIyM30.vlPPhkFrPL-pEM974VB9h4KC9XebvmvWQa80Cl6Uidw'
          },
          body: JSON.stringify({
            user_id: session.user_id,
            exercise_id: session.exercise_id,
            duration_seconds: session.duration_seconds,
            completed_at: session.completed_at
          })
        });

        if (response.ok) {
          session.synced = true;
          syncedCount++;
          console.log('[SW] Synced session:', session.id);
        } else {
          failedCount++;
          console.error('[SW] Failed to sync session:', session.id, response.status);
        }
      } catch (error) {
        failedCount++;
        console.error('[SW] Error syncing session:', session.id, error);
      }
    }

    // Update localStorage with sync status
    await setToStorage('offline_workout_sessions', JSON.stringify(sessions));
    
    // Remove synced sessions
    const remaining = sessions.filter(s => !s.synced);
    if (remaining.length < sessions.length) {
      await setToStorage('offline_workout_sessions', JSON.stringify(remaining));
    }

    console.log(`[SW] Sync complete: ${syncedCount} synced, ${failedCount} failed`);
    
    // Notify app of sync completion
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'OFFLINE_SYNC_COMPLETE',
        data: { synced: syncedCount, failed: failedCount }
      });
    });

  } catch (error) {
    console.error('[SW] Error in syncOfflineSessions:', error);
  }
}

async function cacheWorkoutDataForOffline() {
  try {
    console.log('[SW] Caching essential workout data for offline use...');
    
    // Cache plank exercises
    const exercisesResponse = await fetch('https://kgwmplptoctmoaefnpfg.supabase.co/rest/v1/plank_exercises?select=*', {
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtnd21wbHB0b2N0bW9hZWZucGZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwODgyMjMsImV4cCI6MjA2NzY2NDIyM30.vlPPhkFrPL-pEM974VB9h4KC9XebvmvWQa80Cl6Uidw'
      }
    });
    
    if (exercisesResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put('offline-exercises', exercisesResponse.clone());
      console.log('[SW] Cached exercises for offline use');
    }

  } catch (error) {
    console.error('[SW] Error caching workout data:', error);
  }
}

// Helper functions for localStorage access from service worker
async function getFromStorage(key) {
  return new Promise((resolve) => {
    // Since service worker can't access localStorage directly,
    // we'll use postMessage to communicate with the main thread
    self.clients.matchAll().then(clients => {
      if (clients.length > 0) {
        clients[0].postMessage({
          type: 'GET_STORAGE',
          key: key
        });
      }
    });
    
    // For now, return null - this would need to be implemented
    // with proper message passing between SW and main thread
    resolve(null);
  });
}

async function setToStorage(key, value) {
  return new Promise((resolve) => {
    self.clients.matchAll().then(clients => {
      if (clients.length > 0) {
        clients[0].postMessage({
          type: 'SET_STORAGE',
          key: key,
          value: value
        });
      }
    });
    resolve();
  });
}