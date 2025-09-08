import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import UserSearch from "../users/UserSearch";
import { adminUserService, type AdminUserSummary, type AppRole } from "@/services/adminUserService";
import { useToast } from "@/hooks/use-toast";

const manageableRoles: AppRole[] = [
  "admin",
  "moderator",
  "beta_tester",
  "support_agent",
  "content_creator",
  "subscriber",
];

const RoleManagementDashboard: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<AdminUserSummary | null>(null);
  const [selectedRole, setSelectedRole] = useState<AppRole>("moderator");
  const [reason, setReason] = useState("");
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: roles = [], isLoading: rolesLoading } = useQuery({
    queryKey: ["admin-user-roles", selectedUser?.id],
    queryFn: () => (selectedUser ? adminUserService.getUserRoles(selectedUser.id) : Promise.resolve([])),
    enabled: !!selectedUser?.id,
    staleTime: 60_000,
  });

  const assignMutation = useMutation({
    mutationFn: () =>
      selectedUser ? adminUserService.assignRole(selectedUser.id, selectedRole, reason || undefined) : Promise.resolve(false),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-user-roles", selectedUser?.id] });
      toast({ title: "Role assigned", description: `${selectedRole} granted.` });
      setReason("");
    },
    meta: {
      onError: (err: unknown) => {
        console.error("[RoleManagement] assign error", err);
        toast({ title: "Update failed", description: "Could not assign role.", variant: "destructive" });
      },
    },
  });

  const revokeMutation = useMutation({
    mutationFn: () =>
      selectedUser ? adminUserService.revokeRole(selectedUser.id, selectedRole, reason || undefined) : Promise.resolve(false),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-user-roles", selectedUser?.id] });
      toast({ title: "Role revoked", description: `${selectedRole} revoked.` });
      setReason("");
    },
    meta: {
      onError: (err: unknown) => {
        console.error("[RoleManagement] revoke error", err);
        toast({ title: "Update failed", description: "Could not revoke role.", variant: "destructive" });
      },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Role Management</h2>
        <p className="text-muted-foreground">Assign or revoke administrative and special roles. Admins can manage roles below them; only Superadmins can manage Admins.</p>
      </div>

      <UserSearch onSelect={setSelectedUser} />

      {selectedUser && (
        <Card>
          <CardHeader>
            <CardTitle>User: {selectedUser.email || selectedUser.username || selectedUser.full_name || selectedUser.id}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground mb-2">Current roles</div>
                <div className="flex flex-wrap gap-2">
                  {rolesLoading ? (
                    <span className="text-muted-foreground text-sm">Loading roles…</span>
                  ) : roles.length ? (
                    roles.map((r) => (
                      <span key={r} className="px-2 py-1 rounded-md bg-muted text-foreground text-xs">
                        {r}
                      </span>
                    ))
                  ) : (
                    <span className="text-muted-foreground text-sm">No roles assigned</span>
                  )}
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Role</label>
                  <select
                    className="h-9 rounded-md border bg-background px-3 text-sm"
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as AppRole)}
                  >
                    {manageableRoles.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-sm font-medium">Reason (required for audits)</label>
                  <input
                    className="h-9 rounded-md border bg-background px-3 text-sm"
                    placeholder="Reason for change"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button onClick={() => assignMutation.mutate()} disabled={!reason || assignMutation.isPending}>
                  Assign Role
                </Button>
                <Button variant="destructive" onClick={() => revokeMutation.mutate()} disabled={!reason || revokeMutation.isPending}>
                  Revoke Role
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                Security: Only Admins and Superadmins can change roles. Only Superadmins can create/revoke Admins.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RoleManagementDashboard;
