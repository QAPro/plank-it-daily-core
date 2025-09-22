
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { cleanupAuthState } from '@/utils/authCleanup';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helper function to refresh subscription status
const refreshSubscriptionStatus = async (user: User) => {
  try {
    console.log('Refreshing subscription status for user:', user.email);
    await supabase.functions.invoke('check-subscription');
    console.log('Subscription status refreshed successfully');
  } catch (error) {
    console.log('Subscription refresh failed (non-critical):', error);
    // Don't throw - this is a background operation that shouldn't break auth flow
  }
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('AuthProvider: Initializing auth state listener');
    
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, { 
          email: session?.user?.email,
          emailConfirmed: session?.user?.email_confirmed_at,
          url: window.location.href 
        });
        
        // Check if we're on the email verification page
        const isVerificationPage = window.location.pathname.includes('/email-verify');
        
        // Update session and user state - but be careful about verification scenarios
        if (event === 'SIGNED_IN' && session?.user) {
          // If we're on the verification page and the user's email isn't confirmed,
          // don't automatically set them as signed in - let the verification handler manage this
          if (isVerificationPage && !session.user.email_confirmed_at) {
            console.log('Delaying sign-in state update - awaiting email verification completion');
            setLoading(false);
            return;
          }
          
          console.log('User signed in successfully');
          setSession(session);
          setUser(session.user);
          
          // Clean up pending verification email on successful login
          localStorage.removeItem('pendingVerificationEmail');
          
          // Defer subscription refresh to prevent deadlocks
          setTimeout(() => {
            refreshSubscriptionStatus(session.user);
          }, 100);
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out');
          setSession(null);
          setUser(null);
          // Ensure clean state on sign out
          cleanupAuthState();
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          console.log('Token refreshed successfully');
          setSession(session);
          setUser(session.user);
          // Refresh subscription status on token refresh
          setTimeout(() => {
            refreshSubscriptionStatus(session.user);
          }, 100);
        } else if (event === 'USER_UPDATED' && session?.user) {
          console.log('User updated:', session.user.email);
          setSession(session);
          setUser(session.user);
          
          // Check if this is an email change completion
          const pendingEmailChange = localStorage.getItem('pendingEmailChange');
          if (pendingEmailChange && session.user.email === pendingEmailChange) {
            console.log('Email change completed, clearing pending change');
            localStorage.removeItem('pendingEmailChange');
            
            // Update the users table with the new email
            setTimeout(() => {
              supabase
                .from('users')
                .update({ 
                  email: session.user.email,
                  updated_at: new Date().toISOString()
                })
                .eq('id', session.user.id)
                .then(({ error }) => {
                  if (error) {
                    console.error('Error updating user email in database:', error);
                  } else {
                    console.log('User email updated in database');
                  }
                });
            }, 100);
          }
        } else {
          // For other events, just update the basic state
          setSession(session);
          setUser(session?.user ?? null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session after setting up the listener
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Initial session check:', session?.user?.email || 'No session');
        
        // Only update state if we haven't already received it from the listener
        if (session) {
          setSession(session);
          setUser(session.user);
          // Refresh subscription status for existing session
          setTimeout(() => {
            refreshSubscriptionStatus(session.user);
          }, 100);
        }
        setLoading(false);
      } catch (error) {
        console.error('Session check error:', error);
        setLoading(false);
      }
    };

    checkSession();

    // Cleanup subscription on unmount
    return () => {
      console.log('AuthProvider: Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
