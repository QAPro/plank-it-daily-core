import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface VictoryPhoto {
  id: string;
  user_id: string;
  photo_url: string;
  victory_title: string;
  celebration_notes?: string;
  stats_overlay: any;
  milestone_achieved?: string;
  is_public: boolean;
  celebration_timestamp: string;
  created_at: string;
}

export const useVictoryPhotos = () => {
  const [victoryPhotos, setVictoryPhotos] = useState<VictoryPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchVictoryPhotos = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_victory_photos')
        .select('*')
        .eq('user_id', user.id)
        .order('celebration_timestamp', { ascending: false });

      if (error) throw error;
      setVictoryPhotos(data || []);
    } catch (error) {
      console.error('Error fetching victory photos:', error);
      toast({
        title: 'Oops! Slight Hiccup',
        description: "We're having trouble loading your Victory Gallery. Let's try again!",
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const addVictoryPhoto = async (photo: Omit<VictoryPhoto, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('user_victory_photos')
        .insert([{
          ...photo,
          user_id: user.id,
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: '🎉 Victory Captured!',
        description: 'Your amazing progress is now saved in your Victory Gallery!',
      });

      await fetchVictoryPhotos();
      return data;
    } catch (error) {
      console.error('Error adding victory photo:', error);
      toast({
        title: 'Victory Almost Saved!',
        description: "Let's try capturing this amazing moment again!",
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateVictoryPhoto = async (id: string, updates: Partial<VictoryPhoto>) => {
    try {
      const { error } = await supabase
        .from('user_victory_photos')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Victory Updated!',
        description: 'Your success story details have been enhanced!',
      });

      await fetchVictoryPhotos();
    } catch (error) {
      console.error('Error updating victory photo:', error);
      toast({
        title: 'Update Almost Complete!',
        description: "Let's try saving those changes again!",
        variant: 'destructive',
      });
    }
  };

  const deleteVictoryPhoto = async (id: string) => {
    try {
      const { error } = await supabase
        .from('user_victory_photos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Photo Removed',
        description: 'Victory photo removed from your gallery.',
      });

      await fetchVictoryPhotos();
    } catch (error) {
      console.error('Error deleting victory photo:', error);
      toast({
        title: 'Action Almost Complete!',
        description: "Let's try that again!",
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchVictoryPhotos();
  }, [user]);

  return {
    victoryPhotos,
    loading,
    addVictoryPhoto,
    updateVictoryPhoto,
    deleteVictoryPhoto,
    refetch: fetchVictoryPhotos,
  };
};