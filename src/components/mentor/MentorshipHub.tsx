import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Users, Search, Plus, Star } from 'lucide-react';
import { mentorService, MentorProfile } from '@/services/mentorService';
import { useAuth } from '@/contexts/AuthContext';
import MentorDiscovery from './MentorDiscovery';
import MentorDashboard from './MentorDashboard';
import MentorSetup from './MentorSetup';
import { toast } from 'sonner';

const MentorshipHub: React.FC = () => {
  const { user } = useAuth();
  const [mentorProfile, setMentorProfile] = useState<MentorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSetup, setShowSetup] = useState(false);

  useEffect(() => {
    loadMentorProfile();
  }, [user]);

  const loadMentorProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const profile = await mentorService.getMentorProfile();
      setMentorProfile(profile);
    } catch (error) {
      console.error('Error loading mentor profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetupComplete = () => {
    setShowSetup(false);
    loadMentorProfile();
    toast.success('Mentor profile created successfully!');
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">Please log in to access mentorship features.</p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="h-64 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  if (showSetup) {
    return (
      <MentorSetup
        onComplete={handleSetupComplete}
        onCancel={() => setShowSetup(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Crown className="w-8 h-8 text-yellow-500" />
            Mentorship Hub
          </h1>
          <p className="text-muted-foreground">
            Connect with experienced members or share your expertise with newcomers.
          </p>
        </div>
        
        {!mentorProfile && (
          <Button onClick={() => setShowSetup(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Become a Mentor
          </Button>
        )}
      </div>

      {/* Mentorship Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                <Search className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold">Find a Mentor</h3>
                <p className="text-sm text-muted-foreground">
                  Get personalized guidance from experts
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold">Share Knowledge</h3>
                <p className="text-sm text-muted-foreground">
                  Mentor others and build your reputation
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                <Star className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold">Earn Recognition</h3>
                <p className="text-sm text-muted-foreground">
                  Build status and unlock exclusive features
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="discover" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="discover" className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            Find Mentors
          </TabsTrigger>
          {mentorProfile && (
            <TabsTrigger value="mentor" className="flex items-center gap-2">
              <Crown className="w-4 h-4" />
              Mentor Dashboard
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="discover">
          <MentorDiscovery />
        </TabsContent>

        {mentorProfile && (
          <TabsContent value="mentor">
            <MentorDashboard />
          </TabsContent>
        )}
      </Tabs>

      {/* Mentor Status Badge */}
      {mentorProfile && (
        <Card className="border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-full">
                  <Crown className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">Mentor Status</h3>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 border-yellow-200">
                      Active Mentor
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Specializing in: {mentorProfile.specialization_tracks.map(track => 
                      track.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
                    ).join(', ')}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="flex items-center gap-1 mb-1">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.round(mentorProfile.average_rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="text-sm font-medium ml-1">
                    {mentorProfile.average_rating.toFixed(1)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {mentorProfile.total_mentees} mentees helped
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MentorshipHub;