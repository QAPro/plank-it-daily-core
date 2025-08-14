
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home, User, Dumbbell, BarChart3, Trophy } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { LevelProgressionProvider } from "@/components/level/LevelProgressionProvider";
import HomeTab from "@/components/tabs/HomeTab";
import WorkoutTab from "@/components/tabs/WorkoutTab";
import StatsTab from "@/components/tabs/StatsTab";
import ProfileTab from "@/components/tabs/ProfileTab";
import AchievementsTab from "@/components/tabs/AchievementsTab";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('home');
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

  return (
    <LevelProgressionProvider>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm py-4 shadow-md sticky top-0 z-10 border-b border-orange-100">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-orange-700">
                  Plank<span className="text-gray-800">Coach</span>
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                {user && (
                  <div className="text-gray-700">
                    Welcome, {user.email || user.id}!
                  </div>
                )}
                {/* You can add user profile or settings icon here */}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="container mx-auto px-4 pb-24">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-orange-100 overflow-hidden">
            {/* Navigation Tabs */}
            <div className="flex border-b border-orange-100">
              {[
                { id: 'home', label: 'Home', icon: Home },
                { id: 'workout', label: 'Workout', icon: Dumbbell },
                { id: 'stats', label: 'Stats', icon: BarChart3 },
                { id: 'achievements', label: 'Achievements', icon: Trophy },
                { id: 'profile', label: 'Profile', icon: User },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center py-3 px-4 text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'text-orange-600 bg-orange-50 border-b-2 border-orange-500'
                      : 'text-gray-600 hover:text-orange-600 hover:bg-orange-25'
                  }`}
                >
                  <tab.icon className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              {activeTab === 'home' && <HomeTab key="home" />}
              {activeTab === 'workout' && <WorkoutTab key="workout" />}
              {activeTab === 'stats' && <StatsTab key="stats" />}
              {activeTab === 'achievements' && <AchievementsTab key="achievements" />}
              {activeTab === 'profile' && <ProfileTab key="profile" />}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </LevelProgressionProvider>
  );
};

export default Dashboard;
