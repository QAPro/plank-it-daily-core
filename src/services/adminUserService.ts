import { supabase } from "@/integrations/supabase/client";
import type { SubscriptionPlan, ActiveSubscription } from "@/services/subscriptionService";

export type AdminUserSummary = {
  id: string;
  email: string | null;
  username: string | null;
  full_name: string | null;
};

export type AppRole = "admin" | "moderator" | "user";

export type UserFeatureOverride = {
  id: string;
  user_id: string;
  feature_name: string;
  is_enabled: boolean;
  granted_by: string | null;
  reason: string | null;
  created_at: string;
  expires_at: string | null;
};

// New types
export type AdminUserNote = {
  id: string;
  user_id: string;
  created_by: string;
  title: string;
  content: string;
  note_type: string;
  is_important: boolean;
  created_at: string;
  updated_at: string;
};

export type LifetimeAccessOverride = {
  id: string;
  user_id: string;
  override_type: "lifetime_access";
  override_data: any;
  reason: string | null;
  granted_by: string | null;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
};

export type SubscriptionTimelineEvent = {
  event_date: string;
  event_type: string;
  event_description: string | null;
  plan_name: string | null;
  amount_cents: number | null;
  status: string | null;
};

export type BillingHistoryItem = {
  transaction_id: string;
  amount_cents: number;
  currency: string;
  status: string;
  description: string | null;
  created_at: string;
  stripe_payment_intent_id: string | null;
};

export type UserEngagementMetrics = {
  user_id: string;
  email: string | null;
  subscription_tier: string | null;
  registration_date: string;
  total_sessions: number;
  last_session_date: string | null;
  avg_session_duration: number;
  total_duration: number;
  engagement_status: "active" | "dormant" | "inactive" | string;
  current_streak: number;
  longest_streak: number;
};

async function searchUsersRaw(identifier: string): Promise<AdminUserSummary[]> {
  console.log("[adminUserService] searchUsers", identifier);
  const { data, error } = await supabase.rpc("find_user_by_username_or_email", {
    identifier,
  });

  if (error) {
    console.error("[adminUserService] searchUsers error", error);
    throw error;
  }

  const rows = (data as any[]) || [];
  return rows.map((r) => ({
    id: r.user_id,
    email: r.email ?? null,
    username: r.username ?? null,
    full_name: r.full_name ?? null,
  }));
}

async function getUserRoles(userId: string): Promise<AppRole[]> {
  console.log("[adminUserService] getUserRoles", userId);
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);

  if (error) {
    console.error("[adminUserService] getUserRoles error", error);
    throw error;
  }

  return (data || []).map((r: any) => r.role as AppRole);
}

async function grantAdminRole(userId: string, reason?: string): Promise<boolean> {
  console.log("[adminUserService] grantAdminRole", userId, reason);
  const clientAny = supabase as any;
  const { data, error } = await clientAny.rpc("grant_admin_role", {
    _target_user_id: userId,
    _reason: reason ?? null,
  });

  if (error) {
    console.error("[adminUserService] grantAdminRole error", error);
    throw error;
  }

  return Boolean(data);
}

async function revokeAdminRole(userId: string, reason?: string): Promise<boolean> {
  console.log("[adminUserService] revokeAdminRole", userId, reason);
  const clientAny = supabase as any;
  const { data, error } = await clientAny.rpc("revoke_admin_role", {
    _target_user_id: userId,
    _reason: reason ?? null,
  });

  if (error) {
    console.error("[adminUserService] revokeAdminRole error", error);
    throw error;
  }

  return Boolean(data);
}

async function getFeatureOverrides(userId: string): Promise<UserFeatureOverride[]> {
  console.log("[adminUserService] getFeatureOverrides", userId);
  const clientAny = supabase as any;
  const { data, error } = await clientAny
    .from("user_feature_overrides")
    .select("*")
    .eq("user_id", userId)
    .order("feature_name", { ascending: true });

  if (error) {
    console.error("[adminUserService] getFeatureOverrides error", error);
    throw error;
  }

  return (data as unknown as UserFeatureOverride[]) || [];
}

async function setFeatureOverride(args: {
  userId: string;
  featureName: string;
  isEnabled: boolean;
  reason?: string;
  expiresAt?: string | null;
}): Promise<boolean> {
  const { userId, featureName, isEnabled, reason, expiresAt } = args;
  console.log("[adminUserService] setFeatureOverride", args);

  const clientAny = supabase as any;
  const { error } = await clientAny
    .from("user_feature_overrides")
    .upsert({
      user_id: userId,
      feature_name: featureName,
      is_enabled: isEnabled,
      reason: reason || null,
      expires_at: expiresAt || null,
      granted_by: (await supabase.auth.getUser()).data.user?.id || null,
    }, {
      onConflict: 'user_id,feature_name'
    });

  if (error) {
    console.error("[adminUserService] setFeatureOverride error", error);
    throw error;
  }

  return true;
}

