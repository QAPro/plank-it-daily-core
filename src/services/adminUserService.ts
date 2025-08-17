
import { supabase } from "@/integrations/supabase/client";

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

type SetOverrideArgs = {
  userId: string;
  featureName: string;
  isEnabled: boolean;
  reason?: string;
  expiresAt?: string | null; // ISO string or null
};

async function setFeatureOverride(args: SetOverrideArgs): Promise<boolean> {
  const { userId, featureName, isEnabled, reason, expiresAt } = args;
  console.log("[adminUserService] setFeatureOverride", args);

  const clientAny = supabase as any;
  const { data, error } = await clientAny.rpc("set_user_feature_override", {
    _target_user_id: userId,
    _feature_name: featureName,
    _is_enabled: isEnabled,
    _reason: reason ?? null,
    _expires_at: expiresAt ?? null,
  });

  if (error) {
    console.error("[adminUserService] setFeatureOverride error", error);
    throw error;
  }

  return Boolean(data);
}

export const adminUserService = {
  searchUsers: searchUsersRaw,
  getUserRoles,
  grantAdminRole,
  revokeAdminRole,
  getFeatureOverrides,
  setFeatureOverride,
};
