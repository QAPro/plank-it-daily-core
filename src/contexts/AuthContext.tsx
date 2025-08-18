
import { createContext, useContext, useEffect, useState } from 'react';
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
        console.log('Auth state changed:', event, session?.user?.email);
        
        // Update session and user state
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Handle different auth events
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('User signed in successfully');
          // Clean up pending verification email on successful login
          localStorage.removeItem('pendingVerificationEmail');
          
          // Defer subscription refresh to prevent deadlocks
          setTimeout(() => {
            refreshSubscriptionStatus(session.user);
          }, 100);
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out');
          // Ensure clean state on sign out
          cleanupAuthState();
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          console.log('Token refreshed successfully');
          // Refresh subscription status on token refresh
          setTimeout(() => {
            refreshSubscriptionStatus(session.user);
          }, 100);
        }
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