// ---------------- New admin subscription helpers ----------------

async function getUserActiveSubscription(userId: string): Promise<ActiveSubscription | null> {
  console.log("[adminUserService] getUserActiveSubscription", userId);
  const clientAny = supabase as any;
  const { data, error } = await clientAny.rpc("get_user_active_subscription", {
    _user_id: userId,
  });
  if (error) {
    console.error("[adminUserService] getUserActiveSubscription error", error);
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
}

async function changeUserTier(userId: string, newTier: "free" | "premium", reason?: string): Promise<boolean> {
  console.log("[adminUserService] changeUserTier", { userId, newTier, reason });
  const clientAny = supabase as any;
  const { data, error } = await clientAny.rpc("admin_change_user_tier", {
    _target_user_id: userId,
    _new_tier: newTier,
    _reason: reason ?? null,
  });
  if (error) {
    console.error("[adminUserService] changeUserTier error", error);
    throw error;
  }
  return Boolean(data);
}

async function setCustomPricing(userId: string, planId: string, customPriceCents: number, reason?: string): Promise<boolean> {
  console.log("[adminUserService] setCustomPricing", { userId, planId, customPriceCents, reason });
  const clientAny = supabase as any;
  const { data, error } = await clientAny.rpc("admin_set_custom_pricing", {
    _target_user_id: userId,
    _plan_id: planId,
    _custom_price_cents: customPriceCents,
    _reason: reason ?? null,
  });
  if (error) {
    console.error("[adminUserService] setCustomPricing error", error);
    throw error;
  }
  return Boolean(data);
}

async function getActiveLifetimeOverride(userId: string): Promise<LifetimeAccessOverride | null> {
  console.log("[adminUserService] getActiveLifetimeOverride", userId);
  const clientAny = supabase as any;
  const { data, error } = await clientAny
    .from("user_subscription_overrides")
    .select("*")
    .eq("user_id", userId)
    .eq("override_type", "lifetime_access")
    .eq("is_active", true)
    .or("expires_at.is.null,expires_at.gt.now()")
    .order("created_at", { ascending: false })
    .limit(1);
  if (error) {
    console.error("[adminUserService] getActiveLifetimeOverride error", error);
    throw error;
  }
  const row = (data as any[] | null)?.[0] ?? null;
  return (row as LifetimeAccessOverride) || null;
}

async function grantLifetimeAccess(userId: string, grantedBy: string, reason?: string): Promise<boolean> {
  console.log("[adminUserService] grantLifetimeAccess", { userId, grantedBy, reason });
  const clientAny = supabase as any;

  // 1) Insert lifetime override
  const { error: insertErr } = await clientAny
    .from("user_subscription_overrides")
    .insert({
      user_id: userId,
      override_type: "lifetime_access",
      override_data: {},
      reason: reason ?? null,
      granted_by: grantedBy ?? null,
      is_active: true,
      created_at: new Date().toISOString(),
    });
  if (insertErr) {
    console.error("[adminUserService] grantLifetimeAccess insert error", insertErr);
    throw insertErr;
  }

  // 2) Ensure tier is premium
  await changeUserTier(userId, "premium", reason ?? "Grant lifetime access");
  return true;
}

async function revokeLifetimeAccess(userId: string, reason?: string): Promise<boolean> {
  console.log("[adminUserService] revokeLifetimeAccess", { userId, reason });
  const clientAny = supabase as any;

  // 1) Deactivate overrides
  const { error: updateErr } = await clientAny
    .from("user_subscription_overrides")
    .update({ is_active: false, reason: reason ?? null })
    .eq("user_id", userId)
    .eq("override_type", "lifetime_access")
    .eq("is_active", true);
  if (updateErr) {
    console.error("[adminUserService] revokeLifetimeAccess update error", updateErr);
    throw updateErr;
  }

  return true;
}

// ---------------- Admin notes ----------------

async function getUserNotes(userId: string): Promise<AdminUserNote[]> {
  console.log("[adminUserService] getUserNotes", userId);
  const { data, error } = await (supabase as any)
    .from("user_notes")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    console.error("[adminUserService] getUserNotes error", error);
    throw error;
  }

  return (data as unknown as AdminUserNote[]) || [];
}

