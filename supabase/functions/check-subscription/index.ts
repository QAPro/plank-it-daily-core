
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("[check-subscription] stub invoked");
    // Stubbed response: not subscribed by default
    return new Response(
      JSON.stringify({
        subscribed: false,
        subscription_tier: null,
        subscription_end: null,
        note: "Stripe not configured; use demo mode to simulate active subscriptions.",
      }),
      { headers: corsHeaders, status: 200 }
    );
  } catch (err) {
    console.error("[check-subscription] error:", err);
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: msg }), {
      headers: corsHeaders,
      status: 500,
    });
  }
});
