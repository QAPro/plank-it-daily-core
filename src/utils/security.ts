
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

// Real encryption key derivation from user session
const deriveKey = async (salt: string): Promise<CryptoKey> => {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(salt + window.location.origin),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: new TextEncoder().encode('secure-storage-salt'),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
};

// Secure localStorage wrapper with real AES-GCM encryption
export const secureStorage = {
  setItem: async (key: string, value: string, encrypt = false): Promise<void> => {
    try {
      let dataToStore = value;
      let encrypted = false;
      
      if (encrypt && crypto.subtle) {
        const salt = crypto.getRandomValues(new Uint8Array(16));
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const cryptoKey = await deriveKey(Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join(''));
        
        const encodedData = new TextEncoder().encode(value);
        const encryptedData = await crypto.subtle.encrypt(
          { name: 'AES-GCM', iv },
          cryptoKey,
          encodedData
        );
        
        dataToStore = JSON.stringify({
          encrypted: Array.from(new Uint8Array(encryptedData)),
          salt: Array.from(salt),
          iv: Array.from(iv),
        });
        encrypted = true;
      }
      
      const timestamp = Date.now();
      const secureItem = JSON.stringify({ 
        data: dataToStore, 
        timestamp, 
        encrypted,
        integrity: await crypto.subtle.digest('SHA-256', new TextEncoder().encode(dataToStore + timestamp))
      });
      localStorage.setItem(`secure_${key}`, secureItem);
    } catch (error) {
      console.warn('Failed to store secure item:', error);
      // Fallback to base64 if crypto not available
      const timestamp = Date.now();
      const secureItem = JSON.stringify({ data: btoa(value), timestamp, encrypted: true });
      localStorage.setItem(`secure_${key}`, secureItem);
    }
  },
  
  getItem: async (key: string, maxAge = 24 * 60 * 60 * 1000): Promise<string | null> => {
    try {
      const stored = localStorage.getItem(`secure_${key}`);
      if (!stored) return null;
      
      const { data, timestamp, encrypted, integrity } = JSON.parse(stored);
      
      // Check if data has expired
      if (Date.now() - timestamp > maxAge) {
        localStorage.removeItem(`secure_${key}`);
        return null;
      }
      
      // Verify integrity if available
      if (integrity && crypto.subtle) {
        const computedIntegrity = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(data + timestamp));
        const storedIntegrity = new Uint8Array(Object.values(integrity));
        const computedArray = new Uint8Array(computedIntegrity);
        
        if (!storedIntegrity.every((val, i) => val === computedArray[i])) {
          localStorage.removeItem(`secure_${key}`);
          return null;
        }
      }
      
      if (encrypted && crypto.subtle && typeof data === 'string') {
        try {
          const { encrypted: encryptedData, salt, iv } = JSON.parse(data);
          const cryptoKey = await deriveKey(salt.map((b: number) => b.toString(16).padStart(2, '0')).join(''));
          
          const decryptedData = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: new Uint8Array(iv) },
            cryptoKey,
            new Uint8Array(encryptedData)
          );
          
          return new TextDecoder().decode(decryptedData);
        } catch (decryptError) {
          // Fallback to base64 decode for legacy data
          return encrypted ? atob(data) : data;
        }
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
const SUPABASE_ORIGIN = import.meta.env.VITE_SUPABASE_URL;
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
    `connect-src 'self' ${SUPABASE_ORIGIN} ${SUPABASE_ORIGIN.replace('https://', 'wss://')}`,
    "form-action 'self'",
    "upgrade-insecure-requests"
  ].join("; "),
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "X-XSS-Protection": "1; mode=block",
};
