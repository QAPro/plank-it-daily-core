
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Target, Calendar, TrendingUp, Star, Award } from "lucide-react";

export interface AchievementCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  count: number;
  earnedCount: number;
}

interface AchievementCategoriesProps {
  categories: AchievementCategory[];
  selectedCategory: string;
  onCategorySelect: (categoryId: string) => void;
}

const AchievementCategories = ({ 
  categories, 
  selectedCategory, 
  onCategorySelect 
}: AchievementCategoriesProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
      {categories.map((category, index) => (
        <motion.div
          key={category.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1, duration: 0.3 }}
        >
          <Card 
            className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
              selectedCategory === category.id 
                ? 'ring-2 ring-orange-500 bg-orange-50' 
                : 'hover:shadow-md'
            }`}
            onClick={() => onCategorySelect(category.id)}
          >
            <CardContent className="p-4 text-center">
              <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center ${category.color}`}>
                {category.icon}
              </div>
              <h3 className="font-semibold text-sm mb-1">{category.name}</h3>
              <p className="text-xs text-gray-600 mb-2">{category.description}</p>
              <div className="flex justify-center space-x-1">
                <Badge variant="secondary" className="text-xs">
                  {category.earnedCount}/{category.count}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default AchievementCategories;
