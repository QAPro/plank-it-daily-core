import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Network, 
  Lock, 
  Trophy, 
  Users, 
  Camera, 
  Music, 
  MessageSquare,
  Shield,
  Crown,
  Star,
  Gift,
  AlertTriangle
} from 'lucide-react';

import CrossSystemGuard from '@/components/access/CrossSystemGuard';
import AdvancedFeatureGuard from '@/components/access/AdvancedFeatureGuard';
import LeadershipBadge from '@/components/leadership/LeadershipBadge';
import SeasonalRewards from '@/components/seasonal/SeasonalRewards';
import ModerationTools from '@/components/moderation/ModerationTools';
import { useLeadershipRoles } from '@/hooks/useLeadershipRoles';

const InvestmentWebDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { role, getSpecialPrivileges } = useLeadershipRoles();

  const mockUpgradeAction = () => {
    console.log('Starting upgrade journey...');
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 border-purple-200 dark:border-purple-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                <Network className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <CardTitle className="text-purple-900 dark:text-purple-100 text-2xl">
                  Investment "Lock-in" Web System
                </CardTitle>
                <CardDescription className="text-purple-700 dark:text-purple-300">
                  Interconnected progress across tracks, reputation, and social systems creates exponential switching costs
                </CardDescription>
              </div>
            </div>
            {role && <LeadershipBadge showPerks={false} />}
          </div>
        </CardHeader>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="social">Social Features</TabsTrigger>
          <TabsTrigger value="leadership">Leadership</TabsTrigger>
          <TabsTrigger value="seasonal">Seasonal</TabsTrigger>
          <TabsTrigger value="moderation">Moderation</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Cross-System Dependencies */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Cross-System Dependencies
                </CardTitle>
                <CardDescription>
                  Features require progress across multiple systems
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <Camera className="w-4 h-4 text-pink-500" />
                      <span className="font-medium">Photo Sharing</span>
                    </div>
                    <Badge variant="outline">Reputation + Consistency</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <Music className="w-4 h-4 text-green-500" />
                      <span className="font-medium">Playlist Sharing</span>
                    </div>
                    <Badge variant="outline">Social + Consistency</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-indigo-500" />
                      <span className="font-medium">Unlimited Posts</span>
                    </div>
                    <Badge variant="outline">High Reputation</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-purple-500" />
                      <span className="font-medium">Advanced Analytics</span>
                    </div>
                    <Badge variant="outline">Multi-Track Mastery</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Leadership Hierarchy */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5" />
                  Leadership Hierarchy
                </CardTitle>
                <CardDescription>
                  Exclusive roles with increasing privileges
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-200 to-gray-300 text-gray-800 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      <span className="font-medium">Moderator</span>
                    </div>
                    <Badge variant="outline">Level 7+ | 200 Karma</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-300 to-yellow-500 text-yellow-900 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      <span className="font-medium">Community Leader</span>
                    </div>
                    <Badge variant="outline">Level 10+ | 500 Karma</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-300 to-gray-500 text-white rounded-lg">
                    <div className="flex items-center gap-2">
                      <Crown className="w-4 h-4" />
                      <span className="font-medium">Expert</span>
                    </div>
                    <Badge variant="outline">Level 15+ | 1000 Karma</Badge>
                  </div>
                </div>

                {role && (
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                      Your Current Privileges:
                    </div>
                    <div className="space-y-1">
                      {getSpecialPrivileges().map((privilege, index) => (
                        <div key={index} className="text-xs text-blue-700 dark:text-blue-300">
                          • {privilege}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Investment Protection Warning */}
          <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">
                    Investment Protection System Active
                  </h3>
                  <p className="text-sm text-amber-700 dark:text-amber-300 mb-3">
                    Your progress across status tracks, reputation, social connections, and seasonal rewards 
                    creates an interconnected web of value. Abandoning your journey means permanently losing:
                  </p>
                  <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1 ml-4 list-disc">
                    <li>Advanced feature access requiring cross-system progress</li>
                    <li>Leadership roles and exclusive moderation privileges</li>
                    <li>Limited-time seasonal rewards and exclusive themes</li>
                    <li>Social reputation and community standing</li>
                    <li>Interconnected achievements spanning multiple systems</li>
                  </ul>
                  <p className="text-sm text-amber-700 dark:text-amber-300 mt-3 font-medium">
                    The more you invest across systems, the more costly it becomes to leave.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <AdvancedFeatureGuard feature="advanced_analytics" upgradeAction={mockUpgradeAction}>
            <Card>
              <CardHeader>
                <CardTitle>Advanced Analytics Dashboard</CardTitle>
                <CardDescription>
                  Deep insights across all your progress systems
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Star className="w-16 h-16 mx-auto mb-4 text-purple-500" />
                  <h3 className="font-semibold mb-2">Multi-System Analytics Unlocked!</h3>
                  <p className="text-muted-foreground">
                    View cross-track correlations, reputation trends, and predictive insights.
                  </p>
                </div>
              </CardContent>
            </Card>
          </AdvancedFeatureGuard>
        </TabsContent>

        <TabsContent value="social" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <AdvancedFeatureGuard feature="photo_sharing" upgradeAction={mockUpgradeAction}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="w-5 h-5" />
                    Photo Sharing
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center py-8 text-muted-foreground">
                    Share your victory photos with the community!
                  </p>
                </CardContent>
              </Card>
            </AdvancedFeatureGuard>

            <AdvancedFeatureGuard feature="playlist_sharing" upgradeAction={mockUpgradeAction}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Music className="w-5 h-5" />
                    Playlist Sharing
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center py-8 text-muted-foreground">
                    Share your workout playlists with others!
                  </p>
                </CardContent>
              </Card>
            </AdvancedFeatureGuard>
          </div>

          <AdvancedFeatureGuard feature="unlimited_posts" upgradeAction={mockUpgradeAction}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Unlimited Posting
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center py-8 text-muted-foreground">
                  Post as much as you want without limits!
                </p>
              </CardContent>
            </Card>
          </AdvancedFeatureGuard>
        </TabsContent>

        <TabsContent value="leadership">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Leadership Development</CardTitle>
                <CardDescription>
                  Build your community standing to unlock leadership roles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  {role ? (
                    <div>
                      <LeadershipBadge showPerks={true} size="lg" />
                      <p className="mt-4 text-muted-foreground">
                        You have achieved leadership status in our community!
                      </p>
                    </div>
                  ) : (
                    <div>
                      <Crown className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="font-semibold mb-2">Leadership Awaits</h3>
                      <p className="text-muted-foreground">
                        Build your status tracks and community reputation to unlock leadership roles.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="seasonal">
          <SeasonalRewards />
        </TabsContent>

        <TabsContent value="moderation">
          <ModerationTools />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InvestmentWebDemo;