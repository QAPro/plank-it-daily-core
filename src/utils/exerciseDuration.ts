import { supabase } from '@/integrations/supabase/client';

/**
 * Get the last completed duration for a specific exercise by a user.
 * Returns the duration in seconds from the most recent session, or 30 if no sessions found.
 * 
 * @param userId - The user's ID
 * @param exerciseId - The exercise ID
 * @returns Promise<number> - Duration in seconds (default: 30)
 */
export const getLastCompletedDuration = async (
  userId: string,
  exerciseId: string
): Promise<number> => {
  try {
    const { data, error } = await supabase
      .from('user_sessions')
      .select('duration_seconds')
      .eq('user_id', userId)
      .eq('exercise_id', exerciseId)
      .order('completed_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching last completed duration:', error);
      return 30; // Default fallback
    }

    // Return the duration from last session, or 30 if no sessions found
    return data?.duration_seconds || 30;
  } catch (error) {
    console.error('Error in getLastCompletedDuration:', error);
    return 30; // Default fallback
  }
};
