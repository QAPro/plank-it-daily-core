import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { QueryProvider } from './providers/QueryProvider'
import { applyCSPMetaTag } from './utils/contentSecurityPolicy'

// Apply security headers
applyCSPMetaTag();

createRoot(document.getElementById("root")!).render(
  <QueryProvider>
    <App />
  </QueryProvider>
)
