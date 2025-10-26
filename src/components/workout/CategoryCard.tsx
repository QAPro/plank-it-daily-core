import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ChevronRight, Zap, Dumbbell, Target, Armchair, PersonStanding, Layers, Activity, LucideIcon } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import { getCategoryGradient } from "@/utils/categoryGradients";

type ExerciseCategory = Tables<'exercise_categories'>;

interface CategoryCardProps {
  category: ExerciseCategory;
  exerciseCount: number;
  onClick: () => void;
  index: number;
}

const iconMap: Record<string, LucideIcon> = {
  'Zap': Zap,
  'Target': Target,
  'Dumbbell': Dumbbell,
  'Armchair': Armchair,
  'PersonStanding': PersonStanding,
  'Layers': Layers,
};

export const CategoryCard = ({ category, exerciseCount, onClick, index }: CategoryCardProps) => {
  const IconComponent = iconMap[category.icon_name] || Activity;
  const gradientStyle = getCategoryGradient(category.name);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * index, duration: 0.3 }}
    >
      <Card 
        className="group bg-white rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.1)] transition-all duration-300 cursor-pointer hover:shadow-[0_8px_24px_rgba(0,0,0,0.15)] hover:-translate-y-1 odd:rotate-[-0.5deg] even:rotate-[0.5deg] hover:rotate-0 border-0"
        onClick={onClick}
      >
        <CardContent className="p-5 flex items-center gap-4">
          <div className={`w-[60px] h-[60px] rounded-full flex items-center justify-center ${gradientStyle.gradient} ${gradientStyle.shadow} flex-shrink-0`}>
            <IconComponent className="h-6 w-6 text-white" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-semibold text-[#2C3E50] mb-1">
              {category.name}
            </h3>
            
            {category.description && (
              <p className="text-sm font-medium text-[#7F8C8D] line-clamp-1 mb-2">
                {category.description}
              </p>
            )}
            
            <div className="text-sm font-medium text-[#7F8C8D]">
              {exerciseCount} {exerciseCount === 1 ? 'exercise' : 'exercises'}
            </div>
          </div>

          <ChevronRight className="h-5 w-5 text-[#BDC3C7] group-hover:text-[#FF6B35] group-hover:translate-x-1 transition-all duration-200 flex-shrink-0" />
        </CardContent>
      </Card>
    </motion.div>
  );
};
