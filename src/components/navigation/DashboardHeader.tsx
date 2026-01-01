import { motion } from "framer-motion";
import { Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import innerFireLogo from "@/assets/inner-fire-logo.png";
import { useScrollDirection } from "@/hooks/useScrollDirection";

interface DashboardHeaderProps {
  activeTab?: string;
}

const DashboardHeader = ({ activeTab = 'home' }: DashboardHeaderProps) => {
  const navigate = useNavigate();
  const scrollDirection = useScrollDirection({ threshold: 10 });
  
  // Determine if header should be hidden
  const isHidden = scrollDirection === 'down';
  
  return (
    <motion.header 
      className="fixed top-0 left-0 right-0 bg-background backdrop-blur-sm z-40 transition-transform duration-300 ease-in-out"
      style={{
        transform: isHidden ? 'translateY(-100%)' : 'translateY(0)',
      }}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img 
              src={innerFireLogo} 
              alt="Inner Fire Logo" 
              className="w-10 h-10 object-contain"
            />
            <h1 className="text-2xl font-bold text-coral">inner fire</h1>
          </div>
          <button 
            onClick={() => navigate('/settings', { state: { fromTab: activeTab } })}
            className="w-10 h-10 rounded-full bg-background-secondary hover:bg-gray-200 flex items-center justify-center transition-colors"
            aria-label="Settings"
          >
            <Settings className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>
    </motion.header>
  );
};

export default DashboardHeader;
