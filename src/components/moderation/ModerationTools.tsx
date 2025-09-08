import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Shield, Eye, MessageSquare, Users, Flag } from 'lucide-react';
import { useLeadershipRoles } from '@/hooks/useLeadershipRoles';
import AdvancedFeatureGuard from '@/components/access/AdvancedFeatureGuard';
import LeadershipBadge from '@/components/leadership/LeadershipBadge';

interface ReportedContent {
  id: string;
  type: 'post' | 'comment' | 'user';
  content: string;
  reportedBy: string;
  reason: string;
  timestamp: Date;
  status: 'pending' | 'reviewed' | 'resolved';
}

const ModerationTools: React.FC = () => {
  const { role, canModerate, getSpecialPrivileges } = useLeadershipRoles();
  const [activeTab, setActiveTab] = useState('reports');

  // Mock reported content - in production, this would come from the database
  const reportedContent: ReportedContent[] = [
    {
      id: '1',
      type: 'post',
      content: 'Check out my amazing workout progress!',
      reportedBy: 'user123',
      reason: 'Spam',
      timestamp: new Date(),
      status: 'pending'
    },
    {
      id: '2',
      type: 'comment',
      content: 'This is inappropriate content...',
      reportedBy: 'user456',
      reason: 'Inappropriate content',
      timestamp: new Date(Date.now() - 86400000),
      status: 'pending'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="destructive">Pending</Badge>;
      case 'reviewed':
        return <Badge variant="secondary">Reviewed</Badge>;
      case 'resolved':
        return <Badge variant="default">Resolved</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'post':
        return <MessageSquare className="w-4 h-4" />;
      case 'comment':
        return <MessageSquare className="w-4 h-4" />;
      case 'user':
        return <Users className="w-4 h-4" />;
      default:
        return <Flag className="w-4 h-4" />;
    }
  };

  return (
    <AdvancedFeatureGuard feature="moderator_tools">
      <div className="space-y-6">
        {/* Header with Leadership Badge */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Moderation Tools
                </CardTitle>
                <CardDescription>
                  Manage community content and maintain platform quality
                </CardDescription>
              </div>
              <LeadershipBadge showPerks={false} size="md" />
            </div>
          </CardHeader>
        </Card>

        {/* Moderation Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Reports</p>
                  <p className="text-2xl font-bold text-destructive">
                    {reportedContent.filter(r => r.status === 'pending').length}
                  </p>
                </div>
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Actions This Week</p>
                  <p className="text-2xl font-bold">12</p>
                </div>
                <Shield className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Response Time</p>
                  <p className="text-2xl font-bold text-green-600">2.3h</p>
                </div>
                <Eye className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Moderation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Reported Content</CardTitle>
                <CardDescription>
                  Review and take action on reported posts, comments, and users
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportedContent.map((report) => (
                    <div key={report.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(report.type)}
                          <span className="font-medium capitalize">{report.type}</span>
                          {getStatusBadge(report.status)}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {report.timestamp.toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div className="bg-muted p-3 rounded">
                        <p className="text-sm">{report.content}</p>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          Reported by {report.reportedBy} • Reason: {report.reason}
                        </div>
                        
                        {report.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              Dismiss
                            </Button>
                            <Button size="sm" variant="destructive">
                              Remove
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">User Management</CardTitle>
                <CardDescription>
                  Manage user permissions and handle violations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-2" />
                  <p>User management tools will be displayed here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Moderation Settings</CardTitle>
                <CardDescription>
                  Configure moderation preferences and thresholds
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                      Your Moderation Privileges
                    </h4>
                    <div className="space-y-1">
                      {getSpecialPrivileges().map((privilege, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                          <Shield className="w-3 h-3" />
                          {privilege}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Leadership Development */}
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-900 dark:text-amber-100 mb-1">
                  Leadership Development Path
                </h4>
                <p className="text-sm text-amber-700 dark:text-amber-300 mb-3">
                  Your moderation abilities are tied to your overall community contribution and expertise. 
                  Continue building your status tracks and helping others to unlock advanced moderation features.
                </p>
                <Button size="sm" variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-100">
                  View Leadership Requirements
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdvancedFeatureGuard>
  );
};

export default ModerationTools;