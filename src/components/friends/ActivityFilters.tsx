
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Filter } from 'lucide-react';
import { ActivityFilters as ActivityFiltersType } from '@/services/socialActivityService';

interface ActivityFiltersProps {
  filters: ActivityFiltersType;
  onFiltersChange: (filters: ActivityFiltersType) => void;
  activityCount?: number;
}

const ActivityFilters = ({ filters, onFiltersChange, activityCount = 0 }: ActivityFiltersProps) => {
  const handleTypeChange = (value: string) => {
    onFiltersChange({
      ...filters,
      type: value as ActivityFiltersType['type']
    });
  };

  const handleTimeframeChange = (value: string) => {
    onFiltersChange({
      ...filters,
      timeframe: value as ActivityFiltersType['timeframe']
    });
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'all': return 'All Activities';
      case 'workout': return 'Workouts';
      case 'achievement': return 'Achievements';
      case 'level_up': return 'Level Ups';
      case 'streak_milestone': return 'Streaks';
      case 'personal_best': return 'Personal Bests';
      default: return 'All Activities';
    }
  };

  const getTimeframeLabel = (timeframe: string) => {
    switch (timeframe) {
      case 'today': return 'Today';
      case 'week': return 'This Week';
      case 'month': return 'This Month';
      case 'all': return 'All Time';
      default: return 'This Week';
    }
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Type:</span>
                <Select value={filters.type} onValueChange={handleTypeChange}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Activities</SelectItem>
                    <SelectItem value="workout">🏋️ Workouts</SelectItem>
                    <SelectItem value="achievement">🏆 Achievements</SelectItem>
                    <SelectItem value="level_up">⬆️ Level Ups</SelectItem>
                    <SelectItem value="streak_milestone">🔥 Streaks</SelectItem>
                    <SelectItem value="personal_best">📈 Personal Bests</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Time:</span>
                <Select value={filters.timeframe} onValueChange={handleTimeframeChange}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="all">All Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
              {activityCount} activities
            </Badge>
          </div>
        </div>

        {(filters.type !== 'all' || filters.timeframe !== 'week') && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
            <span className="text-sm text-gray-600">Active filters:</span>
            {filters.type !== 'all' && (
              <Badge 
                variant="secondary" 
                className="bg-blue-100 text-blue-800 cursor-pointer hover:bg-blue-200"
                onClick={() => handleTypeChange('all')}
              >
                {getTypeLabel(filters.type)} ×
              </Badge>
            )}
            {filters.timeframe !== 'week' && (
              <Badge 
                variant="secondary" 
                className="bg-green-100 text-green-800 cursor-pointer hover:bg-green-200"
                onClick={() => handleTimeframeChange('week')}
              >
                {getTimeframeLabel(filters.timeframe)} ×
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityFilters;
