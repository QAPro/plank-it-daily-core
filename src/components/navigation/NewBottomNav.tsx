import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useFeatureFlags } from "@/hooks/useFeatureFlags";
import { useTheme } from "@/components/theme-provider";

// Light mode icons
import statsActiveLi from "@/assets/nav-icons/light/icon_stats_active.png";
import statsInactiveLi from "@/assets/nav-icons/light/icon_stats_inactive.png";
import workoutsActiveLi from "@/assets/nav-icons/light/icon_workouts_active.png";
import workoutsInactiveLi from "@/assets/nav-icons/light/icon_workouts_inactive.png";
import homeActiveLi from "@/assets/nav-icons/light/icon_home_active.png";
import homeInactiveLi from "@/assets/nav-icons/light/icon_home_inactive.png";
import achievementsActiveLi from "@/assets/nav-icons/light/icon_achievements_active.png";
import achievementsInactiveLi from "@/assets/nav-icons/light/icon_achievements_inactive.png";
import friendsActiveLi from "@/assets/nav-icons/light/icon_friends_active.png";
import friendsInactiveLi from "@/assets/nav-icons/light/icon_friends_inactive.png";

// Dark mode icons
import statsActiveDk from "@/assets/nav-icons/dark/icon_stats_active.png";
import statsInactiveDk from "@/assets/nav-icons/dark/icon_stats_inactive.png";
import workoutsActiveDk from "@/assets/nav-icons/dark/icon_workouts_active.png";
import workoutsInactiveDk from "@/assets/nav-icons/dark/icon_workouts_inactive.png";
import homeActiveDk from "@/assets/nav-icons/dark/icon_home_active.png";
import homeInactiveDk from "@/assets/nav-icons/dark/icon_home_inactive.png";
import achievementsActiveDk from "@/assets/nav-icons/dark/icon_achievements_active.png";
import achievementsInactiveDk from "@/assets/nav-icons/dark/icon_achievements_inactive.png";
import friendsActiveDk from "@/assets/nav-icons/dark/icon_friends_active.png";
import friendsInactiveDk from "@/assets/nav-icons/dark/icon_friends_inactive.png";

type TabId = "stats" | "workout" | "home" | "achievements" | "friends";

interface NewBottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const NewBottomNav = ({ activeTab, onTabChange }: NewBottomNavProps) => {
  const { socialFeaturesEnabled } = useFeatureFlags();
  const { theme } = useTheme();
  const [forceUpdate, setForceUpdate] = useState(false);

  // Resolve actual theme (handle "system" mode)
  const resolvedTheme = theme === "system" 
    ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
    : theme;
  
  const iconMode = resolvedTheme === "dark" ? "dark" : "light";

  // Icon sets for light and dark modes
  const iconSets = {
    light: {
      stats: { active: statsActiveLi, inactive: statsInactiveLi },
      workout: { active: workoutsActiveLi, inactive: workoutsInactiveLi },
      home: { active: homeActiveLi, inactive: homeInactiveLi },
      achievements: { active: achievementsActiveLi, inactive: achievementsInactiveLi },
      friends: { active: friendsActiveLi, inactive: friendsInactiveLi },
    },
    dark: {
      stats: { active: statsActiveDk, inactive: statsInactiveDk },
      workout: { active: workoutsActiveDk, inactive: workoutsInactiveDk },
      home: { active: homeActiveDk, inactive: homeInactiveDk },
      achievements: { active: achievementsActiveDk, inactive: achievementsInactiveDk },
      friends: { active: friendsActiveDk, inactive: friendsInactiveDk },
    },
  };

  // Handle system theme changes
  useEffect(() => {
    if (theme !== "system") return;
    
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      setForceUpdate(prev => !prev);
    };
    
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  const tabs: Array<{
    id: TabId;
    label: string;
    visible: boolean;
  }> = [
    { id: "stats", label: "Stats", visible: true },
    { id: "workout", label: "Workouts", visible: true },
    { id: "home", label: "Home", visible: true },
    { id: "achievements", label: "Achievements", visible: true },
    { id: "friends", label: "Friends", visible: socialFeaturesEnabled },
  ];

  const visibleTabs = tabs.filter((tab) => tab.visible);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-nav z-50 pb-4">
      <div className="max-w-7xl mx-auto px-2">
        <div className="flex items-center justify-around h-[80px] py-2 overflow-visible">
          {visibleTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const isHomeTab = tab.id === "home";

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className="flex flex-col items-center justify-end gap-1 min-w-[70px] relative touch-manipulation active:opacity-90"
              >
                <motion.div 
                  className="h-[60px] flex items-center justify-center origin-center"
                  animate={isActive ? { scale: isHomeTab ? 1.08 : 1.03 } : { scale: 1 }}
                  transition={{ duration: 0.2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <img
                    src={isActive 
                      ? iconSets[iconMode][tab.id].active 
                      : iconSets[iconMode][tab.id].inactive
                    }
                    alt={tab.label}
                    className={`${
                      isHomeTab 
                        ? isActive ? "w-[60px] h-[60px]" : "w-12 h-12"
                        : isActive ? "w-11 h-11" : "w-9 h-9"
                    } object-contain ${
                      isActive 
                        ? "drop-shadow-[0_2px_4px_rgba(255,107,53,0.3)]" 
                        : ""
                    }`}
                  />
                </motion.div>
                <span
                  className={`text-xs font-medium transition-colors ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default NewBottomNav;
