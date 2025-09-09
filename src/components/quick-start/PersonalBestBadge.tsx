import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { usePersonalBest } from "@/hooks/usePersonalBest";
import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PersonalBestBadgeProps {
  exerciseId: string | null;
}

const PersonalBestBadge = ({ exerciseId }: PersonalBestBadgeProps) => {
  const { data: personalBest, isLoading } = usePersonalBest(exerciseId);
  const [modalOpen, setModalOpen] = useState(false);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) {
      return remainingSeconds > 0 ? `${minutes}:${remainingSeconds.toString().padStart(2, '0')}` : `${minutes}:00`;
    }
    return `${seconds}s`;
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-6 w-16 bg-muted rounded-full"></div>
      </div>
    );
  }

  if (!personalBest || personalBest === 0) return null;

  return (
    <Dialog open={modalOpen} onOpenChange={setModalOpen}>
      <DialogTrigger asChild>
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="cursor-pointer"
        >
          <Badge 
            variant="outline" 
            className="bg-background/80 backdrop-blur-sm border-yellow-500/20 hover:border-yellow-500/40 transition-all duration-200 text-xs"
          >
            <Trophy className="w-3 h-3 mr-1 text-yellow-600" />
            PB {formatTime(personalBest)}
          </Badge>
        </motion.div>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-600" />
              Personal Best
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-2xl font-bold text-yellow-600">{formatTime(personalBest)}</div>
              <div className="text-muted-foreground">Your longest hold for this exercise</div>
            </div>
            <div className="text-sm text-muted-foreground">
              Keep pushing to beat your record!
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default PersonalBestBadge;