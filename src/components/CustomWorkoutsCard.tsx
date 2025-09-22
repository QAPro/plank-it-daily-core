import React from 'react';
import { motion } from 'framer-motion';
import { Crown, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { useSubscription } from '@/hooks/useSubscription';

const CustomWorkoutsCard: React.FC = () => {
  const { hasAccess, tier } = useFeatureAccess();
  const { upgrade, plans } = useSubscription();
  
  const hasCustomWorkoutAccess = hasAccess('custom_workouts');

  const handleClick = () => {
    if (!hasCustomWorkoutAccess) {
      const premiumPlan = plans?.find(p => p.name.toLowerCase().includes('premium'));
      if (premiumPlan) {
        upgrade(premiumPlan);
      }
    }
    // If user has access, this could navigate to custom workouts page
    // For now, we'll just handle the upgrade case
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card 
        className="cursor-pointer hover:shadow-md transition-all duration-300 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 hover:border-primary/30"
        onClick={handleClick}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              <span className="font-semibold text-primary">Custom</span>
            </div>
            {!hasCustomWorkoutAccess && (
              <Badge variant="secondary" className="flex items-center gap-1 bg-amber-100 text-amber-800 border-amber-300">
                <Crown className="h-3 w-3" />
                Premium
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {hasCustomWorkoutAccess 
              ? "Create personalized workouts" 
              : "Unlock custom workout creation"
            }
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CustomWorkoutsCard;