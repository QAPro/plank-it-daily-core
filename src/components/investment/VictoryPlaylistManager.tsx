import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Music, Plus, Play, Star, Zap, Heart, Crown } from 'lucide-react';
import { useVictoryPlaylists } from '@/hooks/useVictoryPlaylists';
import { motion, AnimatePresence } from 'framer-motion';
import FlagGuard from '@/components/access/FlagGuard';

const VictoryPlaylistManager: React.FC = () => {
  const { 
    victoryPlaylists, 
    loading, 
    createVictoryPlaylist, 
    addSongToPlaylist,
    setDefaultPlaylist 
  } = useVictoryPlaylists();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isAddSongDialogOpen, setIsAddSongDialogOpen] = useState(false);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>('');
  const [newPlaylist, setNewPlaylist] = useState({
    playlist_name: '',
    description: '',
    is_default: false,
  });
  const [newSong, setNewSong] = useState({
    song_title: '',
    artist_name: '',
    energy_level: 3,
    victory_moment_tag: 'power',
    sort_order: 0,
  });

  const energyLevelLabels = {
    1: { label: 'Chill Warmup', icon: Heart, color: 'text-blue-500' },
    2: { label: 'Steady Build', icon: Star, color: 'text-green-500' },
    3: { label: 'Power Mode', icon: Zap, color: 'text-yellow-500' },
    4: { label: 'Beast Mode', icon: Crown, color: 'text-orange-500' },
    5: { label: 'Victory Surge', icon: Crown, color: 'text-red-500' },
  };

  const victoryMomentTags = {
    warmup: { label: 'Warmup Vibes', color: 'bg-blue-100 text-blue-800' },
    power: { label: 'Power Boost', color: 'bg-yellow-100 text-yellow-800' },
    breakthrough: { label: 'Breakthrough', color: 'bg-purple-100 text-purple-800' },
    celebration: { label: 'Victory Dance', color: 'bg-green-100 text-green-800' },
  };

  const handleCreatePlaylist = async () => {
    if (!newPlaylist.playlist_name.trim()) return;
    
    await createVictoryPlaylist(newPlaylist);
    setNewPlaylist({ playlist_name: '', description: '', is_default: false });
    setIsCreateDialogOpen(false);
  };

  const handleAddSong = async () => {
    if (!newSong.song_title.trim() || !newSong.artist_name.trim() || !selectedPlaylistId) return;
    
    await addSongToPlaylist(selectedPlaylistId, newSong);
    setNewSong({
      song_title: '',
      artist_name: '',
      energy_level: 3,
      victory_moment_tag: 'power',
      sort_order: 0,
    });
    setIsAddSongDialogOpen(false);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Music className="w-5 h-5 mr-2 text-primary" />
            Victory Soundtracks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-20 bg-muted rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <FlagGuard featureName="victory_playlists">
      <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Music className="w-5 h-5 mr-2 text-primary" />
            Your Victory Soundtracks
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Create Power Playlist
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Your Victory Soundtrack</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="playlist-name">Playlist Name</Label>
                  <Input
                    id="playlist-name"
                    placeholder="My Power-Up Mix"
                    value={newPlaylist.playlist_name}
                    onChange={(e) => setNewPlaylist({ ...newPlaylist, playlist_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="playlist-description">Description (optional)</Label>
                  <Input
                    id="playlist-description"
                    placeholder="Songs that fuel my victory..."
                    value={newPlaylist.description}
                    onChange={(e) => setNewPlaylist({ ...newPlaylist, description: e.target.value })}
                  />
                </div>
                <Button onClick={handleCreatePlaylist} className="w-full">
                  Create Victory Playlist
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {victoryPlaylists.length === 0 ? (
          <div className="text-center py-12">
            <Music className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Create Your Victory Soundtrack!</h3>
            <p className="text-muted-foreground mb-6">
              Build playlists that power your workouts and celebrate your wins!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence>
              {victoryPlaylists.map((playlist, index) => (
                <motion.div
                  key={playlist.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={playlist.is_default ? 'border-primary' : ''}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mr-3">
                            <Music className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-semibold flex items-center">
                              {playlist.playlist_name}
                              {playlist.is_default && (
                                <Crown className="w-4 h-4 ml-2 text-yellow-500" />
                              )}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {playlist.description || 'Your victory playlist'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {playlist.songs && (
                            <Badge variant="secondary">
                              {playlist.songs.length} power songs
                            </Badge>
                          )}
                          <Button size="sm" variant="outline">
                            <Play className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Songs List */}
                      {playlist.songs && playlist.songs.length > 0 && (
                        <div className="space-y-2 mb-4">
                          {playlist.songs.slice(0, 3).map((song) => {
                            const energyData = energyLevelLabels[song.energy_level as keyof typeof energyLevelLabels];
                            const tagData = victoryMomentTags[song.victory_moment_tag as keyof typeof victoryMomentTags];
                            const EnergyIcon = energyData.icon;
                            
                            return (
                              <div key={song.id} className="flex items-center justify-between p-2 rounded bg-muted/50">
                                <div className="flex items-center">
                                  <EnergyIcon className={`w-4 h-4 mr-2 ${energyData.color}`} />
                                  <div>
                                    <span className="font-medium text-sm">{song.song_title}</span>
                                    <span className="text-muted-foreground text-xs ml-2">by {song.artist_name}</span>
                                  </div>
                                </div>
                                {song.victory_moment_tag && (
                                  <Badge className={`text-xs ${tagData.color}`}>
                                    {tagData.label}
                                  </Badge>
                                )}
                              </div>
                            );
                          })}
                          {playlist.songs.length > 3 && (
                            <p className="text-sm text-muted-foreground text-center">
                              +{playlist.songs.length - 3} more power songs
                            </p>
                          )}
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Dialog open={isAddSongDialogOpen} onOpenChange={setIsAddSongDialogOpen}>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setSelectedPlaylistId(playlist.id)}
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add Power Song
                            </Button>
                          </DialogTrigger>
                        </Dialog>
                        
                        {!playlist.is_default && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setDefaultPlaylist(playlist.id)}
                          >
                            <Crown className="w-4 h-4 mr-2" />
                            Set as Default
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Add Song Dialog */}
        <Dialog open={isAddSongDialogOpen} onOpenChange={setIsAddSongDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Power Song</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="song-title">Song Title</Label>
                <Input
                  id="song-title"
                  placeholder="Enter song title"
                  value={newSong.song_title}
                  onChange={(e) => setNewSong({ ...newSong, song_title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="artist-name">Artist</Label>
                <Input
                  id="artist-name"
                  placeholder="Enter artist name"
                  value={newSong.artist_name}
                  onChange={(e) => setNewSong({ ...newSong, artist_name: e.target.value })}
                />
              </div>
              <div>
                <Label>Energy Level</Label>
                <Select 
                  value={newSong.energy_level.toString()} 
                  onValueChange={(value) => setNewSong({ ...newSong, energy_level: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(energyLevelLabels).map(([level, data]) => {
                      const Icon = data.icon;
                      return (
                        <SelectItem key={level} value={level}>
                          <div className="flex items-center">
                            <Icon className={`w-4 h-4 mr-2 ${data.color}`} />
                            {data.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Victory Moment</Label>
                <Select 
                  value={newSong.victory_moment_tag} 
                  onValueChange={(value) => setNewSong({ ...newSong, victory_moment_tag: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(victoryMomentTags).map(([tag, data]) => (
                      <SelectItem key={tag} value={tag}>
                        {data.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAddSong} className="w-full">
                Add to Victory Playlist
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
    </FlagGuard>
  );
};

export default VictoryPlaylistManager;