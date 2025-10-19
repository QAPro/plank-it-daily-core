import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getBadgeUrl } from '@/utils/badgeAssets';
import { verifyBadgeAssets, getVerificationSummary, type BadgeVerificationReport } from '@/services/badgeVerificationService';
import { NEW_ACHIEVEMENT_DEFINITIONS, type NewAchievement } from '@/services/newAchievementDefinitions';
import { Search, Filter, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export const AchievementDebugPanel = () => {
  const [achievements] = useState<NewAchievement[]>(NEW_ACHIEVEMENT_DEFINITIONS);
  const [filteredAchievements, setFilteredAchievements] = useState<NewAchievement[]>(achievements);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [rarityFilter, setRarityFilter] = useState<string>('all');
  const [premiumFilter, setPremiumFilter] = useState<string>('all');
  const [verificationReport, setVerificationReport] = useState<BadgeVerificationReport | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

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
      filtered = filtered.filter(a => a.isPremium === isPremium);
    }

    setFilteredAchievements(filtered);
  }, [searchTerm, categoryFilter, rarityFilter, premiumFilter, achievements]);

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

  return (
    <div className="space-y-6 p-6">
      {/* Header & Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>🏆 Achievement Debug Panel</span>
            <Button onClick={handleVerification} disabled={isVerifying}>
              {isVerifying ? 'Verifying...' : 'Run Verification'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold">{achievements.length}</div>
              <div className="text-sm text-muted-foreground">Total Achievements</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{achievements.filter(a => a.isPremium).length}</div>
              <div className="text-sm text-muted-foreground">Premium Only</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{achievements.filter(a => a.isSecret).length}</div>
              <div className="text-sm text-muted-foreground">Secret</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{filteredAchievements.length}</div>
              <div className="text-sm text-muted-foreground">Filtered</div>
            </div>
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
          <div className="grid grid-cols-4 gap-4">
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
                        {achievement.isPremium && <Badge variant="secondary">Premium</Badge>}
                        {achievement.isSecret && <Badge variant="destructive">Secret</Badge>}
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
    </div>
  );
};
