import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

// Map Stripe Price IDs to subscription tiers
const PRICE_TO_TIER_MAP: Record<string, string> = {
  'price_1SQZoMJW62tXwc0DsoxUOfpA': 'premium', // Premium Monthly
  'price_1SQZsRJW62tXwc0Dazc2XLxR': 'premium', // Premium Annual
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Verify Stripe key
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }
    logStep("Stripe key verified");

    // Initialize Supabase client with service role key
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) {
      throw new Error("User not authenticated or email not available");
    }
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Initialize Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Find customer by email
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("No customer found, updating to free tier");
      
      // Update user tier to free
      await supabaseClient
        .from("users")
        .update({ subscription_tier: "free" })
        .eq("id", user.id);

      return new Response(JSON.stringify({
        subscribed: false,
        stripe_price_id: null,
        subscription_end: null,
        plan_name: null,
      }), {
        headers: corsHeaders,
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    // Get active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    const hasActiveSub = subscriptions.data.length > 0;

    if (hasActiveSub) {
      const subscription = subscriptions.data[0];
      const priceId = subscription.items.data[0].price.id;
      const subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      const tier = PRICE_TO_TIER_MAP[priceId] || 'free';

      logStep("Active subscription found", { 
        subscriptionId: subscription.id, 
        priceId, 
        tier,
        endDate: subscriptionEnd 
      });

      // Update user tier in database
      await supabaseClient
        .from("users")
        .update({ subscription_tier: tier })
        .eq("id", user.id);

      logStep("User tier updated in database", { tier });

      // Get plan name from database
      const { data: plans } = await supabaseClient
        .from("subscription_plans")
        .select("name, billing_interval")
        .eq("stripe_price_id", priceId)
        .single();

      const planName = plans ? `${plans.name} ${plans.billing_interval === 'year' ? '(Annual)' : '(Monthly)'}` : 'Premium';

      return new Response(JSON.stringify({
        subscribed: true,
        stripe_price_id: priceId,
        subscription_end: subscriptionEnd,
        plan_name: planName,
      }), {
        headers: corsHeaders,
        status: 200,
      });
    } else {
      logStep("No active subscription found, updating to free tier");
      
      // Update user tier to free
      await supabaseClient
        .from("users")
        .update({ subscription_tier: "free" })
        .eq("id", user.id);

      return new Response(JSON.stringify({
        subscribed: false,
        stripe_price_id: null,
        subscription_end: null,
        plan_name: null,
      }), {
        headers: corsHeaders,
        status: 200,
      });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: corsHeaders,
      status: 500,
    });
  }
});
