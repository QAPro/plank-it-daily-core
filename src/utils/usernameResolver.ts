import { supabase } from '@/integrations/supabase/client';

export interface ResolverResult {
  email: string | null;
  error?: string;
}

/**
 * Resolves a username or email to an email address for authentication
 * If the identifier is already an email, returns it directly
 * If it's a username, looks it up in the database to get the associated email
 */
export const resolveUsernameToEmail = async (identifier: string): Promise<ResolverResult> => {
  // Check if identifier looks like an email (contains @)
  const isEmail = identifier.includes('@');
  
  if (isEmail) {
    return { email: identifier };
  }
  
  // It's a username, resolve to email using secure database function
  try {
    const { data, error } = await supabase
      .rpc('find_user_by_username_or_email', { identifier })
      .maybeSingle();
    
    if (error) {
      console.error('Error resolving username:', error);
      return { email: null, error: 'Failed to verify credentials' };
    }
    
    if (!data) {
      return { email: null, error: 'Invalid credentials' };
    }
    
    // The function returns user data including email
    return { email: data.email };
  } catch (err) {
    console.error('Exception resolving username:', err);
    return { email: null, error: 'Failed to verify credentials' };
  }
};
