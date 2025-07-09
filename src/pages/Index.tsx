
import { useState, useEffect } from "react";
import WelcomeScreen from "@/components/WelcomeScreen";
import Dashboard from "@/components/Dashboard";
import { motion, AnimatePresence } from "framer-motion";

const Index = () => {
  const [showWelcome, setShowWelcome] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check for existing session (will be replaced with Supabase auth)
    const hasSeenWelcome = localStorage.getItem('plankit-welcome-seen');
    if (hasSeenWelcome) {
      setShowWelcome(false);
    }
  }, []);

  const handleGetStarted = () => {
    localStorage.setItem('plankit-welcome-seen', 'true');
    setShowWelcome(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <AnimatePresence mode="wait">
        {showWelcome ? (
          <WelcomeScreen key="welcome" onGetStarted={handleGetStarted} />
        ) : (
          <Dashboard key="dashboard" isAuthenticated={isAuthenticated} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
