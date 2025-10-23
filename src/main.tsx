import React from 'react';
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { QueryProvider } from './providers/QueryProvider'
import { applyCSPMetaTag } from './utils/contentSecurityPolicy'

// Apply security headers
applyCSPMetaTag();

// Clear Service Worker and caches on startup
const clearServiceWorkerCache = async () => {
  try {
    // Unregister all service workers
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
        console.log('[SW] Unregistered service worker');
      }
    }
    
    // Clear all caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => {
          console.log('[Cache] Deleting:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }
    
    console.log('[Cleanup] Service Worker and caches cleared');
  } catch (error) {
    console.error('[Cleanup] Failed to clear SW/caches:', error);
  }
};

// Clear on startup only in development or if there's a cache issue
if (import.meta.env.DEV || sessionStorage.getItem('clear-cache') === 'true') {
  clearServiceWorkerCache();
  sessionStorage.removeItem('clear-cache');
}

// Simple error logging
window.addEventListener('error', (event) => {
  console.error('[Global Error]:', event.error);
  // If we get React null errors, mark for cache clear on next load
  if (event.error?.message?.includes('Cannot read properties of null')) {
    sessionStorage.setItem('clear-cache', 'true');
  }
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('[Unhandled Promise Rejection]:', event.reason);
});

createRoot(document.getElementById("root")!).render(
  <QueryProvider>
    <App />
  </QueryProvider>
)
