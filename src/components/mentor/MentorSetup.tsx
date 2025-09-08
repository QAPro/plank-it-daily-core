import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Crown, Users, Star, Trophy, ArrowLeft } from 'lucide-react';
import { mentorService } from '@/services/mentorService';
import { useStatusTracks } from '@/hooks/useStatusTracks';
import { toast } from 'sonner';

interface MentorSetupProps {
  onComplete: () => void;
  onCancel: () => void;
}

const MentorSetup: React.FC<MentorSetupProps> = ({ onComplete, onCancel }) => {
  const { statusTracks } = useStatusTracks();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    specialization_tracks: [] as string[],
    min_mentee_level: 1,
    max_mentees: 3,
    is_accepting_mentees: true,
    bio: ''
  });

  const trackOptions = [
    { value: 'core_strength', label: 'Core Master', description: 'Help others build core strength and stability', icon: <Trophy className="w-4 h-4" /> },
    { value: 'consistency', label: 'Consistency Champion', description: 'Guide newcomers in building healthy habits', icon: <Star className="w-4 h-4" /> },
    { value: 'endurance', label: 'Endurance Expert', description: 'Train others for long-duration holds', icon: <Users className="w-4 h-4" /> },
    { value: 'form_technique', label: 'Form Perfectionist', description: 'Teach proper technique and injury prevention', icon: <Crown className="w-4 h-4" /> },
    { value: 'community_leader', label: 'Community Leader', description: 'Foster positive community culture', icon: <Star className="w-4 h-4" /> }
  ];

  const handleSpecializationToggle = (track: string) => {
    setFormData(prev => ({
      ...prev,
      specialization_tracks: prev.specialization_tracks.includes(track)
        ? prev.specialization_tracks.filter(t => t !== track)
        : [...prev.specialization_tracks, track]
    }));
  };

  const canMentorTrack = (track: string) => {
    const userTrack = statusTracks.find(t => t.track_name === track);
    return userTrack && userTrack.track_level >= 5; // Require level 5+ to mentor
  };

  const handleSubmit = async () => {
    if (formData.specialization_tracks.length === 0) {
      toast.error('Please select at least one specialization track');
      return;
    }

    if (!formData.bio.trim()) {
      toast.error('Please add a brief bio');
      return;
    }

    setLoading(true);
    try {
      await mentorService.createMentorProfile(formData);
      onComplete();
    } catch (error) {
      console.error('Error creating mentor profile:', error);
      toast.error('Failed to create mentor profile');
    } finally {
      setLoading(false);
    }
  };

  const availableTracks = trackOptions.filter(track => canMentorTrack(track.value));
  const lockedTracks = trackOptions.filter(track => !canMentorTrack(track.value));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={onCancel}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Crown className="w-6 h-6 text-yellow-500" />
            Become a Mentor
          </h2>
          <p className="text-muted-foreground">
            Set up your mentor profile and start helping others achieve their goals.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Specialization Tracks</CardTitle>
              <CardDescription>
                Select the areas where you can mentor others. You need Level 5+ in a track to offer mentorship.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {availableTracks.length > 0 && (
                <div>
                  <p className="font-medium text-sm mb-3">Available Specializations:</p>
                  <div className="grid gap-3">
                    {availableTracks.map((track) => {
                      const userTrack = statusTracks.find(t => t.track_name === track.value);
                      const isSelected = formData.specialization_tracks.includes(track.value);
                      
                      return (
                        <div
                          key={track.value}
                          className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-primary/10 border-primary'
                              : 'bg-muted/30 border-muted hover:bg-muted/50'
                          }`}
                          onClick={() => handleSpecializationToggle(track.value)}
                        >
                          <div className="flex items-start gap-3">
                            <Checkbox
                              checked={isSelected}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                {track.icon}
                                <h3 className="font-semibold">{track.label}</h3>
                                <Badge variant="secondary" className="text-xs">
                                  Level {userTrack?.track_level}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {track.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {lockedTracks.length > 0 && (
                <div>
                  <p className="font-medium text-sm mb-3 text-muted-foreground">
                    Unlock by reaching Level 5+:
                  </p>
                  <div className="grid gap-3">
                    {lockedTracks.map((track) => {
                      const userTrack = statusTracks.find(t => t.track_name === track.value);
                      
                      return (
                        <div
                          key={track.value}
                          className="p-4 rounded-lg border bg-muted/20 border-muted opacity-60"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                {track.icon}
                                <h3 className="font-semibold">{track.label}</h3>
                                <Badge variant="outline" className="text-xs">
                                  Level {userTrack?.track_level || 0}/5
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {track.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mentorship Settings</CardTitle>
              <CardDescription>
                Configure your mentorship preferences and availability.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="min_mentee_level">Minimum Mentee Level</Label>
                  <Select
                    value={formData.min_mentee_level.toString()}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, min_mentee_level: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Level 1 (Beginners)</SelectItem>
                      <SelectItem value="2">Level 2+</SelectItem>
                      <SelectItem value="3">Level 3+</SelectItem>
                      <SelectItem value="4">Level 4+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_mentees">Maximum Active Mentees</Label>
                  <Select
                    value={formData.max_mentees.toString()}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, max_mentees: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 mentee</SelectItem>
                      <SelectItem value="2">2 mentees</SelectItem>
                      <SelectItem value="3">3 mentees</SelectItem>
                      <SelectItem value="5">5 mentees</SelectItem>
                      <SelectItem value="10">10 mentees</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Mentor Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell potential mentees about your experience, approach to mentorship, and what they can expect when working with you..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-blue-600" />
                Mentor Benefits
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <Star className="w-4 h-4 text-yellow-500 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Build Reputation</p>
                  <p className="text-xs text-muted-foreground">Earn ratings and exclusive mentor badges</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Users className="w-4 h-4 text-blue-500 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Community Impact</p>
                  <p className="text-xs text-muted-foreground">Help others succeed and grow the community</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Trophy className="w-4 h-4 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Exclusive Access</p>
                  <p className="text-xs text-muted-foreground">Unlock mentor-only features and content</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Track Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {statusTracks.slice(0, 5).map((track) => (
                <div key={track.track_name} className="flex items-center justify-between">
                  <span className="text-sm font-medium capitalize">
                    {track.track_name.replace('_', ' ')}
                  </span>
                  <Badge 
                    variant={track.track_level >= 5 ? "default" : "secondary"}
                    className="text-xs"
                  >
                    Level {track.track_level}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={loading || formData.specialization_tracks.length === 0}
        >
          {loading ? 'Creating Profile...' : 'Become a Mentor'}
        </Button>
      </div>
    </div>
  );
};

export default MentorSetup;