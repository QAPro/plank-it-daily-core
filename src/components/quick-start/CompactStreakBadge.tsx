import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useStreakTracking } from "@/hooks/useStreakTracking";
import React, { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import StreakDisplay from "@/components/StreakDisplay";

const CompactStreakBadge = () => {
  const { streak, isLoading } = useStreakTracking();
  const [modalOpen, setModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-6 w-12 bg-orange-200 rounded-full"></div>
      </div>
    );
  }

  const currentStreak = streak?.current_streak || 0;

  return (
    <Dialog open={modalOpen} onOpenChange={setModalOpen}>
      <DialogTrigger asChild>
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="cursor-pointer"
        >
          <Badge 
            variant="secondary" 
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 hover:from-orange-600 hover:to-red-600 transition-all duration-200 py-2 px-3 md:py-2 md:px-3 lg:py-2 lg:px-3"
          >
            {/* Mobile: Circular with icon + value only */}
            <div className="flex items-center justify-center md:hidden">
              <Flame className="w-3 h-3 mr-1" />
              <span className="font-semibold text-xs">{currentStreak}</span>
            </div>
            
            {/* Tablet: Medium with short label */}
            <div className="hidden md:flex lg:hidden flex-col items-center gap-0.5 min-w-0">
              <div className="flex items-center gap-1">
                <Flame className="w-3 h-3" />
                <span className="whitespace-nowrap text-xs">Streak</span>
              </div>
              <div className="font-semibold">{currentStreak}</div>
            </div>
            
            {/* Desktop: Full label */}
            <div className="hidden lg:flex flex-col items-center gap-0.5 min-w-0">
              <div className="flex items-center gap-1">
                <Flame className="w-3 h-3" />
                <span className="whitespace-nowrap text-xs">Streak</span>
              </div>
              <div className="font-semibold">{currentStreak}</div>
            </div>
          </Badge>
        </motion.div>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <StreakDisplay variant="detailed" />
      </DialogContent>
    </Dialog>
  );
};

export default CompactStreakBadge;