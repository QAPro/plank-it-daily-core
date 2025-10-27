import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ChevronRight, Zap, Dumbbell, Target, Armchair, PersonStanding, Layers, Activity, LucideIcon, Sparkles, Star } from "lucide-react";
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

  // Decorative badge colors - cycling through playful pastels
  const decorativeBadges = [
    { color: 'bg-[#FFB4A2]', icon: Sparkles, position: '-top-2 -right-2', size: 'w-8 h-8' },
    { color: 'bg-[#B2F5EA]', icon: Star, position: '-bottom-2 -left-2', size: 'w-6 h-6' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * index, duration: 0.3 }}
    >
      <Card 
        className="group bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] transition-all duration-300 cursor-pointer hover:shadow-[0_16px_48px_rgba(0,0,0,0.18)] hover:-translate-y-1 hover:rotate-0 border-0"
        onClick={onClick}
      >
        <CardContent className="p-3 flex items-center gap-3 relative overflow-visible">
          {/* Main category icon */}
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${gradientStyle.gradient} ${gradientStyle.shadow} flex-shrink-0 transition-transform duration-300 group-hover:scale-110`}>
            <IconComponent className="h-5 w-5 text-white" />
          </div>
          
          {/* Decorative badges */}
          {decorativeBadges.map((badge, i) => {
            const BadgeIcon = badge.icon;
            return (
              <div 
                key={i}
                className={`absolute ${badge.position} ${badge.size} rounded-full ${badge.color} opacity-70 flex items-center justify-center transition-all duration-300 group-hover:opacity-90 group-hover:scale-110`}
              >
                <BadgeIcon className="h-3 w-3 text-white" />
              </div>
            );
          })}
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-[#2C3E50] truncate mb-0.5">
              {category.name}
            </h3>
            
            <p className="text-xs text-[#7F8C8D]">
              {exerciseCount} {exerciseCount === 1 ? 'exercise' : 'exercises'}
            </p>
          </div>

          <ChevronRight className="h-4 w-4 text-[#BDC3C7] group-hover:text-[#FF6B35] group-hover:translate-x-1 transition-all duration-200 flex-shrink-0" />
        </CardContent>
      </Card>
    </motion.div>
  );
};
