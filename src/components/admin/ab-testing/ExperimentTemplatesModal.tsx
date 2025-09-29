import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  MousePointer, 
  DollarSign, 
  Users, 
  Zap,
  Clock,
  Target,
  TrendingUp
} from "lucide-react";
import { ExperimentTemplate, enhancedABTestingService } from "@/services/enhancedABTestingService";
import { ABTestExperiment } from "@/services/abTestingService";

interface ExperimentTemplatesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTemplate: (experiment: Partial<ABTestExperiment>) => void;
}

export const ExperimentTemplatesModal = ({
  open,
  onOpenChange,
  onSelectTemplate
}: ExperimentTemplatesModalProps) => {
  const [templates] = useState<ExperimentTemplate[]>([
    {
      id: 'button-optimization',
      name: 'Button Optimization',
      description: 'Test different button designs, colors, or text',
      category: 'UI/UX',
      success_metric: 'button_click',
      hypothesis_template: 'Changing the button [element] from [current] to [variant] will increase click-through rate because [reasoning]',
      recommended_sample_size: 2000,
      recommended_duration_days: 14,
      traffic_split: { control: 50, variant_a: 50 }
    },
    {
      id: 'pricing-test',
      name: 'Pricing Test',
      description: 'Test different pricing strategies or displays',
      category: 'Revenue',
      success_metric: 'purchase',
      hypothesis_template: 'Changing the price from [current] to [variant] will [increase/decrease] conversion rate by [expected]% because [reasoning]',
      recommended_sample_size: 5000,
      recommended_duration_days: 21,
      traffic_split: { control: 50, variant_a: 50 }
    },
    {
      id: 'onboarding-flow',
      name: 'Onboarding Flow',
      description: 'Test different user onboarding experiences',
      category: 'User Experience',
      success_metric: 'task_completion',
      hypothesis_template: 'Modifying the onboarding flow by [change] will improve completion rate because [reasoning]',
      recommended_sample_size: 3000,
      recommended_duration_days: 28,
      traffic_split: { control: 50, variant_a: 50 }
    },
    {
      id: 'feature-adoption',
      name: 'Feature Adoption',
      description: 'Test ways to increase adoption of new features',
      category: 'Product',
      success_metric: 'feature_usage',
      hypothesis_template: 'Adding [feature_hint/tutorial/prompt] will increase feature adoption by [expected]% because [reasoning]',
      recommended_sample_size: 4000,
      recommended_duration_days: 30,
      traffic_split: { control: 50, variant_a: 50 }
    }
  ]);

  const [selectedTemplate, setSelectedTemplate] = useState<ExperimentTemplate | null>(null);
  const [customization, setCustomization] = useState({
    experiment_name: '',
    hypothesis: '',
    minimum_sample_size: 0,
    test_duration_days: 0
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'UI/UX':
        return <MousePointer className="h-4 w-4" />;
      case 'Revenue':
        return <DollarSign className="h-4 w-4" />;
      case 'User Experience':
        return <Users className="h-4 w-4" />;
      case 'Product':
        return <Zap className="h-4 w-4" />;
      default:
        return <Target className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'UI/UX':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Revenue':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'User Experience':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'Product':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const handleTemplateSelect = (template: ExperimentTemplate) => {
    setSelectedTemplate(template);
    setCustomization({
      experiment_name: template.name,
      hypothesis: template.hypothesis_template,
      minimum_sample_size: template.recommended_sample_size,
      test_duration_days: template.recommended_duration_days
    });
  };

  const handleCreateFromTemplate = () => {
    if (!selectedTemplate) return;

    const experiment: Partial<ABTestExperiment> = {
      experiment_name: customization.experiment_name,
      experiment_description: selectedTemplate.description,
      hypothesis: customization.hypothesis,
      success_metric: selectedTemplate.success_metric,
      traffic_split: selectedTemplate.traffic_split,
      minimum_sample_size: customization.minimum_sample_size,
      test_duration_days: customization.test_duration_days,
      significance_threshold: 0.95,
      status: 'draft'
    };

    onSelectTemplate(experiment);
    onOpenChange(false);
    setSelectedTemplate(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Experiment Templates</DialogTitle>
          <DialogDescription>
            Choose from proven experiment templates to get started quickly.
            <br />
            <span className="text-xs text-muted-foreground mt-2 block">
              Note: Advanced features like visual designer, collaboration tools, and mobile optimization are not yet implemented.
            </span>
          </DialogDescription>
        </DialogHeader>

        {!selectedTemplate ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((template) => (
              <Card 
                key={template.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleTemplateSelect(template)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {getCategoryIcon(template.category)}
                      {template.name}
                    </CardTitle>
                    <Badge className={getCategoryColor(template.category)}>
                      {template.category}
                    </Badge>
                  </div>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        {template.success_metric.replace('_', ' ')}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {template.recommended_sample_size.toLocaleString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {template.recommended_duration_days}d
                      </div>
                    </div>
                    
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Hypothesis Template:</p>
                      <p className="text-sm italic">{template.hypothesis_template}</p>
                    </div>
                    
                    <Button className="w-full" size="sm">
                      Use This Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
              {getCategoryIcon(selectedTemplate.category)}
              <div>
                <h3 className="font-semibold">{selectedTemplate.name}</h3>
                <p className="text-sm text-muted-foreground">{selectedTemplate.description}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setSelectedTemplate(null)}>
                Back to Templates
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="experiment_name">Experiment Name</Label>
                  <Input
                    id="experiment_name"
                    value={customization.experiment_name}
                    onChange={(e) => setCustomization(prev => ({ ...prev, experiment_name: e.target.value }))}
                    placeholder="Enter experiment name"
                  />
                </div>

                <div>
                  <Label htmlFor="hypothesis">Hypothesis</Label>
                  <Textarea
                    id="hypothesis"
                    value={customization.hypothesis}
                    onChange={(e) => setCustomization(prev => ({ ...prev, hypothesis: e.target.value }))}
                    placeholder="Describe your hypothesis"
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Fill in the placeholders in brackets with your specific details
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="sample_size">Minimum Sample Size</Label>
                  <Input
                    id="sample_size"
                    type="number"
                    value={customization.minimum_sample_size}
                    onChange={(e) => setCustomization(prev => ({ ...prev, minimum_sample_size: parseInt(e.target.value) || 0 }))}
                    placeholder="Minimum sample size"
                  />
                </div>

                <div>
                  <Label htmlFor="duration">Test Duration (Days)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={customization.test_duration_days}
                    onChange={(e) => setCustomization(prev => ({ ...prev, test_duration_days: parseInt(e.target.value) || 0 }))}
                    placeholder="Duration in days"
                  />
                </div>

                <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <h4 className="font-medium text-green-800 dark:text-green-200">Template Benefits</h4>
                  </div>
                  <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                    <li>• Pre-validated hypothesis structure</li>
                    <li>• Optimized sample size calculation</li>
                    <li>• Industry-standard success metrics</li>
                    <li>• Proven experiment duration</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleCreateFromTemplate} className="flex-1">
                Create Experiment from Template
              </Button>
              <Button variant="outline" onClick={() => setSelectedTemplate(null)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};