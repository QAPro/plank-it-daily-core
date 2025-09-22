import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useSessionStats } from "@/hooks/useSessionHistory";
import React, { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const WeeklyProgressBadge = () => {
  const { data: stats, isLoading } = useSessionStats();
  const [modalOpen, setModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-10 w-20 bg-muted rounded-full"></div>
      </div>
    );
  }

  const weeklyProgress = stats?.thisWeekSessions || 0;
  const weeklyGoal = stats?.weeklyGoal || 7;

  return (
    <Dialog open={modalOpen} onOpenChange={setModalOpen}>
      <DialogTrigger asChild>
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="cursor-pointer"
        >
          <Badge 
            variant="outline" 
            className="bg-background/80 backdrop-blur-sm border-blue-500/20 hover:border-blue-500/40 transition-all duration-200 text-xs py-2 px-3"
          >
            <div className="flex flex-col items-center gap-0.5 min-w-0">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-blue-600" />
                <span className="whitespace-nowrap">Progress</span>
              </div>
              <div className="font-semibold text-blue-600">{weeklyProgress}/{weeklyGoal}</div>
            </div>
          </Badge>
        </motion.div>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Weekly Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {weeklyProgress} / {weeklyGoal} days
              </div>
              <div className="text-muted-foreground">
                {weeklyProgress === weeklyGoal 
                  ? "Congratulations! You've reached your weekly goal!" 
                  : `${weeklyGoal - weeklyProgress} more sessions to reach your weekly goal`}
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              Keep up the consistency to maintain your progress!
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default WeeklyProgressBadge;