async function addUserNote(args: {
  userId: string;
  createdBy: string;
  title: string;
  content: string;
  noteType?: string;
  isImportant?: boolean;
}): Promise<boolean> {
  const { userId, createdBy, title, content, noteType, isImportant } = args;
  console.log("[adminUserService] addUserNote", args);

  const { error } = await (supabase as any)
    .from("user_notes")
    .insert({
      user_id: userId,
      created_by: createdBy,
      title,
      content,
      note_type: noteType ?? "general",
      is_important: Boolean(isImportant ?? false),
    });

  if (error) {
    console.error("[adminUserService] addUserNote error", error);
    throw error;
  }

  return true;
}

// ---------------- New: admin dashboard helpers ----------------

export type SubscriptionSummary = {
  freeUsers: number;
  premiumUsers: number;
  activeSubscriptions: number;
  canceledLast7d: number;
};

async function getSubscriptionSummary(): Promise<SubscriptionSummary> {
  console.log("[adminUserService] getSubscriptionSummary");
  const sb: any = supabase;

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();

  const [{ count: freeUsers }, { count: premiumUsers }, { count: activeSubscriptions }, { count: canceledLast7d }] =
    await Promise.all([
      sb.from("users").select("*", { count: "exact", head: true }).eq("subscription_tier", "free"),
      sb.from("users").select("*", { count: "exact", head: true }).eq("subscription_tier", "premium"),
      sb.from("subscriptions").select("*", { count: "exact", head: true }).eq("status", "active"),
      sb.from("subscriptions").select("*", { count: "exact", head: true }).eq("status", "canceled").gte("updated_at", sevenDaysAgo),
    ]);

  return {
    freeUsers: freeUsers ?? 0,
    premiumUsers: premiumUsers ?? 0,
    activeSubscriptions: activeSubscriptions ?? 0,
    canceledLast7d: canceledLast7d ?? 0,
  };
}

// Extend findUsersBySegment to support engagementStatus without breaking current callers
async function findUsersBySegment(args: { tier?: "free" | "premium"; createdAfter?: string; engagementStatus?: "active" | "dormant" | "inactive" }): Promise<AdminUserSummary[]> {
  console.log("[adminUserService] findUsersBySegment", args);

  // If engagement status provided, derive user ids from the materialized view first
  let filterUserIds: string[] | undefined = undefined;
  if (args.engagementStatus) {
    const { data: em, error: emErr } = await (supabase as any)
      .from("user_engagement_metrics")
      .select("user_id")
      .eq("engagement_status", args.engagementStatus);
    if (emErr) {
      console.error("[adminUserService] findUsersBySegment engagement filter error", emErr);
      throw emErr;
    }
    filterUserIds = (em || []).map((r: any) => r.user_id);
    if (filterUserIds.length === 0) {
      return [];
    }
  }

  let query = (supabase as any)
    .from("users")
    .select("id, email, username, full_name")
    .order("created_at", { ascending: false })
    .limit(500);

  if (args.tier) {
    query = query.eq("subscription_tier", args.tier);
  }
  if (args.createdAfter) {
    query = query.gte("created_at", args.createdAfter);
  }
  if (filterUserIds) {
    query = query.in("id", filterUserIds);
  }

  const { data, error } = await query;
  if (error) {
    console.error("[adminUserService] findUsersBySegment error", error);
    throw error;
  }

  return ((data as any[]) || []).map((u) => ({
    id: u.id,
    email: u.email ?? null,
    username: u.username ?? null,
    full_name: u.full_name ?? null,
  }));
}

async function bulkChangeTier(userIds: string[], newTier: "free" | "premium", reason?: string): Promise<number> {
  console.log("[adminUserService] bulkChangeTier", { count: userIds.length, newTier, reason });
  let success = 0;
  for (const id of userIds) {
    try {
      await changeUserTier(id, newTier, reason);
      success++;
    } catch (e) {
      console.warn("[adminUserService] bulkChangeTier failed for", id, e);
    }
  }
  return success;
}

async function bulkGrantLifetime(userIds: string[], grantedBy: string, reason?: string): Promise<number> {
  console.log("[adminUserService] bulkGrantLifetime", { count: userIds.length, grantedBy, reason });
  let success = 0;
  for (const id of userIds) {
    try {
      await grantLifetimeAccess(id, grantedBy, reason);
      success++;
    } catch (e) {
      console.warn("[adminUserService] bulkGrantLifetime failed for", id, e);
    }
  }
  return success;
}

async function bulkRevokeLifetime(userIds: string[], reason?: string): Promise<number> {
  console.log("[adminUserService] bulkRevokeLifetime", { count: userIds.length, reason });
  let success = 0;
  for (const id of userIds) {
    try {
      await revokeLifetimeAccess(id, reason);
      success++;
    } catch (e) {
      console.warn("[adminUserService] bulkRevokeLifetime failed for", id, e);
    }
  }
  return success;
}

