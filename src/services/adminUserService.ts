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

  return data === true;
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

  return data === true;
}

async function getFeatureOverrides(userId: string): Promise<UserFeatureOverride[]> {
  console.log("[adminUserService] getFeatureOverrides", userId);
  
  // Since user_feature_overrides table may not be accessible, we'll create a mock implementation
  // In a real app, you'd want to create this table or use an RPC function
  try {
    const clientAny = supabase as any;
    const { data, error } = await clientAny.rpc("get_user_feature_overrides", {
      _user_id: userId,
    });

    if (error) {
      console.warn("[adminUserService] getFeatureOverrides error, returning empty array", error);
      return [];
    }

    return (data as UserFeatureOverride[]) || [];
  } catch (e) {
    console.warn("[adminUserService] getFeatureOverrides catch, returning empty array", e);
    return [];
  }
}

async function setFeatureOverride(args: {
  userId: string;
  featureName: string;
  isEnabled: boolean;
  reason?: string;
  expiresAt?: string | null;
}): Promise<UserFeatureOverride> {
  console.log("[adminUserService] setFeatureOverride", args);
  
  // Since user_feature_overrides table may not be accessible, we'll create a mock implementation
  try {
    const clientAny = supabase as any;
    const { data, error } = await clientAny.rpc("set_user_feature_override", {
      _user_id: args.userId,
      _feature_name: args.featureName,
      _is_enabled: args.isEnabled,
      _reason: args.reason || null,
      _expires_at: args.expiresAt || null,
    });

    if (error) {
      console.error("[adminUserService] setFeatureOverride error", error);
      throw error;
    }

    return data as UserFeatureOverride;
  } catch (e) {
    console.error("[adminUserService] setFeatureOverride catch", e);
    throw e;
  }
}

async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  console.log("[adminUserService] getSubscriptionPlans");
  const { data, error } = await supabase.from("subscription_plans").select("*").order("sort_order");

  if (error) {
    console.error("[adminUserService] getSubscriptionPlans error", error);
    throw error;
  }

  return (data as SubscriptionPlan[]) || [];
}

// Ensure we use the existing RPC and map fields correctly
async function getActiveSubscription(userId: string): Promise<ActiveSubscription | null> {
  console.log("[adminUserService] getActiveSubscription", userId);
  
  try {
    const { data, error } = await supabase.rpc("get_user_active_subscription", {
      _user_id: userId,
    });

    if (error) {
      console.warn("[adminUserService] getActiveSubscription error", error);
      return null;
    }

    const row = (data as any[])?.[0] ?? null;
    if (!row) return null;

    const result: ActiveSubscription = {
      subscription_id: row.subscription_id ?? null,
      plan_name: row.plan_name ?? null,
      status: row.status ?? null,
      current_period_end: row.current_period_end ?? null,
      is_custom_pricing: row.is_custom_pricing ?? false,
      custom_price_cents: row.effective_price ?? null,
    };

    console.log("[adminUserService] getActiveSubscription result", result);
    return result;
  } catch (e) {
    console.warn("[adminUserService] getActiveSubscription catch", e);
    return null;
  }
}

async function getUserActiveSubscription(userId: string): Promise<ActiveSubscription | null> {
  return getActiveSubscription(userId);
}

// Replace lifetime access functions to use real RPCs and table data
async function getLifetimeAccessOverrides(userId: string): Promise<LifetimeAccessOverride[]> {
  console.log("[adminUserService] getLifetimeAccessOverrides", userId);
  const clientAny = supabase as any;
  const { data, error } = await clientAny.rpc("get_user_lifetime_overrides", {
    _user_id: userId,
  });

  if (error) {
    console.error("[adminUserService] getLifetimeAccessOverrides error", error);
    throw error;
  }

  return (data as LifetimeAccessOverride[]) || [];
}

async function grantLifetimeAccess(
  userId: string,
  _grantedBy: string, // no longer used; server derives from auth.uid()
  reason: string,
  overrideData: any = {},
  expiresAt?: string
): Promise<LifetimeAccessOverride> {
  console.log("[adminUserService] grantLifetimeAccess", userId, reason, overrideData, expiresAt);
  const clientAny = supabase as any;
  const { data, error } = await clientAny.rpc("admin_grant_lifetime_access", {
    _user_id: userId,
    _reason: reason ?? null,
    _override_data: overrideData ?? {},
    _expires_at: expiresAt ?? null,
  });

  if (error) {
    console.error("[adminUserService] grantLifetimeAccess error", error);
    throw error;
  }

  return data as LifetimeAccessOverride;
}

