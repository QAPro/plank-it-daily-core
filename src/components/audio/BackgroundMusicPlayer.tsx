import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, SkipForward, SkipBack } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import FlagGuard from '@/components/access/FlagGuard';
import { cn } from '@/lib/utils';

interface Playlist {
  id: string;
  name: string;
  tracks: string[];
  genre: string;
}

const WORKOUT_PLAYLISTS: Playlist[] = [
  {
    id: 'energetic',
    name: 'High Energy',
    tracks: [
      'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', // Placeholder - would be real music URLs
      'https://www.soundjay.com/misc/sounds/bell-ringing-04.wav',
    ],
    genre: 'Electronic/Rock'
  },
  {
    id: 'focus',
    name: 'Focus Flow',
    tracks: [
      'https://www.soundjay.com/misc/sounds/bell-ringing-03.wav',
      'https://www.soundjay.com/misc/sounds/bell-ringing-02.wav',
    ],
    genre: 'Ambient/Instrumental'
  },
  {
    id: 'calm',
    name: 'Calm Core',
    tracks: [
      'https://www.soundjay.com/misc/sounds/bell-ringing-01.wav',
    ],
    genre: 'Meditation/Ambient'
  }
];

interface BackgroundMusicPlayerProps {
  isWorkoutActive?: boolean;
  className?: string;
}

export const BackgroundMusicPlayer: React.FC<BackgroundMusicPlayerProps> = ({
  isWorkoutActive = false,
  className
}) => {
  const { preferences, updatePreferences } = useUserPreferences();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [currentPlaylist, setCurrentPlaylist] = useState<Playlist>(WORKOUT_PLAYLISTS[0]);
  const [volume, setVolume] = useState(preferences?.music_volume ?? 0.3);
  const [isMuted, setIsMuted] = useState(false);

  // Auto-start music when workout becomes active
  useEffect(() => {
    if (isWorkoutActive && preferences?.background_music && !isPlaying) {
      handlePlay();
    }
  }, [isWorkoutActive, preferences?.background_music]);

  // Sync volume with user preferences
  useEffect(() => {
    if (preferences?.music_volume !== undefined) {
      setVolume(preferences.music_volume);
    }
  }, [preferences?.music_volume]);

  // Update audio volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Handle playlist changes
  useEffect(() => {
    if (audioRef.current && currentPlaylist.tracks.length > 0) {
      audioRef.current.src = currentPlaylist.tracks[currentTrackIndex];
      audioRef.current.load();
    }
  }, [currentPlaylist, currentTrackIndex]);

  const handlePlay = async () => {
    if (audioRef.current && currentPlaylist.tracks.length > 0) {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (error) {
        console.error('Error playing audio:', error);
      }
    }
  };

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleNext = () => {
    const nextIndex = (currentTrackIndex + 1) % currentPlaylist.tracks.length;
    setCurrentTrackIndex(nextIndex);
  };

  const handlePrevious = () => {
    const prevIndex = currentTrackIndex === 0 
      ? currentPlaylist.tracks.length - 1 
      : currentTrackIndex - 1;
    setCurrentTrackIndex(prevIndex);
  };

  const handleVolumeChange = (newVolume: number[]) => {
    const volumeValue = newVolume[0];
    setVolume(volumeValue);
    updatePreferences({ music_volume: volumeValue });
  };

  const handlePlaylistChange = (playlistId: string) => {
    const playlist = WORKOUT_PLAYLISTS.find(p => p.id === playlistId);
    if (playlist) {
      setCurrentPlaylist(playlist);
      setCurrentTrackIndex(0);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const onAudioEnded = () => {
    handleNext();
  };

  const onAudioCanPlay = () => {
    if (isPlaying) {
      audioRef.current?.play();
    }
  };

  if (!preferences?.background_music) {
    return null;
  }

  return (
    <FlagGuard featureName="background_music_player">
      <Card className={cn("w-full max-w-sm", className)}>
        <CardContent className="p-4">
          <audio
            ref={audioRef}
            onEnded={onAudioEnded}
            onCanPlay={onAudioCanPlay}
            preload="metadata"
          />
          
          <div className="space-y-4">
            {/* Playlist Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Workout Playlist</label>
              <Select value={currentPlaylist.id} onValueChange={handlePlaylistChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WORKOUT_PLAYLISTS.map((playlist) => (
                    <SelectItem key={playlist.id} value={playlist.id}>
                      <div className="flex flex-col items-start">
                        <span>{playlist.name}</span>
                        <span className="text-xs text-muted-foreground">{playlist.genre}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Player Controls */}
            <div className="flex items-center justify-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
                disabled={currentPlaylist.tracks.length <= 1}
              >
                <SkipBack className="h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                onClick={isPlaying ? handlePause : handlePlay}
                disabled={currentPlaylist.tracks.length === 0}
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleNext}
                disabled={currentPlaylist.tracks.length <= 1}
              >
                <SkipForward className="h-4 w-4" />
              </Button>
            </div>

            {/* Volume Controls */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Volume</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMute}
                >
                  {isMuted ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <Slider
                value={[isMuted ? 0 : volume]}
                onValueChange={handleVolumeChange}
                max={1}
                step={0.1}
                className="w-full"
                disabled={isMuted}
              />
            </div>

            {/* Current Track Info */}
            <div className="text-center text-sm text-muted-foreground">
              Track {currentTrackIndex + 1} of {currentPlaylist.tracks.length}
            </div>
          </div>
        </CardContent>
      </Card>
    </FlagGuard>
  );
};