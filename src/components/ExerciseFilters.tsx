
import React, { useState } from "react";
import { Search, Filter, X, Heart, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import FlagGuard from '@/components/access/FlagGuard';
import type { Tables } from '@/integrations/supabase/types';

type Exercise = Tables<'plank_exercises'>;

export interface FilterState {
  search: string;
  difficulty: number[];
  categories: string[];
  tags: string[];
  showFavoritesOnly: boolean;
  showRecommendedOnly: boolean;
  hasPerformanceData: boolean | null;
  sortBy: 'name' | 'difficulty' | 'recommendation' | 'performance';
  sortOrder: 'asc' | 'desc';
}

interface ExerciseFiltersProps {
  exercises: Exercise[];
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  availableCategories: string[];
  availableTags: string[];
  hasRecommendations: boolean;
}

const ExerciseFilters = ({ 
  exercises, 
  filters, 
  onFiltersChange, 
  availableCategories, 
  availableTags,
  hasRecommendations 
}: ExerciseFiltersProps) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const updateFilter = (key: keyof FilterState, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      difficulty: [],
      categories: [],
      tags: [],
      showFavoritesOnly: false,
      showRecommendedOnly: false,
      hasPerformanceData: null,
      sortBy: 'name',
      sortOrder: 'asc',
    });
  };

  const activeFilterCount = [
    filters.search,
    filters.difficulty.length > 0,
    filters.categories.length > 0,
    filters.tags.length > 0,
    filters.showFavoritesOnly,
    filters.showRecommendedOnly,
    filters.hasPerformanceData !== null,
  ].filter(Boolean).length;

  const handleDifficultyChange = (level: number, checked: boolean) => {
    const newDifficulty = checked 
      ? [...filters.difficulty, level]
      : filters.difficulty.filter(d => d !== level);
    updateFilter('difficulty', newDifficulty);
  };

  const handleCategoryChange = (category: string, checked: boolean) => {
    const newCategories = checked 
      ? [...filters.categories, category]
      : filters.categories.filter(c => c !== category);
    updateFilter('categories', newCategories);
  };

  const handleTagChange = (tag: string, checked: boolean) => {
    const newTags = checked 
      ? [...filters.tags, tag]
      : filters.tags.filter(t => t !== tag);
    updateFilter('tags', newTags);
  };

  return (
    <FlagGuard featureName="exercise_filters">
      <div className="space-y-4">
        {/* Search and Quick Filters */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search exercises..."
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="relative">
                <Filter className="w-4 h-4 mr-2" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge className="ml-2 bg-orange-500 text-white text-xs w-5 h-5 p-0 flex items-center justify-center">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">Filters</h3>
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear All
                  </Button>
                </div>

                {/* Quick Filters */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Quick Filters</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="favorites"
                        checked={filters.showFavoritesOnly}
                        onCheckedChange={(checked) => updateFilter('showFavoritesOnly', checked)}
                      />
                      <Label htmlFor="favorites" className="text-sm flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        Favorites Only
                      </Label>
                    </div>
                    
                    {hasRecommendations && (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="recommended"
                          checked={filters.showRecommendedOnly}
                          onCheckedChange={(checked) => updateFilter('showRecommendedOnly', checked)}
                        />
                        <Label htmlFor="recommended" className="text-sm flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          Recommended for You
                        </Label>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Difficulty Levels */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Difficulty Level</Label>
                  <div className="grid grid-cols-5 gap-2">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div key={level} className="flex items-center space-x-1">
                        <Checkbox
                          id={`difficulty-${level}`}
                          checked={filters.difficulty.includes(level)}
                          onCheckedChange={(checked) => handleDifficultyChange(level, !!checked)}
                        />
                        <Label htmlFor={`difficulty-${level}`} className="text-xs">
                          {level}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Categories */}
                {availableCategories.length > 0 && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Exercise Type</Label>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {availableCategories.map((category) => (
                          <div key={category} className="flex items-center space-x-2">
                            <Checkbox
                              id={`category-${category}`}
                              checked={filters.categories.includes(category)}
                              onCheckedChange={(checked) => handleCategoryChange(category, !!checked)}
                            />
                            <Label htmlFor={`category-${category}`} className="text-sm capitalize">
                              {category.replace(/_/g, ' ')}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <Separator />
                  </>
                )}

                {/* Sort Options */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Sort By</Label>
                  <div className="flex gap-2">
                    <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
                      <SelectTrigger className="flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="difficulty">Difficulty</SelectItem>
                        {hasRecommendations && <SelectItem value="recommendation">Recommendation</SelectItem>}
                        <SelectItem value="performance">Performance</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateFilter('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                      className="px-3"
                    >
                      {filters.sortOrder === 'asc' ? '↑' : '↓'}
                    </Button>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Active Filters */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2">
            {filters.search && (
              <Badge variant="secondary" className="gap-1">
                Search: "{filters.search}"
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => updateFilter('search', '')} 
                />
              </Badge>
            )}
            {filters.difficulty.map((level) => (
              <Badge key={level} variant="secondary" className="gap-1">
                Difficulty {level}
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => handleDifficultyChange(level, false)} 
                />
              </Badge>
            ))}
            {filters.categories.map((category) => (
              <Badge key={category} variant="secondary" className="gap-1 capitalize">
                {category.replace(/_/g, ' ')}
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => handleCategoryChange(category, false)} 
                />
              </Badge>
            ))}
            {filters.showFavoritesOnly && (
              <Badge variant="secondary" className="gap-1">
                <Heart className="w-3 h-3" />
                Favorites
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => updateFilter('showFavoritesOnly', false)} 
                />
              </Badge>
            )}
            {filters.showRecommendedOnly && (
              <Badge variant="secondary" className="gap-1">
                <TrendingUp className="w-3 h-3" />
                Recommended
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => updateFilter('showRecommendedOnly', false)} 
                />
              </Badge>
            )}
          </div>
        )}
      </div>
    </FlagGuard>
  );
};

export default ExerciseFilters;
