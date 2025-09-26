
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Save, Plus, Trash2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { planFormSchema, type PlanFormData, FEATURE_TEMPLATES, type FeatureTemplate } from "./PlanFormSchema";
import type { SubscriptionPlan } from "@/services/subscriptionService";

interface PlanFormProps {
  editingPlan: Partial<SubscriptionPlan> | null;
  onSave: (data: PlanFormData) => Promise<void>;
  onDelete: (planId: string) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  existingPlans: SubscriptionPlan[];
}

export const PlanForm: React.FC<PlanFormProps> = ({
  editingPlan,
  onSave,
  onDelete,
  onCancel,
  isLoading,
  existingPlans
}) => {
  const { toast } = useToast();
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<PlanFormData>({
    resolver: zodResolver(planFormSchema),
    defaultValues: {
      name: "",
      description: "",
      price_cents: 0,
      billing_interval: "month",
      features: [],
      is_active: true,
      is_popular: false,
      sort_order: 1,
    }
  });

  // Update form when editing plan changes
  useEffect(() => {
    if (editingPlan) {
      reset({
        id: editingPlan.id,
        name: editingPlan.name || "",
        description: editingPlan.description || "",
        price_cents: editingPlan.price_cents || 0,
        billing_interval: editingPlan.billing_interval as "month" | "year" || "month",
        features: editingPlan.features || [],
        is_active: editingPlan.is_active ?? true,
        is_popular: editingPlan.is_popular ?? false,
        sort_order: editingPlan.sort_order || 1,
        stripe_price_id: editingPlan.stripe_price_id || "",
      });
    } else {
      reset({
        name: "",
        description: "",
        price_cents: 0,
        billing_interval: "month",
        features: [],
        is_active: true,
        is_popular: false,
        sort_order: Math.max(...existingPlans.map(p => p.sort_order || 0), 0) + 1,
      });
    }
  }, [editingPlan, existingPlans, reset]);

  const watchedFeatures = watch("features");
  const watchedBillingInterval = watch("billing_interval");
  const watchedIsPopular = watch("is_popular");

  const handleFormSubmit = async (data: PlanFormData) => {
    try {
      // Validate business rules
      if (data.is_popular) {
        const existingPopular = existingPlans.find(
          p => p.is_popular && 
               p.billing_interval === data.billing_interval && 
               p.id !== data.id
        );
        if (existingPopular) {
          toast({
            title: "Validation Error",
            description: `Only one ${data.billing_interval}ly plan can be marked as most popular. "${existingPopular.name}" is already popular.`,
            variant: "destructive"
          });
          return;
        }
      }

      await onSave(data);
      if (!editingPlan) {
        reset(); // Clear form after successful creation
      }
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  const handleDelete = async () => {
    if (!editingPlan?.id) return;
    
    if (!window.confirm(`Are you sure you want to delete "${editingPlan.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await onDelete(editingPlan.id);
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const applyFeatureTemplate = (template: FeatureTemplate) => {
    setValue("features", FEATURE_TEMPLATES[template]);
    toast({
      title: "Template Applied",
      description: `Applied ${template} feature template`,
    });
  };

  const addCustomFeature = () => {
    const feature = prompt("Enter a custom feature:");
    if (feature && feature.trim()) {
      const currentFeatures = watchedFeatures || [];
      if (!currentFeatures.includes(feature.trim())) {
        setValue("features", [...currentFeatures, feature.trim()]);
      }
    }
  };

  const removeFeature = (index: number) => {
    const currentFeatures = watchedFeatures || [];
    setValue("features", currentFeatures.filter((_, i) => i !== index));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            {editingPlan ? `Edit Plan: ${editingPlan.name}` : "Create New Plan"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Plan Name *</Label>
                <Input
                  id="name"
                  {...register("name")}
                  placeholder="e.g., Premium, Enterprise"
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="billing_interval">Billing Interval *</Label>
                <Select
                  value={watchedBillingInterval}
                  onValueChange={(value) => setValue("billing_interval", value as "month" | "year")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="month">Monthly</SelectItem>
                    <SelectItem value="year">Yearly</SelectItem>
                  </SelectContent>
                </Select>
                {errors.billing_interval && (
                  <p className="text-red-600 text-sm mt-1">{errors.billing_interval.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="price_cents">Price (USD) *</Label>
                <Input
                  id="price_cents"
                  type="number"
                  step="0.01"
                  {...register("price_cents", {
                    setValueAs: (v) => Math.round(parseFloat(v) * 100)
                  })}
                  placeholder="9.99"
                />
                {errors.price_cents && (
                  <p className="text-red-600 text-sm mt-1">{errors.price_cents.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="sort_order">Sort Order *</Label>
                <Input
                  id="sort_order"
                  type="number"
                  {...register("sort_order", {
                    setValueAs: (v) => parseInt(v, 10)
                  })}
                  placeholder="1"
                />
                {errors.sort_order && (
                  <p className="text-red-600 text-sm mt-1">{errors.sort_order.message}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Brief description of this plan..."
                className="resize-none"
              />
              {errors.description && (
                <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>
              )}
            </div>

            {/* Features Section */}
            <div>
              <Label>Features</Label>
              <div className="space-y-3 mt-2">
                {/* Feature Templates */}
                <div className="flex gap-2 flex-wrap">
                  <Label className="text-sm font-medium">Quick Templates:</Label>
                  {(Object.keys(FEATURE_TEMPLATES) as FeatureTemplate[]).map((template) => (
                    <Button
                      key={template}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => applyFeatureTemplate(template)}
                      className="capitalize"
                    >
                      {template}
                    </Button>
                  ))}
                </div>

                {/* Current Features */}
                <div className="flex flex-wrap gap-2">
                  {watchedFeatures?.map((feature, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="flex items-center gap-1 px-3 py-1"
                    >
                      {feature}
                      <button
                        type="button"
                        onClick={() => removeFeature(index)}
                        className="ml-1 hover:text-red-600"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>

                {/* Add Custom Feature */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addCustomFeature}
                  className="w-fit"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Custom Feature
                </Button>
              </div>
            </div>

            {/* Plan Settings */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  id="is_active"
                  checked={watch("is_active")}
                  onCheckedChange={(checked) => setValue("is_active", checked)}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
              
              <div className="flex items-center gap-2">
                <Switch
                  id="is_popular"
                  checked={watchedIsPopular}
                  onCheckedChange={(checked) => setValue("is_popular", checked)}
                />
                <Label htmlFor="is_popular">Most Popular</Label>
                {watchedIsPopular && (
                  <Badge variant="default" className="ml-2">
                    Featured
                  </Badge>
                )}
              </div>
            </div>

            {/* Stripe Integration */}
            <div>
              <Label htmlFor="stripe_price_id">Stripe Price ID (Optional)</Label>
              <Input
                id="stripe_price_id"
                {...register("stripe_price_id")}
                placeholder="price_1234567890"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-4 border-t">
              <Button 
                type="submit" 
                disabled={isSubmitting || isLoading}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {editingPlan ? "Update Plan" : "Create Plan"}
              </Button>
              
              {editingPlan && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isSubmitting || isLoading}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Plan
                </Button>
              )}
              
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting || isLoading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};
