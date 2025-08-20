export const sanitizeInput = (input: string): string => {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
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

export const generateCSRFToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

export const secureHeaders = {
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};
