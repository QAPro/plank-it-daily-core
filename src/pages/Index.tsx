
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useOnboarding } from "@/hooks/useOnboarding";
import WelcomeScreen from "@/components/WelcomeScreen";
import Dashboard from "@/components/Dashboard";
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";
import { StreakProvider } from "@/components/StreakProvider";
import { LevelProgressionProvider } from "@/components/level/LevelProgressionProvider";
import { motion, AnimatePresence } from "framer-motion";
// import DevTools from '@/components/DevTools';

const Index = () => {
  const [showWelcome, setShowWelcome] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const { isOnboardingComplete, loading: onboardingLoading, markOnboardingComplete } = useOnboarding();
  const navigate = useNavigate();

  console.log('Index: Current state', { 
    user: user?.email, 
    authLoading, 
    onboardingLoading, 
    isOnboardingComplete,
    showWelcome 
  });

  useEffect(() => {
    console.log('Index: Auth state change detected', { user: user?.email, authLoading });
    
    if (!authLoading && !user) {
      console.log('Index: No authenticated user, redirecting to /auth');
      navigate('/auth');
      return;
    }

    if (user && !onboardingLoading && isOnboardingComplete !== null) {
      console.log('Index: User authenticated, checking welcome/onboarding state');
      const hasSeenWelcome = localStorage.getItem('plankcoach-welcome-seen');
      if (hasSeenWelcome || isOnboardingComplete) {
        console.log('Index: Hiding welcome screen');
        setShowWelcome(false);
      }
    }
  }, [user, authLoading, isOnboardingComplete, onboardingLoading, navigate]);

  const handleGetStarted = () => {
    console.log('Index: Get started clicked');
    localStorage.setItem('plankcoach-welcome-seen', 'true');
    setShowWelcome(false);
  };

  const handleOnboardingComplete = () => {
    console.log('Index: Onboarding completed');
    markOnboardingComplete();
    setShowWelcome(false);
  };

  // Show loading while checking auth state or onboarding status
  if (authLoading || onboardingLoading) {
    console.log('Index: Showing loading state');
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center">
        <div className="text-orange-600 text-lg">Loading...</div>
      </div>
    );
  }

  // If no user, navigation to /auth will happen in useEffect
  if (!user) {
    console.log('Index: No user found, should redirect');
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center">
        <div className="text-orange-600 text-lg">Redirecting to login...</div>
      </div>
    );
  }

  // Show onboarding flow if user hasn't completed it yet
  if (isOnboardingComplete === false && !showWelcome) {
    console.log('Index: Showing onboarding flow');
    return (
      <LevelProgressionProvider>
        <OnboardingFlow onComplete={handleOnboardingComplete} />
      </LevelProgressionProvider>
    );
  }

  console.log('Index: Rendering main content', { showWelcome });

  return (
    <LevelProgressionProvider>
      <StreakProvider>
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
          <AnimatePresence mode="wait">
            {showWelcome ? (
              <WelcomeScreen key="welcome" onGetStarted={handleGetStarted} />
            ) : (
              <Dashboard key="dashboard" />
            )}
          </AnimatePresence>
        </div>
        {/* <DevTools /> */}
      </StreakProvider>
    </LevelProgressionProvider>
  );
};

export default Index;
