import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface LeadershipCandidate {
  id: string;
  user_id: string;
  candidate_type: 'moderator' | 'community_leader' | 'expert';
  qualification_data: {
    highest_level: number;
    total_karma: number;
    community_track_level: number;
    subscription_tier: string;
  };
  qualification_date: string;
  status: 'pending' | 'contacted' | 'promoted' | 'dismissed';
  reviewed_by?: string;
  review_notes?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CandidateWithUserInfo extends LeadershipCandidate {
  username: string;
  email?: string;
}

export const useLeadershipCandidates = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all pending/contacted candidates (admin only)
  const { data: candidates = [], isLoading, error, refetch } = useQuery({
    queryKey: ["leadership-candidates"],
    queryFn: async () => {
      // Get candidates with user info through a separate query
      const { data: candidatesData, error: candidatesError } = await supabase
        .from("leadership_candidates")
        .select("*")
        .in('status', ['pending', 'contacted'])
        .order('created_at', { ascending: false });

      if (candidatesError) throw candidatesError;

      if (!candidatesData || candidatesData.length === 0) {
        return [];
      }

      // Get user info for each candidate
      const userIds = candidatesData.map(c => c.user_id);
      const { data: usersData, error: usersError } = await supabase
        .from("users")
        .select("id, username")
        .in('id', userIds);

      if (usersError) throw usersError;

      // Combine the data
      const usersMap = new Map(usersData?.map(user => [user.id, user]) || []);

      return candidatesData.map(candidate => ({
        ...candidate,
        candidate_type: candidate.candidate_type as 'moderator' | 'community_leader' | 'expert',
        qualification_data: candidate.qualification_data as {
          highest_level: number;
          total_karma: number;
          community_track_level: number;
          subscription_tier: string;
        },
        status: candidate.status as 'pending' | 'contacted' | 'promoted' | 'dismissed',
        username: usersMap.get(candidate.user_id)?.username || 'Unknown User'
      })) as CandidateWithUserInfo[];
    },
    enabled: !!user,
    staleTime: 60_000,
  });

  // Update candidate status
  const updateCandidateStatus = useMutation({
    mutationFn: async ({ candidateId, status, notes }: {
      candidateId: string;
      status: 'contacted' | 'dismissed';
      notes?: string;
    }) => {
      const { error } = await supabase
        .from("leadership_candidates")
        .update({
          status,
          review_notes: notes,
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', candidateId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leadership-candidates"] });
      toast.success("Candidate status updated successfully");
    },
    onError: (error) => {
      console.error("Error updating candidate status:", error);
      toast.error("Failed to update candidate status");
    },
  });

  // Promote candidate to actual role
  const promoteCandidate = useMutation({
    mutationFn: async ({ candidateId, notes }: {
      candidateId: string;
      notes?: string;
    }) => {
      const { data, error } = await supabase.rpc('promote_leadership_candidate', {
        _candidate_id: candidateId,
        _admin_id: user?.id,
        _notes: notes
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leadership-candidates"] });
      queryClient.invalidateQueries({ queryKey: ["user-all-roles"] });
      toast.success("Candidate promoted successfully");
    },
    onError: (error) => {
      console.error("Error promoting candidate:", error);
      toast.error("Failed to promote candidate");
    },
  });

  // Detect new candidates
  const detectCandidates = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc('detect_leadership_candidates');
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leadership-candidates"] });
      toast.success("Candidate detection completed");
    },
    onError: (error) => {
      console.error("Error detecting candidates:", error);
      toast.error("Failed to detect candidates");
    },
  });

  const getCandidateTypeLabel = (type: string) => {
    switch (type) {
      case 'moderator': return 'Moderator';
      case 'community_leader': return 'Community Leader';
      case 'expert': return 'Expert';
      default: return type;
    }
  };

  const getCandidateTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'moderator': return 'secondary';
      case 'community_leader': return 'default';
      case 'expert': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending': return 'outline';
      case 'contacted': return 'secondary';
      case 'promoted': return 'default';
      case 'dismissed': return 'destructive';
      default: return 'outline';
    }
  };

  return {
    candidates,
    isLoading,
    error,
    refetch,
    updateCandidateStatus,
    promoteCandidate,
    detectCandidates,
    getCandidateTypeLabel,
    getCandidateTypeBadgeColor,
    getStatusBadgeColor,
  };
};