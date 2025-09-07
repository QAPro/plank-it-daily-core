// Service Worker for Plank Coach PWA
const CACHE_NAME = 'plank-coach-v1';
const OFFLINE_URL = '/';

// Install event - cache essential resources
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching offline page');
      return cache.addAll([
        OFFLINE_URL,
        '/favicon.ico',
        '/placeholder.svg'
      ]);
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

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.open(CACHE_NAME).then((cache) => {
          return cache.match(OFFLINE_URL);
        });
      })
    );
  }
});

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
  let options = {
    body: 'Time for your workout!',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
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
      if (data.icon) options.icon = data.icon;
      if (data.badge) options.badge = data.badge;
      if (data.tag) options.tag = data.tag;
      if (data.actions) options.actions = data.actions;
      if (data.data) options.data = { ...options.data, ...data.data };
      if (data.requireInteraction !== undefined) options.requireInteraction = data.requireInteraction;
    } catch (error) {
      console.error(`[SW] Error parsing push data (${pushId}):`, error);
      console.log(`[SW] Falling back to default notification (${pushId})`);
    }
  }
  
  console.log(`[SW] Showing notification (${pushId}):`, { title, options });
  
  event.waitUntil(
    self.registration.showNotification(title, options)
      .then(() => {
        console.log(`[SW] Notification displayed successfully (${pushId})`);
      })
      .catch((error) => {
        console.error(`[SW] Failed to display notification (${pushId}):`, error);
      })
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  const pushId = event.notification.data?.pushId || 'unknown';
  const timestamp = new Date().toISOString();
  
  console.log(`[SW] Notification clicked at ${timestamp} (${pushId}):`, {
    action: event.action,
    tag: event.notification.tag,
    data: event.notification.data
  });
  
  event.notification.close();
  
  const action = event.action;
  let urlToOpen = '/';
  
  if (action === 'start-workout') {
    urlToOpen = '/?tab=workout';
  } else if (action === 'view-progress') {
    urlToOpen = '/?tab=stats';
  }
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      console.log(`[SW] Found ${clientList.length} open windows (${pushId})`);
      
      // Try to focus existing window
      for (const client of clientList) {
        if (client.url.includes(urlToOpen.split('?')[0]) && 'focus' in client) {
          console.log(`[SW] Focusing existing window (${pushId}):`, client.url);
          return client.focus();
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

// Background sync for offline session saving
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'sync-sessions') {
    event.waitUntil(syncOfflineSessions());
  }
});

async function syncOfflineSessions() {
  try {
    // Get pending sessions from IndexedDB and sync to server
    console.log('[SW] Syncing offline sessions');
    // Implementation would go here
  } catch (error) {
    console.error('[SW] Error syncing sessions:', error);
  }
}