async function revokeLifetimeAccess(userId: string, reason?: string): Promise<boolean> {
  console.log("[adminUserService] revokeLifetimeAccess", userId, reason);
  // Find active override for this user, then revoke it
  const active = await getActiveLifetimeOverride(userId);
  if (!active) {
    console.warn("[adminUserService] revokeLifetimeAccess no active override found for user", userId);
    return false;
  }

  const clientAny = supabase as any;
  const { data, error } = await clientAny.rpc("admin_revoke_lifetime_access", {
    _override_id: active.id,
    _reason: reason ?? null,
  });

  if (error) {
    console.error("[adminUserService] revokeLifetimeAccess error", error);
    throw error;
  }

  return data === true;
}

async function getActiveLifetimeOverride(userId: string): Promise<LifetimeAccessOverride | null> {
  const overrides = await getLifetimeAccessOverrides(userId);
  return overrides.find((o) => o.is_active) || null;
}

// Use admin RPC to change tier (RLS-safe)
async function changeUserTier(userId: string, newTier: "free" | "premium", reason?: string): Promise<boolean> {
  console.log("[adminUserService] changeUserTier", userId, newTier, reason);
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

  return data === true;
}

// Keep placeholder custom pricing (no backing table yet)
async function setCustomPricing(userId: string, planId: string, priceCents: number, reason?: string): Promise<boolean> {
  console.log("[adminUserService] setCustomPricing", userId, planId, priceCents, reason);
  return true;
}

// Admin notes: real CRUD against admin_user_notes
async function getUserNotes(userId: string): Promise<AdminUserNote[]> {
  console.log("[adminUserService] getUserNotes", userId);
  const { data, error } = await supabase
    .from("admin_user_notes" as any)
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[adminUserService] getUserNotes error", error);
    throw error;
  }

  // Cast via unknown to avoid Supabase type inference error unions
  return (data as unknown as AdminUserNote[]) || [];
}

async function createUserNote(
  userId: string,
  createdBy: string,
  title: string,
  content: string,
  noteType: string,
  isImportant: boolean
): Promise<AdminUserNote> {
  console.log("[adminUserService] createUserNote", userId, createdBy, title, noteType, isImportant);
  const { data, error } = await supabase
    .from("admin_user_notes" as any)
    .insert({
      user_id: userId,
      created_by: createdBy,
      title,
      content,
      note_type: noteType,
      is_important: isImportant,
    })
    .select("*")
    .maybeSingle();

  if (error) {
    console.error("[adminUserService] createUserNote error", error);
    throw error;
  }

  return data as unknown as AdminUserNote;
}

async function addUserNote(args: {
  userId: string;
  createdBy: string;
  title: string;
  content: string;
  noteType: string;
  isImportant: boolean;
}): Promise<AdminUserNote> {
  return createUserNote(args.userId, args.createdBy, args.title, args.content, args.noteType, args.isImportant);
}

async function updateUserNote(noteId: string, updates: Partial<AdminUserNote>): Promise<AdminUserNote> {
  console.log("[adminUserService] updateUserNote", noteId, updates);
  const { data, error } = await supabase
    .from("admin_user_notes" as any)
    .update({
      title: updates.title,
      content: updates.content,
      note_type: updates.note_type,
      is_important: updates.is_important,
    })
    .eq("id", noteId)
    .select("*")
    .maybeSingle();

  if (error) {
    console.error("[adminUserService] updateUserNote error", error);
    throw error;
  }

  return data as unknown as AdminUserNote;
}

async function deleteUserNote(noteId: string): Promise<boolean> {
  console.log("[adminUserService] deleteUserNote", noteId);
  const { error } = await supabase.from("admin_user_notes" as any).delete().eq("id", noteId);

  if (error) {
    console.error("[adminUserService] deleteUserNote error", error);
    throw error;
  }

  return true;
}

