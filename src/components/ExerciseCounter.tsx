import { motion } from "framer-motion";
import { ChevronDown, Grid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ExerciseCounterProps {
  totalExercises: number;
  filteredCount: number;
  isCompact: boolean;
  onToggleView: () => void;
  hasScrollableContent: boolean;
}

export const ExerciseCounter = ({ 
  totalExercises, 
  filteredCount, 
  isCompact, 
  onToggleView,
  hasScrollableContent 
}: ExerciseCounterProps) => {
  const isFiltered = filteredCount < totalExercises;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between mb-4"
    >
      <div className="flex items-center gap-3">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            {totalExercises} Plank Variations Available
          </h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {isFiltered ? (
              <>
                <span>Showing {filteredCount} of {totalExercises} exercises</span>
                <Badge variant="secondary" className="text-xs">Filtered</Badge>
              </>
            ) : (
              <span>All exercises shown</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleView}
          className="flex items-center gap-2"
        >
          {isCompact ? (
            <>
              <List className="w-4 h-4" />
              Detailed
            </>
          ) : (
            <>
              <Grid className="w-4 h-4" />
              Compact
            </>
          )}
        </Button>
      </div>

      {hasScrollableContent && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="absolute right-6 top-1/2 -translate-y-1/2 text-muted-foreground/60 pointer-events-none"
        >
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs">Scroll for more</span>
            <ChevronDown className="w-4 h-4 animate-bounce" />
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};