
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { isSocialEnabled } from "@/constants/featureGating";

type League = {
  id: string;
  name: string;
  description?: string | null;
  league_type: string;
  is_active: boolean;
};

type Division = {
  id: string;
  league_id: string;
  division_name: string;
  division_level: number;
  min_rating: number | null;
  max_rating: number | null;
};

type Participant = {
  id: string;
  league_id: string;
  division_id: string;
  user_id: string;
  current_rating: number;
  peak_rating: number;
  matches_played: number;
  matches_won: number;
  current_streak: number;
  season_points: number;
};

export const useLeagues = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const socialEnabled = isSocialEnabled();

  const leaguesQuery = useQuery({
    queryKey: ["leagues"],
    queryFn: async () => {
      if (!socialEnabled) {
        console.log("[useLeagues] social features disabled, returning empty leagues");
        return [] as League[];
      }
      
      console.log("[useLeagues] fetching active leagues");
      const { data, error } = await supabase
        .from("fitness_leagues")
        .select("*")
        .eq("is_active", true);
      if (error) {
        console.error("[useLeagues] fetch leagues error", error);
        throw error;
      }
      return (data as League[]) || [];
    },
    staleTime: 60_000,
  });

  const divisionsQuery = useQuery({
    queryKey: ["league-divisions"],
    queryFn: async () => {
      if (!socialEnabled) {
        console.log("[useLeagues] social features disabled, returning empty divisions");
        return [] as Division[];
      }
      
      console.log("[useLeagues] fetching league divisions");
      const { data, error } = await supabase.from("league_divisions").select("*");
      if (error) {
        console.error("[useLeagues] fetch divisions error", error);
        throw error;
      }
      return (data as Division[]) || [];
    },
    staleTime: 60_000,
  });

  const myParticipationQuery = useQuery({
    queryKey: ["league-participants", user?.id],
    queryFn: async () => {
      if (!user?.id || !socialEnabled) {
        return [] as Participant[];
      }
      
      console.log("[useLeagues] fetching participants for", user.id);
      const { data, error } = await supabase
        .from("league_participants")
        .select("*")
        .eq("user_id", user.id);
      if (error) {
        console.error("[useLeagues] fetch my participation error", error);
        throw error;
      }
      return (data as Participant[]) || [];
    },
    enabled: !!user?.id && socialEnabled,
    staleTime: 60_000,
  });

  const joinLeagueMutation = useMutation({
    mutationFn: async (leagueId: string) => {
      if (!socialEnabled) {
        throw new Error("Social features are disabled");
      }
      
      if (!user?.id) throw new Error("Must be logged in to join leagues");
      console.log("[useLeagues] joining league", leagueId);

      // Find the lowest division for the league as a sensible default
      const { data: divisions, error: divErr } = await supabase
        .from("league_divisions")
        .select("*")
        .eq("league_id", leagueId)
        .order("division_level", { ascending: true })
        .limit(1);
      if (divErr) {
        console.error("[useLeagues] fetch default division error", divErr);
        throw divErr;
      }
      const division = divisions?.[0];
      if (!division) {
        throw new Error("No divisions found for league");
      }

      const { error } = await supabase.from("league_participants").insert({
        league_id: leagueId,
        division_id: division.id,
        user_id: user.id,
      });
      if (error) {
        console.error("[useLeagues] join league error", error);
        throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["league-participants", user?.id] });
      toast({ title: "League joined", description: "Welcome to the competition!" });
    },
    meta: {
      onError: (err: unknown) => {
        console.error("[useLeagues] join mutation error", err);
        toast({ title: "Could not join league", description: "Please try again later." });
      },
    },
  });

  const leagues = (leaguesQuery.data as League[]) || [];
  const divisions = (divisionsQuery.data as Division[]) || [];
  const myParticipation = (myParticipationQuery.data as Participant[]) || [];

  const divisionsByLeague = divisions.reduce<Record<string, Division[]>>((acc, d) => {
    acc[d.league_id] = acc[d.league_id] || [];
    acc[d.league_id].push(d);
    return acc;
  }, {});

  const leaguesEnriched = leagues.map((l) => {
    const mine = myParticipation.find((p) => p.league_id === l.id) || null;
    return {
      ...l,
      divisions: divisionsByLeague[l.id] || [],
      joined: !!mine,
      participant: mine,
    };
  });

  return {
    leagues: leaguesEnriched,
    loading: leaguesQuery.isLoading || divisionsQuery.isLoading || myParticipationQuery.isLoading,
    error: leaguesQuery.error || divisionsQuery.error || myParticipationQuery.error,
    refetch: () => {
      leaguesQuery.refetch();
      divisionsQuery.refetch();
      myParticipationQuery.refetch();
    },
    joinLeague: (leagueId: string) => joinLeagueMutation.mutate(leagueId),
  };
};
