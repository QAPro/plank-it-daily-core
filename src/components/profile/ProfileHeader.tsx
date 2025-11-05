
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Edit, Mail, Calendar, Check, X, Star, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import CarouselAvatarSelector from "./CarouselAvatarSelector";
import UsernameInput from "./UsernameInput";
import EmailChangeDialog from "./EmailChangeDialog";
import PendingEmailChangeBanner from "./PendingEmailChangeBanner";
import ChangePasswordDialog from "./ChangePasswordDialog";
import { validateUsernameFormat } from "@/utils/usernameValidation";
import ReputationBadge from "@/components/shared/ReputationBadge";
import { useReputation } from "@/hooks/useReputation";
import { format } from "date-fns";
import PrivacyBadge from "@/components/privacy/PrivacyBadge";
import { usePrivacySettings } from "@/hooks/usePrivacySettings";

const ProfileHeader = () => {
  const { user, session } = useAuth();
  const { toast } = useToast();
  const { getTotalKarma } = useReputation(user?.id);
  const { privacySettings } = usePrivacySettings();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [emailChangeDialogOpen, setEmailChangeDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [pendingEmailChange, setPendingEmailChange] = useState<string | null>(null);
  const [editData, setEditData] = useState({
    username: '',
    first_name: '',
    avatar_url: '' as string | null,
  });

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  useEffect(() => {
    // Check for pending email change
    const pendingEmail = localStorage.getItem('pendingEmailChange');
    setPendingEmailChange(pendingEmail);
  }, []);

  const fetchUserProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user profile:', error);
      } else if (data) {
        setUserProfile(data);
        setEditData({
          username: data.username || '',
          first_name: data.first_name || '',
          avatar_url: data.avatar_url || '',
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({
      username: userProfile?.username || '',
      first_name: userProfile?.first_name || '',
      avatar_url: userProfile?.avatar_url || '',
    });
  };

  const handleSave = async () => {
    if (!user) return;
    
    // Validate username format before saving
    if (editData.username.trim()) {
      const usernameValidation = validateUsernameFormat(editData.username.trim());
      if (!usernameValidation.isValid) {
        toast({
          title: "Invalid username",
          description: usernameValidation.error,
          variant: "destructive",
        });
        return;
      }
    }
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          username: editData.username.trim() || null,
          first_name: editData.first_name.trim() || null,
          avatar_url: editData.avatar_url || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        // Handle unique constraint violation
        if (error.code === '23505' && error.message.includes('username')) {
          toast({
            title: "Username not available",
            description: "This username is already taken. Please choose a different one.",
            variant: "destructive",
          });
          return;
        }
        throw error;
      }

      setUserProfile(prev => ({
        ...prev,
        username: editData.username.trim() || null,
        first_name: editData.first_name.trim() || null,
        avatar_url: editData.avatar_url || null,
      }));

      setIsEditing(false);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Failed to update profile",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getDisplayName = () => {
    if (userProfile?.username) {
      return `@${userProfile.username}`;
    }
    return user?.email || 'User';
  };

  const getSubtitle = () => {
    if (userProfile?.first_name) {
      return userProfile.first_name;
    }
    return 'Inner Fire Member';
  };

  const getInitials = () => {
    const name = getDisplayName();
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleClearPendingEmailChange = () => {
    setPendingEmailChange(null);
  };

  const getMemberSinceDate = () => {
    const createdAt = userProfile?.created_at || user?.created_at;
    if (createdAt) {
      return format(new Date(createdAt), 'yyyy');
    }
    return new Date().getFullYear().toString();
  };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.1, duration: 0.5 }}
      className="space-y-4"
    >
      {pendingEmailChange && (
        <PendingEmailChangeBanner
          pendingEmail={pendingEmailChange}
          onClear={handleClearPendingEmailChange}
        />
      )}
      
      <Card className="bg-gradient-to-br from-orange-500 to-amber-500 text-white border-0 relative">
        <CardContent className="p-6">
          {/* Privacy Badge - Top Left */}
          {privacySettings && (
            <div className="absolute top-4 left-4">
              <PrivacyBadge 
                visibility={privacySettings.profile_visibility} 
                size="md"
              />
            </div>
          )}

          {/* Edit Button - Top Right */}
          {!isEditing && (
            <div className="absolute top-4 right-4">
              <Button 
                variant="secondary"
                size="sm"
                onClick={handleEdit}
                className="bg-white/20 text-white hover:bg-white/30 border-0"
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
            </div>
          )}
          
          <div className="flex flex-col items-center pt-8">
            {!isEditing ? (
              <>
                {/* Avatar - Centered & Prominent */}
                <Avatar className="w-28 h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 border-4 border-white/20 mb-4">
                  <AvatarImage src={userProfile?.avatar_url} />
                  <AvatarFallback className="bg-white/20 text-white text-3xl font-bold">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>

                {/* Identity Section - Centered */}
                <div className="text-center mb-4">
                  <h3 className="text-2xl font-bold mb-1">{getDisplayName()}</h3>
                  <p className="text-orange-100 text-lg mb-3">{getSubtitle()}</p>
                  
                  {/* Badges - Centered */}
                  <div className="flex items-center justify-center gap-2">
                    <Badge variant="secondary" className="text-xs bg-white/20 text-white border-0">
                      <Star className="w-3 h-3 mr-1" />
                      Level {userProfile?.current_level || 1}
                    </Badge>
                    <ReputationBadge 
                      karmaScore={getTotalKarma()} 
                      size="sm" 
                      className="shrink-0"
                    />
                  </div>
                </div>

                {/* Info Section - Well-spaced rows */}
                <div className="w-full max-w-md space-y-3 mt-2">
                  {/* Email row */}
                  <div className="flex items-center justify-center gap-2 text-orange-100 text-sm">
                    <Mail className="w-4 h-4 shrink-0" />
                    <span className="break-all">{user?.email}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEmailChangeDialogOpen(true)}
                      className="h-7 px-2 text-orange-100 hover:bg-white/20 hover:text-white shrink-0"
                    >
                      Change Email
                    </Button>
                  </div>

                  {/* Member Since row */}
                  <div className="flex items-center justify-center gap-2 text-orange-100 text-sm">
                    <Calendar className="w-4 h-4 shrink-0" />
                    <span>Member since {getMemberSinceDate()}</span>
                  </div>

                  {/* Change Password row */}
                  <div className="flex items-center justify-center">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setPasswordDialogOpen(true)}
                      className="h-8 px-3 text-orange-100 hover:bg-white/20 hover:text-white"
                    >
                      <Lock className="w-4 h-4 mr-2" />
                      Change Password
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="w-full max-w-md space-y-3">
                <div className="space-y-2">
                  <div className="text-sm text-orange-100/90">First Name (Optional)</div>
                  <Input
                    value={editData.first_name}
                    onChange={(e) => setEditData(prev => ({ ...prev, first_name: e.target.value }))}
                    placeholder="Enter your first name"
                    className="bg-white/20 text-white placeholder:text-orange-100 border-white/30"
                  />
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-orange-100/90">Username</div>
                  <UsernameInput
                    value={editData.username}
                    onChange={(value) => setEditData(prev => ({ ...prev, username: value }))}
                    currentUsername={userProfile?.username}
                    className="bg-white/20 text-white placeholder:text-orange-100"
                  />
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-orange-100/90">Choose an avatar</div>
                  <CarouselAvatarSelector
                    selectedUrl={editData.avatar_url}
                    onSelect={(url) => setEditData(prev => ({ ...prev, avatar_url: url }))}
                    className="mt-1"
                  />
                </div>

                {/* Save/Cancel buttons */}
                <div className="flex items-center justify-end gap-2 mt-4">
                  <Button 
                    variant="secondary"
                    size="sm"
                    onClick={handleSave}
                    disabled={loading}
                    className="bg-white/20 text-white hover:bg-white/30 border-0"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    {loading ? 'Saving...' : 'Save'}
                  </Button>
                  <Button 
                    variant="secondary"
                    size="sm"
                    onClick={handleCancel}
                    disabled={loading}
                    className="bg-white/10 text-white hover:bg-white/20 border-0"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <EmailChangeDialog
        open={emailChangeDialogOpen}
        onOpenChange={setEmailChangeDialogOpen}
        currentEmail={user?.email || ''}
      />
      
      <ChangePasswordDialog
        open={passwordDialogOpen}
        onOpenChange={setPasswordDialogOpen}
      />
    </motion.div>
  );
};

export default ProfileHeader;
