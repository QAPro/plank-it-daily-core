import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface PlaylistSong {
  id: string;
  playlist_id: string;
  song_title: string;
  artist_name: string;
  energy_level: number;
  victory_moment_tag?: string;
  duration_seconds?: number;
  sort_order: number;
  created_at: string;
}

export interface VictoryPlaylist {
  id: string;
  user_id: string;
  playlist_name: string;
  description?: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
  songs?: PlaylistSong[];
}

export const useVictoryPlaylists = () => {
  const [victoryPlaylists, setVictoryPlaylists] = useState<VictoryPlaylist[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchVictoryPlaylists = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data: playlists, error: playlistsError } = await supabase
        .from('user_victory_playlists')
        .select(`
          *,
          songs:victory_playlist_songs(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (playlistsError) throw playlistsError;
      setVictoryPlaylists(playlists || []);
    } catch (error) {
      console.error('Error fetching victory playlists:', error);
      toast({
        title: 'Power-Up Songs Loading...',
        description: "Having trouble accessing your Victory Playlists. Let's try again!",
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createVictoryPlaylist = async (playlist: Omit<VictoryPlaylist, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'songs'>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('user_victory_playlists')
        .insert([{
          ...playlist,
          user_id: user.id,
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: '🎵 Victory Playlist Created!',
        description: 'Your new power-up soundtrack is ready to fuel your success!',
      });

      await fetchVictoryPlaylists();
      return data;
    } catch (error) {
      console.error('Error creating victory playlist:', error);
      toast({
        title: 'Playlist Almost Ready!',
        description: "Let's try creating your victory soundtrack again!",
        variant: 'destructive',
      });
      return null;
    }
  };

  const addSongToPlaylist = async (playlistId: string, song: Omit<PlaylistSong, 'id' | 'playlist_id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('victory_playlist_songs')
        .insert([{
          ...song,
          playlist_id: playlistId,
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: '🎶 Power Song Added!',
        description: 'Your victory soundtrack just got more powerful!',
      });

      await fetchVictoryPlaylists();
      return data;
    } catch (error) {
      console.error('Error adding song to playlist:', error);
      toast({
        title: 'Song Almost Added!',
        description: "Let's try adding this power-up song again!",
        variant: 'destructive',
      });
      return null;
    }
  };

  const updatePlaylist = async (id: string, updates: Partial<VictoryPlaylist>) => {
    try {
      const { error } = await supabase
        .from('user_victory_playlists')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Playlist Enhanced!',
        description: 'Your victory soundtrack has been updated!',
      });

      await fetchVictoryPlaylists();
    } catch (error) {
      console.error('Error updating playlist:', error);
      toast({
        title: 'Update Almost Complete!',
        description: "Let's try saving those playlist changes again!",
        variant: 'destructive',
      });
    }
  };

  const deleteSong = async (songId: string) => {
    try {
      const { error } = await supabase
        .from('victory_playlist_songs')
        .delete()
        .eq('id', songId);

      if (error) throw error;

      toast({
        title: 'Song Updated',
        description: 'Your victory playlist has been refined!',
      });

      await fetchVictoryPlaylists();
    } catch (error) {
      console.error('Error deleting song:', error);
      toast({
        title: 'Action Almost Complete!',
        description: "Let's try that again!",
        variant: 'destructive',
      });
    }
  };

  const setDefaultPlaylist = async (playlistId: string) => {
    try {
      // Remove default from all playlists
      await supabase
        .from('user_victory_playlists')
        .update({ is_default: false })
        .eq('user_id', user?.id);

      // Set new default
      const { error } = await supabase
        .from('user_victory_playlists')
        .update({ is_default: true })
        .eq('id', playlistId);

      if (error) throw error;

      toast({
        title: '🏆 Default Victory Soundtrack Set!',
        description: 'This playlist will now power all your workouts!',
      });

      await fetchVictoryPlaylists();
    } catch (error) {
      console.error('Error setting default playlist:', error);
      toast({
        title: 'Almost Set as Default!',
        description: "Let's try setting your power playlist again!",
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchVictoryPlaylists();
  }, [user]);

  return {
    victoryPlaylists,
    loading,
    createVictoryPlaylist,
    addSongToPlaylist,
    updatePlaylist,
    deleteSong,
    setDefaultPlaylist,
    refetch: fetchVictoryPlaylists,
  };
};