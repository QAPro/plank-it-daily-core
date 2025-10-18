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
    <nav className="fixed bottom-0 left-0 right-0 bg-[#1a2332] border-t border-border z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-around h-20">
          {visibleTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const isHomeTab = tab.id === "home";

            return (
              <motion.button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className="flex flex-col items-center justify-center gap-1 min-w-[70px]"
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  animate={{
                    scale: isActive ? (isHomeTab ? 1.08 : 1.03) : isHomeTab ? 1.05 : 1,
                  }}
                  transition={{ duration: 0.2 }}
                  className="relative flex items-center justify-center h-[44px]"
                >
                  <img
                    src={isActive ? tab.activeIcon : tab.inactiveIcon}
                    alt={tab.label}
                    className={`${isHomeTab ? "w-[60px] h-[60px]" : "w-12 h-12"} object-contain`}
                  />
                </motion.div>
                <span
                  className={`text-xs font-medium transition-colors ${
                    isActive ? "text-[#FF6B35]" : "text-[#A9B4C2]"
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
