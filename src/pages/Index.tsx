
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useOnboarding } from "@/hooks/useOnboarding";
import WelcomeScreen from "@/components/WelcomeScreen";
import Dashboard from "@/components/Dashboard";
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";
import { StreakProvider } from "@/components/StreakProvider";
import { motion, AnimatePresence } from "framer-motion";
import DevTools from '@/components/DevTools';
import { AuthProvider } from "@/contexts/AuthContext";

const Index = () => {
  const [showWelcome, setShowWelcome] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const { isOnboardingComplete, loading: onboardingLoading, markOnboardingComplete } = useOnboarding();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      // If user is not authenticated, redirect to auth page
      navigate('/auth');
      return;
    }

    if (user && isOnboardingComplete !== null) {
      // Check for existing session (will be replaced with onboarding check)
      const hasSeenWelcome = localStorage.getItem('plankcoach-welcome-seen');
      if (hasSeenWelcome || isOnboardingComplete) {
        setShowWelcome(false);
      }
    }
  }, [user, authLoading, isOnboardingComplete, navigate]);

  const handleGetStarted = () => {
    localStorage.setItem('plankcoach-welcome-seen', 'true');
    setShowWelcome(false);
  };

  const handleOnboardingComplete = () => {
    markOnboardingComplete();
    setShowWelcome(false);
  };

  // Show loading while checking auth state or onboarding status
  if (authLoading || onboardingLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center">
        <div className="text-orange-600 text-lg">Loading...</div>
      </div>
    );
  }

  // If no user, navigation to /auth will happen in useEffect
  if (!user) {
    return null;
  }

  // Show onboarding flow if user hasn't completed it yet
  if (isOnboardingComplete === false && !showWelcome) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  return (
    <AuthProvider>
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
      </StreakProvider>
      <DevTools />
    </AuthProvider>
  );
};

export default Index;
