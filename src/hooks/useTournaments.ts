
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

type Tournament = {
  id: string;
  title: string;
  description?: string | null;
  status: string | null;
  registration_start: string;
  registration_end: string;
  tournament_start: string;
  tournament_end: string;
  max_participants?: number | null;
  current_participants?: number | null;
};

type TournamentParticipant = {
  id: string;
  tournament_id: string;
  user_id: string;
  seed_position?: number | null;
  current_round: number;
  is_eliminated: boolean;
  total_score: number;
};

export const useTournaments = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();

  const tournamentsQuery = useQuery({
    queryKey: ["tournaments"],
    queryFn: async () => {
      console.log("[useTournaments] fetching tournaments");
      const { data, error } = await supabase
        .from("tournaments")
        .select("*")
        .in("status", ["upcoming", "registration"]);
      if (error) {
        console.error("[useTournaments] fetch tournaments error", error);
        throw error;
      }
      return (data as Tournament[]) || [];
    },
    staleTime: 60_000,
  });

  const myRegsQuery = useQuery({
    queryKey: ["tournament-participants", user?.id],
    queryFn: async () => {
      if (!user?.id) return [] as TournamentParticipant[];
      console.log("[useTournaments] fetching tournament_participants for", user.id);
      const { data, error } = await supabase
        .from("tournament_participants")
        .select("*")
        .eq("user_id", user.id);
      if (error) {
        console.error("[useTournaments] fetch my registrations error", error);
        throw error;
      }
      return (data as TournamentParticipant[]) || [];
    },
    enabled: !!user?.id,
    staleTime: 60_000,
  });

  const registerMutation = useMutation({
    mutationFn: async (tournamentId: string) => {
      if (!user?.id) throw new Error("Must be logged in to register for tournaments");
      console.log("[useTournaments] registering for", tournamentId);

      const { error } = await supabase.from("tournament_participants").insert({
        tournament_id: tournamentId,
        user_id: user.id,
      });
      if (error) {
        console.error("[useTournaments] register error", error);
        throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tournament-participants", user?.id] });
      qc.invalidateQueries({ queryKey: ["tournaments"] });
      toast({ title: "Registration complete", description: "You're registered for the tournament!" });
    },
    meta: {
      onError: (err: unknown) => {
        console.error("[useTournaments] registration error", err);
        toast({ title: "Registration failed", description: "Please try again later." });
      },
    },
  });

  const tournaments = (tournamentsQuery.data as Tournament[]) || [];
  const regs = (myRegsQuery.data as TournamentParticipant[]) || [];
  const regByTournament = new Map(regs.map((r) => [r.tournament_id, r]));

  const tournamentsWithStatus = tournaments.map((t) => ({
    ...t,
    registered: regByTournament.has(t.id),
    registration: regByTournament.get(t.id) || null,
  }));

  return {
    tournaments: tournamentsWithStatus,
    loading: tournamentsQuery.isLoading || myRegsQuery.isLoading,
    error: tournamentsQuery.error || myRegsQuery.error,
    refetch: () => {
      tournamentsQuery.refetch();
      myRegsQuery.refetch();
    },
    register: (tournamentId: string) => registerMutation.mutate(tournamentId),
  };
};