// Bulk lifetime operations now no-ops are unnecessary, but keep function signatures if needed elsewhere
async function bulkGrantLifetime(userIds: string[], grantedBy: string, reason?: string): Promise<number> {
  console.log("[adminUserService] bulkGrantLifetime (looping RPC)", userIds.length, grantedBy, reason);
  let count = 0;
  for (const uid of userIds) {
    await grantLifetimeAccess(uid, grantedBy, reason || "", {});
    count++;
  }
  return count;
}

async function bulkRevokeLifetime(userIds: string[], reason?: string): Promise<number> {
  console.log("[adminUserService] bulkRevokeLifetime (looping RPC)", userIds.length, reason);
  let count = 0;
  for (const uid of userIds) {
    const ok = await revokeLifetimeAccess(uid, reason || "");
    if (ok) count++;
  }
  return count;
}

async function getUserSummary(userId: string): Promise<AdminUserSummary | null> {
  console.log("[adminUserService] getUserSummary", userId);
  const { data, error } = await supabase
    .from("users")
    .select("id, email, username, full_name")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("[adminUserService] getUserSummary error", error);
    return null;
  }

  return (data as AdminUserSummary) || null;
}

async function getSubscriptionSummary(): Promise<{
  premiumUsers: number;
  freeUsers: number;
  activeSubscriptions: number;
  canceledLast7d: number;
}> {
  console.log("[adminUserService] getSubscriptionSummary");
  
  try {
    // Get counts from users table
    const [premiumResult, freeResult, activeSubsResult] = await Promise.all([
      supabase.from("users").select("id", { count: "exact" }).eq("subscription_tier", "premium"),
      supabase.from("users").select("id", { count: "exact" }).eq("subscription_tier", "free"),
      supabase.from("subscriptions").select("id", { count: "exact" }).eq("status", "active"),
    ]);

    return {
      premiumUsers: premiumResult.count || 0,
      freeUsers: freeResult.count || 0,
      activeSubscriptions: activeSubsResult.count || 0,
      canceledLast7d: 0, // Would need more complex query
    };
  } catch (error) {
    console.error("[adminUserService] getSubscriptionSummary error", error);
    return {
      premiumUsers: 0,
      freeUsers: 0,
      activeSubscriptions: 0,
      canceledLast7d: 0,
    };
  }
}