async function getUserSubscriptionHealth(userId: string): Promise<{ health_score: number; risk_factors: any; recommendations: any } | null> {
  console.log("[adminUserService] getUserSubscriptionHealth", userId);
  const sb: any = supabase;
  const { data, error } = await sb.rpc("get_subscription_health_score", { target_user_id: userId });
  if (error) {
    console.error("[adminUserService] getUserSubscriptionHealth error", error);
    throw error;
  }
  const row = (data as any[] | null)?.[0] ?? null;
  return row || null;
}

// New: admin helpers
async function getUserBillingHistory(userId: string, limit: number = 20): Promise<BillingHistoryItem[]> {
  console.log("[adminUserService] getUserBillingHistory", { userId, limit });
  const sb: any = supabase;
  const { data, error } = await sb.rpc("get_user_billing_history", {
    target_user_id: userId,
    limit_count: limit,
  });
  if (error) {
    console.error("[adminUserService] getUserBillingHistory error", error);
    throw error;
  }
  return ((data as any[]) || []).map((r: any) => ({
    transaction_id: r.transaction_id,
    amount_cents: r.amount_cents,
    currency: r.currency,
    status: r.status,
    description: r.description,
    created_at: r.created_at,
    stripe_payment_intent_id: r.stripe_payment_intent_id ?? null,
  }));
}

async function getUserSubscriptionTimeline(userId: string): Promise<SubscriptionTimelineEvent[]> {
  console.log("[adminUserService] getUserSubscriptionTimeline", userId);
  const sb: any = supabase;
  const { data, error } = await sb.rpc("get_user_subscription_timeline", {
    target_user_id: userId,
  });
  if (error) {
    console.error("[adminUserService] getUserSubscriptionTimeline error", error);
    throw error;
  }
  return (data as SubscriptionTimelineEvent[]) || [];
}

async function getUserEngagementMetrics(userId: string): Promise<UserEngagementMetrics | null> {
  console.log("[adminUserService] getUserEngagementMetrics", userId);
  const { data, error } = await (supabase as any)
    .from("user_engagement_metrics")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) {
    console.error("[adminUserService] getUserEngagementMetrics error", error);
    throw error;
  }
  return (data as UserEngagementMetrics) || null;
}

// User Segments CRUD
type UserSegment = {
  id: string;
  name: string;
  description: string | null;
  criteria: Record<string, any>;
  created_by: string | null;
  is_system_segment: boolean | null;
  user_count: number | null;
  last_refreshed_at: string | null;
  created_at: string;
  updated_at: string;
};

async function listUserSegments(): Promise<UserSegment[]> {
  console.log("[adminUserService] listUserSegments");
  const { data, error } = await (supabase as any)
    .from("user_segments")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) {
    console.error("[adminUserService] listUserSegments error", error);
    throw error;
  }
  return (data as UserSegment[]) || [];
}

async function createUserSegment(args: { name: string; description?: string; criteria: Record<string, any> }): Promise<UserSegment> {
  console.log("[adminUserService] createUserSegment", args);
  const { data: auth } = await supabase.auth.getUser();
  const createdBy = auth.user?.id ?? null;

  const { data, error } = await (supabase as any)
    .from("user_segments")
    .insert({
      name: args.name,
      description: args.description ?? null,
      criteria: args.criteria,
      created_by: createdBy,
      is_system_segment: false,
      user_count: null,
      last_refreshed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .maybeSingle();

  if (error) {
    console.error("[adminUserService] createUserSegment error", error);
    throw error;
  }
  return data as UserSegment;
}

async function deleteUserSegment(segmentId: string): Promise<boolean> {
  console.log("[adminUserService] deleteUserSegment", segmentId);
  const { error } = await (supabase as any)
    .from("user_segments")
    .delete()
    .eq("id", segmentId);
  if (error) {
    console.error("[adminUserService] deleteUserSegment error", error);
    throw error;
  }
  return true;
}

export const adminUserService = {
  searchUsers: searchUsersRaw,
  getUserRoles,
  grantAdminRole,
  revokeAdminRole,
  getFeatureOverrides,
  setFeatureOverride,
  // New exports
  getUserActiveSubscription,
  changeUserTier,
  setCustomPricing,
  getActiveLifetimeOverride,
  grantLifetimeAccess,
  revokeLifetimeAccess,
  getUserNotes,
  addUserNote,
  // New dashboard helpers
  getSubscriptionSummary,
  findUsersBySegment,
  bulkChangeTier,
  bulkGrantLifetime,
  bulkRevokeLifetime,
  getUserSubscriptionHealth,
  // New helpers
  getUserBillingHistory,
  getUserSubscriptionTimeline,
  getUserEngagementMetrics,
  listUserSegments,
  createUserSegment,
  deleteUserSegment,
};
