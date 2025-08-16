
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

type SeasonalEvent = {
  id: string;
  title: string;
  description?: string | null;
  event_type: string;
  theme_data?: any;
  start_date: string;
  end_date: string;
  is_active: boolean;
  reward_data?: any;
  max_participants?: number | null;
  current_participants?: number | null;
};

type EventParticipant = {
  id: string;
  event_id: string;
  user_id: string;
  joined_at: string;
  is_completed: boolean;
  completion_date?: string | null;
  final_score?: number | null;
  rank_position?: number | null;
  progress_data?: any;
};

export const useSeasonalEvents = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();

  const eventsQuery = useQuery({
    queryKey: ["seasonal-events"],
    queryFn: async () => {
      console.log("[useSeasonalEvents] fetching active seasonal_events");
      const { data, error } = await supabase
        .from("seasonal_events")
        .select("*")
        .eq("is_active", true)
        .order("start_date", { ascending: false });
      if (error) {
        console.error("[useSeasonalEvents] fetch events error", error);
        throw error;
      }
      return (data as SeasonalEvent[]) || [];
    },
    staleTime: 60_000,
  });

  const participationQuery = useQuery({
    queryKey: ["event-participants", user?.id],
    queryFn: async () => {
      if (!user?.id) return [] as EventParticipant[];
      console.log("[useSeasonalEvents] fetching event_participants for", user.id);
      const { data, error } = await supabase
        .from("event_participants")
        .select("*")
        .eq("user_id", user.id);
      if (error) {
        console.error("[useSeasonalEvents] fetch participants error", error);
        throw error;
      }
      return (data as EventParticipant[]) || [];
    },
    enabled: !!user?.id,
    staleTime: 60_000,
  });

  const joinMutation = useMutation({
    mutationFn: async (eventId: string) => {
      if (!user?.id) {
        throw new Error("Must be logged in to join events");
      }
      console.log("[useSeasonalEvents] joining event", eventId);
      const { error } = await supabase.from("event_participants").insert({
        event_id: eventId,
        user_id: user.id,
      });
      if (error) {
        console.error("[useSeasonalEvents] join event error", error);
        throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["event-participants", user?.id] });
      qc.invalidateQueries({ queryKey: ["seasonal-events"] });
      toast({ title: "Joined event", description: "You're in! Good luck and have fun." });
    },
    meta: {
      onError: (err: unknown) => {
        console.error("[useSeasonalEvents] join mutation error", err);
        toast({ title: "Could not join", description: "Please try again in a moment." });
      },
    },
  });

  const events = (eventsQuery.data as SeasonalEvent[]) || [];
  const participation = (participationQuery.data as EventParticipant[]) || [];
  const participationMap = new Map(participation.map((p) => [p.event_id, p]));

  const eventsWithStatus = events.map((ev) => ({
    ...ev,
    joined: participationMap.has(ev.id),
    participant: participationMap.get(ev.id) || null,
  }));

  return {
    events: eventsWithStatus,
    loading: eventsQuery.isLoading || participationQuery.isLoading,
    error: eventsQuery.error || participationQuery.error,
    refetch: () => {
      eventsQuery.refetch();
      participationQuery.refetch();
    },
    joinEvent: (eventId: string) => joinMutation.mutate(eventId),
  };
};
