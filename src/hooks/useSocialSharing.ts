import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { enhancedSocialSharingService } from '@/services/enhancedSocialSharingService';
import type { EnhancedShareData, ShareTemplate, ShareAnalytics } from '@/types/socialSharing';
import { useToast } from '@/hooks/use-toast';
import { isSocialEnabled } from '@/constants/featureGating';

export const useSocialSharing = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<ShareTemplate[]>([]);
  const [analytics, setAnalytics] = useState<ShareAnalytics[]>([]);
  const socialEnabled = isSocialEnabled();

  const loadTemplates = useCallback(async (type?: string) => {
    if (!socialEnabled) {
      setTemplates([]);
      return;
    }

    try {
      setLoading(true);
      const loadedTemplates = await enhancedSocialSharingService.getShareTemplates(type);
      setTemplates(loadedTemplates);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast({
        title: "Failed to load templates",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast, socialEnabled]);

  const generateShareImage = useCallback(async (
    shareData: EnhancedShareData, 
    templateId: string
  ): Promise<string | null> => {
    if (!socialEnabled) return null;

    try {
      setLoading(true);
      const imageDataUrl = await enhancedSocialSharingService.generateShareImage(
        shareData, 
        templateId
      );
      return imageDataUrl;
    } catch (error) {
      console.error('Error generating share image:', error);
      toast({
        title: "Failed to generate image",
        description: "Please try again with a different template.",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast, socialEnabled]);

  const shareToMultiplePlatforms = useCallback(async (
    shareData: EnhancedShareData,
    platforms: string[],
    imageDataUrl?: string
  ) => {
    if (!socialEnabled) return;

    const shareText = generateShareText(shareData);
    const sharePromises = platforms.map(platform => {
      switch (platform) {
        case 'twitter':
          return enhancedSocialSharingService.shareToTwitter(shareText, imageDataUrl);
        case 'facebook':
          return enhancedSocialSharingService.shareToFacebook(shareText, imageDataUrl);
        case 'linkedin':
          return enhancedSocialSharingService.shareToLinkedIn(shareText, imageDataUrl);
        case 'whatsapp':
          return enhancedSocialSharingService.shareToWhatsApp(shareText);
        case 'telegram':
          return enhancedSocialSharingService.shareToTelegram(shareText);
        default:
          return Promise.resolve();
      }
    });

    try {
      await Promise.all(sharePromises);
      toast({
        title: "Shared to multiple platforms!",
        description: `Successfully shared to ${platforms.length} platform(s).`,
      });
    } catch (error) {
      toast({
        title: "Some shares failed",
        description: "Please check your browser settings and try again.",
        variant: "destructive",
      });
    }
  }, [toast, socialEnabled]);

  const createChallenge = useCallback(async (challengeData: {
    title: string;
    description: string;
    challenge_type: string;
    target_data: any;
    start_date: string;
    end_date: string;
    template_id?: string;
  }) => {
    if (!user || !socialEnabled) {
      if (!socialEnabled) {
        toast({
          title: "Feature not available",
          description: "Social features are currently disabled.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Authentication required",
          description: "Please log in to create challenges.",
          variant: "destructive",
        });
      }
      return null;
    }

    try {
      setLoading(true);
      const challengeId = await enhancedSocialSharingService.createCommunityChallenge(challengeData);
      
      if (challengeId) {
        toast({
          title: "Challenge created!",
          description: "Your community challenge is now live.",
        });
      }
      
      return challengeId;
    } catch (error) {
      console.error('Error creating challenge:', error);
      toast({
        title: "Failed to create challenge",
        description: "Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, toast, socialEnabled]);

  const joinChallenge = useCallback(async (challengeId: string) => {
    if (!user || !socialEnabled) {
      if (!socialEnabled) {
        toast({
          title: "Feature not available",
          description: "Social features are currently disabled.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Authentication required",
          description: "Please log in to join challenges.",
          variant: "destructive",
        });
      }
      return false;
    }

    try {
      setLoading(true);
      const success = await enhancedSocialSharingService.joinChallenge(challengeId);
      
      if (success) {
        toast({
          title: "Joined challenge!",
          description: "You're now part of this community challenge.",
        });
      }
      
      return success;
    } catch (error) {
      console.error('Error joining challenge:', error);
      toast({
        title: "Failed to join challenge",
        description: "Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, toast, socialEnabled]);

  const loadAnalytics = useCallback(async () => {
    if (!user || !socialEnabled) return;

    try {
      const analyticsData = await enhancedSocialSharingService.getShareAnalytics(user.id);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  }, [user, socialEnabled]);

  const generateShareText = (shareData: EnhancedShareData): string => {
    if (shareData.achievement) {
      return `🏆 Just unlocked "${shareData.achievement}" on PlankIt! ${shareData.achievement_description || ''} #PlankIt #Achievement #Fitness`;
    }
    
    if (shareData.streakDays) {
      return `🔥 ${shareData.streakDays}-day workout streak on PlankIt! Consistency is key! 💪 #PlankIt #Streak #Fitness`;
    }
    
    if (shareData.exercise && shareData.duration) {
      const minutes = Math.floor(shareData.duration / 60);
      const seconds = shareData.duration % 60;
      const timeStr = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
      const pbText = shareData.personalBest ? " 🏆 New personal best!" : "";
      
      return `💪 Just completed a ${timeStr} ${shareData.exercise} on PlankIt!${pbText} #PlankIt #Fitness #CoreStrength`;
    }
    
    return "Check out my fitness progress on PlankIt! 💪 #PlankIt #Fitness";
  };

  return {
    loading,
    templates,
    analytics,
    loadTemplates,
    generateShareImage,
    shareToMultiplePlatforms,
    createChallenge,
    joinChallenge,
    loadAnalytics,
    generateShareText,
  };
};
