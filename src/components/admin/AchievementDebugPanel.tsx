import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getBadgeUrl } from '@/utils/badgeAssets';
import { verifyBadgeAssets, getVerificationSummary, type BadgeVerificationReport } from '@/services/badgeVerificationService';
import { useAchievements } from '@/hooks/useAchievements';
import { getWhatsNextRecommendations, validateRecommendations, type RecommendedAchievement } from '@/services/whatsNextRecommendations';
import { Search, Filter, AlertTriangle, CheckCircle, Info, Wand2, LogOut, Sparkles, Target } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useBadgeProcessing } from '@/hooks/useBadgeProcessing';
import { handleAuthSignOut } from '@/utils/authCleanup';
import { useAuth } from '@/contexts/AuthContext';

export const AchievementDebugPanel = () => {
  const { user } = useAuth();
  const { data: achievements = [] } = useAchievements();
  const [filteredAchievements, setFilteredAchievements] = useState<any[]>(achievements);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [rarityFilter, setRarityFilter] = useState<string>('all');
  const [premiumFilter, setPremiumFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('active');
  const [verificationReport, setVerificationReport] = useState<BadgeVerificationReport | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const { status, processTestBatch, processAllBadges, replaceOriginals } = useBadgeProcessing();
  
  // Recommendations testing state
  const [testUserId, setTestUserId] = useState(user?.id || '');
  const [testAsPremium, setTestAsPremium] = useState(false);
  const [recommendations, setRecommendations] = useState<RecommendedAchievement[]>([]);
  const [isGeneratingRecs, setIsGeneratingRecs] = useState(false);
  const [validationReport, setValidationReport] = useState<ReturnType<typeof validateRecommendations> | null>(null);

  // Filter achievements based on search and filters
  useEffect(() => {
    let filtered = achievements;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(a =>
        a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(a => a.category === categoryFilter);
    }

    // Rarity filter
    if (rarityFilter !== 'all') {
      filtered = filtered.filter(a => a.rarity === rarityFilter);
    }

    // Premium filter
    if (premiumFilter !== 'all') {
      const isPremium = premiumFilter === 'premium';
      filtered = filtered.filter(a => a.is_premium === isPremium);
    }

    // Status filter (active/disabled)
    if (statusFilter === 'active') {
      filtered = filtered.filter(a => !(a as any).isDisabled);
    } else if (statusFilter === 'disabled') {
      filtered = filtered.filter(a => (a as any).isDisabled);
    }

    setFilteredAchievements(filtered);
  }, [searchTerm, categoryFilter, rarityFilter, premiumFilter, statusFilter, achievements]);

  // Run badge verification
  const handleVerification = async () => {
    setIsVerifying(true);
    try {
      const report = await verifyBadgeAssets();
      setVerificationReport(report);
      
      if (report.isValid) {
        toast({
          title: "✅ Verification Complete",
          description: "All badges verified successfully!",
        });
      } else {
        toast({
          title: "⚠️ Verification Issues Found",
          description: `${report.missingBadges.length} missing, ${report.validationErrors.length} errors`,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "❌ Verification Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Common': return 'bg-gray-500';
      case 'Uncommon': return 'bg-green-500';
      case 'Rare': return 'bg-blue-500';
      case 'Epic': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const handleSignOut = async () => {
    try {
      toast({
        title: "Signing out...",
        description: "Please wait."
      });
      await handleAuthSignOut();
    } catch (error) {
      console.error('Sign out error:', error);
      toast({
        title: "Sign out failed",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  // Generate test recommendations
  const handleGenerateRecommendations = async () => {
    if (!testUserId) {
      toast({
        title: "Error",
        description: "Please enter a user ID",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingRecs(true);
    try {
      const recs = await getWhatsNextRecommendations(testUserId, 5);
      setRecommendations(recs);
      
      const validation = validateRecommendations(recs, testUserId, testAsPremium);
      setValidationReport(validation);

      toast({
        title: validation.isValid ? "✅ Recommendations Generated" : "⚠️ Validation Issues",
        description: validation.isValid 
          ? `Generated ${recs.length} recommendations` 
          : `${validation.issues.length} issues found`,
        variant: validation.isValid ? "default" : "destructive"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate recommendations",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingRecs(false);
    }
  };

  const getReasonColor = (reason: RecommendedAchievement['recommendationReason']) => {
    switch (reason) {
      case 'almost_complete': return 'bg-green-500';
      case 'next_tier': return 'bg-blue-500';
      case 'category_diversity': return 'bg-purple-500';
      case 'seasonal_timely': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getReasonLabel = (reason: RecommendedAchievement['recommendationReason']) => {
    switch (reason) {
      case 'almost_complete': return 'Almost Complete';
      case 'next_tier': return 'Next Tier';
      case 'category_diversity': return 'Variety';
      case 'seasonal_timely': return 'Timely';
      default: return reason;
    }
  };

  return (
    <div className="space-y-6 p-6 pb-24">
      <Tabs defaultValue="gallery" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="gallery">Achievement Gallery</TabsTrigger>
          <TabsTrigger value="recommendations">Test Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="gallery" className="space-y-6 mt-6">
      {/* Header & Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>🏆 Achievement Debug Panel</span>
            <div className="flex gap-2">
              <Button onClick={handleVerification} disabled={isVerifying}>
                {isVerifying ? 'Verifying...' : 'Run Verification'}
              </Button>
              <Button onClick={handleSignOut} variant="outline" size="icon">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold">{achievements.length}</div>
              <div className="text-sm text-muted-foreground">Total Achievements</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{achievements.filter(a => a.is_premium).length}</div>
              <div className="text-sm text-muted-foreground">Premium Only</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{achievements.filter(a => a.is_secret).length}</div>
              <div className="text-sm text-muted-foreground">Secret</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-500">{achievements.filter(a => (a as any).isDisabled).length}</div>
              <div className="text-sm text-muted-foreground">Disabled</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{filteredAchievements.length}</div>
              <div className="text-sm text-muted-foreground">Filtered</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Badge Background Processing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5" />
            Badge Background Removal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Remove colored square backgrounds from badge PNGs, making them transparent for better display in trophy case.
            </p>
            
            <div className="flex gap-4">
              <Button 
                onClick={processTestBatch}
                disabled={status.isProcessing}
                variant="outline"
              >
                {status.isProcessing ? 'Processing...' : 'Test Batch (10 badges)'}
              </Button>
              
              <Button 
                onClick={processAllBadges}
                disabled={status.isProcessing}
              >
                {status.isProcessing ? 'Processing...' : 'Process All Badges'}
              </Button>
              
              <Button 
                onClick={replaceOriginals}
                disabled={status.isProcessing}
                variant="destructive"
              >
                {status.isProcessing ? 'Replacing...' : 'Replace Originals with Transparent'}
              </Button>
            </div>
            
            {status.isProcessing && (
              <div className="space-y-2">
                <Progress value={status.progress} />
                <p className="text-sm text-muted-foreground">
                  Processed: {status.completed} / {status.total}
                </p>
              </div>
            )}
            
            {status.errors.length > 0 && (
              <div className="bg-destructive/10 border border-destructive rounded-lg p-4">
                <p className="text-sm font-medium text-destructive mb-2">
                  {status.errors.length} errors occurred:
                </p>
                <ul className="text-xs text-destructive space-y-1 max-h-32 overflow-auto">
                  {status.errors.map((error, i) => (
                    <li key={i}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Verification Report */}
      {verificationReport && (
        <Card className={verificationReport.isValid ? 'border-green-500' : 'border-red-500'}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {verificationReport.isValid ? (
                <><CheckCircle className="w-5 h-5 text-green-500" /> Verification Passed</>
              ) : (
                <><AlertTriangle className="w-5 h-5 text-red-500" /> Verification Issues</>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded text-sm overflow-auto">
              {getVerificationSummary(verificationReport)}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search achievements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Milestones">Milestones</SelectItem>
                <SelectItem value="Consistency">Consistency</SelectItem>
                <SelectItem value="Momentum">Momentum</SelectItem>
                <SelectItem value="Performance">Performance</SelectItem>
                <SelectItem value="Social">Social</SelectItem>
                <SelectItem value="Special">Special</SelectItem>
              </SelectContent>
            </Select>

            <Select value={rarityFilter} onValueChange={setRarityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Rarities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Rarities</SelectItem>
                <SelectItem value="Common">Common</SelectItem>
                <SelectItem value="Uncommon">Uncommon</SelectItem>
                <SelectItem value="Rare">Rare</SelectItem>
                <SelectItem value="Epic">Epic</SelectItem>
              </SelectContent>
            </Select>

            <Select value={premiumFilter} onValueChange={setPremiumFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="free">Free Only</SelectItem>
                <SelectItem value="premium">Premium Only</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active Only</SelectItem>
                <SelectItem value="disabled">Disabled Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Achievement List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Achievements ({filteredAchievements.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {filteredAchievements.map((achievement) => (
                <div key={achievement.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  {/* Badge Image */}
                  <div className="w-20 h-20 flex-shrink-0">
                    <img
                      src={getBadgeUrl(achievement.badgeFileName)}
                      alt={achievement.name}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                      }}
                    />
                  </div>

                  {/* Achievement Info */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{achievement.name}</h3>
                        <p className="text-sm text-muted-foreground">{achievement.id}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={getRarityColor(achievement.rarity)}>
                          {achievement.rarity}
                        </Badge>
                        <Badge variant="outline">{achievement.points} pts</Badge>
                        {achievement.is_premium && <Badge variant="secondary">Premium</Badge>}
                        {achievement.is_secret && <Badge variant="destructive">Secret</Badge>}
                        {(achievement as any).isDisabled && <Badge variant="destructive" className="bg-red-600">DISABLED</Badge>}
                      </div>
                    </div>

                    <p className="text-sm">{achievement.description}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Category: {achievement.category}</span>
                      <span>•</span>
                      <span>Criteria: {achievement.criteria}</span>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      Badge File: {achievement.badgeFileName}
                    </div>

                    {(achievement as any).isDisabled && (
                      <div className="text-xs text-red-500 font-medium bg-red-50 dark:bg-red-950 p-2 rounded">
                        ⚠️ Disabled: {(achievement as any).disabledReason}
                      </div>
                    )}

                    {(achievement as any).unlockCriteria && (
                      <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                        <span className="font-medium">Unlock Logic:</span> {(achievement as any).unlockCriteria.type}
                        {(achievement as any).unlockCriteria.conditions?.description && (
                          <span className="ml-2">- {(achievement as any).unlockCriteria.conditions.description}</span>
                        )}
                      </div>
                    )}

                    {achievement.relatedExerciseCategories.length > 0 && (
                      <div className="flex gap-2">
                        {achievement.relatedExerciseCategories.map((cat) => (
                          <Badge key={cat} variant="outline" className="text-xs">
                            {cat}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6 mt-6">
          {/* Test Recommendations Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Test "What's Next?" Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">User ID</label>
                    <Input
                      placeholder="Enter user ID to test"
                      value={testUserId}
                      onChange={(e) => setTestUserId(e.target.value)}
                    />
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={testAsPremium}
                        onChange={(e) => setTestAsPremium(e.target.checked)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm font-medium">Test as Premium User</span>
                    </label>
                  </div>
                </div>

                <Button 
                  onClick={handleGenerateRecommendations}
                  disabled={isGeneratingRecs || !testUserId}
                  className="w-full"
                >
                  {isGeneratingRecs ? 'Generating...' : 'Generate Recommendations'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Validation Report */}
          {validationReport && (
            <Card className={validationReport.isValid ? 'border-green-500' : 'border-red-500'}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {validationReport.isValid ? (
                    <><CheckCircle className="w-5 h-5 text-green-500" /> Validation Passed</>
                  ) : (
                    <><AlertTriangle className="w-5 h-5 text-red-500" /> Validation Issues</>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {validationReport.isValid ? (
                  <p className="text-sm text-green-600">All validation checks passed!</p>
                ) : (
                  <div className="space-y-2">
                    {validationReport.issues.map((issue, i) => (
                      <p key={i} className="text-sm text-red-600">• {issue}</p>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Recommendations Results */}
          {recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Recommended Achievements ({recommendations.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-4">
                    {recommendations.map((rec) => (
                      <div key={rec.achievement.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        {/* Badge Image */}
                        <div className="w-20 h-20 flex-shrink-0">
                          <img
                            src={getBadgeUrl(rec.achievement.badgeFileName)}
                            alt={rec.achievement.name}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder.svg';
                            }}
                          />
                        </div>

                        {/* Achievement Info */}
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-lg">{rec.achievement.name}</h3>
                              <p className="text-sm text-muted-foreground">{rec.achievement.id}</p>
                            </div>
                            <div className="flex gap-2 flex-wrap justify-end">
                              <Badge className={getRarityColor(rec.achievement.rarity)}>
                                {rec.achievement.rarity}
                              </Badge>
                              <Badge variant="outline">{rec.achievement.points} pts</Badge>
                              <Badge className={getReasonColor(rec.recommendationReason)}>
                                {getReasonLabel(rec.recommendationReason)}
                              </Badge>
                              <Badge variant="secondary">Priority: {rec.priority}</Badge>
                            </div>
                          </div>

                          <p className="text-sm">{rec.achievement.description}</p>
                          
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Progress</span>
                              <span className="font-medium">{Math.round(rec.progress.percentage)}%</span>
                            </div>
                            <Progress value={rec.progress.percentage} className="h-2" />
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>{rec.progress.current} / {rec.progress.required}</span>
                              {rec.progress.estimatedCompletion && (
                                <span>{rec.progress.estimatedCompletion}</span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Category: {rec.achievement.category}</span>
                            <span>•</span>
                            <span>Criteria: {rec.achievement.criteria}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {recommendations.length === 0 && !isGeneratingRecs && validationReport && (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No recommendations generated. Try testing with a different user ID.
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
