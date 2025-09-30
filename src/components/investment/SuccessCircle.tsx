import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, Plus, Heart, MessageCircle, Share2, Star, Calendar, User } from 'lucide-react';
import { useSuccessStories } from '@/hooks/useSuccessStories';
import { motion, AnimatePresence } from 'framer-motion';

const SuccessCircle: React.FC = () => {
  const { 
    stories, 
    loading, 
    createSuccessStory, 
    reactToStory, 
    addComment, 
    getStoryComments 
  } = useSuccessStories();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedStory, setSelectedStory] = useState<string>('');
  const [newStory, setNewStory] = useState({
    story_title: '',
    story_content: '',
    story_type: 'transformation',
    is_public: true,
  });
  const [commentText, setCommentText] = useState('');

  const storyTypes = {
    transformation: { 
      label: 'Transformation Journey', 
      emoji: '✨', 
      description: 'Your amazing physical or mental transformation'
    },
    breakthrough: { 
      label: 'Breakthrough Moment', 
      emoji: '💥', 
      description: 'A moment when everything clicked'
    },
    milestone: { 
      label: 'Milestone Achievement', 
      emoji: '🏆', 
      description: 'Reaching an important goal or target'
    },
    inspiration: { 
      label: 'Daily Inspiration', 
      emoji: '🌟', 
      description: 'What keeps you motivated every day'
    },
    tip: { 
      label: 'Success Tip', 
      emoji: '💡', 
      description: 'Helpful advice for others on their journey'
    },
  };

  const reactionTypes = {
    inspiration: { emoji: '✨', label: 'So Inspiring!' },
    motivation: { emoji: '💪', label: 'Pure Motivation' },
    amazing: { emoji: '🤩', label: 'Amazing!' },
    goals: { emoji: '🎯', label: 'Goals AF' },
    strength: { emoji: '💎', label: 'Pure Strength' },
  };

  const handleCreateStory = async () => {
    if (!newStory.story_title.trim() || !newStory.story_content.trim()) return;
    
    await createSuccessStory(newStory as any);
    setNewStory({
      story_title: '',
      story_content: '',
      story_type: 'transformation',
      is_public: true,
    });
    setIsCreateDialogOpen(false);
  };

  const handleReaction = async (storyId: string, reactionType: string) => {
    await reactToStory(storyId, reactionType as any);
  };

  const handleAddComment = async (storyId: string) => {
    if (!commentText.trim()) return;
    
    await addComment(storyId, commentText);
    setCommentText('');
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BookOpen className="w-5 h-5 mr-2 text-primary" />
            Success Circle
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-3">
                <div className="h-4 bg-muted rounded w-1/3" />
                <div className="h-20 bg-muted rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Create Story Button */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
        <CardContent className="p-6 text-center">
          <BookOpen className="w-12 h-12 mx-auto text-primary mb-4" />
          <h3 className="text-lg font-semibold mb-2">Share Your Success Story!</h3>
          <p className="text-muted-foreground mb-4">
            Inspire others with your journey and become part of our amazing Success Circle
          </p>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg">
                <Plus className="w-4 h-4 mr-2" />
                Share Your Victory
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Share Your Success Story</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Story Type</label>
                  <Select 
                    value={newStory.story_type} 
                    onValueChange={(value) => setNewStory({ ...newStory, story_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(storyTypes).map(([key, type]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center">
                            <span className="mr-2">{type.emoji}</span>
                            <div>
                              <div className="font-medium">{type.label}</div>
                              <div className="text-xs text-muted-foreground">{type.description}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Story Title</label>
                  <Input
                    placeholder="My Amazing Transformation Journey..."
                    value={newStory.story_title}
                    onChange={(e) => setNewStory({ ...newStory, story_title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Your Story</label>
                  <Textarea
                    placeholder="Share your journey, what challenges you overcame, breakthroughs you had, and how you're growing stronger every day..."
                    value={newStory.story_content}
                    onChange={(e) => setNewStory({ ...newStory, story_content: e.target.value })}
                    rows={6}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="public"
                    checked={newStory.is_public}
                    onChange={(e) => setNewStory({ ...newStory, is_public: e.target.checked })}
                  />
                  <label htmlFor="public" className="text-sm">
                    Share publicly to inspire the Success Circle
                  </label>
                </div>
                <Button onClick={handleCreateStory} className="w-full" size="lg">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Share Your Success Story
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Success Stories Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-primary" />
              Success Circle Stories
            </div>
            <Badge variant="secondary">{stories.length} Inspiring Stories</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stories.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Start the Success Circle!</h3>
              <p className="text-muted-foreground">
                Be the first to share an inspiring story and start building our community of success!
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <AnimatePresence>
                {stories.map((story, index) => {
                  const storyTypeData = storyTypes[story.story_type as keyof typeof storyTypes];
                  
                  return (
                    <motion.div
                      key={story.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border rounded-lg p-6 bg-card hover:bg-accent/30 transition-colors"
                    >
                      {/* Story Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mr-3">
                            <User className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-semibold">
                              {story.author?.username || 'Success Champion'}
                            </h4>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Calendar className="w-3 h-3 mr-1" />
                              {new Date(story.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <Badge className="flex items-center">
                          <span className="mr-1">{storyTypeData.emoji}</span>
                          {storyTypeData.label}
                        </Badge>
                      </div>

                      {/* Story Content */}
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold mb-2">{story.story_title}</h3>
                        <p className="text-muted-foreground leading-relaxed">{story.story_content}</p>
                      </div>

                      {/* Story Actions */}
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center space-x-4">
                          {/* Reactions */}
                          <div className="flex items-center space-x-2">
                            {Object.entries(reactionTypes).map(([key, reaction]) => (
                              <button
                                key={key}
                                onClick={() => handleReaction(story.id, key)}
                                className="flex items-center space-x-1 px-2 py-1 rounded hover:bg-accent transition-colors"
                              >
                                <span>{reaction.emoji}</span>
                                <span className="text-xs">{reaction.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <Heart className="w-4 h-4 mr-1" />
                            {story.likes_count} reactions
                          </div>
                          <div className="flex items-center">
                            <MessageCircle className="w-4 h-4 mr-1" />
                            {story.comments_count} comments
                          </div>
                          <div className="flex items-center">
                            <Share2 className="w-4 h-4 mr-1" />
                            {story.shares_count} shares
                          </div>
                        </div>
                      </div>

                      {/* Add Comment */}
                      <div className="mt-4 pt-4 border-t">
                        <div className="flex space-x-2">
                          <Input
                            placeholder="Add words of encouragement..."
                            value={selectedStory === story.id ? commentText : ''}
                            onChange={(e) => {
                              setSelectedStory(story.id);
                              setCommentText(e.target.value);
                            }}
                          />
                          <Button 
                            size="sm" 
                            onClick={() => handleAddComment(story.id)}
                            disabled={!commentText.trim()}
                          >
                            <MessageCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SuccessCircle;