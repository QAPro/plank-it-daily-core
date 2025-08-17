
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminUserService, AdminUserSummary } from "@/services/adminUserService";
import { useToast } from "@/hooks/use-toast";
import { ShieldPlus, ShieldMinus } from "lucide-react";

type Props = {
  user: AdminUserSummary;
};

const UserDetailsCard: React.FC<Props> = ({ user }) => {
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: roles = [], isLoading: rolesLoading } = useQuery({
    queryKey: ["admin-user-roles", user.id],
    queryFn: () => adminUserService.getUserRoles(user.id),
    staleTime: 60_000,
  });

  const isAdmin = roles.includes("admin");

  const grantMutation = useMutation({
    mutationFn: (reason?: string) => adminUserService.grantAdminRole(user.id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-user-roles", user.id] });
      toast({ title: "Role updated", description: "Admin role granted." });
    },
    meta: {
      onError: (err: unknown) => {
        console.error("[UserDetailsCard] grant admin error", err);
        toast({ title: "Update failed", description: "Could not grant admin role.", variant: "destructive" });
      },
    },
  });

  const revokeMutation = useMutation({
    mutationFn: (reason?: string) => adminUserService.revokeAdminRole(user.id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-user-roles", user.id] });
      toast({ title: "Role updated", description: "Admin role revoked." });
    },
    meta: {
      onError: (err: unknown) => {
        console.error("[UserDetailsCard] revoke admin error", err);
        toast({ title: "Update failed", description: "Could not revoke admin role.", variant: "destructive" });
      },
    },
  });

  const handleGrant = () => {
    const reason = window.prompt("Reason for granting admin (optional):") || undefined;
    grantMutation.mutate(reason);
  };

  const handleRevoke = () => {
    if (!window.confirm("Revoke admin role for this user?")) return;
    const reason = window.prompt("Reason for revoking admin (optional):") || undefined;
    revokeMutation.mutate(reason);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {user.full_name || user.username || user.email || "User"}
          {isAdmin && <Badge variant="default">Admin</Badge>}
        </CardTitle>
        <CardDescription className="space-y-0.5">
          <div>{user.email || "No email"}</div>
          <div className="text-xs text-muted-foreground">Username: {user.username || "N/A"}</div>
          <div className="text-xs text-muted-foreground">User ID: {user.id}</div>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center gap-3">
        {!rolesLoading && (
          <>
            {isAdmin ? (
              <Button variant="destructive" onClick={handleRevoke}>
                <ShieldMinus className="w-4 h-4 mr-2" />
                Revoke Admin
              </Button>
            ) : (
              <Button onClick={handleGrant}>
                <ShieldPlus className="w-4 h-4 mr-2" />
                Grant Admin
              </Button>
            )}
            <div className="ml-auto text-sm text-muted-foreground">
              Roles: {roles.length ? roles.join(", ") : "None"}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default UserDetailsCard;
