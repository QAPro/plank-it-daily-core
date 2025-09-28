import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminUserService } from "@/services/adminUserService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus } from "lucide-react";

const UserSegmentManager: React.FC = () => {
  const [newSegmentName, setNewSegmentName] = useState("");
  const [newSegmentTier, setNewSegmentTier] = useState<"free" | "premium">("free");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: segments = [], isLoading } = useQuery({
    queryKey: ["admin", "user-segments"],
    queryFn: () => adminUserService.listUserSegments(),
  });

  const createSegmentMutation = useMutation({
    mutationFn: (args: { name: string; filter: any }) => 
      adminUserService.createUserSegment(args.name, args.filter),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "user-segments"] });
      toast({ title: "Segment created", description: "User segment has been created successfully." });
      setNewSegmentName("");
      setNewSegmentTier("free");
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create segment",
        description: error.message || "Could not create user segment.",
        variant: "destructive",
      });
    },
  });

  const deleteSegmentMutation = useMutation({
    mutationFn: (segmentId: string) => adminUserService.deleteUserSegment(segmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "user-segments"] });
      toast({ title: "Segment deleted", description: "User segment has been deleted successfully." });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete segment",
        description: error.message || "Could not delete user segment.",
        variant: "destructive",
      });
    },
  });

  const handleCreateSegment = () => {
    if (!newSegmentName.trim()) {
      toast({
        title: "Invalid input",
        description: "Please enter a segment name.",
        variant: "destructive",
      });
      return;
    }

    const filter = { subscription_tier: newSegmentTier };
    createSegmentMutation.mutate({ name: newSegmentName, filter });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Segments</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Create new segment */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded">
          <div>
            <Label htmlFor="segment-name">Segment Name</Label>
            <Input
              id="segment-name"
              value={newSegmentName}
              onChange={(e) => setNewSegmentName(e.target.value)}
              placeholder="e.g., Premium Users"
            />
          </div>
          
          <div>
            <Label htmlFor="segment-tier">Subscription Tier</Label>
            <Select value={newSegmentTier} onValueChange={(value: "free" | "premium") => setNewSegmentTier(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-end">
            <Button 
              onClick={handleCreateSegment}
              disabled={createSegmentMutation.isPending}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Segment
            </Button>
          </div>
        </div>

        {/* Existing segments */}
        <div className="space-y-2">
          {isLoading ? (
            <div className="text-muted-foreground">Loading segments...</div>
          ) : segments.length === 0 ? (
            <div className="text-muted-foreground">No segments created yet.</div>
          ) : (
            segments.map((segment: any) => (
              <div key={segment.id} className="flex items-center justify-between p-3 border rounded">
                <div>
                  <div className="font-medium">{segment.name}</div>
                  <div className="text-sm text-muted-foreground">
                    Filter: {JSON.stringify(segment.filter)}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteSegmentMutation.mutate(segment.id)}
                  disabled={deleteSegmentMutation.isPending}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserSegmentManager;
