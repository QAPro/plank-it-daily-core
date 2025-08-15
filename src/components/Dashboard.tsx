
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home, User, Dumbbell, BarChart3, Trophy } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import TabNavigation from "@/components/TabNavigation";

const Dashboard = () => {
  const { user, session, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-orange-600 text-lg">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600 text-lg">Not authenticated.</div>
      </div>
    );
  }

  return <TabNavigation />;
};

export default Dashboard;
