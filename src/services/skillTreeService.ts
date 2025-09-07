import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type UserAchievement = Tables<'user_achievements'>;

export interface SkillNode {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'core' | 'endurance' | 'flexibility' | 'strength';
  tier: number; // 1-5, higher tiers require more unlocks
  prerequisites: string[]; // Node IDs that must be unlocked first
  unlockRequirement: {
    type: 'sessions' | 'duration' | 'streak' | 'achievement';
    value: number;
    specific?: string; // For achievement-based unlocks
  };
  rewards: {
    xp: number;
    title?: string;
    exerciseUnlock?: string;
    badge?: string;
  };
}

export interface SkillTree {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  nodes: SkillNode[];
}

export const SKILL_TREES: SkillTree[] = [
  {
    id: 'core_mastery',
    name: 'Core Mastery',
    description: 'Master the fundamentals of core strength',
    icon: '🛡️',
    color: 'from-red-500 to-orange-600',
    nodes: [
      {
        id: 'basic_plank',
        name: 'Basic Plank',
        description: 'Master the fundamental plank position',
        icon: '📏',
        category: 'core',
        tier: 1,
        prerequisites: [],
        unlockRequirement: { type: 'sessions', value: 1 },
        rewards: { xp: 10, title: 'Plank Apprentice' }
      },
      {
        id: 'minute_holder',
        name: 'Minute Holder',
        description: 'Hold planks for extended periods',
        icon: '⏱️',
        category: 'core',
        tier: 2,
        prerequisites: ['basic_plank'],
        unlockRequirement: { type: 'duration', value: 60 },
        rewards: { xp: 50, exerciseUnlock: 'side_plank', title: 'Time Master' }
      },
      {
        id: 'iron_core',
        name: 'Iron Core',
        description: 'Achieve unbreakable core strength',
        icon: '🛡️',
        category: 'core',
        tier: 3,
        prerequisites: ['minute_holder'],
        unlockRequirement: { type: 'duration', value: 300 },
        rewards: { xp: 200, exerciseUnlock: 'plank_variations', badge: 'Iron Core Master' }
      },
      {
        id: 'core_legend',
        name: 'Core Legend',
        description: 'Transcend mortal core limitations',
        icon: '👑',
        category: 'core',
        tier: 4,
        prerequisites: ['iron_core'],
        unlockRequirement: { type: 'duration', value: 600 },
        rewards: { xp: 500, title: 'Core Legend', badge: 'Golden Core' }
      }
    ]
  },
  {
    id: 'endurance_path',
    name: 'Endurance Path',
    description: 'Build unstoppable stamina and persistence',
    icon: '🏃‍♂️',
    color: 'from-blue-500 to-cyan-600',
    nodes: [
      {
        id: 'consistency_seeker',
        name: 'Consistency Seeker',
        description: 'Begin your journey of daily dedication',
        icon: '📅',
        category: 'endurance',
        tier: 1,
        prerequisites: [],
        unlockRequirement: { type: 'streak', value: 3 },
        rewards: { xp: 25, title: 'Consistent' }
      },
      {
        id: 'habit_former',
        name: 'Habit Former',
        description: 'Make fitness a natural part of your life',
        icon: '🔄',
        category: 'endurance',
        tier: 2,
        prerequisites: ['consistency_seeker'],
        unlockRequirement: { type: 'streak', value: 14 },
        rewards: { xp: 100, exerciseUnlock: 'extended_hold', title: 'Habit Former' }
      },
      {
        id: 'endurance_master',
        name: 'Endurance Master',
        description: 'Achieve mastery through persistent effort',
        icon: '🌟',
        category: 'endurance',
        tier: 3,
        prerequisites: ['habit_former'],
        unlockRequirement: { type: 'streak', value: 30 },
        rewards: { xp: 300, badge: 'Endurance Master', title: 'Unstoppable' }
      },
      {
        id: 'immortal_spirit',
        name: 'Immortal Spirit',
        description: 'Your dedication knows no bounds',
        icon: '💎',
        category: 'endurance',
        tier: 5,
        prerequisites: ['endurance_master'],
        unlockRequirement: { type: 'streak', value: 100 },
        rewards: { xp: 1000, title: 'Immortal', badge: 'Diamond Spirit' }
      }
    ]
  },
  {
    id: 'flexibility_flow',
    name: 'Flexibility Flow',
    description: 'Develop grace, mobility, and flow',
    icon: '🤸‍♀️',
    color: 'from-purple-500 to-pink-600',
    nodes: [
      {
        id: 'mobility_explorer',
        name: 'Mobility Explorer',
        description: 'Discover the joy of movement variety',
        icon: '🗺️',
        category: 'flexibility',
        tier: 1,
        prerequisites: [],
        unlockRequirement: { type: 'sessions', value: 5 },
        rewards: { xp: 30, exerciseUnlock: 'stretching_routine' }
      },
      {
        id: 'flow_finder',
        name: 'Flow Finder',
        description: 'Find your rhythm in movement',
        icon: '🌊',
        category: 'flexibility',
        tier: 2,
        prerequisites: ['mobility_explorer'],
        unlockRequirement: { type: 'sessions', value: 20 },
        rewards: { xp: 75, exerciseUnlock: 'yoga_flow', title: 'Flow Finder' }
      },
      {
        id: 'flexibility_sage',
        name: 'Flexibility Sage',
        description: 'Wisdom through mindful movement',
        icon: '🧘‍♂️',
        category: 'flexibility',
        tier: 3,
        prerequisites: ['flow_finder'],
        unlockRequirement: { type: 'sessions', value: 50 },
        rewards: { xp: 200, badge: 'Flexibility Sage', title: 'Sage' }
      }
    ]
  },
  {
    id: 'strength_forge',
    name: 'Strength Forge',
    description: 'Forge unbreakable strength and power',
    icon: '⚒️',
    color: 'from-gray-700 to-gray-900',
    nodes: [
      {
        id: 'power_seeker',
        name: 'Power Seeker',
        description: 'Begin your quest for strength',
        icon: '💪',
        category: 'strength',
        tier: 1,
        prerequisites: [],
        unlockRequirement: { type: 'sessions', value: 10 },
        rewards: { xp: 40, title: 'Power Seeker' }
      },
      {
        id: 'strength_builder',
        name: 'Strength Builder',
        description: 'Build the foundation of true power',
        icon: '🏗️',
        category: 'strength',
        tier: 2,
        prerequisites: ['power_seeker'],
        unlockRequirement: { type: 'achievement', value: 1, specific: 'iron_core' },
        rewards: { xp: 150, exerciseUnlock: 'advanced_planks', title: 'Builder' }
      },
      {
        id: 'forge_master',
        name: 'Forge Master',
        description: 'Master the forge of strength',
        icon: '⚒️',
        category: 'strength',
        tier: 4,
        prerequisites: ['strength_builder'],
        unlockRequirement: { type: 'sessions', value: 100 },
        rewards: { xp: 400, badge: 'Forge Master', title: 'Forge Master' }
      }
    ]
  }
];

