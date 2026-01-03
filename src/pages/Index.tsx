
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useOnboarding } from "@/hooks/useOnboarding";
import WelcomeScreen from "@/components/WelcomeScreen";
import Dashboard from "@/components/Dashboard";

import { LevelProgressionProvider } from "@/components/level/LevelProgressionProvider";
import { AnimatePresence } from "framer-motion";

const Index = () => {
  const [showWelcome, setShowWelcome] = useState(true);
  const [initialWorkout, setInitialWorkout] = useState<{exerciseId: string, duration: number} | null>(null);
  const { user, loading: authLoading, error: authError } = useAuth();
  const { isOnboardingComplete, loading: onboardingLoading, markOnboardingComplete } = useOnboarding();
  const navigate = useNavigate();

  console.log('Index: Current state', { 
    user: user?.email, 
    authLoading, 
    onboardingLoading, 
    isOnboardingComplete,
    showWelcome,
    authError
  });

  useEffect(() => {
    console.log('Index: Auth state change detected', { user: user?.email, authLoading, onboardingLoading });
    
    // Only redirect if we're certain user is not logged in (both loading states complete)
    if (!authLoading && !onboardingLoading && !user && !authError) {
      console.log('Index: No authenticated user, redirecting to /auth');
      navigate('/auth');
      return;
    }

    // Only make decisions when both auth and onboarding are done loading
    if (!authLoading && !onboardingLoading && user && isOnboardingComplete !== null) {
      // If onboarding is complete, hide welcome screen
      if (isOnboardingComplete === true) {
        console.log('Index: Hiding welcome screen - onboarding complete');
        setShowWelcome(false);
      }
    }
  }, [user, authLoading, isOnboardingComplete, onboardingLoading, authError, navigate]);

  const handleWorkoutSelected = async (exerciseId: string, exerciseName: string) => {
    console.log('Index: Workout selected:', exerciseName);
    
    try {
      // Mark onboarding complete with default values
      await markOnboardingComplete();
      
      // Navigate to Dashboard with selected exercise
      setInitialWorkout({ exerciseId, duration: 30 });
      setShowWelcome(false);
    } catch (error) {
      console.error('Index: Failed to save onboarding completion:', error);
      // Show error to user but still let them proceed
      alert('There was an issue saving your progress. Please try again or contact support if this persists.');
    }
  };

  const handleSkip = async () => {
    console.log('Index: User chose to explore on their own');
    
    try {
      // Mark onboarding complete
      await markOnboardingComplete();
      
      // Let HomeTab use its default (Forearm Plank)
      setShowWelcome(false);
    } catch (error) {
      console.error('Index: Failed to save onboarding completion:', error);
      // Show error to user but still let them proceed
      alert('There was an issue saving your progress. Please try again or contact support if this persists.');
    }
  };

  // Show loading while checking auth state or onboarding status
  // IMPORTANT: Wait for BOTH to complete to prevent flickering/wrong routing
  if (authLoading || onboardingLoading) {
    console.log('Index: Showing loading state');
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FFF9F5] to-[#FFFCFA] flex items-center justify-center pb-24">
        <div className="text-coral text-lg">Loading...</div>
      </div>
    );
  }

  // Show auth error if there is one
  if (authError) {
    console.log('Index: Showing auth error', authError);
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FFF9F5] to-[#FFFCFA] flex items-center justify-center pb-24">
        <div className="text-red-600 text-lg">Authentication Error: {authError}</div>
      </div>
    );
  }

  // If no user, navigation to /auth will happen in useEffect
  if (!user) {
    console.log('Index: No user found, should redirect');
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FFF9F5] to-[#FFFCFA] flex items-center justify-center pb-24">
        <div className="text-coral text-lg">Redirecting to login...</div>
      </div>
    );
  }

  console.log('Index: Rendering main content', { showWelcome });

  return (
    <LevelProgressionProvider>
      <div className="min-h-screen bg-gradient-to-b from-[#FFF9F5] to-[#FFFCFA]">
          <AnimatePresence mode="wait">
            {showWelcome ? (
              <WelcomeScreen 
                key="welcome" 
                user={user}
                onWorkoutSelected={handleWorkoutSelected}
                onSkip={handleSkip}
              />
            ) : (
              <Dashboard key="dashboard" initialWorkout={initialWorkout} />
            )}
          </AnimatePresence>
      </div>
    </LevelProgressionProvider>
  );
};

export default Index;
