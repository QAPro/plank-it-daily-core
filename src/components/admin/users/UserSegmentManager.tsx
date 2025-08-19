
import React, { useMemo, useState } from "react";
import { adminUserService, AdminUserSummary } from "@/services/adminUserService";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

type TierFilter = "any" | "free" | "premium";
type EngagementStatus = "any" | "active" | "dormant" | "inactive";

const UserSegmentManager: React.FC = () => {
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tier, setTier] = useState<TierFilter>("any");
  const [createdAfter, setCreatedAfter] = useState<string>("");
  const [engagement, setEngagement] = useState<EngagementStatus>("any");

  const criteria = useMemo(() => {
    return {
      tier: tier === "any" ? undefined : tier,
      createdAfter: createdAfter ? new Date(createdAfter).toISOString() : undefined,
      engagementStatus: engagement === "any" ? undefined : engagement,
    };
  }, [tier, createdAfter, engagement]);

  const { data: users = [], isLoading, refetch } = useQuery({
    queryKey: ["admin", "segment-evaluate", criteria],
    queryFn: () =>
      adminUserService.findUsersBySegment({
        tier: criteria.tier,
        createdAfter: criteria.createdAfter,
        engagementStatus: criteria.engagementStatus as any,
      }),
    staleTime: 10_000,
  });

  const { data: savedSegments = [], refetch: refetchSegments } = useQuery({
    queryKey: ["admin", "saved-segments"],
    queryFn: () => adminUserService.listUserSegments(),
    staleTime: 10_000,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      adminUserService.createUserSegment({
        name,
        description,
        criteria,
      }),
    onSuccess: () => {
      toast({ title: "Segment saved", description: "Your segment has been saved." });
      setName("");
      setDescription("");
      refetchSegments();
    },
    meta: {
      onError: (err: unknown) => {
        console.error("[UserSegmentManager] create segment error", err);
        toast({ title: "Save failed", description: "Could not save segment.", variant: "destructive" });
      },
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (segmentId: string) => adminUserService.deleteUserSegment(segmentId),
    onSuccess: () => {
      toast({ title: "Segment deleted", description: "The segment has been removed." });
      refetchSegments();
    },
    meta: {
      onError: (err: unknown) => {
        console.error("[UserSegmentManager] delete segment error", err);
        toast({ title: "Delete failed", description: "Could not delete segment.", variant: "destructive" });
      },
    },
  });

  const handleExport = () => {
    const rows = users as AdminUserSummary[];
    const header = ["id", "email", "username", "full_name"];
    const csv = [
      header.join(","),
      ...rows.map(r => [r.id, r.email ?? "", r.username ?? "", r.full_name ?? ""].map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `segment-export-${new Date().toISOString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const preview = (users as AdminUserSummary[]).slice(0, 10);

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Segment Manager</CardTitle>
        <CardDescription>Create, evaluate, save and export user segments</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Builder */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <Label className="text-sm">Tier</Label>
            <Select value={tier} onValueChange={(v: TierFilter) => setTier(v)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm">Engagement</Label>
            <Select value={engagement} onValueChange={(v: EngagementStatus) => setEngagement(v)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select engagement" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="dormant">Dormant</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm">Created After</Label>
            <Input type="date" value={createdAfter} onChange={(e) => setCreatedAfter(e.target.value)} className="mt-1" />
          </div>
          <div className="flex items-end gap-2">
            <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
              Evaluate
            </Button>
            <Button variant="secondary" onClick={handleExport} disabled={isLoading || (users as AdminUserSummary[]).length === 0}>
              Export CSV
            </Button>
          </div>
        </div>

        {/* Summary */}
        <div className="text-sm text-muted-foreground">
          {isLoading ? "Evaluating..." : `Matched users: ${(users as AdminUserSummary[]).length}${(users as AdminUserSummary[]).length > 0 ? " (showing 10 below)" : ""}`}
        </div>

        {/* Preview */}
        {(users as AdminUserSummary[]).length > 0 && (
          <div className="rounded border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead className="text-right">ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {preview.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.full_name || "—"}</TableCell>
                    <TableCell>{u.email || "—"}</TableCell>
                    <TableCell>{u.username || "—"}</TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">{u.id}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Save Segment */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <Label className="text-sm">Segment Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Active Premiums" className="mt-1" />
          </div>
          <div className="md:col-span-2">
            <Label className="text-sm">Description</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What is this segment for?" className="mt-1" />
          </div>
          <div className="md:col-span-3">
            <Button onClick={() => createMutation.mutate()} disabled={!name.trim() || createMutation.isPending}>
              Save Segment
            </Button>
          </div>
        </div>

        {/* Saved Segments */}
        <div>
          <div className="text-sm font-medium mb-2">Saved Segments</div>
          {(savedSegments as any[]).length === 0 ? (
            <div className="text-sm text-muted-foreground">No saved segments yet.</div>
          ) : (
            <div className="rounded border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(savedSegments as any[]).map((s: any) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell className="max-w-[400px] truncate">{s.description || "—"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setTier((s.criteria?.tier as TierFilter) ?? "any");
                              setEngagement((s.criteria?.engagementStatus as EngagementStatus) ?? "any");
                              setCreatedAfter(s.criteria?.createdAfter ? new Date(s.criteria.createdAfter).toISOString().slice(0,10) : "");
                              refetch();
                            }}
                          >
                            Evaluate
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteMutation.mutate(s.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserSegmentManager;
