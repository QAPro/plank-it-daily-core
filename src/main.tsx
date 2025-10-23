import React from 'react';
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { QueryProvider } from './providers/QueryProvider'
import { applyCSPMetaTag } from './utils/contentSecurityPolicy'

// Apply security headers
applyCSPMetaTag();

// Simple error logging
window.addEventListener('error', (event) => {
  console.error('[Global Error]:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('[Unhandled Promise Rejection]:', event.reason);
});

createRoot(document.getElementById("root")!).render(
  <QueryProvider>
    <App />
  </QueryProvider>
)
