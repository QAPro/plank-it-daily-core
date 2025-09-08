import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Star, Users, CheckCircle, XCircle, MessageCircle, Trophy, Crown } from 'lucide-react';
import { mentorService, MentorRelationship, MentorProfile } from '@/services/mentorService';
import { toast } from 'sonner';

const MentorDashboard: React.FC = () => {
  const [relationships, setRelationships] = useState<MentorRelationship[]>([]);
  const [profile, setProfile] = useState<MentorProfile | null>(null);
  const [stats, setStats] = useState({
    totalMentees: 0,
    activeMentees: 0,
    averageRating: 0,
    completedMentorships: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedRelationship, setSelectedRelationship] = useState<MentorRelationship | null>(null);
  const [completionDialog, setCompletionDialog] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [relationshipsData, profileData, statsData] = await Promise.all([
        mentorService.getMentorRelationships(),
        mentorService.getMentorProfile(),
        mentorService.getMentorStats()
      ]);

      setRelationships(relationshipsData);
      setProfile(profileData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading mentor data:', error);
      toast.error('Failed to load mentor data');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (relationshipId: string) => {
    try {
      await mentorService.respondToRequest(relationshipId, true);
      toast.success('Mentorship request accepted!');
      loadData();
    } catch (error) {
      console.error('Error accepting request:', error);
      toast.error('Failed to accept request');
    }
  };

  const handleDeclineRequest = async (relationshipId: string) => {
    try {
      await mentorService.respondToRequest(relationshipId, false);
      toast.success('Mentorship request declined');
      loadData();
    } catch (error) {
      console.error('Error declining request:', error);
      toast.error('Failed to decline request');
    }
  };

  const handleCompleteMentorship = async () => {
    if (!selectedRelationship || rating === 0) return;

    try {
      await mentorService.completeMentorship(selectedRelationship.id, rating, feedback);
      toast.success('Mentorship completed successfully!');
      setCompletionDialog(false);
      setSelectedRelationship(null);
      setRating(0);
      setFeedback('');
      loadData();
    } catch (error) {
      console.error('Error completing mentorship:', error);
      toast.error('Failed to complete mentorship');
    }
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

  const getStatusBadge = (status: string) => {
    const configs = {
      pending: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', label: 'Pending' },
      accepted: { color: 'bg-blue-100 text-blue-700 border-blue-200', label: 'Active' },
      completed: { color: 'bg-green-100 text-green-700 border-green-200', label: 'Completed' },
      declined: { color: 'bg-red-100 text-red-700 border-red-200', label: 'Declined' }
    };
    
    const config = configs[status as keyof typeof configs] || configs.pending;
    return (
      <Badge variant="secondary" className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getRatingStars = (rating: number, interactive = false, onRatingChange?: (rating: number) => void) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${
          i < rating 
            ? 'fill-yellow-400 text-yellow-400' 
            : 'text-gray-300'
        } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
        onClick={interactive && onRatingChange ? () => onRatingChange(i + 1) : undefined}
      />
    ));
  };

  const pendingRequests = relationships.filter(r => r.status === 'pending');
  const activeRelationships = relationships.filter(r => r.status === 'accepted');
  const completedRelationships = relationships.filter(r => r.status === 'completed');

  if (!profile) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Crown className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Become a Mentor</h3>
          <p className="text-muted-foreground mb-4">
            Share your expertise and help others achieve their fitness goals.
          </p>
          <Button>Set Up Mentor Profile</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Crown className="w-6 h-6 text-yellow-500" />
            Mentor Dashboard
          </h2>
          <p className="text-muted-foreground">
            Manage your mentorships and help others grow.
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stats.activeMentees}</p>
                <p className="text-sm text-muted-foreground">Active Mentees</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{stats.completedMentorships}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</p>
                <p className="text-sm text-muted-foreground">Avg Rating</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{pendingRequests.length}</p>
                <p className="text-sm text-muted-foreground">Pending Requests</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="requests" className="space-y-4">
        <TabsList>
          <TabsTrigger value="requests">
            Requests ({pendingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="active">
            Active ({activeRelationships.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedRelationships.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-4">
          {pendingRequests.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No pending requests</p>
              </CardContent>
            </Card>
          ) : (
            pendingRequests.map((relationship) => (
              <Card key={relationship.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">
                          {relationship.mentee_name || relationship.mentee_username}
                        </h3>
                        <Badge variant="outline">
                          {getTrackDisplayName(relationship.mentor_track)}
                        </Badge>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Goals:</p>
                        <ul className="text-sm mt-1 space-y-1">
                          {relationship.mentee_goals.map((goal, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <div className="w-1 h-1 bg-muted-foreground rounded-full" />
                              {goal}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <p className="text-xs text-muted-foreground">
                        Requested {new Date(relationship.matched_at).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleAcceptRequest(relationship.id)}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeclineRequest(relationship.id)}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Decline
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          {activeRelationships.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No active mentorships</p>
              </CardContent>
            </Card>
          ) : (
            activeRelationships.map((relationship) => (
              <Card key={relationship.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">
                          {relationship.mentee_name || relationship.mentee_username}
                        </h3>
                        <Badge variant="outline">
                          {getTrackDisplayName(relationship.mentor_track)}
                        </Badge>
                        {getStatusBadge(relationship.status)}
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Goals:</p>
                        <ul className="text-sm mt-1 space-y-1">
                          {relationship.mentee_goals.map((goal, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <div className="w-1 h-1 bg-muted-foreground rounded-full" />
                              {goal}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <p className="text-xs text-muted-foreground">
                        Started {new Date(relationship.accepted_at!).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedRelationship(relationship);
                        setCompletionDialog(true);
                      }}
                    >
                      Complete Mentorship
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedRelationships.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No completed mentorships yet</p>
              </CardContent>
            </Card>
          ) : (
            completedRelationships.map((relationship) => (
              <Card key={relationship.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">
                          {relationship.mentee_name || relationship.mentee_username}
                        </h3>
                        <Badge variant="outline">
                          {getTrackDisplayName(relationship.mentor_track)}
                        </Badge>
                        {getStatusBadge(relationship.status)}
                      </div>
                      
                      {relationship.rating && (
                        <div className="flex items-center gap-2">
                          {getRatingStars(relationship.rating)}
                          <span className="text-sm text-muted-foreground">
                            ({relationship.rating}/5 stars)
                          </span>
                        </div>
                      )}
                      
                      {relationship.feedback && (
                        <p className="text-sm italic text-muted-foreground">
                          "{relationship.feedback}"
                        </p>
                      )}
                      
                      <p className="text-xs text-muted-foreground">
                        Completed {new Date(relationship.completed_at!).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={completionDialog} onOpenChange={setCompletionDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Complete Mentorship</DialogTitle>
            <DialogDescription>
              Rate your experience with {selectedRelationship?.mentee_name || selectedRelationship?.mentee_username}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Rating</label>
              <div className="flex gap-1">
                {getRatingStars(rating, true, setRating)}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Feedback (Optional)
              </label>
              <Textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Share your thoughts on this mentorship experience..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCompletionDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCompleteMentorship}
              disabled={rating === 0}
            >
              Complete Mentorship
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MentorDashboard;