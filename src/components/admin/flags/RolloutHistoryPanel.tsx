import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { History, ChevronDown, ChevronUp, User, Clock } from "lucide-react";
import { useRolloutHistory } from "@/hooks/useFeatureUserMetrics";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

type Props = {
  featureName: string;
};

const RolloutHistoryPanel = ({ featureName }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: history, isLoading } = useRolloutHistory(featureName);

  if (isLoading) return null;
  if (!history || history.length === 0) return null;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full justify-between text-xs h-8"
        >
          <div className="flex items-center gap-2">
            <History className="h-3 w-3" />
            Rollout History ({history.length})
          </div>
          {isOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </Button>
      </CollapsibleTrigger>
      
      <CollapsibleContent className="space-y-2 mt-2">
        <div className="max-h-48 overflow-y-auto space-y-1">
          {history.map((entry: any) => (
            <div 
              key={entry.id} 
              className="p-2 rounded border bg-muted/30 text-xs"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={entry.new_percentage > entry.old_percentage ? "default" : "destructive"}
                    className="text-xs px-1 py-0"
                  >
                    {entry.old_percentage}% → {entry.new_percentage}%
                  </Badge>
                  {entry.user_impact_estimate > 0 && (
                    <span className="text-muted-foreground">
                      ~{entry.user_impact_estimate} users affected
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {new Date(entry.created_at).toLocaleDateString()}
                </div>
              </div>
              {entry.change_reason && (
                <p className="text-muted-foreground mt-1">{entry.change_reason}</p>
              )}
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default RolloutHistoryPanel;