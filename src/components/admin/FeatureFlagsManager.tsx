
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, RefreshCw, Users, Globe, Target, Flag } from 'lucide-react';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import AdvancedFlagControls, { AdvancedFlagState } from '@/components/admin/flags/AdvancedFlagControls';
import FeatureSelector from '@/components/admin/flags/FeatureSelector';
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { getFeatureByName, type FeatureCatalogItem } from '@/constants/featureCatalog';

const FeatureFlagsManager = () => {
  const { flags, loading, toggle, upsert, refetch } = useFeatureFlags();
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newFlag, setNewFlag] = useState({
    feature_name: '',
    description: '',
    target_audience: 'all',
    rollout_percentage: 100,
    is_enabled: true
  });
  const [advanced, setAdvanced] = useState<AdvancedFlagState>({
    cohort_rules_text: "",
    ab_test_config_text: "",
    rollout_strategy: "immediate",
    rollout_start_date: "",
    rollout_end_date: "",
  });

  const handleToggle = async (flagName: string, currentEnabled: boolean) => {
    await toggle(flagName, !currentEnabled);
  };

  const handleFeatureSelect = (feature: FeatureCatalogItem) => {
    setNewFlag({
      feature_name: feature.name,
      description: feature.description,
      target_audience: feature.defaultAudience,
      rollout_percentage: feature.defaultRolloutPercentage,
      is_enabled: true
    });
  };

  const handleCreateFlag = async () => {
    if (!newFlag.feature_name.trim()) return;

    // Validate and parse JSON without throwing (use zod.safeParse)
    let cohortRules: any = {};
    if (advanced.cohort_rules_text.trim()) {
      try {
        cohortRules = JSON.parse(advanced.cohort_rules_text);
      } catch {
        toast({
          title: "Invalid cohort JSON",
          description: "Please provide valid JSON for cohort rules.",
          variant: "destructive",
        });
        return;
      }
    }

    let abTestConfig: any = null;
    if (advanced.ab_test_config_text.trim()) {
      try {
        abTestConfig = JSON.parse(advanced.ab_test_config_text);
      } catch {
        toast({
          title: "Invalid A/B config JSON",
          description: "Please provide valid JSON for A/B test config.",
          variant: "destructive",
        });
        return;
      }
      const abSchema = z.object({
        variants: z.array(z.string()).min(2, "Provide at least 2 variants"),
      }).passthrough();
      const valid = abSchema.safeParse(abTestConfig);
      if (!valid.success) {
        toast({
          title: "A/B config invalid",
          description: valid.error.issues[0]?.message ?? "Variants are required",
          variant: "destructive",
        });
        return;
      }
    }

    await upsert({
      feature_name: newFlag.feature_name.trim(),
      description: newFlag.description || null,
      target_audience: newFlag.target_audience || 'all',
      rollout_percentage: Number(newFlag.rollout_percentage) || 0,
      is_enabled: newFlag.is_enabled,
      // Advanced fields
      cohort_rules: cohortRules,
      ab_test_config: abTestConfig,
      rollout_strategy: advanced.rollout_strategy,
      rollout_start_date: advanced.rollout_start_date ? new Date(advanced.rollout_start_date).toISOString() : null,
      rollout_end_date: advanced.rollout_end_date ? new Date(advanced.rollout_end_date).toISOString() : null,
    });

    setShowCreateDialog(false);
    setNewFlag({
      feature_name: '',
      description: '',
      target_audience: 'all',
      rollout_percentage: 100,
      is_enabled: true
    });
    setAdvanced({
      cohort_rules_text: "",
      ab_test_config_text: "",
      rollout_strategy: "immediate",
      rollout_start_date: "",
      rollout_end_date: "",
    });
  };

  const handleRefresh = () => {
    refetch();
  };

  const getAudienceIcon = (audience: string) => {
    switch (audience) {
      case 'all': return Globe;
      case 'beta': return Users;
      default: return Target;
    }
  };

  const getAudienceBadgeColor = (audience: string) => {
    switch (audience) {
      case 'all': return 'bg-green-100 text-green-800 border-green-200';
      case 'beta': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getFeatureDisplayInfo = (flagName: string) => {
    const catalogFeature = getFeatureByName(flagName);
    return catalogFeature ? {
      displayName: catalogFeature.displayName,
      isKnownFeature: true
    } : {
      displayName: flagName,
      isKnownFeature: false
    };
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Loading feature flags...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Feature Flags</h2>
          <p className="text-gray-600 mt-1">Control which features are available to users</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleRefresh} size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Flag
              </Button>
            </DialogTrigger>
            
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Feature Flag</DialogTitle>
                <DialogDescription>
                  Select a feature from the catalog or create a custom one
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <FeatureSelector
                  value={newFlag.feature_name}
                  onChange={(value) => setNewFlag({ ...newFlag, feature_name: value })}
                  onFeatureSelect={handleFeatureSelect}
                />
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newFlag.description}
                    onChange={(e) => setNewFlag({ ...newFlag, description: e.target.value })}
                    placeholder="Describe what this feature flag controls..."
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="audience">Target Audience</Label>
                    <Input
                      id="audience"
                      value={newFlag.target_audience}
                      onChange={(e) => setNewFlag({ ...newFlag, target_audience: e.target.value })}
                      placeholder="all, beta, premium..."
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="rollout">Rollout %</Label>
                    <Input
                      id="rollout"
                      type="number"
                      min="0"
                      max="100"
                      value={newFlag.rollout_percentage}
                      onChange={(e) => setNewFlag({ ...newFlag, rollout_percentage: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={newFlag.is_enabled}
                    onCheckedChange={(checked) => setNewFlag({ ...newFlag, is_enabled: checked })}
                  />
                  <Label>Enable immediately</Label>
                </div>

                {/* Advanced controls */}
                <AdvancedFlagControls value={advanced} onChange={setAdvanced} />
                
                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateFlag}>
                    Create Flag
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4">
        {flags.map((flag) => {
          const AudienceIcon = getAudienceIcon(flag.target_audience || 'all');
          const featureInfo = getFeatureDisplayInfo(flag.feature_name);
          
          return (
            <Card key={flag.id} className={`transition-all ${flag.is_enabled ? 'border-green-200' : 'border-gray-200'}`}>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{featureInfo.displayName}</CardTitle>
                        {!featureInfo.isKnownFeature && (
                          <Badge variant="outline" className="text-xs">Custom</Badge>
                        )}
                      </div>
                      {featureInfo.displayName !== flag.feature_name && (
                        <code className="text-xs text-muted-foreground">{flag.feature_name}</code>
                      )}
                    </div>
                    <Badge variant={flag.is_enabled ? "default" : "secondary"}>
                      {flag.is_enabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  
                  <Switch
                    checked={flag.is_enabled}
                    onCheckedChange={() => handleToggle(flag.feature_name, flag.is_enabled)}
                  />
                </div>
                
                {flag.description && (
                  <CardDescription>{flag.description}</CardDescription>
                )}
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <AudienceIcon className="w-4 h-4" />
                    <Badge variant="outline" className={getAudienceBadgeColor(flag.target_audience || 'all')}>
                      {flag.target_audience || 'all'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Target className="w-4 h-4" />
                    <span>{flag.rollout_percentage || 100}% rollout</span>
                  </div>
                  
                  {flag.created_at && (
                    <div className="text-xs text-gray-500">
                      Created {new Date(flag.created_at).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
        
        {flags.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Flag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No Feature Flags</h3>
              <p className="text-gray-600 mb-4">Create your first feature flag to start controlling app features.</p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Flag
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default FeatureFlagsManager;
