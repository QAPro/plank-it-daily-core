import { motion } from "framer-motion";
import { Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLevelProgression } from "@/hooks/useLevelProgression";
import React, { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const UserLevelBadge = () => {
  const { userLevel, loading } = useLevelProgression();
  const [modalOpen, setModalOpen] = useState(false);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-6 w-20 bg-muted rounded-full"></div>
      </div>
    );
  }

  if (!userLevel) return null;

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
            variant="outline" 
            className="bg-background/80 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-all duration-200 text-xs py-2 px-3"
          >
            <div className="flex flex-col items-center gap-0.5 min-w-0">
              <div className="flex items-center gap-1">
                <Crown className="w-3 h-3 text-primary" />
                <span className="whitespace-nowrap text-xs">Level</span>
              </div>
              <div className="font-semibold text-primary">{userLevel.current_level}</div>
            </div>
          </Badge>
        </motion.div>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-primary" />
              Level Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-2xl font-bold text-primary">Level {userLevel.current_level}</div>
              <div className="text-muted-foreground">{userLevel.level_title}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Experience Points</div>
              <div className="text-lg font-semibold">{userLevel.current_xp} XP</div>
            </div>
            {userLevel.next_unlock && (
              <div>
                <div className="text-sm text-muted-foreground">Next Unlock</div>
                <div className="text-sm">Level {userLevel.next_unlock.level}: {userLevel.next_unlock.feature_name}</div>
              </div>
            )}
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default UserLevelBadge;