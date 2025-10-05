import { supabase } from '@/integrations/supabase/client';

export interface ResolverResult {
  email: string | null;
  error?: string;
}

/**
 * Resolves a username or email to an email address for authentication
 * Uses secure database function that prevents username enumeration
 */
export const resolveUsernameToEmail = async (identifier: string): Promise<ResolverResult> => {
  if (!identifier || identifier.trim() === '') {
    return { email: null, error: 'Invalid credentials' };
  }

  try {
    // Use the secure resolve_login_identifier function
    // This function returns the email directly or null if not found
    const { data, error } = await supabase
      .rpc('resolve_login_identifier', { identifier: identifier.trim() });
    
    if (error) {
      console.error('Error resolving login identifier:', error);
      return { email: null, error: 'Failed to verify credentials' };
    }
    
    // If data is null, user doesn't exist (but we don't reveal this)
    if (!data) {
      return { email: null, error: 'Invalid credentials' };
    }
    
    // Return the resolved email
    return { email: data };
  } catch (err) {
    console.error('Exception resolving identifier:', err);
    return { email: null, error: 'Failed to verify credentials' };
  }
};
