
import React, { useState } from "react";
import { motion, Reorder } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { GripVertical, Edit, Eye, EyeOff, Star, Crown } from "lucide-react";
import type { SubscriptionPlan } from "@/services/subscriptionService";

interface DraggablePlanListProps {
  plans: SubscriptionPlan[];
  selectedPlans: Set<string>;
  onPlanSelect: (planId: string, selected: boolean) => void;
  onPlanEdit: (plan: SubscriptionPlan) => void;
  onReorder: (newOrder: SubscriptionPlan[]) => Promise<void>;
  isReordering: boolean;
}

export const DraggablePlanList: React.FC<DraggablePlanListProps> = ({
  plans,
  selectedPlans,
  onPlanSelect,
  onPlanEdit,
  onReorder,
  isReordering
}) => {
  const { toast } = useToast();
  const [draggedItems, setDraggedItems] = useState(plans);

  const handleReorder = async (newOrder: SubscriptionPlan[]) => {
    setDraggedItems(newOrder);
    
    // Update sort_order for each plan based on new position
    const updatedPlans = newOrder.map((plan, index) => ({
      ...plan,
      sort_order: index + 1
    }));

    try {
      await onReorder(updatedPlans);
      toast({
        title: "Plans Reordered",
        description: "Plan order updated successfully"
      });
    } catch (error) {
      console.error("Reorder error:", error);
      toast({
        title: "Reorder Failed", 
        description: "Could not update plan order",
        variant: "destructive"
      });
      // Reset to original order on error
      setDraggedItems(plans);
    }
  };

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
  };

  const getPlanIcon = (plan: SubscriptionPlan) => {
    if (plan.name.toLowerCase().includes('pro') || plan.name.toLowerCase().includes('enterprise')) {
      return <Crown className="w-4 h-4 text-purple-600" />;
    }
    if (plan.is_popular) {
      return <Star className="w-4 h-4 text-orange-500" />;
    }
    return null;
  };

  return (
    <div className="space-y-3">
      <Reorder.Group
        axis="y"
        values={draggedItems}
        onReorder={handleReorder}
        className="space-y-3"
      >
        {draggedItems.map((plan) => (
          <Reorder.Item
            key={plan.id}
            value={plan}
            className="cursor-grab active:cursor-grabbing"
            whileDrag={{ 
              scale: 1.02, 
              boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
              zIndex: 50 
            }}
            transition={{ duration: 0.2 }}
          >
            <Card className={`
              ${selectedPlans.has(plan.id) ? 'ring-2 ring-blue-500 bg-blue-50/50' : ''}
              ${!plan.is_active ? 'opacity-60' : ''}
              hover:shadow-md transition-all duration-200
            `}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* Drag Handle */}
                  <div className="flex items-center gap-2">
                    <GripVertical 
                      className="w-5 h-5 text-gray-400 hover:text-gray-600 cursor-grab" 
                    />
                    <Checkbox
                      checked={selectedPlans.has(plan.id)}
                      onCheckedChange={(checked) => onPlanSelect(plan.id, !!checked)}
                    />
                  </div>

                  {/* Plan Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getPlanIcon(plan)}
                      <h3 className="font-semibold text-lg">{plan.name}</h3>
                      
                      {/* Badges */}
                      <div className="flex gap-1">
                        {plan.is_popular && (
                          <Badge variant="default" className="bg-orange-500 text-white">
                            Most Popular
                          </Badge>
                        )}
                        {!plan.is_active && (
                          <Badge variant="secondary" className="bg-gray-500 text-white">
                            Inactive
                          </Badge>
                        )}
                        <Badge variant="outline">
                          {plan.billing_interval?.toUpperCase()}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <span className="font-medium text-lg text-gray-800">
                          {formatPrice(plan.price_cents)}
                        </span>
                        <span>per {plan.billing_interval}</span>
                      </div>
                      
                      {plan.description && (
                        <span className="text-gray-500 truncate max-w-xs">
                          {plan.description}
                        </span>
                      )}
                      
                      <div className="flex items-center gap-1 text-xs">
                        <span>Order:</span>
                        <Badge variant="outline" className="text-xs">
                          {plan.sort_order || 0}
                        </Badge>
                      </div>
                    </div>

                    {/* Features Preview */}
                    {plan.features && plan.features.length > 0 && (
                      <div className="mt-2 flex gap-1 flex-wrap">
                        {plan.features.slice(0, 3).map((feature, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                        {plan.features.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{plan.features.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onPlanEdit(plan)}
                      className="flex items-center gap-1"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </Button>
                    
                    <div className="flex items-center">
                      {plan.is_active ? (
                        <Eye className="w-4 h-4 text-green-600" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Reorder.Item>
        ))}
      </Reorder.Group>

      {draggedItems.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 text-gray-500"
        >
          <div className="text-lg font-medium mb-2">No plans found</div>
          <div className="text-sm">Create your first subscription plan to get started</div>
        </motion.div>
      )}
    </div>
  );
};
