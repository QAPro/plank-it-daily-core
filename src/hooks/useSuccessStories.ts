import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface SuccessStory {
  id: string;
  user_id: string;
  story_title: string;
  story_content: string;
  story_type: 'transformation' | 'breakthrough' | 'milestone' | 'inspiration' | 'tip';
  transformation_data: any;
  is_featured: boolean;
  is_public: boolean;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  created_at: string;
  updated_at: string;
  author?: {
    id: string;
    username?: string;
    full_name?: string;
  };
  user_reaction?: {
    reaction_type: string;
  };
}

export interface StoryReaction {
  id: string;
  story_id: string;
  user_id: string;
  reaction_type: 'inspiration' | 'motivation' | 'amazing' | 'goals' | 'strength';
  created_at: string;
}

export interface StoryComment {
  id: string;
  story_id: string;
  user_id: string;
  comment_text: string;
  is_encouragement: boolean;
  created_at: string;
  author?: {
    username?: string;
    full_name?: string;
  };
}

export const useSuccessStories = () => {
  const [stories, setStories] = useState<SuccessStory[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchSuccessStories = async (includeOwn = false) => {
    if (!user) return;
    
    setLoading(true);
    try {
      let query = supabase
        .from('user_success_stories')
        .select(`
          *,
          author:users!user_success_stories_user_id_fkey(id, username, full_name),
          user_reaction:success_story_reactions(reaction_type)
        `)
        .order('created_at', { ascending: false });

      if (includeOwn) {
        query = query.or(`is_public.eq.true,user_id.eq.${user.id}`);
      } else {
        query = query.eq('is_public', true);
      }

      const { data, error } = await query;

      if (error) throw error;
      setStories((data as any) || []);
    } catch (error) {
      console.error('Error fetching success stories:', error);
      toast({
        title: 'Success Stories Loading...',
        description: "Having trouble accessing the Success Circle. Let's try again!",
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createSuccessStory = async (storyData: Partial<SuccessStory>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('user_success_stories')
        .insert([{
          story_title: storyData.story_title || '',
          story_content: storyData.story_content || '',
          story_type: storyData.story_type || 'transformation',
          user_id: user.id,
          transformation_data: storyData.transformation_data || {},
          is_featured: storyData.is_featured || false,
          is_public: storyData.is_public !== undefined ? storyData.is_public : true,
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: '🌟 Success Story Shared!',
        description: 'Your inspiring story is now part of our Success Circle!',
      });

      await fetchSuccessStories(true);
      return data;
    } catch (error) {
      console.error('Error creating success story:', error);
      toast({
        title: 'Story Almost Shared!',
        description: "Let's try sharing your inspiring success story again!",
        variant: 'destructive',
      });
      return null;
    }
  };

  const reactToStory = async (storyId: string, reactionType: StoryReaction['reaction_type']) => {
    if (!user) return;

    try {
      // Check if user already reacted
      const { data: existingReaction } = await supabase
        .from('success_story_reactions')
        .select('id, reaction_type')
        .eq('story_id', storyId)
        .eq('user_id', user.id)
        .single();

      if (existingReaction) {
        if (existingReaction.reaction_type === reactionType) {
          // Remove reaction if same type
          await supabase
            .from('success_story_reactions')
            .delete()
            .eq('id', existingReaction.id);
        } else {
          // Update reaction type
          await supabase
            .from('success_story_reactions')
            .update({ reaction_type: reactionType })
            .eq('id', existingReaction.id);
        }
      } else {
        // Create new reaction
        await supabase
          .from('success_story_reactions')
          .insert([{
            story_id: storyId,
            user_id: user.id,
            reaction_type: reactionType,
          }]);
      }

      toast({
        title: '💝 Reaction Shared!',
        description: 'Your support means everything to our Success Circle!',
      });

      await fetchSuccessStories(true);
    } catch (error) {
      console.error('Error reacting to story:', error);
      toast({
        title: 'Reaction Almost Sent!',
        description: "Let's try sharing that encouragement again!",
        variant: 'destructive',
      });
    }
  };

  const addComment = async (storyId: string, commentText: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('success_story_comments')
        .insert([{
          story_id: storyId,
          user_id: user.id,
          comment_text: commentText,
          is_encouragement: true,
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: '💬 Encouragement Added!',
        description: 'Your supportive words will inspire and motivate!',
      });

      return data;
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: 'Comment Almost Added!',
        description: "Let's try sharing that encouragement again!",
        variant: 'destructive',
      });
      return null;
    }
  };

  const getStoryComments = async (storyId: string) => {
    try {
      const { data, error } = await supabase
        .from('success_story_comments')
        .select(`
          *,
          author:users!success_story_comments_user_id_fkey(username, full_name)
        `)
        .eq('story_id', storyId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching comments:', error);
      return [];
    }
  };

  useEffect(() => {
    fetchSuccessStories(true);
  }, [user]);

  return {
    stories,
    loading,
    createSuccessStory,
    reactToStory,
    addComment,
    getStoryComments,
    refetch: () => fetchSuccessStories(true),
  };
};