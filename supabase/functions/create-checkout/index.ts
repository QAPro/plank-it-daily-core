
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // In the future, verify plan id and create Stripe session here.
    const body = await req.json().catch(() => ({}));
    console.log("[create-checkout] called with body:", body);

    // Stubbed behavior: respond with a friendly message
    const message = "Stripe not configured. Demo mode is available and uses in-app flow.";
    console.log("[create-checkout] returning stub message");

    // Return a dummy URL (your app could route to a help page later)
    const url = `${req.headers.get("origin") || "http://localhost:3000"}/`;

    return new Response(JSON.stringify({ url, message, demo: true }), {
      headers: corsHeaders,
      status: 200,
    });
  } catch (err) {
    console.error("[create-checkout] error:", err);
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: msg }), {
      headers: corsHeaders,
      status: 500,
    });
  }
});
