import { motion } from "framer-motion";
import { Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import innerFireLogo from "@/assets/inner-fire-logo.png";

interface DashboardHeaderProps {
  activeTab?: string;
}

const DashboardHeader = ({ activeTab = 'home' }: DashboardHeaderProps) => {
  const navigate = useNavigate();
  return (
    <header className="fixed top-0 left-0 right-0 bg-background backdrop-blur-sm z-40">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <motion.div 
          className="flex items-center justify-between"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center">
            <img 
              src={innerFireLogo} 
              alt="Inner Fire Logo" 
              className="h-10 w-auto object-contain"
            />
          </div>
          <button 
            onClick={() => navigate('/settings', { state: { fromTab: activeTab } })}
            className="w-10 h-10 rounded-full bg-background-secondary hover:bg-gray-200 flex items-center justify-center transition-colors"
            aria-label="Settings"
          >
            <Settings className="w-5 h-5 text-gray-500" />
          </button>
        </motion.div>
      </div>
    </header>
  );
};

export default DashboardHeader;
