import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Star, Users, Crown, MessageCircle, Trophy } from 'lucide-react';
import { mentorService, MentorProfile, MentorMatchCriteria } from '@/services/mentorService';
import { useStatusTracks } from '@/hooks/useStatusTracks';
import { toast } from 'sonner';

const MentorDiscovery: React.FC = () => {
  const [mentors, setMentors] = useState<MentorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMentor, setSelectedMentor] = useState<MentorProfile | null>(null);
  const [requestDialog, setRequestDialog] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<string>('');
  const [goals, setGoals] = useState<string>('');
  const { statusTracks } = useStatusTracks();

  const criteria: MentorMatchCriteria = {
    track: selectedTrack,
    min_mentor_level: 5,
    goals: goals.split('\n').filter(g => g.trim())
  };

  useEffect(() => {
    if (selectedTrack) {
      loadMentors();
    }
  }, [selectedTrack]);

  const loadMentors = async () => {
    if (!selectedTrack) return;
    
    setLoading(true);
    try {
      const foundMentors = await mentorService.findMentors(criteria);
      setMentors(foundMentors);
    } catch (error) {
      console.error('Error loading mentors:', error);
      toast.error('Failed to load mentors');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestMentorship = async () => {
    if (!selectedMentor || !selectedTrack || !goals.trim()) return;

    try {
      await mentorService.requestMentorship(
        selectedMentor.user_id,
        selectedTrack,
        goals.split('\n').filter(g => g.trim())
      );
      
      toast.success('Mentorship request sent!');
      setRequestDialog(false);
      setSelectedMentor(null);
      setGoals('');
    } catch (error) {
      console.error('Error requesting mentorship:', error);
      toast.error('Failed to send request');
    }
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  const getTrackDisplayName = (track: string) => {
    const trackNames: Record<string, string> = {
      core_strength: 'Core Master',
      consistency: 'Consistency Champion',
      endurance: 'Endurance Expert',
      form_technique: 'Form Perfectionist',
      community_leader: 'Community Leader'
    };
    return trackNames[track] || track;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Find a Mentor</h2>
        <p className="text-muted-foreground">
          Connect with experienced community members to accelerate your fitness journey.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Criteria</CardTitle>
          <CardDescription>
            Select the track you want mentorship in
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedTrack} onValueChange={setSelectedTrack}>
            <SelectTrigger>
              <SelectValue placeholder="Select a track for mentorship" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="core_strength">Core Master</SelectItem>
              <SelectItem value="consistency">Consistency Champion</SelectItem>
              <SelectItem value="endurance">Endurance Expert</SelectItem>
              <SelectItem value="form_technique">Form Perfectionist</SelectItem>
              <SelectItem value="community_leader">Community Leader</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {loading && selectedTrack && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Finding mentors...</p>
        </div>
      )}

      {!loading && selectedTrack && mentors.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">
              No mentors available for {getTrackDisplayName(selectedTrack)} at this time.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mentors.map((mentor) => (
          <Card key={mentor.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-yellow-500" />
                    {mentor.full_name || mentor.username}
                  </CardTitle>
                  <CardDescription>
                    @{mentor.username}
                  </CardDescription>
                </div>
                {mentor.average_rating > 0 && (
                  <div className="flex items-center gap-1">
                    {getRatingStars(Math.round(mentor.average_rating))}
                    <span className="text-sm text-muted-foreground ml-1">
                      ({mentor.total_mentees})
                    </span>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Specializations:</p>
                <div className="flex flex-wrap gap-1">
                  {mentor.specialization_tracks.map((track) => (
                    <Badge key={track} variant="secondary" className="text-xs">
                      {getTrackDisplayName(track)}
                    </Badge>
                  ))}
                </div>
              </div>

              {mentor.bio && (
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {mentor.bio}
                </p>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span>{mentor.current_mentees}/{mentor.max_mentees} mentees</span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-green-500" />
                  <span>{mentor.total_mentees} completed</span>
                </div>
              </div>

              <Button
                onClick={() => {
                  setSelectedMentor(mentor);
                  setRequestDialog(true);
                }}
                className="w-full"
                disabled={mentor.current_mentees >= mentor.max_mentees}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                {mentor.current_mentees >= mentor.max_mentees ? 'Unavailable' : 'Request Mentorship'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={requestDialog} onOpenChange={setRequestDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Request Mentorship</DialogTitle>
            <DialogDescription>
              Send a mentorship request to {selectedMentor?.full_name || selectedMentor?.username}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Track: {getTrackDisplayName(selectedTrack)}</p>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Your Goals (one per line)
              </label>
              <Textarea
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
                placeholder="Improve plank hold duration&#10;Better form technique&#10;Increase consistency"
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRequestDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleRequestMentorship}
              disabled={!goals.trim()}
            >
              Send Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MentorDiscovery;