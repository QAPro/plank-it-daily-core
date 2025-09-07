import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Target, CheckCircle } from 'lucide-react';
import { ProgressionSuggestion as ProgressionSuggestionType } from '@/services/progressiveDifficultyService';

interface ProgressionSuggestionProps {
  suggestion: ProgressionSuggestionType;
  onAccept: (newValue: number) => void;
  onDismiss: () => void;
}

export const ProgressionSuggestion: React.FC<ProgressionSuggestionProps> = ({
  suggestion,
  onAccept,
  onDismiss
}) => {
  const getIcon = () => {
    switch (suggestion.type) {
      case 'duration':
        return <Target className="h-4 w-4" />;
      case 'difficulty':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <CheckCircle className="h-4 w-4" />;
    }
  };

  const getConfidenceColor = () => {
    switch (suggestion.confidence) {
      case 'high':
        return 'bg-green-500';
      case 'medium':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card className="border-l-4 border-l-primary bg-primary/5">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="text-primary mt-1">
            {getIcon()}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-medium text-sm">Progress Suggestion</h4>
              <Badge 
                variant="secondary" 
                className={`text-white text-xs ${getConfidenceColor()}`}
              >
                {suggestion.confidence} confidence
              </Badge>
            </div>
            
            <p className="text-sm text-foreground mb-2">
              {suggestion.suggestion}
            </p>
            
            <p className="text-xs text-muted-foreground mb-3">
              {suggestion.reasoning}
            </p>
            
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={() => onAccept(suggestion.suggestedValue)}
                className="text-xs"
              >
                Try It
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={onDismiss}
                className="text-xs"
              >
                Not Now
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};