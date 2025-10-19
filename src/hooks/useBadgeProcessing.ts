import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ProcessingStatus {
  isProcessing: boolean;
  progress: number;
  completed: number;
  total: number;
  errors: string[];
}

interface ProcessingResult {
  success: boolean;
  processed: number;
  total: number;
  errors: string[];
  badges: { original: string; processed: string; status: string }[];
}

export const useBadgeProcessing = () => {
  const { toast } = useToast();
  const [status, setStatus] = useState<ProcessingStatus>({
    isProcessing: false,
    progress: 0,
    completed: 0,
    total: 0,
    errors: [],
  });

  const processTestBatch = async () => {
    setStatus({
      isProcessing: true,
      progress: 0,
      completed: 0,
      total: 10,
      errors: [],
    });

    try {
      const { data, error } = await supabase.functions.invoke(
        "process-badge-backgrounds",
        {
          body: { action: "test" },
        }
      );

      if (error) throw error;

      const result = data as ProcessingResult;
      
      setStatus({
        isProcessing: false,
        progress: 100,
        completed: result.processed,
        total: result.total,
        errors: result.errors,
      });

      if (result.success) {
        toast({
          title: "Test Batch Complete",
          description: `Successfully processed ${result.processed} badges`,
        });
      } else {
        toast({
          title: "Test Batch Completed with Errors",
          description: `Processed ${result.processed}/${result.total} badges. ${result.errors.length} errors.`,
          variant: "destructive",
        });
      }

      return result;
    } catch (error) {
      console.error("Test batch processing error:", error);
      setStatus((prev) => ({
        ...prev,
        isProcessing: false,
      }));
      toast({
        title: "Processing Failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const processAllBadges = async () => {
    setStatus({
      isProcessing: true,
      progress: 0,
      completed: 0,
      total: 351,
      errors: [],
    });

    try {
      const { data, error } = await supabase.functions.invoke(
        "process-badge-backgrounds",
        {
          body: { action: "process_all" },
        }
      );

      if (error) throw error;

      const result = data as ProcessingResult;
      
      setStatus({
        isProcessing: false,
        progress: 100,
        completed: result.processed,
        total: result.total,
        errors: result.errors,
      });

      if (result.success) {
        toast({
          title: "Processing Complete",
          description: `Successfully processed all ${result.processed} badges`,
        });
      } else {
        toast({
          title: "Processing Completed with Errors",
          description: `Processed ${result.processed}/${result.total} badges. ${result.errors.length} errors.`,
          variant: "destructive",
        });
      }

      return result;
    } catch (error) {
      console.error("Badge processing error:", error);
      setStatus((prev) => ({
        ...prev,
        isProcessing: false,
      }));
      toast({
        title: "Processing Failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    status,
    processTestBatch,
    processAllBadges,
  };
};
