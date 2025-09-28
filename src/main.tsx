import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { QueryProvider } from './providers/QueryProvider'
import { applyCSPMetaTag } from './utils/contentSecurityPolicy'

// Apply security headers
applyCSPMetaTag();

// Register service worker for PWA and push notifications with production error handling
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw-secure.js', {
        scope: '/'
      });
      console.log('[SW] Service worker registered:', registration.scope);
      
      // Update service worker if available
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('[SW] New service worker available, will activate on next visit');
            }
          });
        }
      });
    } catch (error) {
      console.error('[SW] Service worker registration failed:', error);
      // Don't let SW errors break the app
      localStorage.setItem('sw-error', JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }));
    }
  });
}

// Production error handling
window.addEventListener('error', (event) => {
  console.error('[Global Error]:', event.error);
  if (event.error?.message?.includes('Cannot read properties of null')) {
    // React hydration issue - reload once
    const reloadCount = parseInt(localStorage.getItem('reload-count') || '0');
    if (reloadCount < 2) {
      localStorage.setItem('reload-count', String(reloadCount + 1));
      window.location.reload();
    }
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
