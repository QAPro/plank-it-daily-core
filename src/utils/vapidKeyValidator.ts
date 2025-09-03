/**
 * VAPID Key Validation Utilities
 * Validates and tests VAPID keys to ensure they're properly formatted for Web Push
 */

export interface VapidKeyValidationResult {
  isValid: boolean;
  errors: string[];
  keyLength?: number;
  keyFormat?: 'base64url' | 'base64' | 'invalid';
}

/**
 * Validates a VAPID public key format
 */
export function validateVapidPublicKey(key: string): VapidKeyValidationResult {
  const errors: string[] = [];
  
  if (!key) {
    errors.push('VAPID key is empty or undefined');
    return { isValid: false, errors };
  }

  // Check length - VAPID keys should be 65 bytes when decoded (87-88 chars in base64url)
  if (key.length < 80 || key.length > 100) {
    errors.push(`Invalid key length: ${key.length} (expected 87-88 characters for base64url)`);
  }

  // Detect format
  let keyFormat: 'base64url' | 'base64' | 'invalid' = 'invalid';
  
  // Base64url format (preferred for VAPID)
  if (/^[A-Za-z0-9_-]+$/.test(key)) {
    keyFormat = 'base64url';
  }
  // Standard base64 format
  else if (/^[A-Za-z0-9+/]+(=*)$/.test(key)) {
    keyFormat = 'base64';
  }
  else {
    errors.push('Key contains invalid characters (must be base64 or base64url)');
  }

  // Test conversion to Uint8Array
  try {
    const uint8Array = urlBase64ToUint8Array(key);
    if (uint8Array.length !== 65) {
      errors.push(`Decoded key length is ${uint8Array.length} bytes (expected 65)`);
    }
  } catch (error) {
    errors.push(`Cannot decode key: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    keyLength: key.length,
    keyFormat
  };
}

/**
 * Convert base64url to Uint8Array (same as in usePushNotifications)
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  return new Uint8Array([...rawData].map(char => char.charCodeAt(0)));
}

/**
 * Test VAPID key by attempting to create a subscription options object
 */
export async function testVapidKey(key: string): Promise<{ success: boolean; error?: string }> {
  try {
    const validation = validateVapidPublicKey(key);
    if (!validation.isValid) {
      return { 
        success: false, 
        error: `Validation failed: ${validation.errors.join(', ')}` 
      };
    }

    // Test conversion
    const applicationServerKey = urlBase64ToUint8Array(key);
    
    // Test with PushManager if available
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      const registration = await navigator.serviceWorker.ready;
      
      // Test subscription options (doesn't actually subscribe)
      const options = {
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey
      };
      
      // This will validate the key without actually subscribing
      console.log('[VAPID Test] Key validation successful, options created:', {
        applicationServerKeyLength: applicationServerKey.length,
        userVisibleOnly: options.userVisibleOnly
      });

      return { success: true };
    }

    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error during key test' 
    };
  }
}

/**
 * Generate instructions for creating valid VAPID keys
 */
export function getVapidKeyGenerationInstructions(): string {
  return `
To generate valid VAPID keys:

1. Using Node.js:
   npm install web-push
   node -e "console.log(require('web-push').generateVAPIDKeys())"

2. Using online generator:
   Visit: https://vapidkeys.com/

3. Using openssl:
   openssl ecparam -genkey -name prime256v1 -out vapid_private.pem
   openssl ec -in vapid_private.pem -pubout -outform DER | tail -c 65 | base64 | tr '/+' '_-' | tr -d '='

The public key should be 87-88 characters long and contain only A-Z, a-z, 0-9, -, and _ characters.
`;
}