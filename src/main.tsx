import React from 'react';
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { QueryProvider } from './providers/QueryProvider'
import { applyCSPMetaTag } from './utils/contentSecurityPolicy'

// Apply security headers
applyCSPMetaTag();

// Clear any existing reload counter
localStorage.removeItem('reload-count');

// Simple error logging without auto-reload
window.addEventListener('error', (event) => {
  console.error('[Global Error]:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('[Unhandled Promise Rejection]:', event.reason);
});

// Register service worker after React is ready
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw-secure.js')
      .then(reg => console.log('[SW] Registered:', reg.scope))
      .catch(err => console.error('[SW] Registration failed:', err));
  });
}

createRoot(document.getElementById("root")!).render(
  <QueryProvider>
    <App />
  </QueryProvider>
)