// Segmentation: align with existing table shape; normalize to .filter for UI
async function findUsersBySegment(args: { 
  tier?: "free" | "premium"; 
  createdAfter?: string; 
  engagementStatus?: "active" | "dormant" | "inactive" 
}): Promise<AdminUserSummary[]> {
  console.log("[adminUserService] findUsersBySegment", args);

  // If engagement status provided, derive user ids from the materialized view first
  let filterUserIds: string[] | undefined = undefined;
  if (args.engagementStatus) {
    try {
      // Use secure RPC instead of direct MV access
      const clientAny = supabase as any;
      const { data: em, error: emErr } = await clientAny.rpc("admin_get_user_ids_by_engagement_status", {
        _status: args.engagementStatus,
      });

      if (emErr) {
        console.warn("[adminUserService] engagement filter unavailable (RPC error). Continuing without engagement filter.", emErr);
      } else {
        filterUserIds = ((em as any[]) || []).map((r: any) => r.user_id);
        if (filterUserIds.length === 0) {
          return [];
        }
      }
    } catch (e) {
      console.warn("[adminUserService] engagement filter error; continuing without engagement filter", e);
    }
  }

  let query = supabase
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

// Use admin RPC for bulk tier changes (RLS-safe)
async function bulkChangeTier(userIds: string[], tier: "free" | "premium", reason?: string): Promise<number> {
  console.log("[adminUserService] bulkChangeTier", userIds.length, tier, reason);
  const clientAny = supabase as any;
  const { data, error } = await clientAny.rpc("admin_bulk_change_tier", {
    _user_ids: userIds,
    _new_tier: tier,
    _reason: reason ?? null,
  });

  if (error) {
    console.error("[adminUserService] bulkChangeTier error", error);
    throw error;
  }

  return (data as number) ?? 0;
}

async function getUserSubscriptionHealth(userId: string): Promise<any> {
  console.log("[adminUserService] getUserSubscriptionHealth", userId);
  // Use the existing SQL function name and expected parameter key
  const { data, error } = await supabase.rpc("get_subscription_health_score", {
    target_user_id: userId,
  });

  if (error) {
    console.error("[adminUserService] getUserSubscriptionHealth error", error);
    throw error;
  }

  // Function returns a TABLE; normalize to a single row or null
  const row = Array.isArray(data) ? data[0] : data;
  return row || null;
}

async function getUserBillingHistory(userId: string): Promise<any> {
  console.log("[adminUserService] getUserBillingHistory", userId);
  // Match the SQL function and parameter name (limit_count is optional)
  const { data, error } = await supabase.rpc("get_user_billing_history", {
    target_user_id: userId,
  });

  if (error) {
    console.error("[adminUserService] getUserBillingHistory error", error);
    throw error;
  }

  return data;
}

async function getUserSubscriptionTimeline(userId: string): Promise<any> {
  console.log("[adminUserService] getUserSubscriptionTimeline", userId);
  // Match the SQL function and parameter name
  const { data, error } = await supabase.rpc("get_user_subscription_timeline", {
    target_user_id: userId,
  });

  if (error) {
    console.error("[adminUserService] getUserSubscriptionTimeline error", error);
    throw error;
  }

  return data;
}

// Re-add: Fetch a single user's engagement metrics from the materialized view
async function getUserEngagementMetrics(userId: string): Promise<UserEngagementMetrics | null> {
  console.log("[adminUserService] getUserEngagementMetrics", userId);
  // Use secure RPC instead of direct MV access
  const { data, error } = await supabase.rpc("get_user_engagement_metrics_row", {
    target_user_id: userId,
  });

  if (error) {
    console.error("[adminUserService] getUserEngagementMetrics error", error);
    return null;
  }

  // RPC returns SETOF -> array; normalize to single row
  const row = Array.isArray(data) ? data[0] : data;
  return (row as unknown as UserEngagementMetrics) || null;
}

// Re-add: List saved user segments; normalize filter field for UI
async function listUserSegments(): Promise<any[]> {
  console.log("[adminUserService] listUserSegments");
  const { data, error } = await supabase.from("user_segments" as any).select("*").order("created_at", { ascending: false });

  if (error) {
    console.error("[adminUserService] listUserSegments error", error);
    return [];
  }

  // Normalize: ensure each item has .filter for the UI, even if DB uses 'criteria'
  return (data || []).map((seg: any) => ({
    ...seg,
    filter: seg.filter ?? seg.criteria ?? {},
  }));
}

// Make createUserSegment accept either (name, filter) or object; map to DB column 'criteria'
async function createUserSegment(arg1: string | { name: string; filter: any }, arg2?: any): Promise<any> {
  console.log("[adminUserService] createUserSegment", arg1, arg2);
  
  const name = typeof arg1 === "string" ? arg1 : arg1.name;
  const filter = typeof arg1 === "string" ? arg2 : arg1.filter;

  const { data, error } = await supabase
    .from("user_segments" as any)
    .insert({ name, criteria: filter })
    .select("*")
    .maybeSingle();

  if (error) {
    console.error("[adminUserService] createUserSegment error", error);
    throw error;
  }

  // Ensure we only spread an object
  const base = (data ?? {}) as any;
  return { ...base, filter: base.filter ?? base.criteria ?? {} };
}

async function deleteUserSegment(segmentId: string): Promise<boolean> {
  console.log("[adminUserService] deleteUserSegment", segmentId);
  const { error } = await supabase.from("user_segments" as any).delete().eq("id", segmentId);

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
  getSubscriptionPlans,
  getActiveSubscription,
  getUserActiveSubscription,
  getActiveLifetimeOverride,
  changeUserTier,
  setCustomPricing,
  getUserNotes,
  createUserNote,
  addUserNote,
  updateUserNote,
  deleteUserNote,
  getLifetimeAccessOverrides,
  grantLifetimeAccess,
  revokeLifetimeAccess,
  getUserSummary,
  getSubscriptionSummary,
  findUsersBySegment,
  bulkChangeTier,
  bulkGrantLifetime,
  bulkRevokeLifetime,
  getUserSubscriptionHealth,
  getUserBillingHistory,
  getUserSubscriptionTimeline,
  getUserEngagementMetrics,
  listUserSegments,
  createUserSegment,
  deleteUserSegment,
};
