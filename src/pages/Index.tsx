
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import WelcomeScreen from "@/components/WelcomeScreen";
import Dashboard from "@/components/Dashboard";
import { StreakProvider } from "@/components/StreakProvider";
import { motion, AnimatePresence } from "framer-motion";

const Index = () => {
  const [showWelcome, setShowWelcome] = useState(true);
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      // If user is not authenticated, redirect to auth page
      navigate('/auth');
      return;
    }

    if (user) {
      // Check for existing session (will be replaced with Supabase auth)
      const hasSeenWelcome = localStorage.getItem('plankit-welcome-seen');
      if (hasSeenWelcome) {
        setShowWelcome(false);
      }
    }
  }, [user, loading, navigate]);

  const handleGetStarted = () => {
    localStorage.setItem('plankit-welcome-seen', 'true');
    setShowWelcome(false);
  };

  // Show loading while checking auth state
  if (loading) {
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

  return (
    <StreakProvider>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
        <AnimatePresence mode="wait">
          {showWelcome ? (
            <WelcomeScreen key="welcome" onGetStarted={handleGetStarted} />
          ) : (
            <Dashboard key="dashboard" isAuthenticated={true} />
          )}
        </AnimatePresence>
      </div>
    </StreakProvider>
  );
};

export default Index;
