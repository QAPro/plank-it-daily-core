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

    // Test if we can create a JWK key from both keys (mirror the send function)
    let canImportPrivateKey = false;
    let canSignJWT = false;
    if (publicKey && privateKey && validation.publicKey.isValidLength && validation.privateKey.isValidLength && 
        validation.publicKey.isBase64url && validation.privateKey.isBase64url) {
      try {
        // Convert public key from base64url to bytes (should be 65 bytes: 0x04 + X + Y)
        const pubBinaryString = atob(publicKey.replace(/-/g, '+').replace(/_/g, '/'));
        const pubBytes = new Uint8Array(pubBinaryString.length);
        for (let i = 0; i < pubBinaryString.length; i++) {
          pubBytes[i] = pubBinaryString.charCodeAt(i);
        }

        if (pubBytes.length === 65 && pubBytes[0] === 0x04) {
          // Extract x and y coordinates
          const x = pubBytes.slice(1, 33);
          const y = pubBytes.slice(33, 65);
          
          // Convert to base64url format for JWK
          const toBase64Url = (buffer: Uint8Array) => 
            btoa(String.fromCharCode(...buffer)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

          // Build complete EC JWK like the send function does
          const jwkPrivate: JsonWebKey = {
            kty: 'EC',
            crv: 'P-256',
            d: privateKey,  // base64url 32-byte scalar
            x: toBase64Url(x),  // base64url X coordinate  
            y: toBase64Url(y),  // base64url Y coordinate
          };

          // Try to import the JWK private key like the send function
          const cryptoKey = await crypto.subtle.importKey(
            'jwk',
            jwkPrivate,
            { name: 'ECDSA', namedCurve: 'P-256' },
            false,
            ['sign']
          );
          canImportPrivateKey = true;

          // Test actual JWT signing to confirm end-to-end functionality
          const header = { typ: 'JWT', alg: 'ES256' };
          const payload = { aud: 'test', exp: Math.floor(Date.now() / 1000) + 3600, sub: 'test' };
          const toB64Url = (input: string) => btoa(input).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
          const encodedHeader = toB64Url(JSON.stringify(header));
          const encodedPayload = toB64Url(JSON.stringify(payload));
          const unsignedToken = `${encodedHeader}.${encodedPayload}`;
          
          const signature = await crypto.subtle.sign(
            { name: 'ECDSA', hash: 'SHA-256' },
            cryptoKey,
            new TextEncoder().encode(unsignedToken)
          );
          canSignJWT = true;
        }
      } catch (e) {
        console.log('Failed to import private key or sign JWT:', e.message);
      }
    }

    const isValid = validation.publicKey.exists && 
                   validation.publicKey.isValidLength && 
                   validation.publicKey.isBase64url &&
                   validation.privateKey.exists && 
                   validation.privateKey.isValidLength && 
                   validation.privateKey.isBase64url &&
                   canImportPrivateKey &&
                   canSignJWT;

    return new Response(
      JSON.stringify({ 
        isValid,
        canImportPrivateKey,
        canSignJWT,
        validation,
        recommendations: isValid ? [] : [
          !validation.publicKey.exists && "VAPID_PUBLIC_KEY secret not set",
          !validation.privateKey.exists && "VAPID_PRIVATE_KEY secret not set",
          !validation.publicKey.isValidLength && "Public key wrong length (should be 87-88 chars)",
          !validation.privateKey.isValidLength && "Private key wrong length (should be 43-44 chars)",
          !validation.publicKey.isBase64url && "Public key not valid base64url format",
          !validation.privateKey.isBase64url && "Private key not valid base64url format",
          !canImportPrivateKey && "Private key cannot be imported as JWK (wrong format)",
          canImportPrivateKey && !canSignJWT && "Private key imports but cannot sign JWT (check coordinates)"
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