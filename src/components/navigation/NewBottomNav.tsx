import { motion } from "framer-motion";
import { useFeatureFlags } from "@/hooks/useFeatureFlags";
import homeActive from "@/assets/nav-icons/icon_home_active.png";
import homeInactive from "@/assets/nav-icons/icon_home_inactive.png";
import statsActive from "@/assets/nav-icons/icon_stats_active.png";
import statsInactive from "@/assets/nav-icons/icon_stats_inactive.png";
import workoutsActive from "@/assets/nav-icons/icon_workouts_active.png";
import workoutsInactive from "@/assets/nav-icons/icon_workouts_inactive.png";
import friendsActive from "@/assets/nav-icons/icon_friends_active.png";
import friendsInactive from "@/assets/nav-icons/icon_friends_inactive.png";
import achievementsActive from "@/assets/nav-icons/icon_achievements_active.png";
import achievementsInactive from "@/assets/nav-icons/icon_achievements_inactive.png";

type TabId = "stats" | "workout" | "home" | "achievements" | "friends";

interface NewBottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const NewBottomNav = ({ activeTab, onTabChange }: NewBottomNavProps) => {
  const { socialFeaturesEnabled } = useFeatureFlags();

  const tabs: Array<{
    id: TabId;
    label: string;
    activeIcon: string;
    inactiveIcon: string;
    visible: boolean;
  }> = [
    {
      id: "stats",
      label: "Stats",
      activeIcon: statsActive,
      inactiveIcon: statsInactive,
      visible: true,
    },
    {
      id: "workout",
      label: "Workouts",
      activeIcon: workoutsActive,
      inactiveIcon: workoutsInactive,
      visible: true,
    },
    {
      id: "home",
      label: "Home",
      activeIcon: homeActive,
      inactiveIcon: homeInactive,
      visible: true,
    },
    {
      id: "achievements",
      label: "Achievements",
      activeIcon: achievementsActive,
      inactiveIcon: achievementsInactive,
      visible: true,
    },
    {
      id: "friends",
      label: "Friends",
      activeIcon: friendsActive,
      inactiveIcon: friendsInactive,
      visible: socialFeaturesEnabled,
    },
  ];

  const visibleTabs = tabs.filter((tab) => tab.visible);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-nav z-50">
      <div className="max-w-7xl mx-auto px-2">
        <div className="flex items-center justify-around h-[72px]">
          {visibleTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const isHomeTab = tab.id === "home";

            return (
              <motion.button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className="flex flex-col items-center justify-center gap-1 min-w-[70px] relative group touch-manipulation"
                whileTap={{ scale: 0.95 }}
                animate={isActive ? { scale: isHomeTab ? 1.08 : 1.03 } : { scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                <img
                  src={isActive ? tab.activeIcon : tab.inactiveIcon}
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
                <span
                  className={`text-xs font-medium transition-colors ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {tab.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default NewBottomNav;
