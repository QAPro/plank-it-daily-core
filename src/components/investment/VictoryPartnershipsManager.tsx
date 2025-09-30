import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Plus, Send, Calendar, Crown, Heart } from 'lucide-react';
import { useVictoryPartnerships } from '@/hooks/useVictoryPartnerships';
import { motion, AnimatePresence } from 'framer-motion';

const VictoryPartnershipsManager: React.FC = () => {
  const { 
    partnerships, 
    checkins, 
    loading, 
    createPartnership, 
    sendCheckin, 
    updatePartnership 
  } = useVictoryPartnerships();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCheckinDialogOpen, setIsCheckinDialogOpen] = useState(false);
  const [selectedPartnership, setSelectedPartnership] = useState<string>('');
  const [newPartnership, setNewPartnership] = useState({
    partner_email: '',
    check_in_frequency: 'daily',
    motivation_style: 'encouraging',
    shared_goals: {},
  });
  const [newCheckin, setNewCheckin] = useState({
    checkin_type: 'encouragement',
    message: '',
  });

  const motivationStyles = {
    encouraging: { 
      label: 'Encouraging Supporter', 
      description: 'Gentle motivation and positive reinforcement',
      icon: Heart,
      color: 'text-pink-500'
    },
    competitive: { 
      label: 'Friendly Competitor', 
      description: 'Healthy competition and achievement challenges',
      icon: Crown,
      color: 'text-yellow-500'
    },
    casual: { 
      label: 'Casual Companion', 
      description: 'Relaxed support and flexible check-ins',
      icon: Users,
      color: 'text-blue-500'
    },
  };

  const checkinTypes = {
    encouragement: { label: 'Words of Encouragement', emoji: '💪' },
    progress_share: { label: 'Progress Celebration', emoji: '📈' },
    goal_update: { label: 'Goal Achievement', emoji: '🎯' },
    celebration: { label: 'Victory Dance', emoji: '🎉' },
  };

  const handleCreatePartnership = async () => {
    // In a real app, you'd search for user by email and get their ID
    // For now, this is a placeholder for the partnership creation flow
    console.log('Create partnership:', newPartnership);
    setIsCreateDialogOpen(false);
  };

  const handleSendCheckin = async () => {
    const partnership = partnerships.find(p => p.id === selectedPartnership);
    if (!partnership) return;

    const receiverId = partnership.partner?.id;
    if (!receiverId) return;

    await sendCheckin(selectedPartnership, receiverId, newCheckin as any);
    setNewCheckin({ checkin_type: 'encouragement', message: '' });
    setIsCheckinDialogOpen(false);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2 text-primary" />
            Victory Partners
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-20 bg-muted rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Partnerships Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Users className="w-5 h-5 mr-2 text-primary" />
              Your Victory Partners
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Find Success Buddy
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Connect with Your Victory Partner</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Partner's Email</label>
                    <Input
                      placeholder="friend@example.com"
                      value={newPartnership.partner_email}
                      onChange={(e) => setNewPartnership({ ...newPartnership, partner_email: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Check-in Frequency</label>
                    <Select 
                      value={newPartnership.check_in_frequency} 
                      onValueChange={(value) => setNewPartnership({ ...newPartnership, check_in_frequency: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily Victory Check-ins</SelectItem>
                        <SelectItem value="weekly">Weekly Success Updates</SelectItem>
                        <SelectItem value="bi-weekly">Bi-weekly Progress Shares</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Partnership Style</label>
                    <Select 
                      value={newPartnership.motivation_style} 
                      onValueChange={(value) => setNewPartnership({ ...newPartnership, motivation_style: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(motivationStyles).map(([key, style]) => {
                          const Icon = style.icon;
                          return (
                            <SelectItem key={key} value={key}>
                              <div className="flex items-center">
                                <Icon className={`w-4 h-4 mr-2 ${style.color}`} />
                                <div>
                                  <div className="font-medium">{style.label}</div>
                                  <div className="text-xs text-muted-foreground">{style.description}</div>
                                </div>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleCreatePartnership} className="w-full">
                    Send Partnership Invitation
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {partnerships.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Find Your Success Buddy!</h3>
              <p className="text-muted-foreground mb-6">
                Partner with someone to share victories, stay motivated, and achieve success together!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {partnerships.map((partnership, index) => {
                  const style = motivationStyles[partnership.motivation_style as keyof typeof motivationStyles];
                  const StyleIcon = style.icon;
                  
                  return (
                    <motion.div
                      key={partnership.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className={partnership.partnership_status === 'active' ? 'border-primary' : ''}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mr-3">
                                <StyleIcon className={`w-6 h-6 ${style.color}`} />
                              </div>
                              <div>
                                <h4 className="font-semibold">
                                  {partnership.partner?.username || 'Victory Partner'}
                                </h4>
                                <p className="text-sm text-muted-foreground">{style.label}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant={partnership.partnership_status === 'active' ? 'default' : 'secondary'}
                              >
                                {partnership.partnership_status === 'active' ? '🏆 Active Partnership' : 
                                 partnership.partnership_status === 'pending' ? '⏳ Pending' : 
                                 'Completed'}
                              </Badge>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Check-ins:</span>
                              <span className="ml-2 capitalize">{partnership.check_in_frequency}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Since:</span>
                              <span className="ml-2">
                                {partnership.partnership_start_date ? 
                                  new Date(partnership.partnership_start_date).toLocaleDateString() : 
                                  'Just started!'}
                              </span>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Dialog open={isCheckinDialogOpen} onOpenChange={setIsCheckinDialogOpen}>
                              <DialogTrigger asChild>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => setSelectedPartnership(partnership.id)}
                                >
                                  <Send className="w-4 h-4 mr-2" />
                                  Send Encouragement
                                </Button>
                              </DialogTrigger>
                            </Dialog>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Check-ins */}
      {checkins.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-primary" />
              Recent Success Support
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {checkins.slice(0, 5).map((checkin) => {
                const checkinTypeData = checkinTypes[checkin.checkin_type as keyof typeof checkinTypes];
                return (
                  <div key={checkin.id} className="p-3 rounded bg-accent/50 border">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <span className="mr-2">{checkinTypeData.emoji}</span>
                        <span className="font-medium text-sm">{checkinTypeData.label}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(checkin.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm">{checkin.message}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Send Check-in Dialog */}
      <Dialog open={isCheckinDialogOpen} onOpenChange={setIsCheckinDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Your Support</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Type of Support</label>
              <Select 
                value={newCheckin.checkin_type} 
                onValueChange={(value) => setNewCheckin({ ...newCheckin, checkin_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(checkinTypes).map(([key, type]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center">
                        <span className="mr-2">{type.emoji}</span>
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Your Encouraging Message</label>
              <Textarea
                placeholder="You're doing amazing! Keep up the fantastic work..."
                value={newCheckin.message}
                onChange={(e) => setNewCheckin({ ...newCheckin, message: e.target.value })}
                rows={4}
              />
            </div>
            <Button onClick={handleSendCheckin} className="w-full">
              <Send className="w-4 h-4 mr-2" />
              Send Victory Support
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VictoryPartnershipsManager;