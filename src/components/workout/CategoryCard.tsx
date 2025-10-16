import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { ChevronRight, Zap, Dumbbell, Wind, Target, Scale, Activity, LucideIcon } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type ExerciseCategory = Tables<'exercise_categories'>;

interface CategoryCardProps {
  category: ExerciseCategory;
  exerciseCount: number;
  onClick: () => void;
  index: number;
}

const iconMap: Record<string, LucideIcon> = {
  'Zap': Zap,
  'Dumbbell': Dumbbell,
  'Wind': Wind,
  'Target': Target,
  'Scale': Scale,
  'Activity': Activity,
};

export const CategoryCard = ({ category, exerciseCount, onClick, index }: CategoryCardProps) => {
  const IconComponent = iconMap[category.icon_name] || Activity;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * index, duration: 0.3 }}
    >
      <Card 
        className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-primary/20 hover:border-primary/40"
        onClick={onClick}
      >
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <IconComponent className="h-6 w-6 text-primary" />
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          
          <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
            {category.name}
          </h3>
          
          {category.description && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {category.description}
            </p>
          )}
          
          <Badge variant="secondary" className="text-xs">
            {exerciseCount} {exerciseCount === 1 ? 'exercise' : 'exercises'}
          </Badge>
        </CardContent>
      </Card>
    </motion.div>
  );
};
