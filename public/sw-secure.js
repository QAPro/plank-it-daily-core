// Secure Service Worker - Enhanced security version
const CACHE_NAME = 'plank-coach-secure-v1';
const OFFLINE_URL = '/';

// Essential resources for offline support
const ESSENTIAL_RESOURCES = [
  OFFLINE_URL,
  '/favicon.ico',
  '/placeholder.svg',
  '/icons/notification-workout.png',
  '/icons/notification-achievement.png',
  '/icons/notification-streak.png',
  '/icons/notification-progress.png',
];

// Install event - cache essential resources
self.addEventListener('install', (event) => {
  console.log('[SW-Secure] Installing secure service worker');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW-Secure] Caching essential resources');
      return cache.addAll(ESSENTIAL_RESOURCES);
    }).then(() => {
      console.log('[SW-Secure] Skip waiting on install');
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW-Secure] Activating secure service worker');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW-Secure] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW-Secure] Claiming clients');
      return self.clients.claim();
    })
  );
});

// Secure fetch event - NO direct API writes
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

  // Handle Supabase API requests - READ ONLY
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

    // Cache public storage assets
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

    // All other Supabase requests: network first, no caching
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

// Helper functions for notifications
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

// Push event - secure notification display
self.addEventListener('push', (event) => {
  const timestamp = new Date().toISOString();
  const pushId = Math.random().toString(36).substr(2, 9);
  
  console.log(`[SW-Secure] Push received at ${timestamp} (ID: ${pushId})`);
  
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
      const data = JSON.parse(rawText);
      
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
      console.error(`[SW-Secure] Error parsing push data (${pushId}):`, error);
    }
  }
  
  console.log(`[SW-Secure] Showing notification (${pushId}) with category ${category}`);
  
  event.waitUntil(
    self.registration.showNotification(title, options)
      .then(() => {
        console.log(`[SW-Secure] Notification displayed successfully (${pushId})`);
      })
      .catch((error) => {
        console.error(`[SW-Secure] Failed to display notification (${pushId}):`, error);
      })
  );
});

// SECURE Notification click event - NO direct API calls
self.addEventListener('notificationclick', (event) => {
  const pushId = event.notification.data?.pushId || 'unknown';
  const category = event.notification.data?.category || 'reminder';
  const timestamp = new Date().toISOString();
  
  console.log(`[SW-Secure] Notification clicked at ${timestamp} (${pushId}):`, {
    action: event.action,
    category: category,
    tag: event.notification.tag
  });
  
  event.notification.close();
  
  const action = event.action;
  let urlToOpen = '/';
  
  // Enhanced action handling
  switch (action) {
    case 'start-workout':
    case 'quick-workout':
    case 'full-workout':
      urlToOpen = '/?tab=workout';
      break;
    
    case 'view-progress':
    case 'view-stats':
      urlToOpen = '/?tab=stats';
      break;
    
    case 'view-achievement':
      urlToOpen = '/?tab=achievements';
      break;
    
    case 'set-goal':
      urlToOpen = '/?tab=stats';
      break;
    
    case 'share':
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
    
    case 'dismiss':
      console.log(`[SW-Secure] Notification dismissed (${pushId})`);
      return;
    
    default:
      // Default click based on category
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
      console.log(`[SW-Secure] Found ${clientList.length} open windows (${pushId})`);
      
      // SECURE: Send interaction data to app for processing
      secureLogInteraction(pushId, action, category, event.notification.data);
      
      // Try to focus existing window
      const baseUrl = urlToOpen.split('?')[0];
      for (const client of clientList) {
        if (client.url.includes(baseUrl) && 'focus' in client) {
          console.log(`[SW-Secure] Focusing existing window (${pushId}):`, client.url);
          if (client.url.includes(urlToOpen)) {
            return client.focus();
          }
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
        console.log(`[SW-Secure] Opening new window (${pushId}):`, urlToOpen);
        return clients.openWindow(urlToOpen);
      }
    })
    .catch((error) => {
      console.error(`[SW-Secure] Error handling notification click (${pushId}):`, error);
    })
  );
});

