
import { motion } from "framer-motion";
import { User, Edit, Mail, Calendar, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import AvatarSelector from "./AvatarSelector";
import UsernameInput from "./UsernameInput";
import EmailChangeDialog from "./EmailChangeDialog";
import PendingEmailChangeBanner from "./PendingEmailChangeBanner";
import { validateUsernameFormat } from "@/utils/usernameValidation";

const ProfileHeader = () => {
  const { user, session } = useAuth();
  const { toast } = useToast();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [emailChangeDialogOpen, setEmailChangeDialogOpen] = useState(false);
  const [pendingEmailChange, setPendingEmailChange] = useState<string | null>(null);
  const [editData, setEditData] = useState({
    full_name: '',
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
          full_name: data.full_name || '',
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
    toast({
      title: "Edit mode activated",
      description: "You can now edit your profile information.",
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({
      full_name: userProfile?.full_name || '',
      username: userProfile?.username || '',
      avatar_url: userProfile?.avatar_url || '',
    });
    toast({
      title: "Changes cancelled",
      description: "Your profile changes have been discarded.",
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
          full_name: editData.full_name.trim() || null,
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
        full_name: editData.full_name.trim() || null,
        username: editData.username.trim() || null,
        avatar_url: editData.avatar_url || null,
      }));

      setIsEditing(false);
      toast({
        title: "Profile updated successfully",
        description: "Your profile information has been saved.",
      });
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
    if (userProfile?.full_name) {
      return userProfile.full_name;
    }
    if (userProfile?.username) {
      return `@${userProfile.username}`;
    }
    return user?.email || 'User';
  };

  const getSubtitle = () => {
    if (userProfile?.username && userProfile?.full_name) {
      return `@${userProfile.username}`;
    }
    if (user?.email) {
      return user.email;
    }
    return 'PlankIt Member';
  };

  const getInitials = () => {
    const name = getDisplayName();
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleClearPendingEmailChange = () => {
    setPendingEmailChange(null);
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
          <div className="flex items-center space-x-4">
            <Avatar className="w-16 h-16 border-2 border-white/20">
              <AvatarImage src={userProfile?.avatar_url} />
              <AvatarFallback className="bg-white/20 text-white text-lg font-bold">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Input
                      value={editData.full_name}
                      onChange={(e) => setEditData(prev => ({ ...prev, full_name: e.target.value }))}
                      placeholder="Enter your full name (e.g., John Smith)"
                      className="bg-white/20 text-white placeholder:text-orange-100 border-white/30 focus:border-white"
                    />
                    <p className="text-xs text-orange-100/80">
                      This is how your name appears on your profile and to other users
                    </p>
                  </div>
                  <UsernameInput
                    value={editData.username}
                    onChange={(value) => setEditData(prev => ({ ...prev, username: value }))}
                    currentUsername={userProfile?.username}
                    className="bg-white/20 text-white placeholder:text-orange-100"
                  />
                  <div className="space-y-2">
                    <div className="text-sm text-orange-100/90">Choose an avatar</div>
                    <AvatarSelector
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
                </>
              )}
              
              {!isEditing && (
                <div className="flex items-center space-x-4 text-orange-100 text-sm">
                  <div className="flex items-center space-x-1">
                    <Mail className="w-3 h-3" />
                    <span>{user?.email}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEmailChangeDialogOpen(true)}
                      className="h-6 px-2 ml-1 text-orange-100 hover:bg-white/20 hover:text-white"
                    >
                      Change
                    </Button>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>Member since 2024</span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {isEditing ? (
                <>
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
                </>
              ) : (
                <Button 
                  variant="secondary"
                  size="sm"
                  onClick={handleEdit}
                  className="bg-white/20 text-white hover:bg-white/30 border-0"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              )}
            </div>
          </div>
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
