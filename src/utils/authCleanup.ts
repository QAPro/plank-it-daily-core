
import { supabase } from '@/integrations/supabase/client';
import { resolveUsernameToEmail } from './usernameResolver';

export const cleanupAuthState = () => {
  console.log('Cleaning up authentication state...');
  
  // Remove standard auth tokens
  localStorage.removeItem('supabase.auth.token');
  
  // Remove all Supabase auth keys from localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      console.log('Removing auth key:', key);
      localStorage.removeItem(key);
    }
  });
  
  // Remove from sessionStorage if in use
  if (typeof sessionStorage !== 'undefined') {
    Object.keys(sessionStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        console.log('Removing session auth key:', key);
        sessionStorage.removeItem(key);
      }
    });
  }
};

export const handleAuthSignOut = async () => {
  try {
    console.log('Starting sign out process...');
    
    // Clean up auth state first
    cleanupAuthState();
    
    // Attempt global sign out (fallback if it fails)
    try {
      await supabase.auth.signOut({ scope: 'global' });
      console.log('Global sign out successful');
    } catch (err) {
      console.log('Global sign out failed, continuing:', err);
    }
    
    // Force page reload for a clean state
    window.location.href = '/auth';
  } catch (error) {
    console.error('Sign out error:', error);
    // Even if there's an error, redirect to auth page
    window.location.href = '/auth';
  }
};

/**
 * Handles user sign-in with email/username and password
 * Supports both email and username as the identifier
 */
export const handleAuthSignIn = async (credentials: { email: string; password: string }) => {
  try {
    console.log('Starting sign in process...');
    
    // Clean up existing state first
    cleanupAuthState();
    
    // Attempt global sign out to clear any existing session
    try {
      await supabase.auth.signOut({ scope: 'global' });
    } catch (err) {
      console.log('Pre-signin cleanup failed, continuing:', err);
    }
    
    // Resolve username to email if needed
    const { email, error: resolveError } = await resolveUsernameToEmail(credentials.email);
    
    if (resolveError || !email) {
      console.error('Failed to resolve identifier:', resolveError);
      return { 
        data: null, 
        error: { message: 'Invalid credentials' }
      };
    }
    
    // Sign in with the resolved email and password
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: credentials.password,
    });
    
    if (error) {
      throw error;
    }
    
    if (data.user) {
      console.log('Sign in successful, redirecting...');
      // Force page reload for clean state
      window.location.href = '/';
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Sign in error:', error);
    return { data: null, error };
  }
};
