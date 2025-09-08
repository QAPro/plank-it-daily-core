import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { adminUserService } from "@/services/adminUserService";
import type { AppRole } from "@/services/adminUserService";

export const useRoles = (userId?: string) => {
  const { user } = useAuth();
  const targetUserId = userId || user?.id;

  const { data: allRoles = [], isLoading, error, refetch } = useQuery({
    queryKey: ["user-all-roles", targetUserId],
    queryFn: async () => {
      if (!targetUserId) return [];
      return adminUserService.getAllUserRoles(targetUserId);
    },
    enabled: !!targetUserId,
    staleTime: 60_000,
  });

  // Extract just the role names for convenience
  const roleNames = allRoles.map(r => r.role_name as AppRole);

  const hasRole = (role: AppRole) => roleNames.includes(role);
  const hasAnyRole = (roles: AppRole[]) => roles.some(role => roleNames.includes(role));

  // Administrative levels
  const isSuperadmin = hasRole("superadmin");
  const isAdmin = hasRole("admin") || isSuperadmin;
  const isModerator = hasRole("moderator") || isAdmin;

  // Special roles
  const isBetaTester = hasRole("beta_tester");
  const isSupportAgent = hasRole("support_agent");
  const isContentCreator = hasRole("content_creator");

  // Subscription roles
  const isSubscriber = hasRole("subscriber");

  // Role level (hierarchy)
  const roleLevel = isSuperadmin ? 5 : isAdmin ? 4 : isModerator ? 3 : isSubscriber ? 2 : 1;

  return {
    allRoles,
    roleNames,
    hasRole,
    hasAnyRole,
    isSuperadmin,
    isAdmin,
    isModerator,
    isBetaTester,
    isSupportAgent,
    isContentCreator,
    isSubscriber,
    roleLevel,
    loading: isLoading,
    error,
    refetch,
  };
};

export const useAdminLevel = () => {
  const { user } = useAuth();
  const { roleLevel, isSuperadmin, isAdmin, loading } = useRoles();

  const canModifyRoles = roleLevel >= 4; // Admin or higher
  const canManageAdmins = isSuperadmin;

  return {
    roleLevel,
    canModifyRoles,
    canManageAdmins,
    isSuperadmin,
    isAdmin,
    loading,
  };
};

export const useCanModifyRoles = (targetUserId?: string) => {
  const { user } = useAuth();
  const currentUserRoles = useRoles();
  const targetUserRoles = useRoles(targetUserId);

  const canModify = 
    currentUserRoles.roleLevel >= 4 && // Must be admin+
    (currentUserRoles.isSuperadmin || currentUserRoles.roleLevel > targetUserRoles.roleLevel);

  return {
    canModify,
    currentLevel: currentUserRoles.roleLevel,
    targetLevel: targetUserRoles.roleLevel,
    loading: currentUserRoles.loading || targetUserRoles.loading,
  };
};