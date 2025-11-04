
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Edit, Mail, Calendar, Check, X, Star } from "lucide-react";
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
  const [pendingEmailChange, setPendingEmailChange] = useState<string | null>(null);
  const [editData, setEditData] = useState({
    username: '',
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
    if (user?.email) {
      return user.email;
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
      
      <Card className="bg-gradient-to-br from-orange-500 to-amber-500 text-white border-0">
        <CardContent className="p-6">
          {/* Privacy Badge */}
          {privacySettings && (
            <div className="mb-4">
              <PrivacyBadge 
                visibility={privacySettings.profile_visibility} 
                size="md"
              />
            </div>
          )}
          
          <div className="flex items-start space-x-4 relative">
            {!isEditing && (
              <Avatar className="w-16 h-16 border-2 border-white/20">
                <AvatarImage src={userProfile?.avatar_url} />
                <AvatarFallback className="bg-white/20 text-white text-lg font-bold">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
            )}
            
            <div className="flex-1 min-w-0">
              {isEditing ? (
                <div className="space-y-3">
                  <UsernameInput
                    value={editData.username}
                    onChange={(value) => setEditData(prev => ({ ...prev, username: value }))}
                    currentUsername={userProfile?.username}
                    className="bg-white/20 text-white placeholder:text-orange-100"
                  />
                  <div className="space-y-2">
                    <div className="text-sm text-orange-100/90">Choose an avatar</div>
                    <CarouselAvatarSelector
                      selectedUrl={editData.avatar_url}
                      onSelect={(url) => setEditData(prev => ({ ...prev, avatar_url: url }))}
                      className="mt-1"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <h3 className="text-xl font-bold mb-1">{getDisplayName()}</h3>
                  <p className="text-orange-100 mb-2">{getSubtitle()}</p>
                  <div className="flex items-center gap-2 mb-3">
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
                </>
              )}
              
              {!isEditing && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-orange-100 text-sm sm:text-base">
                  <div className="flex items-center gap-1 w-full sm:w-auto">
                    <Mail className="w-3 h-3 shrink-0" />
                    <span className="break-all">{user?.email}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEmailChangeDialogOpen(true)}
                      className="h-6 px-2 ml-1 text-orange-100 hover:bg-white/20 hover:text-white shrink-0"
                    >
                      Change
                    </Button>
                  </div>
                  <div className="flex items-center gap-1 w-full sm:w-auto">
                    <Calendar className="w-3 h-3 shrink-0" />
                    <span>Member since {getMemberSinceDate()}</span>
                  </div>
                </div>
              )}
            </div>
            
            {!isEditing && (
              <div className="absolute top-0 right-0">
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
          </div>
          
          {isEditing && (
            <div className="flex items-center justify-end gap-2 mt-3">
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
          )}
        </CardContent>
      </Card>

      <EmailChangeDialog
        open={emailChangeDialogOpen}
        onOpenChange={setEmailChangeDialogOpen}
        currentEmail={user?.email || ''}
      />
    </motion.div>
  );
};

export default ProfileHeader;
