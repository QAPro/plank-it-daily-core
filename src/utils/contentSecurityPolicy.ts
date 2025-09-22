// Content Security Policy configuration for enhanced security
import { isInLovablePreview } from './iframe';

export const generateCSPHeader = (): string => {
  const SUPABASE_ORIGIN = "https://kgwmplptoctmoaefnpfg.supabase.co";
  const isLovablePreview = isInLovablePreview();
  
  const cspDirectives = [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-src 'none'",
    // Allow frame-ancestors for Lovable preview, strict security in production
    isLovablePreview ? "frame-ancestors *.lovable.app *.lovable.dev" : "frame-ancestors 'none'",
    "script-src 'self'",
    "script-src-attr 'none'",
    "style-src 'self' 'unsafe-inline'", // unsafe-inline needed for dynamic styles
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    `connect-src 'self' ${SUPABASE_ORIGIN} wss://kgwmplptoctmoaefnpfg.supabase.co`,
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests",
    "block-all-mixed-content"
  ];
  
  return cspDirectives.join("; ");
};

// Apply CSP via meta tag (fallback if server headers not available)
export const applyCSPMetaTag = (): void => {
  if (typeof document !== 'undefined') {
    const existingMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (existingMeta) return;
    
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = generateCSPHeader();
    document.head.appendChild(meta);
  }
};

// Security headers for development reference
export const securityHeaders = {
  "Content-Security-Policy": generateCSPHeader(),
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
  "X-XSS-Protection": "1; mode=block",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()"
};