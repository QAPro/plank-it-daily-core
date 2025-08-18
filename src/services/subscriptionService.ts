
import { supabase } from "@/integrations/supabase/client";
import { addMonths, addYears } from "date-fns";

export type SubscriptionPlan = {
  id: string;
  name: string;
  description: string | null;
  price_cents: number;
  billing_interval: "month" | "year" | string;
  stripe_price_id: string | null;
  features: any[] | null;
  is_active: boolean;
  is_popular: boolean;
  sort_order: number | null;
  created_at?: string;
  updated_at?: string;
};

export type ActiveSubscription = {
  subscription_id: string | null;
  plan_name: string | null;
  status: "active" | "canceled" | "past_due" | "unpaid" | "trialing" | string | null;
  current_period_end: string | null;
  is_custom_pricing: boolean | null;
  custom_price_cents: number | null;
};

export type AdminSettingKey =
  | "subscription_system_enabled"
  | "stripe_mode"
  | "demo_mode"
  | "allow_custom_pricing"
  | "beta_user_discount_percentage";

export type AdminSetting = {
  id?: string;
  setting_key: AdminSettingKey | string;
  setting_value: any;
  description?: string | null;
  updated_by?: string | null;
  updated_at?: string;
  is_public?: boolean | null;
};

const SETTINGS_TABLE = "admin_settings";
const PLANS_TABLE = "subscription_plans";
const SUBSCRIPTIONS_TABLE = "subscriptions";
const BILLING_TABLE = "billing_transactions";
const USERS_TABLE = "users";

// Use a locally casted supabase client to avoid TS errors until generated types include new tables/RPCs
const sb: any = supabase;

export const subscriptionService = {
  async getPlans(): Promise<SubscriptionPlan[]> {
    console.log("[subscriptionService] getPlans");
    const { data, error } = await sb
      .from(PLANS_TABLE)
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });
    if (error) {
      console.error("[subscriptionService] getPlans error", error);
      throw error;
    }
    return (data as unknown as SubscriptionPlan[]) || [];
  },

  async getAdminSettings(keys?: AdminSettingKey[]): Promise<Record<string, any>> {
    console.log("[subscriptionService] getAdminSettings", keys);
    let query = sb.from(SETTINGS_TABLE).select("setting_key, setting_value");
    if (keys && keys.length) {
      query = query.in("setting_key", keys as string[]);
    }
    const { data, error } = await query;
    if (error) {
      console.error("[subscriptionService] getAdminSettings error", error);
      throw error;
    }
    const map: Record<string, any> = {};
    (data || []).forEach((row: any) => {
      map[row.setting_key] = row.setting_value;
    });
    return map;
  },

  async setAdminSetting(key: AdminSettingKey, value: any, updatedBy?: string) {
    console.log("[subscriptionService] setAdminSetting", key, value);
    const { error } = await sb
      .from(SETTINGS_TABLE)
      .upsert(
        {
          setting_key: key,
          setting_value: value,
          updated_by: updatedBy ?? null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "setting_key" }
      );
    if (error) {
      console.error("[subscriptionService] setAdminSetting error", error);
      throw error;
    }
  },

  async getActiveSubscription(userId: string): Promise<ActiveSubscription | null> {
    console.log("[subscriptionService] getActiveSubscription", userId);
    const { data, error } = await sb.rpc("get_user_active_subscription", {
      _user_id: userId,
    });
    if (error) {
      console.error("[subscriptionService] getActiveSubscription error", error);
      throw error;
    }
    const row = (data as any[] | null)?.[0] ?? null;
    if (!row) return null;
    return {
      subscription_id: row.subscription_id ?? null,
      plan_name: row.plan_name ?? null,
      status: row.status ?? null,
      current_period_end: row.current_period_end ?? null,
      is_custom_pricing: row.is_custom_pricing ?? null,
      custom_price_cents: row.effective_price ?? null,
    };
  },

  // DEMO upgrade flow: no Stripe. Creates a subscription row and updates the user's tier.
  async startDemoUpgrade(userId: string, plan: SubscriptionPlan) {
    console.log("[subscriptionService] startDemoUpgrade", { userId, plan });
    const now = new Date();
    const periodEnd =
      (plan.billing_interval as string) === "year"
        ? addYears(now, 1)
        : addMonths(now, 1);

    // 1) Create/Upsert active subscription for this user/plan
    const { error: subErr } = await sb.from(SUBSCRIPTIONS_TABLE).insert({
      user_id: userId,
      plan_id: plan.id,
      status: "active",
      current_period_start: now.toISOString(),
      current_period_end: periodEnd.toISOString(),
      cancel_at_period_end: false,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    });
    if (subErr) {
      console.error("[subscriptionService] startDemoUpgrade insert subscription error", subErr);
      throw subErr;
    }

    // 2) Update users.subscription_tier to premium (aligns with feature gating)
    const { error: userErr } = await sb
      .from(USERS_TABLE)
      .update({ subscription_tier: "premium", updated_at: now.toISOString() })
      .eq("id", userId);
    if (userErr) {
      console.error("[subscriptionService] startDemoUpgrade update user tier error", userErr);
      throw userErr;
    }

    // 3) Add a billing transaction record (demo)
    const { error: billErr } = await sb.from(BILLING_TABLE).insert({
      user_id: userId,
      amount_cents: plan.price_cents,
      currency: "usd",
      status: "succeeded",
      transaction_type: "subscription",
      description: `Demo upgrade to ${plan.name}`,
      processed_at: now.toISOString(),
      created_at: now.toISOString(),
    });
    if (billErr) {
      console.error("[subscriptionService] startDemoUpgrade billing insert error", billErr);
      throw billErr;
    }

    return true;
  },

  async cancelActiveSubscription(userId: string) {
    console.log("[subscriptionService] cancelActiveSubscription", userId);
    const now = new Date();

    // 1) Mark any active subscription as canceled
    const { error: subErr } = await sb
      .from(SUBSCRIPTIONS_TABLE)
      .update({
        status: "canceled",
        canceled_at: now.toISOString(),
        updated_at: now.toISOString(),
      })
      .eq("user_id", userId)
      .eq("status", "active");
    if (subErr) {
      console.error("[subscriptionService] cancelActiveSubscription update sub error", subErr);
      throw subErr;
    }

    // 2) Downgrade user tier back to free
    const { error: userErr } = await sb
      .from(USERS_TABLE)
      .update({ subscription_tier: "free", updated_at: now.toISOString() })
      .eq("id", userId);
    if (userErr) {
      console.error("[subscriptionService] cancelActiveSubscription update user tier error", userErr);
      throw userErr;
    }

    return true;
  },
};
