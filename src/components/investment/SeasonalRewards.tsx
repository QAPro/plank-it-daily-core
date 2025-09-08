import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Award, Calendar, Clock, Users, Zap, AlertTriangle, Crown } from 'lucide-react';
import { useSeasonalCertifications } from '@/hooks/useInvestmentProtection';

const SeasonalRewards: React.FC = () => {
  const { data: certifications, isLoading } = useSeasonalCertifications();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="h-32 bg-muted/10" />
          </Card>
        ))}
      </div>
    );
  }

  const activeCertifications = certifications?.filter(cert => 
    new Date(cert.endDate) > new Date()
  ) || [];

  const userCertifications = certifications?.filter(cert => cert.userCertification) || [];

  const getSeasonalColor = (season: string) => {
    switch (season.toLowerCase()) {
      case 'winter': return 'bg-blue-500';
      case 'spring': return 'bg-green-500';
      case 'summer': return 'bg-yellow-500';
      case 'fall': case 'autumn': return 'bg-orange-500';
      default: return 'bg-primary';
    }
  };

  const getSeasonalIcon = (season: string) => {
    switch (season.toLowerCase()) {
      case 'winter': return '❄️';
      case 'spring': return '🌸';
      case 'summer': return '☀️';
      case 'fall': case 'autumn': return '🍂';
      default: return '✨';
    }
  };

  const isExpiringSoon = (expiryDate: string) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return daysUntilExpiry <= 30;
  };

  const getDaysRemaining = (date: string) => {
    const now = new Date();
    const target = new Date(date);
    const days = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, days);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Seasonal Rewards</h2>
          <p className="text-muted-foreground mt-1">
            Limited-time certifications that expire if not maintained
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          {userCertifications.length} Active Certifications
        </Badge>
      </div>

      {/* User's Active Certifications */}
      {userCertifications.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Crown className="w-5 h-5 text-primary" />
            Your Active Certifications
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userCertifications.map((cert) => (
              <motion.div
                key={cert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className={`border-gold/50 bg-gold/5 ${isExpiringSoon(cert.userCertification!.expiresAt) ? 'ring-2 ring-red-500/50' : ''}`}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <span className="text-lg">{getSeasonalIcon(cert.seasonPeriod)}</span>
                      {cert.certificationName}
                      {isExpiringSoon(cert.userCertification!.expiresAt) && (
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                      )}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="default">Earned</Badge>
                      <Badge variant="outline" className="text-xs">
                        {cert.prestigeValue} prestige
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Maintenance Score</span>
                        <span className="font-medium">
                          {cert.userCertification!.maintenanceScore}%
                        </span>
                      </div>
                      <Progress 
                        value={cert.userCertification!.maintenanceScore} 
                        className={`h-2 ${cert.userCertification!.maintenanceScore < 50 ? 'bg-red-100' : ''}`}
                      />
                    </div>

                    <div className="text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Expires in:</span>
                        <span className={`font-medium ${isExpiringSoon(cert.userCertification!.expiresAt) ? 'text-red-600' : ''}`}>
                          {getDaysRemaining(cert.userCertification!.expiresAt)} days
                        </span>
                      </div>
                      {cert.userCertification!.abandonmentCost > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Abandonment Cost:</span>
                          <span className="font-medium text-red-600">
                            ${cert.userCertification!.abandonmentCost.toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>

                    {isExpiringSoon(cert.userCertification!.expiresAt) && (
                      <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded text-xs text-red-700 dark:text-red-300">
                        ⚠️ This certification expires soon! Maintain your progress to keep it.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Available Certifications */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Award className="w-5 h-5" />
          Available Seasonal Certifications
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeCertifications.map((cert) => {
            const isEarned = !!cert.userCertification;
            const spotsRemaining = cert.maxHolders - cert.currentHolders;
            const availabilityPercentage = (cert.currentHolders / cert.maxHolders) * 100;
            
            return (
              <motion.div
                key={cert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className={`${isEarned ? 'border-primary/50' : 'border-muted'} ${spotsRemaining <= 5 ? 'ring-2 ring-red-500/20' : ''}`}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <span className="text-lg">{getSeasonalIcon(cert.seasonPeriod)}</span>
                      {cert.certificationName}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {cert.seasonPeriod} {cert.seasonYear}
                      </Badge>
                      <Badge variant={spotsRemaining <= 5 ? 'destructive' : 'secondary'}>
                        {spotsRemaining} spots left
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Availability</span>
                        <span className="font-medium">
                          {cert.currentHolders}/{cert.maxHolders}
                        </span>
                      </div>
                      <Progress 
                        value={availabilityPercentage} 
                        className={`h-2 ${availabilityPercentage > 90 ? 'bg-red-100' : ''}`}
                      />
                    </div>

                    <div className="text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Prestige Value:</span>
                        <span className="font-medium text-primary">
                          {cert.prestigeValue} points
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Period ends:</span>
                        <span className="font-medium">
                          {getDaysRemaining(cert.endDate)} days
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Expires:</span>
                        <span className="font-medium">
                          {getDaysRemaining(cert.expiryDate)} days
                        </span>
                      </div>
                    </div>

                    {/* Requirements */}
                    {cert.maintenanceRequirement && (
                      <div className="p-2 bg-muted/20 rounded text-xs">
                        <div className="font-medium mb-1">Requirements:</div>
                        <ul className="space-y-0.5 text-muted-foreground">
                          {cert.maintenanceRequirement.min_sessions_per_week && (
                            <li>• {cert.maintenanceRequirement.min_sessions_per_week} sessions/week</li>
                          )}
                          {cert.maintenanceRequirement.min_duration_seconds && (
                            <li>• {Math.floor(cert.maintenanceRequirement.min_duration_seconds / 60)} min sessions</li>
                          )}
                          {cert.maintenanceRequirement.social_interactions && (
                            <li>• {cert.maintenanceRequirement.social_interactions} social interactions</li>
                          )}
                          {cert.maintenanceRequirement.mastery_level && (
                            <li>• Level {cert.maintenanceRequirement.mastery_level} mastery</li>
                          )}
                          {cert.maintenanceRequirement.min_streak && (
                            <li>• {cert.maintenanceRequirement.min_streak} day streak</li>
                          )}
                        </ul>
                      </div>
                    )}

                    {spotsRemaining <= 5 && (
                      <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded text-xs text-red-700 dark:text-red-300">
                        🔥 Only {spotsRemaining} spots remaining! This certification may close soon.
                      </div>
                    )}

                    <Button 
                      variant={isEarned ? "default" : "outline"} 
                      size="sm" 
                      className="w-full"
                      disabled={isEarned || spotsRemaining === 0}
                    >
                      {isEarned ? (
                        <>
                          <Crown className="w-4 h-4 mr-2" />
                          Earned
                        </>
                      ) : spotsRemaining === 0 ? (
                        'Full'
                      ) : (
                        <>
                          <Zap className="w-4 h-4 mr-2" />
                          Start Challenge
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* FOMO Warning */}
      <Card className="border-red-500/20 bg-red-500/5">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-red-600">
            <Clock className="w-5 h-5" />
            Time-Sensitive Investment Warning
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-red-700 dark:text-red-300">
              Seasonal certifications are <strong>limited-time investments</strong> that require consistent maintenance. 
              Once expired, they cannot be re-earned and represent permanent loss of prestige value.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <h5 className="font-medium text-red-700 dark:text-red-300 mb-1">⚠️ Expiration Risks</h5>
                <ul className="text-xs text-red-600 dark:text-red-400 space-y-0.5">
                  <li>• Certifications expire if maintenance drops below 50%</li>
                  <li>• No recovery mechanism once expired</li>
                  <li>• Prestige value permanently lost</li>
                  <li>• Future seasonal access may be restricted</li>
                </ul>
              </div>
              
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <h5 className="font-medium text-yellow-700 dark:text-yellow-300 mb-1">🔥 Scarcity Pressure</h5>
                <ul className="text-xs text-yellow-600 dark:text-yellow-400 space-y-0.5">
                  <li>• Limited spots create competitive pressure</li>
                  <li>• First-come, first-served allocation</li>
                  <li>• Exclusive access to future opportunities</li>
                  <li>• Social status differentiation</li>
                </ul>
              </div>
            </div>

            <div className="text-center p-3 bg-primary/5 rounded-lg">
              <p className="text-sm font-medium text-primary">
                💎 Your seasonal certifications are irreplaceable investments in your platform status
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SeasonalRewards;