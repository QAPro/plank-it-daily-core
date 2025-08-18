
import { useState } from 'react';
import { Calendar, CalendarIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface DateRange {
  start: Date | null;
  end: Date | null;
  preset: string;
}

interface AdvancedDateRangeFilterProps {
  value: DateRange;
  onChange: (dateRange: DateRange) => void;
}

const DATE_PRESETS = [
  { value: '7_days', label: 'Last 7 days' },
  { value: '30_days', label: 'Last 30 days' },
  { value: '90_days', label: 'Last 90 days' },
  { value: '180_days', label: 'Last 6 months' },
  { value: '365_days', label: 'Last year' },
  { value: 'custom', label: 'Custom range' }
];

const AdvancedDateRangeFilter = ({ value, onChange }: AdvancedDateRangeFilterProps) => {
  const [isCustomMode, setIsCustomMode] = useState(value.preset === 'custom');

  const handlePresetChange = (preset: string) => {
    if (preset === 'custom') {
      setIsCustomMode(true);
      onChange({ ...value, preset, start: null, end: null });
    } else {
      setIsCustomMode(false);
      onChange({ ...value, preset, start: null, end: null });
    }
  };

  const handleCustomDateChange = (field: 'start' | 'end', date: Date | undefined) => {
    onChange({
      ...value,
      preset: 'custom',
      [field]: date || null
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium">Date Range</span>
      </div>

      <Select value={value.preset} onValueChange={handlePresetChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select time period" />
        </SelectTrigger>
        <SelectContent>
          {DATE_PRESETS.map((preset) => (
            <SelectItem key={preset.value} value={preset.value}>
              {preset.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {isCustomMode && (
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Start Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !value.start && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {value.start ? format(value.start, "MMM dd, yyyy") : "Pick start"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={value.start || undefined}
                  onSelect={(date) => handleCustomDateChange('start', date)}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">End Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !value.end && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {value.end ? format(value.end, "MMM dd, yyyy") : "Pick end"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={value.end || undefined}
                  onSelect={(date) => handleCustomDateChange('end', date)}
                  initialFocus
                  disabled={(date) => value.start ? date < value.start : false}
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedDateRangeFilter;
