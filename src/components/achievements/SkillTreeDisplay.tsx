import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Lock, Unlock, Crown, Star, Zap } from 'lucide-react';
import { SkillTreeEngine, type SkillTree, type SkillNode } from '@/services/skillTreeService';
import { useAuth } from '@/contexts/AuthContext';

interface SkillTreeDisplayProps {
  selectedTree?: string;
  onNodeClick?: (node: SkillNode) => void;
}

const SkillTreeDisplay = ({ selectedTree, onNodeClick }: SkillTreeDisplayProps) => {
  const { user } = useAuth();
  const [trees] = useState(SkillTreeEngine.getAllTrees());
  const [activeTree, setActiveTree] = useState<SkillTree | null>(null);
  const [unlockedNodes, setUnlockedNodes] = useState<Map<string, boolean>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProgress = async () => {
      if (!user?.id) return;
      
      const engine = new SkillTreeEngine(user.id);
      const progress = await engine.getUserProgress();
      setUnlockedNodes(progress);
      setLoading(false);
    };

    loadProgress();
  }, [user?.id]);

  useEffect(() => {
    if (selectedTree) {
      const tree = SkillTreeEngine.getTreeById(selectedTree);
      setActiveTree(tree || trees[0]);
    } else {
      setActiveTree(trees[0]);
    }
  }, [selectedTree, trees]);

  const getNodeIcon = (node: SkillNode, isUnlocked: boolean) => {
    if (!isUnlocked) return <Lock className="w-5 h-5" />;
    
    switch (node.tier) {
      case 1: return <Zap className="w-5 h-5" />;
      case 2: return <Star className="w-5 h-5" />;
      case 3: return <Crown className="w-5 h-5" />;
      case 4: 
      case 5: return <Crown className="w-5 h-5 text-yellow-400" />;
      default: return <Unlock className="w-5 h-5" />;
    }
  };

  const getNodeStyles = (node: SkillNode, isUnlocked: boolean) => {
    const baseStyles = "relative p-4 border-2 transition-all duration-300 cursor-pointer";
    
    if (!isUnlocked) {
      return `${baseStyles} bg-muted/50 border-muted text-muted-foreground hover:bg-muted/70`;
    }

    switch (node.tier) {
      case 1:
        return `${baseStyles} bg-gradient-to-br from-green-50 to-emerald-100 border-green-300 hover:from-green-100 hover:to-emerald-200 text-green-800`;
      case 2:
        return `${baseStyles} bg-gradient-to-br from-blue-50 to-cyan-100 border-blue-300 hover:from-blue-100 hover:to-cyan-200 text-blue-800`;
      case 3:
        return `${baseStyles} bg-gradient-to-br from-purple-50 to-violet-100 border-purple-300 hover:from-purple-100 hover:to-violet-200 text-purple-800`;
      case 4:
        return `${baseStyles} bg-gradient-to-br from-orange-50 to-amber-100 border-orange-300 hover:from-orange-100 hover:to-amber-200 text-orange-800`;
      case 5:
        return `${baseStyles} bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-400 hover:from-yellow-100 hover:to-yellow-200 text-yellow-900 shadow-lg shadow-yellow-200`;
      default:
        return `${baseStyles} bg-gradient-to-br from-gray-50 to-slate-100 border-gray-300 hover:from-gray-100 hover:to-slate-200 text-gray-800`;
    }
  };

  const getTierLabel = (tier: number) => {
    switch (tier) {
      case 1: return 'Novice';
      case 2: return 'Apprentice';
      case 3: return 'Adept';
      case 4: return 'Expert';
      case 5: return 'Master';
      default: return 'Unknown';
    }
  };

  const getTreeProgress = (tree: SkillTree) => {
    const totalNodes = tree.nodes.length;
    const unlockedCount = tree.nodes.filter(node => unlockedNodes.get(node.id)).length;
    return Math.round((unlockedCount / totalNodes) * 100);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tree Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {trees.map((tree) => {
          const progress = getTreeProgress(tree);
          const isActive = activeTree?.id === tree.id;
          
          return (
            <motion.div
              key={tree.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                className={`
                  p-4 cursor-pointer transition-all duration-300
                  ${isActive 
                    ? `bg-gradient-to-br ${tree.color} text-white shadow-lg` 
                    : 'hover:shadow-md'
                  }
                `}
                onClick={() => setActiveTree(tree)}
              >
                <div className="text-center space-y-3">
                  <div className="text-2xl">{tree.icon}</div>
                  <div>
                    <h3 className="font-semibold text-sm">{tree.name}</h3>
                    <p className={`text-xs ${isActive ? 'text-white/80' : 'text-muted-foreground'}`}>
                      {tree.description}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <Progress value={progress} className="h-2" />
                    <p className={`text-xs ${isActive ? 'text-white/80' : 'text-muted-foreground'}`}>
                      {progress}% Complete
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Active Tree Display */}
      {activeTree && (
        <motion.div
          key={activeTree.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
              <span className="text-3xl">{activeTree.icon}</span>
              {activeTree.name}
            </h2>
            <p className="text-muted-foreground">{activeTree.description}</p>
          </div>

          {/* Skill Nodes by Tier */}
          {[1, 2, 3, 4, 5].map(tier => {
            const tierNodes = activeTree.nodes.filter(node => node.tier === tier);
            if (tierNodes.length === 0) return null;

            return (
              <div key={tier} className="space-y-4">
                <div className="flex items-center justify-center">
                  <Badge variant="outline" className="text-sm font-medium">
                    Tier {tier} - {getTierLabel(tier)}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tierNodes.map((node) => {
                    const isUnlocked = unlockedNodes.get(node.id) || false;
                    const hasPrerequisites = node.prerequisites.every(prereqId => 
                      unlockedNodes.get(prereqId)
                    );
                    const canUnlock = hasPrerequisites && !isUnlocked;

                    return (
                      <motion.div
                        key={node.id}
                        whileHover={{ scale: canUnlock ? 1.03 : 1.01 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <Card
                          className={getNodeStyles(node, isUnlocked)}
                          onClick={() => onNodeClick?.(node)}
                        >
                          <div className="space-y-3">
                            {/* Node Header */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                {getNodeIcon(node, isUnlocked)}
                                <div className="text-xl">{node.icon}</div>
                              </div>
                              {isUnlocked && (
                                <Badge variant="secondary" className="text-xs">
                                  Unlocked
                                </Badge>
                              )}
                            </div>

                            {/* Node Info */}
                            <div>
                              <h4 className="font-semibold text-sm">{node.name}</h4>
                              <p className="text-xs opacity-80 mt-1">
                                {node.description}
                              </p>
                            </div>

                            {/* Unlock Requirement */}
                            <div className="text-xs opacity-70">
                              {node.unlockRequirement.type === 'sessions' && 
                                `Complete ${node.unlockRequirement.value} workouts`}
                              {node.unlockRequirement.type === 'duration' && 
                                `Hold for ${node.unlockRequirement.value}s`}
                              {node.unlockRequirement.type === 'streak' && 
                                `Achieve ${node.unlockRequirement.value}-day streak`}
                              {node.unlockRequirement.type === 'achievement' && 
                                `Earn achievement: ${node.unlockRequirement.specific}`}
                            </div>

                            {/* Rewards Preview */}
                            {node.rewards.xp > 0 && (
                              <div className="flex items-center justify-between text-xs">
                                <span>+{node.rewards.xp} XP</span>
                                {node.rewards.title && (
                                  <span className="font-medium">"{node.rewards.title}"</span>
                                )}
                              </div>
                            )}

                            {/* Prerequisites */}
                            {node.prerequisites.length > 0 && !isUnlocked && (
                              <div className="text-xs opacity-60">
                                Requires: {node.prerequisites.map(prereqId => {
                                  const prereqNode = activeTree.nodes.find(n => n.id === prereqId);
                                  return prereqNode?.name;
                                }).join(', ')}
                              </div>
                            )}
                          </div>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
};

export default SkillTreeDisplay;