import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const publicKey = Deno.env.get('VAPID_PUBLIC_KEY');
    const privateKey = Deno.env.get('VAPID_PRIVATE_KEY');

    const validation = {
      publicKey: {
        exists: !!publicKey,
        length: publicKey?.length || 0,
        isValidLength: publicKey ? publicKey.length >= 87 && publicKey.length <= 88 : false,
        isBase64url: publicKey ? /^[A-Za-z0-9_-]+$/.test(publicKey) : false
      },
      privateKey: {
        exists: !!privateKey,
        length: privateKey?.length || 0,
        isValidLength: privateKey ? privateKey.length >= 43 && privateKey.length <= 44 : false,
        isBase64url: privateKey ? /^[A-Za-z0-9_-]+$/.test(privateKey) : false
      }
    };

    // Test if we can create a key from the private key
    let canImportPrivateKey = false;
    if (privateKey && validation.privateKey.isValidLength && validation.privateKey.isBase64url) {
      try {
        // Convert base64url to ArrayBuffer
        const binaryString = atob(privateKey.replace(/-/g, '+').replace(/_/g, '/'));
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        // Try to import as raw P-256 private key
        const key = await crypto.subtle.importKey(
          'raw',
          bytes,
          { name: 'ECDSA', namedCurve: 'P-256' },
          false,
          ['sign']
        );
        canImportPrivateKey = true;
      } catch (e) {
        console.log('Failed to import private key:', e.message);
      }
    }

    const isValid = validation.publicKey.exists && 
                   validation.publicKey.isValidLength && 
                   validation.publicKey.isBase64url &&
                   validation.privateKey.exists && 
                   validation.privateKey.isValidLength && 
                   validation.privateKey.isBase64url &&
                   canImportPrivateKey;

    return new Response(
      JSON.stringify({ 
        isValid,
        canImportPrivateKey,
        validation,
        recommendations: isValid ? [] : [
          !validation.publicKey.exists && "VAPID_PUBLIC_KEY secret not set",
          !validation.privateKey.exists && "VAPID_PRIVATE_KEY secret not set",
          !validation.publicKey.isValidLength && "Public key wrong length (should be 87-88 chars)",
          !validation.privateKey.isValidLength && "Private key wrong length (should be 43-44 chars)",
          !validation.publicKey.isBase64url && "Public key not valid base64url format",
          !validation.privateKey.isBase64url && "Private key not valid base64url format",
          !canImportPrivateKey && "Private key cannot be imported (wrong format)"
        ].filter(Boolean)
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('VAPID validation error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});