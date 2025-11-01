import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface PrivacySettings {
  id: string;
  user_id: string;
  profile_visibility: 'public' | 'friends_only' | 'private';
  activity_visibility: 'public' | 'friends_only' | 'private';
  friend_request_privacy: 'everyone' | 'friends_of_friends' | 'no_one';
  show_achievements: boolean;
  show_statistics: boolean;
  show_streak: boolean;
  allow_friend_suggestions: boolean;
  allow_tagging: boolean;
  data_collection_analytics: boolean;
  data_collection_personalization: boolean;
  marketing_emails: boolean;
  product_updates: boolean;
  privacy_consent_given: boolean;
  privacy_consent_date: string | null;
  created_at: string;
  updated_at: string;
}

export const usePrivacySettings = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: privacySettings, isLoading, error } = useQuery({
    queryKey: ['privacy-settings', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('privacy_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return data as PrivacySettings;
    },
    enabled: !!user?.id,
    staleTime: 30 * 1000, // 30 seconds
  });

  const updateSettingMutation = useMutation({
    mutationFn: async (updates: Partial<Omit<PrivacySettings, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('privacy_settings')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['privacy-settings', user?.id], data);
      toast.success('Privacy settings updated');
    },
    onError: (error) => {
      console.error('Error updating privacy settings:', error);
      toast.error('Failed to update privacy settings');
    },
  });

  const giveConsentMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('privacy_settings')
        .update({
          privacy_consent_given: true,
          privacy_consent_date: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['privacy-settings', user?.id], data);
      toast.success('Privacy consent recorded');
    },
    onError: (error) => {
      console.error('Error recording privacy consent:', error);
      toast.error('Failed to record privacy consent');
    },
  });

  return {
    privacySettings,
    isLoading,
    error,
    updateSetting: updateSettingMutation.mutate,
    giveConsent: giveConsentMutation.mutate,
    isUpdating: updateSettingMutation.isPending || giveConsentMutation.isPending,
  };
};
