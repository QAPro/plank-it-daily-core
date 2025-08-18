
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
    console.log("[customer-portal] stub invoked");
    // Stub: return a simple URL back to the app root with a note.
    const url = `${req.headers.get("origin") || "http://localhost:3000"}/`;
    const message = "Stripe customer portal not configured. Use demo mode or admin tools for now.";
    return new Response(JSON.stringify({ url, message, demo: true }), {
      headers: corsHeaders,
      status: 200,
    });
  } catch (err) {
    console.error("[customer-portal] error:", err);
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: msg }), {
      headers: corsHeaders,
      status: 500,
    });
  }
});
