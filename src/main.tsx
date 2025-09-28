import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { QueryProvider } from './providers/QueryProvider'
import { applyCSPMetaTag } from './utils/contentSecurityPolicy'

// Apply security headers
applyCSPMetaTag();

// Defer service worker registration for better performance
import { deferServiceWorkerRegistration } from './utils/performanceOptimization';
deferServiceWorkerRegistration();

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
