
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

export const adminUserService = {
  searchUsers: searchUsersRaw,
  getUserRoles,
  grantAdminRole,
  revokeAdminRole,
  getFeatureOverrides,
  // New exports
  getUserActiveSubscription,
  changeUserTier,
  setCustomPricing,
  getActiveLifetimeOverride,
  grantLifetimeAccess,
  revokeLifetimeAccess,
  getUserNotes,
  addUserNote,
};
