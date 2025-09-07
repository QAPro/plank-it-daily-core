import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface VictoryPartnership {
  id: string;
  partner1_id: string;
  partner2_id: string;
  partnership_status: 'pending' | 'active' | 'paused' | 'completed';
  shared_goals: any;
  partnership_start_date?: string;
  partnership_end_date?: string;
  check_in_frequency: 'daily' | 'weekly' | 'bi-weekly';
  motivation_style: 'encouraging' | 'competitive' | 'casual';
  created_at: string;
  updated_at: string;
  partner?: {
    id: string;
    username?: string;
    full_name?: string;
  };
}

export interface VictoryPartnerCheckin {
  id: string;
  partnership_id: string;
  sender_id: string;
  receiver_id: string;
  checkin_type: 'encouragement' | 'progress_share' | 'goal_update' | 'celebration';
  message: string;
  workout_data?: any;
  is_read: boolean;
  created_at: string;
}

export const useVictoryPartnerships = () => {
  const [partnerships, setPartnerships] = useState<VictoryPartnership[]>([]);
  const [checkins, setCheckins] = useState<VictoryPartnerCheckin[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchPartnerships = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('victory_partnerships')
        .select(`
          *
        `)
        .or(`partner1_id.eq.${user.id},partner2_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setPartnerships((data as any) || []);
    } catch (error) {
      console.error('Error fetching victory partnerships:', error);
      toast({
        title: 'Success Partners Loading...',
        description: "Having trouble accessing your Victory Partners. Let's try again!",
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCheckins = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('victory_partner_checkins')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setCheckins((data as any) || []);
    } catch (error) {
      console.error('Error fetching checkins:', error);
    }
  };

  const createPartnership = async (partnerId: string, partnershipData: Partial<VictoryPartnership>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('victory_partnerships')
        .insert([{
          partner1_id: user.id,
          partner2_id: partnerId,
          ...partnershipData,
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: '🤝 Victory Partnership Created!',
        description: 'Your success buddy partnership is ready to begin your journey together!',
      });

      await fetchPartnerships();
      return data;
    } catch (error) {
      console.error('Error creating partnership:', error);
      toast({
        title: 'Partnership Almost Ready!',
        description: "Let's try connecting with your victory partner again!",
        variant: 'destructive',
      });
      return null;
    }
  };

  const sendCheckin = async (partnershipId: string, receiverId: string, checkinData: Partial<VictoryPartnerCheckin>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('victory_partner_checkins')
        .insert([{
          partnership_id: partnershipId,
          sender_id: user.id,
          receiver_id: receiverId,
          checkin_type: checkinData.checkin_type || 'encouragement',
          message: checkinData.message || '',
          workout_data: checkinData.workout_data,
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: '💪 Encouragement Sent!',
        description: 'Your victory partner will be inspired by your support!',
      });

      await fetchCheckins();
      return data;
    } catch (error) {
      console.error('Error sending checkin:', error);
      toast({
        title: 'Message Almost Sent!',
        description: "Let's try sending that encouragement again!",
        variant: 'destructive',
      });
      return null;
    }
  };

  const updatePartnership = async (partnershipId: string, updates: Partial<VictoryPartnership>) => {
    try {
      const { error } = await supabase
        .from('victory_partnerships')
        .update(updates)
        .eq('id', partnershipId);

      if (error) throw error;

      toast({
        title: 'Partnership Enhanced!',
        description: 'Your victory partnership has been updated for even better success!',
      });

      await fetchPartnerships();
    } catch (error) {
      console.error('Error updating partnership:', error);
      toast({
        title: 'Update Almost Complete!',
        description: "Let's try saving those partnership changes again!",
        variant: 'destructive',
      });
    }
  };

  const markCheckinAsRead = async (checkinId: string) => {
    try {
      const { error } = await supabase
        .from('victory_partner_checkins')
        .update({ is_read: true })
        .eq('id', checkinId);

      if (error) throw error;
      await fetchCheckins();
    } catch (error) {
      console.error('Error marking checkin as read:', error);
    }
  };

  useEffect(() => {
    fetchPartnerships();
    fetchCheckins();
  }, [user]);

  return {
    partnerships,
    checkins,
    loading,
    createPartnership,
    sendCheckin,
    updatePartnership,
    markCheckinAsRead,
    refetch: () => {
      fetchPartnerships();
      fetchCheckins();
    },
  };
};