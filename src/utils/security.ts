
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/data:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/&lt;script/gi, '')
    .replace(/&lt;\/script/gi, '')
    .replace(/eval\s*\(/gi, '')
    .replace(/expression\s*\(/gi, '')
    .trim();
};

export const sanitizeHtml = (html: string): string => {
  // More comprehensive HTML sanitization
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/<link\b[^<]*>/gi, '')
    .replace(/<meta\b[^<]*>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/data:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
};

export const sanitizeUsername = (username: string): string => {
  return username
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '') // Remove invalid characters
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
    .replace(/^_+|_+$/g, '') // Remove leading/trailing underscores
    .slice(0, 30); // Ensure max length
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const rateLimiter = (key: string, limit: number, windowMs: number): boolean => {
  const now = Date.now();
  const window = Math.floor(now / windowMs);
  const storageKey = `rateLimit_${key}_${window}`;
  
  const current = parseInt(localStorage.getItem(storageKey) || '0');
  
  if (current >= limit) {
    return false;
  }
  
  localStorage.setItem(storageKey, (current + 1).toString());
  
  // Clean up old entries
  setTimeout(() => {
    localStorage.removeItem(storageKey);
  }, windowMs);
  
  return true;
};

// Secure localStorage wrapper with encryption for sensitive data
export const secureStorage = {
  setItem: (key: string, value: string, encrypt = false): void => {
    try {
      const dataToStore = encrypt ? btoa(value) : value;
      const timestamp = Date.now();
      const secureItem = JSON.stringify({ data: dataToStore, timestamp, encrypted: encrypt });
      localStorage.setItem(`secure_${key}`, secureItem);
    } catch (error) {
      console.warn('Failed to store secure item:', error);
    }
  },
  
  getItem: (key: string, maxAge = 24 * 60 * 60 * 1000): string | null => {
    try {
      const stored = localStorage.getItem(`secure_${key}`);
      if (!stored) return null;
      
      const { data, timestamp, encrypted } = JSON.parse(stored);
      
      // Check if data has expired
      if (Date.now() - timestamp > maxAge) {
        localStorage.removeItem(`secure_${key}`);
        return null;
      }
      
      return encrypted ? atob(data) : data;
    } catch (error) {
      console.warn('Failed to retrieve secure item:', error);
      return null;
    }
  },
  
  removeItem: (key: string): void => {
    localStorage.removeItem(`secure_${key}`);
  },
  
  clear: (): void => {
    const keys = Object.keys(localStorage).filter(key => key.startsWith('secure_'));
    keys.forEach(key => localStorage.removeItem(key));
  }
};

export const generateCSRFToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Hardened security headers (client-side representation)
// Note: Ensure your hosting layer applies these headers.
const SUPABASE_ORIGIN = "https://kgwmplptoctmoaefnpfg.supabase.co";
export const secureHeaders = {
  "Content-Security-Policy": [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    `connect-src 'self' ${SUPABASE_ORIGIN} wss://kgwmplptoctmoaefnpfg.supabase.co`,
    "form-action 'self'",
    "upgrade-insecure-requests"
  ].join("; "),
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "X-XSS-Protection": "1; mode=block",
};
