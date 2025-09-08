import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Shield, Clock, Award, Lock, TrendingUp, Zap, Crown } from 'lucide-react';
import { useInvestmentPortfolio, useSeasonalCertifications, useExclusiveFeatures, useInvestmentStreaks } from '@/hooks/useInvestmentProtection';

const InvestmentProtectionDashboard: React.FC = () => {
  const { data: portfolio, isLoading: portfolioLoading } = useInvestmentPortfolio();
  const { data: certifications, isLoading: certificationsLoading } = useSeasonalCertifications();
  const { data: exclusiveFeatures, isLoading: featuresLoading } = useExclusiveFeatures();
  const { data: investmentStreaks, isLoading: streaksLoading } = useInvestmentStreaks();

  if (portfolioLoading || certificationsLoading || featuresLoading || streaksLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="h-32 bg-muted/10" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const formatCurrency = (value: number) => `$${value.toFixed(2)}`;
  const formatDifficulty = (score: number) => {
    if (score < 2) return { label: 'Easy', color: 'bg-green-500' };
    if (score < 5) return { label: 'Moderate', color: 'bg-yellow-500' };
    if (score < 8) return { label: 'Hard', color: 'bg-orange-500' };
    return { label: 'Extreme', color: 'bg-red-500' };
  };

  return (
    <div className="space-y-6">
      {/* Portfolio Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <Card className="border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              Total Investment Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(portfolio?.totalPortfolioValue || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Accumulated across all systems
            </p>
          </CardContent>
        </Card>

        <Card className="border-orange-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              30-Day Abandonment Cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">
              {formatCurrency(portfolio?.abandonmentCost30d || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              What you'd lose by leaving
            </p>
          </CardContent>
        </Card>

        <Card className="border-red-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-red-500" />
              Recovery Difficulty
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${formatDifficulty(portfolio?.recoveryDifficultyScore || 1).color}`} />
              <span className="text-2xl font-bold">
                {formatDifficulty(portfolio?.recoveryDifficultyScore || 1).label}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Re-entry complexity level
            </p>
          </CardContent>
        </Card>
      </motion.div>

      <Tabs defaultValue="portfolio" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="portfolio">Portfolio Breakdown</TabsTrigger>
          <TabsTrigger value="streaks">Investment Streaks</TabsTrigger>
          <TabsTrigger value="certifications">Seasonal Certs</TabsTrigger>
          <TabsTrigger value="exclusive">Exclusive Access</TabsTrigger>
        </TabsList>

        <TabsContent value="portfolio" className="space-y-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Investment Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Social Capital</span>
                    <span className="font-medium">{formatCurrency(portfolio?.socialCapitalValue || 0)}</span>
                  </div>
                  <Progress value={(portfolio?.socialCapitalValue || 0) / (portfolio?.totalPortfolioValue || 1) * 100} className="h-2" />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Mastery Investment</span>
                    <span className="font-medium">{formatCurrency(portfolio?.masteryInvestmentValue || 0)}</span>
                  </div>
                  <Progress value={(portfolio?.masteryInvestmentValue || 0) / (portfolio?.totalPortfolioValue || 1) * 100} className="h-2" />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Exclusive Access</span>
                    <span className="font-medium">{formatCurrency(portfolio?.exclusiveAccessValue || 0)}</span>
                  </div>
                  <Progress value={(portfolio?.exclusiveAccessValue || 0) / (portfolio?.totalPortfolioValue || 1) * 100} className="h-2" />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Streak Multipliers</span>
                    <span className="font-medium">{formatCurrency(portfolio?.streakMultiplierValue || 0)}</span>
                  </div>
                  <Progress value={(portfolio?.streakMultiplierValue || 0) / (portfolio?.totalPortfolioValue || 1) * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-500/20 bg-red-500/5">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-red-600">
                  <AlertTriangle className="w-5 h-5" />
                  Abandonment Impact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">24 Hours</span>
                    <span className="font-medium text-yellow-600">{formatCurrency(portfolio?.abandonmentCost24h || 0)}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Immediate streak penalties and multiplier losses
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">7 Days</span>
                    <span className="font-medium text-orange-600">{formatCurrency(portfolio?.abandonmentCost7d || 0)}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Streak resets + partial exclusive access loss
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">30 Days</span>
                    <span className="font-medium text-red-600">{formatCurrency(portfolio?.abandonmentCost30d || 0)}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Complete investment loss + social reputation reset
                  </div>
                </div>

                <div className="pt-3 border-t">
                  <div className="text-sm font-medium text-center text-red-600">
                    ⚠️ These losses are permanent and cannot be recovered
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="streaks" className="space-y-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {investmentStreaks?.map((streak) => (
              <Card key={streak.id} className="border-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary" />
                    {streak.streakType.replace('_', ' ').toUpperCase()}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Current Multiplier</span>
                      <Badge variant="secondary">{streak.currentMultiplier.toFixed(1)}x</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Investment Value</span>
                      <span className="font-medium">{formatCurrency(streak.totalInvestmentValue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Reset Penalty</span>
                      <span className="font-medium text-red-500">{formatCurrency(streak.resetPenaltyValue)}</span>
                    </div>
                    <Progress value={(streak.currentMultiplier / streak.maxMultiplierAchieved) * 100} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        </TabsContent>

        <TabsContent value="certifications" className="space-y-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {certifications?.map((cert) => (
              <Card key={cert.id} className={cert.userCertification ? 'border-gold/50 bg-gold/5' : 'border-muted'}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    {cert.certificationName}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={cert.userCertification ? 'default' : 'secondary'}>
                      {cert.seasonPeriod} {cert.seasonYear}
                    </Badge>
                    <Badge variant="outline">
                      {cert.currentHolders}/{cert.maxHolders}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Prestige Value</span>
                      <span className="font-medium">{cert.prestigeValue} pts</span>
                    </div>
                    
                    {cert.userCertification && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-sm">Maintenance Score</span>
                          <span className="font-medium">{cert.userCertification.maintenanceScore}%</span>
                        </div>
                        <Progress value={cert.userCertification.maintenanceScore} className="h-2" />
                        <div className="text-xs text-muted-foreground">
                          Expires: {new Date(cert.userCertification.expiresAt).toLocaleDateString()}
                        </div>
                        {cert.userCertification.abandonmentCost > 0 && (
                          <div className="text-xs text-red-600 font-medium">
                            Abandonment Cost: {formatCurrency(cert.userCertification.abandonmentCost)}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        </TabsContent>

        <TabsContent value="exclusive" className="space-y-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {exclusiveFeatures?.map((feature) => (
              <Card key={feature.id} className={feature.userAccess ? 'border-primary/50 bg-primary/5' : 'border-muted'}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    {feature.userAccess ? <Crown className="w-4 h-4 text-primary" /> : <Lock className="w-4 h-4 text-muted-foreground" />}
                    {feature.featureName}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={feature.featureType === 'limited_edition' ? 'destructive' : 'secondary'}>
                      {feature.featureType.replace('_', ' ')}
                    </Badge>
                    {feature.maxUsers && (
                      <Badge variant="outline">
                        {feature.currentUsers}/{feature.maxUsers}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Scarcity Multiplier</span>
                      <span className="font-medium text-primary">{feature.scarcityMultiplier}x</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Prestige Value</span>
                      <span className="font-medium">{feature.prestigeValue} pts</span>
                    </div>
                    
                    {feature.userAccess ? (
                      <>
                        <Badge variant="default" className="w-full justify-center">
                          {feature.userAccess.accessLevel.toUpperCase()} ACCESS
                        </Badge>
                        <div className="text-xs text-muted-foreground">
                          Granted: {new Date(feature.userAccess.grantedAt).toLocaleDateString()}
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Investment Value</span>
                          <span className="font-medium">{formatCurrency(feature.userAccess.investmentValue)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Abandonment Penalty</span>
                          <span className="font-medium text-red-500">{formatCurrency(feature.userAccess.abandonmentPenalty)}</span>
                        </div>
                      </>
                    ) : (
                      <Button variant="outline" className="w-full" disabled>
                        <Lock className="w-4 h-4 mr-2" />
                        Invitation Required
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InvestmentProtectionDashboard;