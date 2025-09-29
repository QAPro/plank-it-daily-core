import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Users, Crown, Zap, Target, Settings, Layers, BarChart3, Gamepad2, HelpCircle } from "lucide-react";

interface FeatureFlagsHelpProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const FeatureFlagsHelp = ({ open, onOpenChange }: FeatureFlagsHelpProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Feature Flags Help Guide
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Bulk Operations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CheckCircle2 className="h-5 w-5" />
                Bulk Operations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Use checkboxes to select multiple feature flags for bulk operations:
              </p>
              <ul className="text-sm space-y-2">
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  <span><strong>Select flags:</strong> Check the boxes next to feature flags you want to modify</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  <span><strong>Bulk enable/disable:</strong> Turn multiple flags on or off simultaneously</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  <span><strong>Bulk rollout:</strong> Set the same rollout percentage across multiple flags</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Rollout Percentages */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart3 className="h-5 w-5" />
                Rollout Percentages
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Control what percentage of users see a feature:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Rollout Strategy:</p>
                  <ul className="text-sm space-y-1">
                    <li>• <strong>0%:</strong> Feature disabled for all users</li>
                    <li>• <strong>25%:</strong> Limited beta testing</li>
                    <li>• <strong>50%:</strong> A/B testing phase</li>
                    <li>• <strong>100%:</strong> Full rollout to all users</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Best Practices:</p>
                  <ul className="text-sm space-y-1">
                    <li>• Start with small percentages (5-10%)</li>
                    <li>• Monitor metrics before increasing</li>
                    <li>• Use gradual rollout for high-risk features</li>
                    <li>• Set to 0% to instantly disable if needed</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feature Hierarchy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Layers className="h-5 w-5" />
                Feature Hierarchy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Features are organized in parent-child relationships:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Parent Features:</p>
                  <ul className="text-sm space-y-1">
                    <li>• Main feature categories (e.g., "Social Features")</li>
                    <li>• Control entire feature sets</li>
                    <li>• Shown as expandable cards</li>
                    <li>• Can toggle all children at once</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Child Features:</p>
                  <ul className="text-sm space-y-1">
                    <li>• Specific functionality within a parent</li>
                    <li>• Shown inside parent cards</li>
                    <li>• Inherit parent's enable/disable state</li>
                    <li>• Can have individual rollout percentages</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Target Audiences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5" />
                Target Audiences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Features can target specific user groups:
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="bg-blue-500/10 text-blue-700 border-blue-200">
                  <Users className="h-3 w-3 mr-1" />
                  All Users
                </Badge>
                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 border-yellow-200">
                  <Crown className="h-3 w-3 mr-1" />
                  Premium Only
                </Badge>
                <Badge variant="outline" className="bg-purple-500/10 text-purple-700 border-purple-200">
                  <Zap className="h-3 w-3 mr-1" />
                  Beta Testers
                </Badge>
                <Badge variant="outline" className="bg-gray-500/10 text-gray-700 border-gray-200">
                  <Target className="h-3 w-3 mr-1" />
                  Custom Segment
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* A/B Testing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Gamepad2 className="h-5 w-5" />
                A/B Testing Integration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Feature flags can be connected to A/B testing experiments:
              </p>
              <ul className="text-sm space-y-2">
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  <span><strong>Experiment Setup:</strong> Link flags to A/B test variants</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  <span><strong>Statistical Analysis:</strong> Monitor conversion rates and significance</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  <span><strong>Winner Implementation:</strong> Automatically apply winning variants</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Separator />

          {/* Quick Tips */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium text-sm mb-2">💡 Quick Tips:</h4>
            <ul className="text-xs space-y-1 text-muted-foreground">
              <li>• Use the search bar to quickly find specific features</li>
              <li>• Filter by category to focus on related functionality</li>
              <li>• Monitor real-time user metrics for each feature</li>
              <li>• Create rollout schedules for gradual feature releases</li>
              <li>• Always test in staging before production rollout</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};