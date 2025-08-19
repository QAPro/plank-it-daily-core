
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Eye, 
  EyeOff, 
  Trash2, 
  Copy, 
  Download, 
  Upload,
  Star,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface BulkOperationsBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkActivate: () => Promise<void>;
  onBulkDeactivate: () => Promise<void>;
  onBulkDelete: () => Promise<void>;
  onBulkDuplicate: () => Promise<void>;
  onExportPlans: () => Promise<void>;
  onImportPlans: () => Promise<void>;
  onBulkSetPopular: (isPopular: boolean) => Promise<void>;
  isLoading: boolean;
}

export const BulkOperationsBar: React.FC<BulkOperationsBarProps> = ({
  selectedCount,
  onClearSelection,
  onBulkActivate,
  onBulkDeactivate, 
  onBulkDelete,
  onBulkDuplicate,
  onExportPlans,
  onImportPlans,
  onBulkSetPopular,
  isLoading
}) => {
  const [bulkAction, setBulkAction] = React.useState<string>("");

  const handleBulkAction = async () => {
    if (!bulkAction) return;

    try {
      switch (bulkAction) {
        case "activate":
          await onBulkActivate();
          break;
        case "deactivate":
          await onBulkDeactivate();
          break;
        case "delete":
          if (window.confirm(`Delete ${selectedCount} selected plans? This cannot be undone.`)) {
            await onBulkDelete();
          }
          break;
        case "duplicate":
          await onBulkDuplicate();
          break;
        case "set-popular":
          await onBulkSetPopular(true);
          break;
        case "unset-popular":
          await onBulkSetPopular(false);
          break;
      }
    } catch (error) {
      console.error("Bulk action error:", error);
    } finally {
      setBulkAction("");
    }
  };

  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.2 }}
          className="sticky top-0 z-40 mb-4"
        >
          <Card className="border-blue-200 bg-blue-50/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="bg-blue-600">
                      {selectedCount} selected
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onClearSelection}
                      className="h-6 w-6 p-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Select value={bulkAction} onValueChange={setBulkAction}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Choose action..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="activate">
                          <div className="flex items-center gap-2">
                            <Eye className="w-4 h-4" />
                            Activate Plans
                          </div>
                        </SelectItem>
                        <SelectItem value="deactivate">
                          <div className="flex items-center gap-2">
                            <EyeOff className="w-4 h-4" />
                            Deactivate Plans
                          </div>
                        </SelectItem>
                        <SelectItem value="set-popular">
                          <div className="flex items-center gap-2">
                            <Star className="w-4 h-4" />
                            Mark as Popular
                          </div>
                        </SelectItem>
                        <SelectItem value="unset-popular">
                          <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 opacity-50" />
                            Remove Popular
                          </div>
                        </SelectItem>
                        <SelectItem value="duplicate">
                          <div className="flex items-center gap-2">
                            <Copy className="w-4 h-4" />
                            Duplicate Plans
                          </div>
                        </SelectItem>
                        <SelectItem value="delete">
                          <div className="flex items-center gap-2 text-red-600">
                            <Trash2 className="w-4 h-4" />
                            Delete Plans
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      onClick={handleBulkAction}
                      disabled={!bulkAction || isLoading}
                      size="sm"
                    >
                      Apply
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onExportPlans}
                    disabled={isLoading}
                    className="flex items-center gap-1"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onImportPlans}
                    disabled={isLoading}
                    className="flex items-center gap-1"
                  >
                    <Upload className="w-4 h-4" />
                    Import
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
