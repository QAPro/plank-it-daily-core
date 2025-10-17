import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface DashboardHeaderProps {
  onSettingsClick: () => void;
}

const DashboardHeader = ({ onSettingsClick }: DashboardHeaderProps) => {
  return (
    <header className="fixed top-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-b border-border z-40">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-foreground">PlankIt</h1>
        </div>
        
        <motion.div whileTap={{ scale: 0.95 }}>
          <Button
            variant="ghost"
            size="icon"
            onClick={onSettingsClick}
            className="rounded-full"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </motion.div>
      </div>
    </header>
  );
};

export default DashboardHeader;
