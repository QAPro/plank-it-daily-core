import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface WorkoutVictoryLog {
  id: string;
  session_id: string;
  user_id: string;
  victory_level: number;
  todays_win?: string;
  power_moments: string[];
  growth_insights?: string;
  victory_notes?: string;
  breakthrough_achieved: boolean;
  energy_before?: number;
  energy_after?: number;
  created_at: string;
}

export const useWorkoutVictoryLogs = () => {
  const [victoryLogs, setVictoryLogs] = useState<WorkoutVictoryLog[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchVictoryLogs = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('workout_victory_logs')
        .select(`
          *,
          session:user_sessions(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVictoryLogs(data || []);
    } catch (error) {
      console.error('Error fetching victory logs:', error);
      toast({
        title: 'Success Stories Loading...',
        description: "Having trouble accessing your Victory Chronicles. Let's try again!",
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const addVictoryLog = async (sessionId: string, log: Omit<WorkoutVictoryLog, 'id' | 'session_id' | 'user_id' | 'created_at'>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('workout_victory_logs')
        .insert([{
          ...log,
          session_id: sessionId,
          user_id: user.id,
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: '🏆 Victory Story Saved!',
        description: 'Your success moment has been added to your Victory Chronicles!',
      });

      await fetchVictoryLogs();
      return data;
    } catch (error) {
      console.error('Error adding victory log:', error);
      toast({
        title: 'Victory Almost Recorded!',
        description: "Let's try capturing this success story again!",
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateVictoryLog = async (id: string, updates: Partial<WorkoutVictoryLog>) => {
    try {
      const { error } = await supabase
        .from('workout_victory_logs')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Victory Story Enhanced!',
        description: 'Your success chronicle has been updated!',
      });

      await fetchVictoryLogs();
    } catch (error) {
      console.error('Error updating victory log:', error);
      toast({
        title: 'Update Almost Complete!',
        description: "Let's try saving those victory details again!",
        variant: 'destructive',
      });
    }
  };

  const getVictoryInsights = () => {
    if (victoryLogs.length === 0) return null;

    const totalBreakthroughs = victoryLogs.filter(log => log.breakthrough_achieved).length;
    const avgVictoryLevel = victoryLogs.reduce((acc, log) => acc + log.victory_level, 0) / victoryLogs.length;
    const energyGains = victoryLogs
      .filter(log => log.energy_before && log.energy_after)
      .map(log => (log.energy_after! - log.energy_before!));
    const avgEnergyGain = energyGains.length > 0 
      ? energyGains.reduce((acc, gain) => acc + gain, 0) / energyGains.length 
      : 0;

    const allPowerMoments = victoryLogs.flatMap(log => log.power_moments);
    const recentWins = victoryLogs.slice(0, 5).map(log => log.todays_win).filter(Boolean);

    return {
      totalBreakthroughs,
      avgVictoryLevel: Math.round(avgVictoryLevel * 10) / 10,
      avgEnergyGain: Math.round(avgEnergyGain * 10) / 10,
      totalPowerMoments: allPowerMoments.length,
      recentWins,
      totalVictoryLogs: victoryLogs.length,
    };
  };

  useEffect(() => {
    fetchVictoryLogs();
  }, [user]);

  return {
    victoryLogs,
    loading,
    addVictoryLog,
    updateVictoryLog,
    getVictoryInsights,
    refetch: fetchVictoryLogs,
  };
};