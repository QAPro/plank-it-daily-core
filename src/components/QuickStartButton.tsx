
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Play, Clock } from 'lucide-react';
import { QuickStartData } from '@/services/quickStartService';

interface QuickStartButtonProps {
  quickStartData: QuickStartData;
  onQuickStart: () => void;
  className?: string;
}

export const QuickStartButton: React.FC<QuickStartButtonProps> = ({
  quickStartData,
  onQuickStart,
  className = ""
}) => {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };

  return (
    <Card className={`border-primary/20 hover:border-primary/40 transition-colors cursor-pointer ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Clock className="h-3 w-3" />
              <span>Last workout</span>
            </div>
            <h3 className="font-medium text-foreground">{quickStartData.exerciseName}</h3>
            <p className="text-sm text-muted-foreground">
              {formatTime(quickStartData.duration)} • {quickStartData.difficulty}
            </p>
          </div>
          <Button 
            onClick={onQuickStart}
            size="sm"
            className="ml-4 gap-2"
          >
            <Play className="h-3 w-3" />
            Quick Start
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};