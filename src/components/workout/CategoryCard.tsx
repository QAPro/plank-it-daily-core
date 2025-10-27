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
        className="group bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] transition-all duration-300 cursor-pointer hover:shadow-[0_16px_48px_rgba(0,0,0,0.18)] hover:-translate-y-2 hover:scale-105 hover:rotate-0 border-2 border-transparent"
        onClick={onClick}
        style={{
          borderColor: gradientStyle.borderColor ? gradientStyle.borderColor.replace('border-', '').replace('/20', '33') : 'transparent',
        }}
      >
        <CardContent className="p-3 md:p-4 flex items-center gap-3 relative">
          {/* Main category icon */}
          <div 
            className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center ${gradientStyle.gradient} ${gradientStyle.shadow} flex-shrink-0 transition-all duration-300 group-hover:scale-110`}
            style={{
              boxShadow: gradientStyle.glowColor ? `0 0 0 rgba(0,0,0,0)` : undefined,
            }}
          >
            <IconComponent className="h-4 w-4 md:h-5 md:w-5 text-white" />
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm md:text-base font-bold text-[#2C3E50] line-clamp-2 mb-0.5 leading-tight">
              {category.name}
            </h3>
            
            <p className="text-xs text-[#7F8C8D] font-medium">
              {exerciseCount} {exerciseCount === 1 ? 'exercise' : 'exercises'}
            </p>
          </div>

          <ChevronRight 
            className="h-4 w-4 text-[#BDC3C7] transition-all duration-200 flex-shrink-0"
            style={{
              color: gradientStyle.badgeColor || '#BDC3C7'
            }}
          />
        </CardContent>
      </Card>
      
      <style>{`
        .group:hover {
          box-shadow: 0 16px 48px rgba(0,0,0,0.18), 0 0 40px ${gradientStyle.glowColor || 'rgba(255,107,53,0.4)'} !important;
        }
      `}</style>
    </motion.div>
  );
};
