import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Music, Volume2 } from 'lucide-react';
import { useUserPreferences } from '@/hooks/useUserPreferences';

const MUSIC_GENRES = [
  { id: 'electronic', name: 'Electronic/EDM', description: 'High-energy beats for intense workouts' },
  { id: 'rock', name: 'Rock/Alternative', description: 'Driving rhythms and powerful vocals' },
  { id: 'pop', name: 'Pop/Hip-Hop', description: 'Catchy beats and motivational lyrics' },
  { id: 'instrumental', name: 'Instrumental', description: 'Focus-friendly background music' },
  { id: 'ambient', name: 'Ambient/Chill', description: 'Calming sounds for mindful workouts' },
  { id: 'classical', name: 'Classical/Film', description: 'Orchestral and cinematic pieces' }
];

const AUTO_START_OPTIONS = [
  { value: 'always', label: 'Always start with workout' },
  { value: 'timer-only', label: 'Only during timer sessions' },
  { value: 'manual', label: 'Manual control only' }
];

export const MusicPreferences: React.FC = () => {
  const { preferences, updatePreferences, loading } = useUserPreferences();

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-10 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-1/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleMusicToggle = (enabled: boolean) => {
    updatePreferences({ background_music: enabled });
  };

  const handleVolumeChange = (volume: number[]) => {
    updatePreferences({ music_volume: volume[0] });
  };

  const handleGenreChange = (genre: string) => {
    updatePreferences({ 
      // Store the preferred genre in an extended preferences field
      // For now, we'll use a custom field that can be added to the user preferences
      ...preferences,
      preferred_music_genre: genre 
    } as any);
  };

  const handleAutoStartChange = (autoStart: string) => {
    updatePreferences({ 
      ...preferences,
      music_auto_start: autoStart 
    } as any);
  };

  const backgroundMusic = preferences?.background_music ?? false;
  const musicVolume = preferences?.music_volume ?? 0.3;
  const preferredGenre = (preferences as any)?.preferred_music_genre ?? 'electronic';
  const musicAutoStart = (preferences as any)?.music_auto_start ?? 'timer-only';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="h-5 w-5" />
          Background Music
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enable Background Music */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="background-music">Enable Background Music</Label>
            <p className="text-sm text-muted-foreground">
              Play workout music during your plank sessions
            </p>
          </div>
          <Switch
            id="background-music"
            checked={backgroundMusic}
            onCheckedChange={handleMusicToggle}
          />
        </div>

        {backgroundMusic && (
          <>
            {/* Music Volume */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4" />
                  Music Volume
                </Label>
                <span className="text-sm text-muted-foreground">
                  {Math.round(musicVolume * 100)}%
                </span>
              </div>
              <Slider
                value={[musicVolume]}
                onValueChange={handleVolumeChange}
                max={1}
                step={0.1}
                className="w-full"
              />
              <p className="text-sm text-muted-foreground">
                Music will automatically duck during countdown sounds and notifications
              </p>
            </div>

            {/* Music Genre/Style */}
            <div className="space-y-3">
              <Label>Preferred Music Style</Label>
              <Select value={preferredGenre} onValueChange={handleGenreChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose your workout music style" />
                </SelectTrigger>
                <SelectContent>
                  {MUSIC_GENRES.map((genre) => (
                    <SelectItem key={genre.id} value={genre.id}>
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{genre.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {genre.description}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Auto-Start Settings */}
            <div className="space-y-3">
              <Label>Music Auto-Start</Label>
              <Select value={musicAutoStart} onValueChange={handleAutoStartChange}>
                <SelectTrigger>
                  <SelectValue placeholder="When should music start playing?" />
                </SelectTrigger>
                <SelectContent>
                  {AUTO_START_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Control when background music automatically starts during your workouts
              </p>
            </div>

            {/* Music Mix Information */}
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Smart Audio Mixing</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Music automatically lowers during voice countdowns</li>
                <li>• Timer completion sounds play over music</li>
                <li>• Music resumes normal volume after audio cues</li>
                <li>• Seamless transitions between tracks during workouts</li>
              </ul>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};