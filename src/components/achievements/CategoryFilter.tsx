import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

type AchievementCategory = 'All' | 'Consistency' | 'Performance' | 'Milestones' | 'Social' | 'Momentum' | 'Special';

interface CategoryFilterProps {
  selectedCategory: AchievementCategory;
  onCategoryChange: (category: AchievementCategory) => void;
  categoryCounts?: Record<string, number>;
}

const CATEGORIES: AchievementCategory[] = [
  'All',
  'Consistency',
  'Performance',
  'Milestones',
  'Social',
  'Momentum',
  'Special'
];

export const CategoryFilter = ({
  selectedCategory,
  onCategoryChange,
  categoryCounts = {}
}: CategoryFilterProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <label htmlFor="category-filter" className="text-sm font-medium text-foreground">
        Filter by Category
      </label>
      <Select
        value={selectedCategory}
        onValueChange={(value) => onCategoryChange(value as AchievementCategory)}
      >
        <SelectTrigger 
          id="category-filter"
          className="w-full sm:w-[220px] bg-background"
          aria-label="Filter achievements by category"
        >
          <SelectValue placeholder="Select category" />
        </SelectTrigger>
        <SelectContent className="bg-background z-50">
          {CATEGORIES.map((category) => (
            <SelectItem key={category} value={category}>
              <div className="flex items-center justify-between gap-3 w-full">
                <span>{category}</span>
                {categoryCounts[category] !== undefined && (
                  <Badge variant="secondary" className="ml-2">
                    {categoryCounts[category]}
                  </Badge>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export type { AchievementCategory };
