import { useState, useMemo, useCallback } from "react";
import { useFeatureFlags } from "@/hooks/useFeatureFlags";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { RefreshCw, Plus, Users, Target, Zap, Search, Filter, ChevronDown, ChevronRight, AlertTriangle, Palette, Brain, Music, TrendingUp, Crown, Trophy, Gamepad2, FolderOpen, Folder, Settings, Eye, EyeOff, Database, Layers, BarChart3, Sparkles, Play, Pause, Activity, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { GRANULAR_FEATURE_CATEGORIES, getGranularFeaturesByCategory, getGranularFeatureByName, getAllGranularFeatureNames } from "@/constants/granularFeatureCatalog";
import type { FeatureFlag } from "@/services/featureManagementService";
import AdvancedFlagControls, { AdvancedFlagState } from "./flags/AdvancedFlagControls";
import RolloutPercentageControl from "./flags/RolloutPercentageControl";
import BulkRolloutControl from "./flags/BulkRolloutControl";

// Enhanced data structures for hierarchical flags
type FeatureFlagWithChildren = FeatureFlag & {
  children: FeatureFlag[];
  category?: string;
  icon?: React.ComponentType<any>;
  componentCount?: number;
  usageCount?: number;
  performanceImpact?: 'low' | 'medium' | 'high';
};

// Tree node state management
type TreeNodeState = {
  isExpanded: boolean;
  isSelected: boolean;
  isHovered: boolean;
};

type TreeState = Record<string, TreeNodeState>;

const FeatureFlagsManager: React.FC = () => {
  const { flags, loading, toggle, upsert, refetch, getParentFeatures, getChildFeatures, hasChildren, toggleParentAndChildren } = useFeatureFlags();
  
  // Enhanced state management for tree structure
  const [showNewFlagDialog, setShowNewFlagDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [pendingToggle, setPendingToggle] = useState<{ name: string; enabled: boolean } | null>(null);
  const [treeState, setTreeState] = useState<TreeState>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [showEnabledOnly, setShowEnabledOnly] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<string>("");
  const [bulkAction, setBulkAction] = useState<'enable' | 'disable'>('enable');
  const [selectedFlags, setSelectedFlags] = useState<Set<string>>(new Set());
  const [showBulkRollout, setShowBulkRollout] = useState(false);
  const [expandAll, setExpandAll] = useState(false);

  // Enhanced new flag form state
  const [newFlag, setNewFlag] = useState({
    feature_name: "",
    description: "",
    target_audience: "all",
    rollout_percentage: 100,
    parent_feature_id: null as string | null,
    category: "",
    performanceImpact: "low" as 'low' | 'medium' | 'high',
  });

  // Enhanced event handlers with tree state management
  const updateTreeNode = useCallback((nodeId: string, updates: Partial<TreeNodeState>) => {
    setTreeState(prev => ({
      ...prev,
      [nodeId]: { ...prev[nodeId], ...updates }
    }));
  }, []);

  const toggleExpansion = useCallback((nodeId: string) => {
    updateTreeNode(nodeId, { 
      isExpanded: !treeState[nodeId]?.isExpanded 
    });
  }, [treeState, updateTreeNode]);

  const handleToggle = (name: string, currentEnabled: boolean) => {
    const newEnabled = !currentEnabled;
    
    // Check if this feature has UI impacts that require confirmation
    const uiImpacts = getUIImpacts(name);
    
    if (uiImpacts.length > 0 && !newEnabled) {
      setPendingToggle({ name, enabled: newEnabled });
      setShowConfirmDialog(true);
    } else {
      toggle(name, newEnabled);
    }
  };

  const confirmToggle = () => {
    if (pendingToggle) {
      toggle(pendingToggle.name, pendingToggle.enabled);
      setPendingToggle(null);
    }
    setShowConfirmDialog(false);
  };

  const handleBulkAction = () => {
    if (selectedFlags.size === 0) {
      toast.error("Please select at least one feature flag");
      return;
    }
    
    selectedFlags.forEach(flagName => {
      toggle(flagName, bulkAction === 'enable');
    });
    
    setSelectedFlags(new Set());
    setShowBulkDialog(false);
    toast.success(`${bulkAction}d ${selectedFlags.size} feature flags`);
  };

  const handleSelectFlag = (flagName: string, selected: boolean) => {
    const newSelected = new Set(selectedFlags);
    if (selected) {
      newSelected.add(flagName);
    } else {
      newSelected.delete(flagName);
    }
    setSelectedFlags(newSelected);
  };

  const handleExpandAll = () => {
    const newExpandAll = !expandAll;
    setExpandAll(newExpandAll);
    
    const newTreeState: TreeState = {};
    getParentFeatures().forEach(parent => {
      newTreeState[parent.id] = {
        isExpanded: newExpandAll,
        isSelected: false,
        isHovered: false
      };
    });
    setTreeState(newTreeState);
  };

  const handleCreateFlag = () => {
    if (!newFlag.feature_name.trim() || !newFlag.description.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    upsert({
      feature_name: newFlag.feature_name,
      description: newFlag.description,
      target_audience: newFlag.target_audience,
      rollout_percentage: newFlag.rollout_percentage,
      parent_feature_id: newFlag.parent_feature_id,
      is_enabled: true,
    });

    // Reset form
    setNewFlag({
      feature_name: "",
      description: "",
      target_audience: "all",
      rollout_percentage: 100,
      parent_feature_id: null,
      category: "",
      performanceImpact: "low",
    });
    setSelectedFeature("");
    setShowNewFlagDialog(false);
  };

  const handleRefresh = () => {
    refetch();
    toast.success("Feature flags refreshed");
  };

  const handleParentToggle = async (parentName: string, enabled: boolean) => {
    try {
      await toggleParentAndChildren(parentName, enabled);
      toast.success(`${parentName} and all children updated`);
    } catch (error) {
      toast.error("Failed to update parent and children");
    }
  };

  // Enhanced helper functions with new categorization
  const getCategoryIcon = (category: string) => {
    const iconMap: Record<string, React.ComponentType<any>> = {
      music: Music,
      ai: Brain,
      social: Users,
      analytics: BarChart3,
      premium: Crown,
      ui: Palette,
      competition: Trophy,
      core: Database,
      navigation: Layers,
      other: Settings
    };
    return iconMap[category] || Settings;
  };

  const getCategoryColor = (category: string) => {
    const colorMap: Record<string, string> = {
      music: "text-purple-600",
      ai: "text-blue-600", 
      social: "text-green-600",
      analytics: "text-orange-600",
      premium: "text-yellow-600",
      ui: "text-pink-600",
      competition: "text-red-600",
      core: "text-gray-600",
      navigation: "text-indigo-600",
      other: "text-slate-600"
    };
    return colorMap[category] || "text-slate-600";
  };

  const getAudienceIcon = (audience: string) => {
    switch (audience) {
      case "all": return <Users className="h-3 w-3" />;
      case "premium": return <Crown className="h-3 w-3" />;
      case "beta": return <Zap className="h-3 w-3" />;
      default: return <Target className="h-3 w-3" />;
    }
  };

  const getAudienceBadgeColor = (audience: string) => {
    switch (audience) {
      case "all": return "bg-blue-500/10 text-blue-700 border-blue-200";
      case "premium": return "bg-yellow-500/10 text-yellow-700 border-yellow-200";
      case "beta": return "bg-purple-500/10 text-purple-700 border-purple-200";
      default: return "bg-gray-500/10 text-gray-700 border-gray-200";
    }
  };

  const getPerformanceIndicator = (impact: 'low' | 'medium' | 'high') => {
    const indicators = {
      low: { color: "text-green-600", bg: "bg-green-100", label: "Low", icon: CheckCircle2 },
      medium: { color: "text-yellow-600", bg: "bg-yellow-100", label: "Med", icon: Activity },
      high: { color: "text-red-600", bg: "bg-red-100", label: "High", icon: XCircle }
    };
    return indicators[impact];
  };

  const getFeatureDisplayInfo = (featureName: string) => {
    const catalogFeature = getGranularFeatureByName(featureName);
    if (catalogFeature) {
      const category = GRANULAR_FEATURE_CATEGORIES[catalogFeature.category];
      return {
        displayName: catalogFeature.displayName,
        category: catalogFeature.category,
        icon: category?.icon || Target,
        color: category?.color || "text-gray-600"
      };
    }
    
    // Fallback for features not in catalog
    return {
      displayName: featureName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      category: 'other',
      icon: Target,
      color: "text-gray-600"
    };
  };

  const getUIImpacts = (featureName: string): string[] => {
    const catalogFeature = getGranularFeatureByName(featureName);
    return catalogFeature?.uiComponents || [];
  };

  // Real user metrics are now fetched per feature in the RolloutPercentageControl component

  // Enhanced organized flags with tree state and advanced filtering
  const organizedFlags = useMemo(() => {
    const parentFlags = getParentFeatures().map(parent => {
      const children = getChildFeatures(parent.id)
        .filter(child => {
          if (!searchTerm) return true;
          const displayInfo = getFeatureDisplayInfo(child.feature_name);
          return displayInfo.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                 child.feature_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                 (child.description && child.description.toLowerCase().includes(searchTerm.toLowerCase()));
        })
        .filter(child => {
          if (categoryFilter === "all") return true;
          const displayInfo = getFeatureDisplayInfo(child.feature_name);
          return displayInfo.category === categoryFilter;
        })
        .filter(child => !showEnabledOnly || child.is_enabled);

      const displayInfo = getFeatureDisplayInfo(parent.feature_name);
      // Use the actual user count if available, default to 0
      const actualUserCount = 0; // Will be fetched in real-time by the RolloutPercentageControl
      
      return {
        ...parent,
        children,
        category: displayInfo.category,
        icon: getCategoryIcon(displayInfo.category),
        componentCount: children.length,
        usageCount: actualUserCount,
        performanceImpact: children.length > 5 ? 'high' : children.length > 2 ? 'medium' : 'low'
      } as FeatureFlagWithChildren;
    })
    .filter(parent => {
      // Show parent if it matches search/filter or has matching children
      if (parent.children.length > 0) return true;
      
      if (!searchTerm && categoryFilter === "all") return true;
      
      if (searchTerm) {
        const displayInfo = getFeatureDisplayInfo(parent.feature_name);
        if (displayInfo.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            parent.feature_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (parent.description && parent.description.toLowerCase().includes(searchTerm.toLowerCase()))) {
          return true;
        }
      }
      
      if (categoryFilter !== "all") {
        return parent.category === categoryFilter;
      }
      
      return false;
    })
    .filter(parent => !showEnabledOnly || parent.is_enabled || parent.children.some(c => c.is_enabled));

    return parentFlags;
  }, [flags, searchTerm, categoryFilter, showEnabledOnly, getParentFeatures, getChildFeatures]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary" />
          <div className="space-y-2">
            <p className="text-lg font-medium">Loading Feature Flags...</p>
            <p className="text-sm text-muted-foreground">Organizing hierarchical structure</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header with Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Settings className="h-8 w-8 text-primary" />
            Feature Flags Manager
          </h1>
          <p className="text-muted-foreground mt-1">
            Surgical control over application functionality with hierarchical organization
          </p>
          <div className="flex gap-4 mt-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Database className="h-4 w-4" />
              {flags.length} total flags
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {flags.filter(f => f.is_enabled).length} enabled
            </span>
            <span className="flex items-center gap-1">
              <Layers className="h-4 w-4" />
              {getParentFeatures().length} categories
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExpandAll}>
            {expandAll ? <FolderOpen className="h-4 w-4 mr-2" /> : <Folder className="h-4 w-4 mr-2" />}
            {expandAll ? 'Collapse All' : 'Expand All'}
          </Button>
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" disabled={selectedFlags.size === 0}>
                <Sparkles className="h-4 w-4 mr-2" />
                Bulk Actions ({selectedFlags.size})
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Bulk Actions</DialogTitle>
                <DialogDescription>
                  Apply actions to {selectedFlags.size} selected feature flags
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Action</Label>
                  <Select value={bulkAction} onValueChange={(value: 'enable' | 'disable') => setBulkAction(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="enable">Enable</SelectItem>
                      <SelectItem value="disable">Disable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Label>Action</Label>
                  <Select value={bulkAction} onValueChange={(value: 'enable' | 'disable') => setBulkAction(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="enable">Enable All</SelectItem>
                      <SelectItem value="disable">Disable All</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowBulkDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleBulkAction}>
                    Apply to {selectedFlags.size} flags
                  </Button>
                  <Button variant="outline" onClick={() => { setShowBulkDialog(false); setShowBulkRollout(true); }}>
                    Set Rollout %
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={showNewFlagDialog} onOpenChange={setShowNewFlagDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Flag
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Feature Flag</DialogTitle>
                <DialogDescription>
                  Add a new feature flag to control application functionality
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="feature_name">Feature Name *</Label>
                  <Input
                    id="feature_name"
                    value={newFlag.feature_name}
                    onChange={(e) => setNewFlag({ ...newFlag, feature_name: e.target.value })}
                    placeholder="e.g., advanced_analytics"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={newFlag.description}
                    onChange={(e) => setNewFlag({ ...newFlag, description: e.target.value })}
                    placeholder="Describe what this feature controls..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="target_audience">Target Audience</Label>
                    <Select value={newFlag.target_audience} onValueChange={(value) => setNewFlag({ ...newFlag, target_audience: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        <SelectItem value="premium">Premium Users</SelectItem>
                        <SelectItem value="beta">Beta Users</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="rollout_percentage">Rollout Percentage</Label>
                    <div className="space-y-2">
                      <Slider
                        value={[newFlag.rollout_percentage]}
                        onValueChange={(values) => setNewFlag({ ...newFlag, rollout_percentage: values[0] })}
                        min={0}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex gap-1 justify-center">
                        {[0, 25, 50, 75, 100].map((value) => (
                          <Button
                            key={value}
                            size="sm"
                            variant={newFlag.rollout_percentage === value ? "default" : "outline"}
                            onClick={() => setNewFlag({ ...newFlag, rollout_percentage: value })}
                            className="text-xs px-2"
                            type="button"
                          >
                            {value}%
                          </Button>
                        ))}
                      </div>
                      <p className="text-sm text-center text-muted-foreground">
                        {newFlag.rollout_percentage}% of users will see this feature
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <Label htmlFor="parent_feature">Parent Feature (Optional)</Label>
                  <Select value={newFlag.parent_feature_id || ""} onValueChange={(value) => setNewFlag({ ...newFlag, parent_feature_id: value || null })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select parent feature..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No Parent</SelectItem>
                      {getParentFeatures().map(parent => (
                        <SelectItem key={parent.id} value={parent.id}>
                          {getFeatureDisplayInfo(parent.feature_name).displayName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowNewFlagDialog(false)}>
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

      {/* Enhanced Search and Filter Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
              <Input
                placeholder="Search feature flags, descriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="w-64">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by category..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {Object.entries(GRANULAR_FEATURE_CATEGORIES).map(([key, category]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <category.icon className="h-4 w-4" />
                        {category.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="enabled-only"
                checked={showEnabledOnly}
                onCheckedChange={(checked) => setShowEnabledOnly(checked === true)}
              />
              <Label htmlFor="enabled-only">Enabled only</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hierarchical Feature Flags Tree */}
      <div className="space-y-4">
        {organizedFlags.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="space-y-4">
                <Settings className="h-12 w-12 mx-auto text-muted-foreground" />
                <div>
                  <h3 className="text-lg font-medium">No feature flags found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm || categoryFilter !== "all" || showEnabledOnly
                      ? "Try adjusting your search or filters"
                      : "Create your first feature flag to get started"
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          organizedFlags.map((parentFlag) => {
            const displayInfo = getFeatureDisplayInfo(parentFlag.feature_name);
            const isExpanded = treeState[parentFlag.id]?.isExpanded ?? false;
            const performanceIndicator = getPerformanceIndicator(parentFlag.performanceImpact || 'low');
            
            return (
              <Card key={parentFlag.id} className="overflow-hidden">
                {/* Parent Feature Header */}
                <div className="p-4 bg-muted/30 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <Checkbox
                        checked={selectedFlags.has(parentFlag.feature_name)}
                        onCheckedChange={(checked) => handleSelectFlag(parentFlag.feature_name, checked as boolean)}
                      />
                      <Collapsible
                        open={isExpanded}
                        onOpenChange={() => toggleExpansion(parentFlag.id)}
                      >
                        <CollapsibleTrigger className="flex items-center gap-2 hover:bg-accent hover:text-accent-foreground rounded p-1 transition-colors">
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </CollapsibleTrigger>
                      </Collapsible>
                      <div className={`p-2 rounded-lg ${performanceIndicator.bg}`}>
                        <displayInfo.icon className={`h-5 w-5 ${displayInfo.color}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">{displayInfo.displayName}</h3>
                          <Badge variant="outline" className={getAudienceBadgeColor(parentFlag.target_audience || 'all')}>
                            {getAudienceIcon(parentFlag.target_audience || 'all')}
                            <span className="ml-1">{parentFlag.target_audience}</span>
                          </Badge>
                          <Badge variant="outline" className={`${performanceIndicator.color} ${performanceIndicator.bg} border-current`}>
                            <performanceIndicator.icon className="h-3 w-3 mr-1" />
                            {performanceIndicator.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{parentFlag.description}</p>
                        <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                          <span>{parentFlag.componentCount} components</span>
                          <span>{parentFlag.usageCount} users</span>
                        </div>
                        <div className="mt-3">
                          <RolloutPercentageControl
                            featureFlag={parentFlag}
                            onUpdate={refetch}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {parentFlag.is_enabled ? (
                          <Play className="h-4 w-4 text-green-600" />
                        ) : (
                          <Pause className="h-4 w-4 text-red-600" />
                        )}
                        <Switch
                          checked={parentFlag.is_enabled}
                          onCheckedChange={(checked) => handleParentToggle(parentFlag.feature_name, checked)}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Child Features */}
                <Collapsible open={isExpanded}>
                  <CollapsibleContent>
                    <div className="divide-y">
                      {parentFlag.children.map((childFlag) => {
                        const childDisplayInfo = getFeatureDisplayInfo(childFlag.feature_name);
                        const isParentDisabled = !parentFlag.is_enabled;
                        
                        return (
                          <div
                            key={childFlag.id}
                            className={`p-4 pl-16 transition-colors ${isParentDisabled ? 'opacity-50 bg-muted/20' : ''}`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 flex-1">
                                <Checkbox
                                  checked={selectedFlags.has(childFlag.feature_name)}
                                  onCheckedChange={(checked) => handleSelectFlag(childFlag.feature_name, checked as boolean)}
                                  disabled={isParentDisabled}
                                />
                                <div className={`p-1.5 rounded ${isParentDisabled ? 'bg-muted' : 'bg-background'} border`}>
                                  <childDisplayInfo.icon className={`h-4 w-4 ${childDisplayInfo.color}`} />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-medium">{childDisplayInfo.displayName}</h4>
                                    {isParentDisabled && (
                                      <Badge variant="outline" className="text-xs">
                                        Parent Disabled
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground">{childFlag.description}</p>
                                  {getUIImpacts(childFlag.feature_name).length > 0 && (
                                    <div className="flex gap-1 mt-1">
                                      {getUIImpacts(childFlag.feature_name).slice(0, 3).map((component, index) => (
                                        <Badge key={index} variant="secondary" className="text-xs">
                                          {component}
                                        </Badge>
                                      ))}
                                      {getUIImpacts(childFlag.feature_name).length > 3 && (
                                        <Badge variant="secondary" className="text-xs">
                                          +{getUIImpacts(childFlag.feature_name).length - 3} more
                                        </Badge>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <Badge variant="outline" className={getAudienceBadgeColor(childFlag.target_audience || 'all')}>
                                  {childFlag.rollout_percentage}%
                                </Badge>
                                <div className="flex items-center gap-2">
                                  {childFlag.is_enabled && !isParentDisabled ? (
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                  ) : (
                                    <XCircle className="h-4 w-4 text-red-600" />
                                  )}
                                  <Switch
                                    checked={childFlag.is_enabled}
                                    onCheckedChange={(checked) => handleToggle(childFlag.feature_name, !checked)}
                                    disabled={isParentDisabled}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            );
          })
        )}
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Confirm Feature Toggle
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action will affect UI components. Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          {pendingToggle && (
            <div className="space-y-2">
              <p className="font-medium">
                {pendingToggle.enabled ? 'Enabling' : 'Disabling'} "{pendingToggle.name}" will affect:
              </p>
              <div className="bg-orange-50 p-3 rounded border">
                {getUIImpacts(pendingToggle.name).map((component, index) => (
                  <div key={index} className="text-sm text-orange-800">
                    • {component}
                  </div>
                ))}
              </div>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmToggle}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <BulkRolloutControl
        isOpen={showBulkRollout}
        onClose={() => setShowBulkRollout(false)}
        selectedFeatures={Array.from(selectedFlags)}
        onSuccess={() => {
          refetch();
          setSelectedFlags(new Set());
          setShowBulkRollout(false);
        }}
      />
    </div>
  );
};

export default FeatureFlagsManager;