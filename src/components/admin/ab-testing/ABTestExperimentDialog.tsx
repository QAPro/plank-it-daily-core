import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, Target, TrendingUp } from "lucide-react";
import { ABTestExperiment } from "@/services/abTestingService";
import { useFeatureFlags } from "@/hooks/useFeatureFlags";

interface ABTestExperimentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  experiment?: ABTestExperiment | null;
  onSave: (experiment: Partial<ABTestExperiment>) => void;
  isLoading: boolean;
}

export const ABTestExperimentDialog = ({
  open,
  onOpenChange,
  experiment,
  onSave,
  isLoading
}: ABTestExperimentDialogProps) => {
  const { flags } = useFeatureFlags();
  const [formData, setFormData] = useState<Partial<ABTestExperiment>>({
    experiment_name: experiment?.experiment_name || "",
    experiment_description: experiment?.experiment_description || "",
    hypothesis: experiment?.hypothesis || "",
    success_metric: experiment?.success_metric || "button_click",
    traffic_split: experiment?.traffic_split || { control: 50, variant_a: 50 },
    minimum_sample_size: experiment?.minimum_sample_size || 1000,
    significance_threshold: experiment?.significance_threshold || 0.95,
    test_duration_days: experiment?.test_duration_days || 14,
    feature_flag_id: experiment?.feature_flag_id || "",
  });

  const [trafficSplit, setTrafficSplit] = useState(
    (experiment?.traffic_split?.control as number) || 50
  );

  const handleSave = () => {
    onSave({
      ...formData,
      traffic_split: { 
        control: trafficSplit, 
        variant_a: 100 - trafficSplit 
      }
    });
  };

  const calculateSampleSize = () => {
    const baselineRate = 0.1; // 10% baseline conversion rate
    const minEffect = 0.2; // 20% minimum detectable effect
    const alpha = 1 - formData.significance_threshold!;
    const beta = 0.2; // 80% power
    
    // Simplified calculation
    const z_alpha = alpha <= 0.05 ? 1.96 : 2.58;
    const z_beta = 0.84;
    
    const p1 = baselineRate;
    const p2 = baselineRate * (1 + minEffect);
    const p_pooled = (p1 + p2) / 2;
    
    const numerator = Math.pow(z_alpha + z_beta, 2) * 2 * p_pooled * (1 - p_pooled);
    const denominator = Math.pow(p2 - p1, 2);
    
    return Math.ceil(numerator / denominator);
  };

  const successMetrics = [
    { value: "button_click", label: "Button Click" },
    { value: "page_view", label: "Page View" },
    { value: "conversion", label: "Conversion" },
    { value: "engagement", label: "Engagement" },
    { value: "retention", label: "Retention" },
    { value: "signup", label: "Sign Up" },
    { value: "purchase", label: "Purchase" },
    { value: "feature_usage", label: "Feature Usage" },
    { value: "time_spent", label: "Time Spent" },
    { value: "task_completion", label: "Task Completion" }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            {experiment ? "Edit A/B Test Experiment" : "Create A/B Test Experiment"}
          </DialogTitle>
          <DialogDescription>
            Set up a controlled experiment to test different variants of your feature
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Configuration */}
          <div className="lg:col-span-2 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Experiment Name</Label>
              <Input
                id="name"
                placeholder="e.g., Homepage CTA Button Color"
                value={formData.experiment_name}
                onChange={(e) => setFormData({ ...formData, experiment_name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what this experiment tests..."
                value={formData.experiment_description}
                onChange={(e) => setFormData({ ...formData, experiment_description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hypothesis">Hypothesis</Label>
              <Textarea
                id="hypothesis"
                placeholder="e.g., Changing the CTA button from blue to green will increase click-through rate by 20%"
                value={formData.hypothesis}
                onChange={(e) => setFormData({ ...formData, hypothesis: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="feature">Linked Feature Flag</Label>
                <Select
                  value={formData.feature_flag_id || ""}
                  onValueChange={(value) => setFormData({ ...formData, feature_flag_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select feature flag" />
                  </SelectTrigger>
                  <SelectContent>
                    {flags.map((flag) => (
                      <SelectItem key={flag.id} value={flag.id}>
                        {flag.feature_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="success-metric">Success Metric</Label>
                <Select
                  value={formData.success_metric}
                  onValueChange={(value) => setFormData({ ...formData, success_metric: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select metric" />
                  </SelectTrigger>
                  <SelectContent>
                    {successMetrics.map((metric) => (
                      <SelectItem key={metric.value} value={metric.value}>
                        {metric.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Traffic Split</Label>
              <div className="space-y-4">
                <div className="px-3">
                  <Slider
                    value={[trafficSplit]}
                    onValueChange={([value]) => setTrafficSplit(value)}
                    max={90}
                    min={10}
                    step={5}
                    className="w-full"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-muted-foreground">{trafficSplit}%</div>
                        <div className="text-sm text-muted-foreground">Control</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{100 - trafficSplit}%</div>
                        <div className="text-sm text-muted-foreground">Variant A</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>

          {/* Statistical Configuration */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calculator className="h-4 w-4" />
                  Statistical Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sample-size">Minimum Sample Size</Label>
                  <Input
                    id="sample-size"
                    type="number"
                    value={formData.minimum_sample_size}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      minimum_sample_size: parseInt(e.target.value) || 1000 
                    })}
                  />
                  <div className="text-xs text-muted-foreground">
                    Recommended: {calculateSampleSize().toLocaleString()}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="significance">Significance Level</Label>
                  <Select
                    value={formData.significance_threshold?.toString()}
                    onValueChange={(value) => setFormData({ 
                      ...formData, 
                      significance_threshold: parseFloat(value) 
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.90">90% (p &lt; 0.10)</SelectItem>
                      <SelectItem value="0.95">95% (p &lt; 0.05)</SelectItem>
                      <SelectItem value="0.99">99% (p &lt; 0.01)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Test Duration (Days)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.test_duration_days}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      test_duration_days: parseInt(e.target.value) || 14 
                    })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Expected Impact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground space-y-2">
                  <div>• Duration: {formData.test_duration_days} days</div>
                  <div>• Sample size: {formData.minimum_sample_size?.toLocaleString()} users</div>
                  <div>• Confidence: {((formData.significance_threshold || 0.95) * 100).toFixed(0)}%</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isLoading || !formData.experiment_name || !formData.success_metric}
          >
            {isLoading ? "Saving..." : experiment ? "Update Experiment" : "Create Experiment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};