// SECURE interaction logging - via app messaging
function secureLogInteraction(pushId, action, category, notificationData) {
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

    console.log(`[SW-Secure] Requesting secure log for interaction (${pushId})`);

    // Send to app for secure processing (app has user context & JWT)
    clients.matchAll({ type: 'window' }).then((clientList) => {
      if (clientList.length > 0) {
        clientList[0].postMessage({
          type: 'LOG_NOTIFICATION_INTERACTION',
          data: interactionData
        });
      }
    });

  } catch (error) {
    console.error(`[SW-Secure] Error preparing interaction log (${pushId}):`, error);
  }
}

// SECURE background sync - NO direct API writes
self.addEventListener('sync', (event) => {
  console.log('[SW-Secure] Background sync triggered:', event.tag);
  
  if (event.tag === 'sync-sessions') {
    event.waitUntil(secureSessionSync());
  }
});

// SECURE session sync - via app messaging
async function secureSessionSync() {
  try {
    console.log('[SW-Secure] Starting secure session sync...');
    
    // Get offline sessions from localStorage (read-only)
    const offlineSessionsData = await getFromStorage('offline_workout_sessions');
    if (!offlineSessionsData) {
      console.log('[SW-Secure] No offline sessions to sync');
      return;
    }

    const sessions = JSON.parse(offlineSessionsData);
    const unsynced = sessions.filter(s => !s.synced);
    
    if (unsynced.length === 0) {
      console.log('[SW-Secure] All sessions already synced');
      return;
    }

    console.log(`[SW-Secure] Requesting secure sync for ${unsynced.length} sessions`);
    
    // Send to app for secure processing
    const clients = await self.clients.matchAll({ type: 'window' });
    if (clients.length > 0) {
      for (const session of unsynced) {
        clients[0].postMessage({
          type: 'SAVE_OFFLINE_SESSION',
          data: session
        });
      }
    }

  } catch (error) {
    console.error('[SW-Secure] Error in secure session sync:', error);
  }
}

// Message handling from app
self.addEventListener('message', (event) => {
  console.log('[SW-Secure] Received message:', event.data);
  
  const { type, sessionId } = event.data;
  
  if (type === 'SYNC_SUCCESS') {
    // Mark session as synced in localStorage
    markSessionSynced(sessionId);
  } else if (type === 'SYNC_FAILED') {
    console.error('[SW-Secure] Session sync failed:', event.data.error);
  }
});

// Helper functions
async function getFromStorage(key) {
  return new Promise((resolve) => {
    // Request from app
    clients.matchAll({ type: 'window' }).then((clientList) => {
      if (clientList.length > 0) {
        clientList[0].postMessage({
          type: 'GET_STORAGE',
          key: key
        });
        
        // Listen for response
        const handleMessage = (event) => {
          if (event.data.type === 'STORAGE_VALUE' && event.data.key === key) {
            self.removeEventListener('message', handleMessage);
            resolve(event.data.value);
          }
        };
        self.addEventListener('message', handleMessage);
      } else {
        resolve(null);
      }
    });
  });
}

async function markSessionSynced(sessionId) {
  try {
    const data = await getFromStorage('offline_workout_sessions');
    if (data) {
      const sessions = JSON.parse(data);
      const updated = sessions.map(s => 
        s.id === sessionId ? { ...s, synced: true } : s
      );
      
      // Send update back to app
      const clients = await self.clients.matchAll({ type: 'window' });
      if (clients.length > 0) {
        clients[0].postMessage({
          type: 'SET_STORAGE',
          key: 'offline_workout_sessions',
          value: JSON.stringify(updated)
        });
      }
    }
  } catch (error) {
    console.error('[SW-Secure] Error marking session synced:', error);
  }
}