export class SkillTreeEngine {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  async getUserProgress(): Promise<Map<string, boolean>> {
    const unlockedNodes = new Map<string, boolean>();
    
    // Get user's achievements and session data
    const [achievementsResult, sessionsResult, streakResult] = await Promise.all([
      supabase.from('user_achievements').select('*').eq('user_id', this.userId),
      supabase.from('user_sessions').select('*').eq('user_id', this.userId),
      supabase.from('user_streaks').select('*').eq('user_id', this.userId).maybeSingle()
    ]);

    const achievements = achievementsResult.data || [];
    const sessions = sessionsResult.data || [];
    const streak = streakResult.data;

    // Check each node in each tree
    for (const tree of SKILL_TREES) {
      for (const node of tree.nodes) {
        const isUnlocked = await this.checkNodeUnlock(node, sessions, achievements, streak);
        unlockedNodes.set(node.id, isUnlocked);
      }
    }

    return unlockedNodes;
  }

  private async checkNodeUnlock(
    node: SkillNode, 
    sessions: any[], 
    achievements: UserAchievement[], 
    streak: any
  ): Promise<boolean> {
    // Check prerequisites first
    for (const prereqId of node.prerequisites) {
      // This would need to be checked against unlocked nodes
      // For simplicity, assuming prerequisites are met if they exist
    }

    // Check unlock requirement
    switch (node.unlockRequirement.type) {
      case 'sessions':
        return sessions.length >= node.unlockRequirement.value;
      
      case 'duration':
        const maxDuration = Math.max(...sessions.map(s => s.duration_seconds || 0));
        return maxDuration >= node.unlockRequirement.value;
      
      case 'streak':
        return (streak?.current_streak || 0) >= node.unlockRequirement.value;
      
      case 'achievement':
        if (node.unlockRequirement.specific) {
          return achievements.some(a => a.achievement_name === node.unlockRequirement.specific);
        }
        return achievements.length >= node.unlockRequirement.value;
      
      default:
        return false;
    }
  }

  async unlockNode(nodeId: string): Promise<boolean> {
    const allNodes = SKILL_TREES.flatMap(tree => tree.nodes);
    const node = allNodes.find(n => n.id === nodeId);
    
    if (!node) return false;

    // Award XP and titles when unlocking
    if (node.rewards.xp > 0) {
      // Award XP through existing XP system
      console.log(`Awarding ${node.rewards.xp} XP for unlocking ${node.name}`);
    }

    if (node.rewards.title) {
      // Could store titles in user profile or achievements
      console.log(`Title unlocked: ${node.rewards.title}`);
    }

    return true;
  }

  static getTreeById(treeId: string): SkillTree | undefined {
    return SKILL_TREES.find(tree => tree.id === treeId);
  }

  static getNodeById(nodeId: string): SkillNode | undefined {
    return SKILL_TREES.flatMap(tree => tree.nodes).find(node => node.id === nodeId);
  }

  static getAllTrees(): SkillTree[] {
    return SKILL_TREES;
  }
}