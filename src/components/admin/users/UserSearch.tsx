
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { adminUserService, AdminUserSummary } from "@/services/adminUserService";
import { useToast } from "@/hooks/use-toast";
import { Search } from "lucide-react";

type UserSearchProps = {
  onSelect: (user: AdminUserSummary) => void;
};

const UserSearch: React.FC<UserSearchProps> = ({ onSelect }) => {
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AdminUserSummary[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await adminUserService.searchUsers(query.trim());
      setResults(res);
      if (res.length === 0) {
        toast({ title: "No users found", description: "Try a different email, username, or ID." });
      }
    } catch (err: any) {
      toast({
        title: "Search failed",
        description: err?.message || "Unable to search users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          placeholder="Search by email, username, or user ID"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button type="submit" disabled={loading}>
          <Search className="w-4 h-4 mr-2" />
          {loading ? "Searching..." : "Search"}
        </Button>
      </form>

      {results.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <ul className="divide-y">
              {results.map((u) => (
                <li key={u.id} className="flex items-center justify-between p-3">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{u.username || u.email || u.id}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {u.email || "No email"} • {u.username || "No username"} • {u.id}
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => onSelect(u)}>
                    Select
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserSearch;
