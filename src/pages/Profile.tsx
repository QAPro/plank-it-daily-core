import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, Lock, Trophy, Flame, Clock, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useSessionHistory } from '@/hooks/useSessionHistory';
import { useStreakTracking } from '@/hooks/useStreakTracking';
import { useUserAchievements } from '@/hooks/useUserAchievements';
import { useViewableProfile } from '@/hooks/useViewableProfile';
import { usePrivacySettings } from '@/hooks/usePrivacySettings';
import EditProfileDialog from '@/components/profile/EditProfileDialog';
import ChangePasswordDialog from '@/components/profile/ChangePasswordDialog';
import PrivateProfilePlaceholder from '@/components/privacy/PrivateProfilePlaceholder';
import ProfileHeader from '@/components/profile/ProfileHeader';

const Profile = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const { user } = useAuth();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  // Determine if viewing own profile or someone else's
  const targetUserId = userId || user?.id;
  const isOwnProfile = !userId || userId === user?.id;

  // For own profile, use normal hooks
  const { data: sessions } = useSessionHistory();
  const { streak } = useStreakTracking();
  const { achievements } = useUserAchievements();
  const { privacySettings } = usePrivacySettings();

  // For viewing other profiles, use viewable profile hook
  const { profile: viewableProfile, loading: viewableLoading } = useViewableProfile(
    isOwnProfile ? null : targetUserId || null
  );

  useEffect(() => {
    if (isOwnProfile && user) {
      fetchUserData();
    } else if (!isOwnProfile && viewableProfile) {
      setUserData(viewableProfile);
      setLoading(false);
    }
  }, [user, isOwnProfile, viewableProfile]);

  const fetchUserData = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      setUserData(data);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = () => {
    if (userData?.username) {
      return userData.username.substring(0, 2).toUpperCase();
    }
    return user?.email?.substring(0, 2).toUpperCase() || 'U';
  };

  const getDisplayName = () => {
    if (userData?.first_name && userData?.username) {
      return `${userData.first_name} (@${userData.username})`;
    }
    if (userData?.username) {
      return `@${userData.username}`;
    }
    return user?.email || 'User';
  };

  const totalWorkouts = sessions?.length || 0;
  const totalTime = sessions?.reduce((acc, session) => {
    const duration = session.duration_seconds || 0;
    return acc + duration;
  }, 0) || 0;
  const totalMinutes = Math.round(totalTime / 60);

  const stats = [
    { icon: Trophy, label: 'Workouts', value: totalWorkouts, color: 'text-primary' },
    { icon: Clock, label: 'Total Time', value: `${totalMinutes}m`, color: 'text-blue-600' },
    { icon: Flame, label: 'Streak', value: `${streak?.current_streak || 0} days`, color: 'text-orange-600' },
    { icon: Trophy, label: 'Achievements', value: achievements?.length || 0, color: 'text-purple-600' },
  ];

  if (loading || (!isOwnProfile && viewableLoading)) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FFF9F5] to-[#FFFCFA] flex items-center justify-center pb-32">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // If viewing someone else's profile and don't have access
  if (!isOwnProfile && viewableProfile && !viewableProfile.canView) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FFF9F5] to-[#FFFCFA]">
        <div className="max-w-2xl mx-auto p-6 space-y-6 pb-32">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4"
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Profile</h1>
            </div>
          </motion.div>
          <PrivateProfilePlaceholder />
        </div>
      </div>
    );
  }

  // Apply visibility filters for viewing other profiles
  const visibleFields = viewableProfile?.visibleFields || {
    achievements: true,
    statistics: true,
    streak: true,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF9F5] to-[#FFFCFA]">
      <div className="max-w-2xl mx-auto p-6 space-y-6 pb-32">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => isOwnProfile ? navigate('/settings') : navigate(-1)}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Profile</h1>
            <p className="text-muted-foreground">View and edit your profile</p>
          </div>
        </motion.div>

        {/* Profile Header - Use ProfileHeader component */}
        {isOwnProfile ? (
          <ProfileHeader />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
              <CardContent className="pt-8 pb-6">
                <div className="flex flex-col items-center text-center space-y-3">
                  <Avatar className="w-36 h-36 border-4 border-background shadow-lg">
                    <AvatarImage src={userData?.avatar_url} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="space-y-1">
                    <h2 className="text-2xl font-bold text-foreground">{getDisplayName()}</h2>
                    {userData?.first_name && (
                      <p className="text-sm text-muted-foreground">{userData.first_name}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Statistics Grid - Apply visibility filters */}
        {visibleFields.statistics && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {stats
                    .filter(stat => {
                      // Filter based on visibility settings
                      if (stat.label === 'Streak' && !visibleFields.streak) return false;
                      if (stat.label === 'Achievements' && !visibleFields.achievements) return false;
                      return true;
                    })
                    .map((stat, index) => {
                      const Icon = stat.icon;
                      return (
                        <div key={index} className="flex flex-col items-center p-4 bg-secondary/50 rounded-lg">
                          <Icon className={`w-6 h-6 mb-2 ${stat.color}`} />
                          <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                          <p className="text-sm text-muted-foreground">{stat.label}</p>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Member Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Calendar className="w-5 h-5" />
                <div>
                  <p className="text-sm">Member since</p>
                  <p className="font-medium text-foreground">
                    {userData?.created_at 
                      ? new Date(userData.created_at).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long' 
                        })
                      : 'Unknown'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Dialogs - Only show for own profile */}
      {isOwnProfile && (
        <>
          <EditProfileDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            userData={userData}
            onUpdate={fetchUserData}
          />
          <ChangePasswordDialog
            open={passwordDialogOpen}
            onOpenChange={setPasswordDialogOpen}
          />
        </>
      )}
    </div>
  );
};

export default Profile;
