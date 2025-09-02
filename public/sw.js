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
  console.log('[SW] Push received:', event);
  
  if (!event.data) {
    return;
  }
  
  const options = {
    ...event.data.json(),
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    vibrate: [200, 100, 200],
    requireInteraction: true,
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
  
  event.waitUntil(
    self.registration.showNotification('Plank Coach', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event);
  
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
      // Try to focus existing window
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Open new window if no existing one found
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
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