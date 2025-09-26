import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Plus, Edit, RefreshCw, Users, Globe, Target, Flag, ChevronDown, ChevronRight, AlertTriangle, Info, Folder, FolderOpen, Search, Filter } from 'lucide-react';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import AdvancedFlagControls, { AdvancedFlagState } from '@/components/admin/flags/AdvancedFlagControls';
import FeatureSelector from '@/components/admin/flags/FeatureSelector';
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { getFeatureByName, type FeatureCatalogItem } from '@/constants/featureCatalog';
import { FEATURE_UI_IMPACTS, getUIImpactIcon, getUIImpactColor, UIImpact } from '@/constants/featureUIImpacts';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { GRANULAR_FEATURE_CATALOG, GRANULAR_FEATURE_CATEGORIES, getGranularFeaturesByCategory, type GranularFeatureCatalogItem } from '@/constants/granularFeatureCatalog';

type FeatureFlag = {
  id: string;
  feature_name: string;
  is_enabled: boolean;
  description?: string | null;
  target_audience?: string | null;
  rollout_percentage?: number | null;
  parent_feature_id?: string | null;
  created_at?: string;
  updated_at?: string;
};

type FeatureFlagWithChildren = FeatureFlag & {
  children: FeatureFlag[];
};

const FeatureFlagsManager = () => {
  const { flags, loading, toggle, upsert, refetch } = useFeatureFlags();
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingToggle, setPendingToggle] = useState<{flagName: string, currentEnabled: boolean} | null>(null);
  const [expandedImpacts, setExpandedImpacts] = useState<Record<string, boolean>>({});
  const [expandedParents, setExpandedParents] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showOnlyEnabled, setShowOnlyEnabled] = useState(false);
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
    const impacts = getUIImpacts(flagName);
    if (impacts.length > 0) {
      setPendingToggle({flagName, currentEnabled});
      setShowConfirmDialog(true);
    } else {
      await toggle(flagName, !currentEnabled);
    }
  };

  const confirmToggle = async () => {
    if (pendingToggle) {
      await toggle(pendingToggle.flagName, !pendingToggle.currentEnabled);
      setPendingToggle(null);
      setShowConfirmDialog(false);
    }
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

  const getUIImpacts = (flagName: string) => {
    return FEATURE_UI_IMPACTS[flagName] || [];
  };

  // Auto-suggest UI impacts for new feature names
  const suggestedImpacts = useMemo(() => {
    if (!newFlag.feature_name) return [];
    
    // Direct match
    if (FEATURE_UI_IMPACTS[newFlag.feature_name]) {
      return FEATURE_UI_IMPACTS[newFlag.feature_name];
    }
    
    // Partial match based on keywords
    const keywords = newFlag.feature_name.toLowerCase();
    const suggestions: UIImpact[] = [];
    
    if (keywords.includes('social') || keywords.includes('friend')) {
      suggestions.push(...(FEATURE_UI_IMPACTS.social_features || []));
    }
    if (keywords.includes('compete') || keywords.includes('challenge')) {
      suggestions.push(...(FEATURE_UI_IMPACTS.social_challenges || []));
    }
    if (keywords.includes('event')) {
      suggestions.push(...(FEATURE_UI_IMPACTS.events || []));
    }
    if (keywords.includes('analytic')) {
      suggestions.push(...(FEATURE_UI_IMPACTS.analytics_dashboard || []));
    }
    
    return suggestions;
  }, [newFlag.feature_name]);

  const toggleImpactExpansion = (flagName: string) => {
    setExpandedImpacts(prev => ({
      ...prev,
      [flagName]: !prev[flagName]
    }));
  };

  const toggleParentExpansion = (parentId: string) => {
    setExpandedParents(prev => ({
      ...prev,
      [parentId]: !prev[parentId]
    }));
  };

  // Group flags by parent-child relationship and apply filters
  const organizedFlags = useMemo(() => {
    const parentFlags = flags.filter(flag => !flag.parent_feature_id);
    const childFlags = flags.filter(flag => flag.parent_feature_id);
    
    let filteredParents = parentFlags.map(parent => ({
      ...parent,
      children: childFlags.filter(child => child.parent_feature_id === parent.id)
    }));

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredParents = filteredParents.filter(parent => 
        parent.feature_name.toLowerCase().includes(query) ||
        parent.description?.toLowerCase().includes(query) ||
        parent.children.some(child => 
          child.feature_name.toLowerCase().includes(query) ||
          child.description?.toLowerCase().includes(query)
        )
      );
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      const categoryFeatures = getGranularFeaturesByCategory(selectedCategory as any);
      const categoryFeatureNames = categoryFeatures.map(f => f.name);
      
      filteredParents = filteredParents.filter(parent =>
        categoryFeatureNames.includes(parent.feature_name) ||
        parent.children.some(child => categoryFeatureNames.includes(child.feature_name))
      );
    }

    // Apply enabled filter
    if (showOnlyEnabled) {
      filteredParents = filteredParents.filter(parent =>
        parent.is_enabled || parent.children.some(child => child.is_enabled)
      );
    }

    return filteredParents;
  }, [flags, searchQuery, selectedCategory, showOnlyEnabled]);

  // Handle bulk parent toggle
  const handleParentToggle = async (parentFlag: FeatureFlagWithChildren, enabled: boolean) => {
    // Toggle parent
    await toggle(parentFlag.feature_name, enabled);
    
    // If disabling parent, show confirmation for children
    if (!enabled && parentFlag.children.length > 0) {
      const enabledChildrenCount = parentFlag.children.filter(child => child.is_enabled).length;
      if (enabledChildrenCount > 0) {
        toast({
          title: "Parent feature disabled",
          description: `${enabledChildrenCount} child feature${enabledChildrenCount > 1 ? 's' : ''} will be effectively disabled but settings preserved.`,
        });
      }
    }
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
          <p className="text-gray-600 mt-1">Control which features are available to users - {organizedFlags.length} features</p>
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
                
                {/* Auto-suggested UI Impacts */}
                {suggestedImpacts.length > 0 && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Info className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">
                        Suggested UI Impact ({suggestedImpacts.length} element{suggestedImpacts.length !== 1 ? 's' : ''})
                      </span>
                    </div>
                    <div className="space-y-1">
                      {suggestedImpacts.slice(0, 3).map((impact, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-blue-700">
                          <impact.icon className="w-3 h-3" />
                          <span className="font-medium">{impact.element}</span>
                          <span className="text-blue-600">-</span>
                          <span>{impact.description}</span>
                        </div>
                      ))}
                      {suggestedImpacts.length > 3 && (
                        <div className="text-xs text-blue-600">
                          +{suggestedImpacts.length - 3} more elements will be affected
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
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

      {/* Impact Preview Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Confirm Feature Toggle
            </DialogTitle>
            <DialogDescription>
              This action will affect multiple UI elements. Please review the impact below.
            </DialogDescription>
          </DialogHeader>
          
          {pendingToggle && (
            <div className="space-y-4">
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="font-medium text-orange-900 mb-2">
                  {pendingToggle.currentEnabled ? 'Disabling' : 'Enabling'} "{pendingToggle.flagName}" will affect:
                </div>
                <div className="space-y-2">
                  {getUIImpacts(pendingToggle.flagName).map((impact, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-orange-800">
                      <impact.icon className="w-4 h-4" />
                      <span className="font-medium">{impact.element}</span>
                      <span>-</span>
                      <span>{impact.description}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={confirmToggle} variant={pendingToggle.currentEnabled ? "destructive" : "default"}>
                  {pendingToggle.currentEnabled ? 'Disable Feature' : 'Enable Feature'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Search and Filter Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex-1 max-w-sm">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search features..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="text-sm border rounded px-3 py-1.5 bg-white"
                >
                  <option value="all">All Categories</option>
                  {Object.entries(GRANULAR_FEATURE_CATEGORIES).map(([key, category]) => (
                    <option key={key} value={key}>
                      {category.icon} {category.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={showOnlyEnabled}
                  onChange={(e) => setShowOnlyEnabled(e.target.checked)}
                  className="rounded"
                />
                Enabled only
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {organizedFlags.map((parentFlag) => {
          const AudienceIcon = getAudienceIcon(parentFlag.target_audience || 'all');
          const featureInfo = getFeatureDisplayInfo(parentFlag.feature_name);
          const uiImpacts = getUIImpacts(parentFlag.feature_name);
          const isExpanded = expandedImpacts[parentFlag.feature_name] || false;
          const isParentExpanded = expandedParents[parentFlag.id] || false;
          const hasChildren = parentFlag.children.length > 0;
          const enabledChildrenCount = parentFlag.children.filter(child => child.is_enabled).length;
          
          return (
            <div key={parentFlag.id}>
              {/* Parent Feature Card */}
              <Card className={`transition-all ${parentFlag.is_enabled ? 'border-green-200' : 'border-gray-200'} ${hasChildren ? 'border-l-4 border-l-primary' : ''}`}>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {hasChildren && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleParentExpansion(parentFlag.id)}
                          className="p-1 h-6 w-6"
                        >
                          {isParentExpanded ? (
                            <FolderOpen className="h-4 w-4" />
                          ) : (
                            <Folder className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">{featureInfo.displayName}</CardTitle>
                          {!featureInfo.isKnownFeature && (
                            <Badge variant="outline" className="text-xs">Custom</Badge>
                          )}
                          {hasChildren && (
                            <Badge variant="outline" className="text-xs">
                              {enabledChildrenCount}/{parentFlag.children.length} enabled
                            </Badge>
                          )}
                        </div>
                        {featureInfo.displayName !== parentFlag.feature_name && (
                          <code className="text-xs text-muted-foreground">{parentFlag.feature_name}</code>
                        )}
                      </div>
                      <Badge variant={parentFlag.is_enabled ? "default" : "secondary"}>
                        {parentFlag.is_enabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div>
                            <Switch
                              checked={parentFlag.is_enabled}
                              onCheckedChange={(enabled) => hasChildren ? 
                                handleParentToggle(parentFlag, enabled) : 
                                handleToggle(parentFlag.feature_name, parentFlag.is_enabled)
                              }
                            />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="left">
                          <div className="text-center">
                            <div className="font-medium">
                              {parentFlag.is_enabled ? 'Disable' : 'Enable'} {featureInfo.displayName}
                            </div>
                            {hasChildren && (
                              <div className="text-xs text-muted-foreground mt-1">
                                Controls {parentFlag.children.length} child feature{parentFlag.children.length !== 1 ? 's' : ''}
                              </div>
                            )}
                            {uiImpacts.length > 0 && (
                              <div className="text-xs text-muted-foreground mt-1">
                                Affects {uiImpacts.length} UI element{uiImpacts.length !== 1 ? 's' : ''}
                              </div>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    {/* Feature Description */}
                    {parentFlag.description && (
                      <p className="text-sm text-muted-foreground">{parentFlag.description}</p>
                    )}

                    {/* Feature Meta Information */}
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <div className="flex items-center gap-1">
                        <AudienceIcon className="w-4 h-4 text-muted-foreground" />
                        <Badge className={getAudienceBadgeColor(parentFlag.target_audience || 'all')}>
                          {parentFlag.target_audience || 'all'}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Target className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {parentFlag.rollout_percentage || 100}% rollout
                        </span>
                      </div>
                      
                      {parentFlag.created_at && (
                        <div className="text-xs text-muted-foreground">
                          Created {new Date(parentFlag.created_at).toLocaleDateString()}
                        </div>
                      )}
                    </div>

                    {/* UI Impacts */}
                    {uiImpacts.length > 0 && (
                      <div className="border rounded-lg p-3 bg-muted/30">
                        <Collapsible
                          open={isExpanded}
                          onOpenChange={() => toggleImpactExpansion(parentFlag.feature_name)}
                        >
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" className="flex items-center gap-2 p-0 h-auto font-medium">
                              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                              UI Impact ({uiImpacts.length} element{uiImpacts.length !== 1 ? 's' : ''})
                            </Button>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="space-y-2 mt-3">
                            {uiImpacts.map((impact, index) => (
                              <div key={index} className="flex items-start gap-2 text-sm">
                                <impact.icon className="w-4 h-4 mt-0.5" />
                                <div className="flex-1">
                                  <div className="font-medium">{impact.element}</div>
                                  <div className="text-muted-foreground text-xs">{impact.description}</div>
                                </div>
                              </div>
                            ))}
                          </CollapsibleContent>
                        </Collapsible>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Child Features */}
              {hasChildren && isParentExpanded && (
                <div className="ml-8 mt-4 space-y-3 border-l-2 border-muted pl-4">
                  {parentFlag.children.map((childFlag) => {
                    const childAudienceIcon = getAudienceIcon(childFlag.target_audience || 'all');
                    const childFeatureInfo = getFeatureDisplayInfo(childFlag.feature_name);
                    const childUIImpacts = getUIImpacts(childFlag.feature_name);
                    const isChildExpanded = expandedImpacts[childFlag.feature_name] || false;
                    const isParentDisabled = !parentFlag.is_enabled;
                    
                    return (
                      <Card key={childFlag.id} className={`transition-all ${childFlag.is_enabled && !isParentDisabled ? 'border-green-200' : 'border-gray-200'} ${isParentDisabled ? 'opacity-60' : ''}`}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                  <CardTitle className="text-base">{childFeatureInfo.displayName}</CardTitle>
                                  {!childFeatureInfo.isKnownFeature && (
                                    <Badge variant="outline" className="text-xs">Custom</Badge>
                                  )}
                                  {isParentDisabled && (
                                    <Badge variant="secondary" className="text-xs">Parent Disabled</Badge>
                                  )}
                                </div>
                                {childFeatureInfo.displayName !== childFlag.feature_name && (
                                  <code className="text-xs text-muted-foreground">{childFlag.feature_name}</code>
                                )}
                              </div>
                              <Badge variant={childFlag.is_enabled && !isParentDisabled ? "default" : "secondary"}>
                                {childFlag.is_enabled ? 'Enabled' : 'Disabled'}
                              </Badge>
                            </div>
                            
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div>
                                    <Switch
                                      checked={childFlag.is_enabled}
                                      onCheckedChange={() => handleToggle(childFlag.feature_name, childFlag.is_enabled)}
                                      disabled={isParentDisabled}
                                    />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent side="left">
                                  <div className="text-center">
                                    <div className="font-medium">
                                      {childFlag.is_enabled ? 'Disable' : 'Enable'} {childFeatureInfo.displayName}
                                    </div>
                                    {isParentDisabled && (
                                      <div className="text-xs text-muted-foreground mt-1">
                                        Parent feature must be enabled first
                                      </div>
                                    )}
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </CardHeader>

                        <CardContent className="pt-0">
                          <div className="space-y-3">
                            {/* Child Feature Description */}
                            {childFlag.description && (
                              <p className="text-sm text-muted-foreground">{childFlag.description}</p>
                            )}

                            {/* Child Feature Meta Information */}
                            <div className="flex flex-wrap items-center gap-3 text-sm">
                              <div className="flex items-center gap-1">
                                <Target className="w-4 h-4 text-muted-foreground" />
                                <Badge className={getAudienceBadgeColor(childFlag.target_audience || 'all')}>
                                  {childFlag.target_audience || 'all'}
                                </Badge>
                              </div>
                              
                              <div className="flex items-center gap-1">
                                <Target className="w-4 h-4 text-muted-foreground" />
                                <span className="text-muted-foreground">
                                  {childFlag.rollout_percentage || 100}% rollout
                                </span>
                              </div>
                            </div>

                            {/* Child UI Impacts */}
                            {childUIImpacts.length > 0 && (
                              <div className="border rounded-lg p-2 bg-muted/20">
                                <Collapsible
                                  open={isChildExpanded}
                                  onOpenChange={() => toggleImpactExpansion(childFlag.feature_name)}
                                >
                                  <CollapsibleTrigger asChild>
                                    <Button variant="ghost" className="flex items-center gap-2 p-0 h-auto font-medium text-sm">
                                      {isChildExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                                      UI Impact ({childUIImpacts.length})
                                    </Button>
                                  </CollapsibleTrigger>
                                  <CollapsibleContent className="space-y-1 mt-2">
                                    {childUIImpacts.map((impact, index) => (
                                      <div key={index} className="flex items-start gap-2 text-xs">
                                        <impact.icon className="w-3 h-3 mt-0.5" />
                                        <div className="flex-1">
                                          <div className="font-medium">{impact.element}</div>
                                          <div className="text-muted-foreground">{impact.description}</div>
                                        </div>
                                      </div>
                                    ))}
                                  </CollapsibleContent>
                                </Collapsible>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {flags.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Flag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">No Feature Flags</h3>
              <p className="text-gray-600 mb-4">
                Create your first feature flag to start controlling application features.
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Feature Flag
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default FeatureFlagsManager;