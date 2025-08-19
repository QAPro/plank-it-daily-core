
import React, { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { subscriptionService, SubscriptionPlan } from "@/services/subscriptionService";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Plus, RefreshCw, Search, Filter, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

import { PlanForm } from "./plan-manager/PlanForm";
import { DraggablePlanList } from "./plan-manager/DraggablePlanList";
import { BulkOperationsBar } from "./plan-manager/BulkOperationsBar";
import { PlanFormData } from "./plan-manager/PlanFormSchema";

const EnhancedPlanManager: React.FC = () => {
  const { toast } = useToast();
  const qc = useQueryClient();

  // State
  const [editingPlan, setEditingPlan] = useState<Partial<SubscriptionPlan> | null>(null);
  const [selectedPlans, setSelectedPlans] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);

  // Data fetching
  const { data: plans = [], isLoading } = useQuery({
    queryKey: ["admin", "subscription-plans", "all"],
    queryFn: () => subscriptionService.getAllPlans(),
    staleTime: 30_000,
  });

  // Mutations
  const saveMutation = useMutation({
    mutationFn: (data: PlanFormData) => subscriptionService.upsertPlan(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "subscription-plans", "all"] });
      toast({ title: "Success", description: "Plan saved successfully." });
      setEditingPlan(null);
      setShowForm(false);
    },
    meta: {
      onError: (err: unknown) => {
        console.error("[EnhancedPlanManager] save error", err);
        toast({ title: "Save failed", description: "Could not save plan.", variant: "destructive" });
      },
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => subscriptionService.deletePlan(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "subscription-plans", "all"] });
      toast({ title: "Deleted", description: "Plan deleted successfully." });
      setEditingPlan(null);
      setShowForm(false);
    },
    meta: {
      onError: (err: unknown) => {
        console.error("[EnhancedPlanManager] delete error", err);
        toast({ title: "Delete failed", description: "Could not delete plan.", variant: "destructive" });
      },
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async (reorderedPlans: SubscriptionPlan[]) => {
      // Update sort_order for each plan
      await Promise.all(
        reorderedPlans.map(plan => 
          subscriptionService.upsertPlan({ ...plan, sort_order: plan.sort_order })
        )
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "subscription-plans", "all"] });
    },
  });

  // Handlers
  const handleCreateNew = () => {
    setEditingPlan(null);
    setShowForm(true);
  };

  const handleEditPlan = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setEditingPlan(null);
    setShowForm(false);
  };

  const handlePlanSelect = useCallback((planId: string, selected: boolean) => {
    setSelectedPlans(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(planId);
      } else {
        newSet.delete(planId);
      }
      return newSet;
    });
  }, []);

  const handleClearSelection = () => {
    setSelectedPlans(new Set());
  };

  // Wrapper functions to match expected Promise<void> signature
  const handleSavePlan = async (data: PlanFormData): Promise<void> => {
    await saveMutation.mutateAsync(data);
  };

  const handleDeletePlan = async (planId: string): Promise<void> => {
    await deleteMutation.mutateAsync(planId);
  };

  // Bulk operations
  const handleBulkActivate = async () => {
    const selectedPlanObjects = plans.filter(p => selectedPlans.has(p.id));
    await Promise.all(
      selectedPlanObjects.map(plan => 
        subscriptionService.upsertPlan({ ...plan, is_active: true })
      )
    );
    qc.invalidateQueries({ queryKey: ["admin", "subscription-plans", "all"] });
    toast({ title: "Success", description: `Activated ${selectedPlans.size} plans` });
    setSelectedPlans(new Set());
  };

  const handleBulkDeactivate = async () => {
    const selectedPlanObjects = plans.filter(p => selectedPlans.has(p.id));
    await Promise.all(
      selectedPlanObjects.map(plan => 
        subscriptionService.upsertPlan({ ...plan, is_active: false })
      )
    );
    qc.invalidateQueries({ queryKey: ["admin", "subscription-plans", "all"] });
    toast({ title: "Success", description: `Deactivated ${selectedPlans.size} plans` });
    setSelectedPlans(new Set());
  };

  const handleBulkDelete = async () => {
    await Promise.all(
      Array.from(selectedPlans).map(planId => subscriptionService.deletePlan(planId))
    );
    qc.invalidateQueries({ queryKey: ["admin", "subscription-plans", "all"] });
    toast({ title: "Success", description: `Deleted ${selectedPlans.size} plans` });
    setSelectedPlans(new Set());
  };

  const handleBulkDuplicate = async () => {
    const selectedPlanObjects = plans.filter(p => selectedPlans.has(p.id));
    await Promise.all(
      selectedPlanObjects.map(plan => {
        const duplicatedPlan = {
          ...plan,
          id: undefined, // Remove ID to create new
          name: `${plan.name} (Copy)`,
          is_popular: false, // Don't duplicate popular status
          sort_order: (plan.sort_order || 0) + 100 // Place at end
        };
        return subscriptionService.upsertPlan(duplicatedPlan);
      })
    );
    qc.invalidateQueries({ queryKey: ["admin", "subscription-plans", "all"] });
    toast({ title: "Success", description: `Duplicated ${selectedPlans.size} plans` });
    setSelectedPlans(new Set());
  };

  const handleBulkSetPopular = async (isPopular: boolean) => {
    const selectedPlanObjects = plans.filter(p => selectedPlans.has(p.id));
    
    // Validate: only one popular plan per billing interval
    if (isPopular) {
      const billingIntervals = new Set(selectedPlanObjects.map(p => p.billing_interval));
      for (const interval of billingIntervals) {
        const existingPopular = plans.find(p => 
          p.is_popular && 
          p.billing_interval === interval && 
          !selectedPlans.has(p.id)
        );
        if (existingPopular) {
          toast({
            title: "Validation Error",
            description: `Cannot set multiple ${interval}ly plans as popular. "${existingPopular.name}" is already popular.`,
            variant: "destructive"
          });
          return;
        }
      }
    }

    await Promise.all(
      selectedPlanObjects.map(plan => 
        subscriptionService.upsertPlan({ ...plan, is_popular: isPopular })
      )
    );
    qc.invalidateQueries({ queryKey: ["admin", "subscription-plans", "all"] });
    toast({ 
      title: "Success", 
      description: `${isPopular ? 'Set' : 'Removed'} popular status for ${selectedPlans.size} plans` 
    });
    setSelectedPlans(new Set());
  };

  const handleExportPlans = async () => {
    const selectedPlanObjects = plans.filter(p => selectedPlans.has(p.id));
    const dataStr = JSON.stringify(selectedPlanObjects, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'subscription-plans.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast({ title: "Success", description: `Exported ${selectedPlans.size} plans` });
  };

  const handleImportPlans = async () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    
    fileInput.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      try {
        const text = await file.text();
        const importedPlans = JSON.parse(text);
        
        if (!Array.isArray(importedPlans)) {
          throw new Error('Invalid file format');
        }
        
        await Promise.all(
          importedPlans.map(plan => {
            const { id, ...planData } = plan; // Remove ID to create new
            return subscriptionService.upsertPlan(planData);
          })
        );
        
        qc.invalidateQueries({ queryKey: ["admin", "subscription-plans", "all"] });
        toast({ title: "Success", description: `Imported ${importedPlans.length} plans` });
      } catch (error) {
        toast({ 
          title: "Import failed", 
          description: "Could not parse file or save plans", 
          variant: "destructive" 
        });
      }
    };
    
    fileInput.click();
  };

  // Filter plans based on search
  const filteredPlans = plans.filter(plan =>
    plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plan.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plan.features?.some(feature => 
      feature.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                Enhanced Plan Manager
              </CardTitle>
              <CardDescription>
                Manage subscription plans with drag-and-drop reordering, bulk operations, and advanced features
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => qc.invalidateQueries({ queryKey: ["admin", "subscription-plans", "all"] })}>
                <RefreshCw className="w-4 h-4 mr-1" />
                Refresh
              </Button>
              <Button size="sm" onClick={handleCreateNew}>
                <Plus className="w-4 h-4 mr-1" />
                New Plan
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Search and Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search plans, features..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-1" />
              Filters
            </Button>
          </div>

          {/* Bulk Operations Bar */}
          <BulkOperationsBar
            selectedCount={selectedPlans.size}
            onClearSelection={handleClearSelection}
            onBulkActivate={handleBulkActivate}
            onBulkDeactivate={handleBulkDeactivate}
            onBulkDelete={handleBulkDelete}
            onBulkDuplicate={handleBulkDuplicate}
            onExportPlans={handleExportPlans}
            onImportPlans={handleImportPlans}
            onBulkSetPopular={handleBulkSetPopular}
            isLoading={saveMutation.isPending || deleteMutation.isPending}
          />

          {/* Create/Edit Form */}
          {showForm && (
            <PlanForm
              editingPlan={editingPlan}
              onSave={handleSavePlan}
              onDelete={handleDeletePlan}
              onCancel={handleCancelForm}
              isLoading={saveMutation.isPending || deleteMutation.isPending}
              existingPlans={plans}
            />
          )}

          {/* Plans List */}
          {isLoading ? (
            <div className="text-sm text-muted-foreground py-8 text-center">
              Loading plans...
            </div>
          ) : (
            <DraggablePlanList
              plans={filteredPlans}
              selectedPlans={selectedPlans}
              onPlanSelect={handlePlanSelect}
              onPlanEdit={handleEditPlan}
              onReorder={reorderMutation.mutateAsync}
              isReordering={reorderMutation.isPending}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedPlanManager;
