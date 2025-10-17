import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import { CATEGORY_ACHIEVEMENTS, CROSS_CATEGORY_ACHIEVEMENTS } from './categoryAchievementDefinitions';

type UserAchievement = Tables<'user_achievements'>;

export interface ExpandedAchievement {
  id: string;
  name: string;
  description: string;
  category: 'consistency' | 'performance' | 'exploration' | 'social' | 'milestone' | 'category_specific' | 'cross_category';
  icon: string;
  badge_color: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  points: number;
  requirement: AchievementRequirement;
  unlock_message: string;
  share_message: string;
}

export interface AchievementRequirement {
  type: 'streak' | 'duration' | 'count' | 'variety' | 'time_based' | 'social' | 'improvement' | 'category_specific' | 'cross_category';
  value: number;
  conditions?: {
    exercise_types?: string[];
    exercise_categories?: string[];
    time_of_day?: 'morning' | 'evening' | 'weekend';
    consecutive?: boolean;
    within_timeframe?: number;
    improvement_threshold?: number;
    required_categories?: string[];
    category_combination?: string[];
    same_day?: boolean;
    minimum_categories?: number;
    balanced_requirement?: number;
    duration_based?: boolean;
    perfectionist_requirement?: number;
    ultimate_explorer?: boolean;
    champion_requirement?: number;
    renaissance_requirement?: number;
  };
}

// Expanded Achievement Definitions
export const EXPANDED_ACHIEVEMENTS: ExpandedAchievement[] = [
  // CONSISTENCY ACHIEVEMENTS
  {
    id: 'daily_warrior',
    name: 'Daily Warrior',
    description: '7 consecutive days of workouts',
    category: 'consistency',
    icon: '⚔️',
    badge_color: 'from-orange-400 to-red-500',
    rarity: 'common',
    points: 50,
    requirement: { type: 'streak', value: 7 },
    unlock_message: 'Seven days strong! You\'re building an unstoppable habit!',
    share_message: 'Just completed a 7-day workout streak! 💪 #PlankCoach'
  },
  {
    id: 'habit_builder',
    name: 'Habit Builder',
    description: '14 consecutive days of workouts',
    category: 'consistency',
    icon: '🏗️',
    badge_color: 'from-blue-400 to-purple-500',
    rarity: 'uncommon',
    points: 100,
    requirement: { type: 'streak', value: 14 },
    unlock_message: 'Two weeks of dedication! You\'re building something amazing!',
    share_message: 'Two weeks of consistent workouts completed! 🔥 #PlankCoach'
  },
  {
    id: 'unstoppable',
    name: 'Unstoppable',
    description: '30 consecutive days of workouts',
    category: 'consistency',
    icon: '🌟',
    badge_color: 'from-purple-400 to-pink-500',
    rarity: 'rare',
    points: 250,
    requirement: { type: 'streak', value: 30 },
    unlock_message: 'One month of pure dedication! You are truly unstoppable!',
    share_message: 'Achieved a 30-day workout streak! Unstoppable! 🌟 #PlankCoach'
  },
  {
    id: 'legend',
    name: 'Legend',
    description: '100 consecutive days of workouts',
    category: 'consistency',
    icon: '👑',
    badge_color: 'from-yellow-400 to-orange-500',
    rarity: 'legendary',
    points: 1000,
    requirement: { type: 'streak', value: 100 },
    unlock_message: 'ONE HUNDRED DAYS! You are a true fitness legend!',
    share_message: '100-day workout streak achieved! I am a fitness legend! 👑 #PlankCoach'
  },
  {
    id: 'weekend_warrior',
    name: 'Weekend Warrior',
    description: '10 weekend workouts completed',
    category: 'consistency',
    icon: '🏃‍♂️',
    badge_color: 'from-green-400 to-blue-500',
    rarity: 'uncommon',
    points: 75,
    requirement: { 
      type: 'time_based', 
      value: 10, 
      conditions: { time_of_day: 'weekend' } 
    },
    unlock_message: 'Weekend dedication pays off! You never skip the important days!',
    share_message: 'Completed 10 weekend workouts! Weekend warrior mode activated! 🏃‍♂️ #PlankCoach'
  },
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: '20 morning workouts (before 9 AM)',
    category: 'consistency',
    icon: '🌅',
    badge_color: 'from-yellow-300 to-orange-400',
    rarity: 'rare',
    points: 150,
    requirement: { 
      type: 'time_based', 
      value: 20, 
      conditions: { time_of_day: 'morning' } 
    },
    unlock_message: 'Rise and grind! You\'ve mastered the art of morning workouts!',
    share_message: '20 morning workouts completed! Early bird gets the gains! 🌅 #PlankCoach'
  },
  {
    id: 'night_owl',
    name: 'Night Owl',
    description: '20 evening workouts (after 7 PM)',
    category: 'consistency',
    icon: '🦉',
    badge_color: 'from-indigo-400 to-purple-600',
    rarity: 'rare',
    points: 150,
    requirement: { 
      type: 'time_based', 
      value: 20, 
      conditions: { time_of_day: 'evening' } 
    },
    unlock_message: 'Night time is the right time! You own the evening hours!',
    share_message: '20 evening workouts completed! Night owl strength! 🦉 #PlankCoach'
  },

  // PERFORMANCE ACHIEVEMENTS
  {
    id: 'quick_start',
    name: 'Quick Start',
    description: 'Complete a 15-second plank',
    category: 'performance',
    icon: '⚡',
    badge_color: 'from-green-300 to-green-500',
    rarity: 'common',
    points: 10,
    requirement: { type: 'duration', value: 15 },
    unlock_message: 'Every journey begins with a single step! Great start!',
    share_message: 'Started my plank journey with 15 seconds! ⚡ #PlankCoach'
  },
  {
    id: 'half_minute_hero',
    name: 'Half Minute Hero',
    description: 'Complete a 30-second plank',
    category: 'performance',
    icon: '🦸‍♂️',
    badge_color: 'from-blue-300 to-blue-500',
    rarity: 'common',
    points: 25,
    requirement: { type: 'duration', value: 30 },
    unlock_message: 'Thirty seconds of pure strength! You\'re a hero in the making!',
    share_message: 'Held a 30-second plank! Half minute hero! 🦸‍♂️ #PlankCoach'
  },
  {
    id: 'minute_master',
    name: 'Minute Master',
    description: 'Complete a 60-second plank',
    category: 'performance',
    icon: '⏱️',
    badge_color: 'from-purple-300 to-purple-500',
    rarity: 'uncommon',
    points: 50,
    requirement: { type: 'duration', value: 60 },
    unlock_message: 'One full minute! You\'ve mastered the fundamental challenge!',
    share_message: 'Achieved a 60-second plank! Minute master unlocked! ⏱️ #PlankCoach'
  },
  {
    id: 'endurance_expert',
    name: 'Endurance Expert',
    description: 'Complete a 2-minute plank',
    category: 'performance',
    icon: '💪',
    badge_color: 'from-red-400 to-pink-500',
    rarity: 'rare',
    points: 100,
    requirement: { type: 'duration', value: 120 },
    unlock_message: 'Two minutes of unwavering strength! You are an endurance expert!',
    share_message: 'Crushed a 2-minute plank! Endurance expert level! 💪 #PlankCoach'
  },
  {
    id: 'iron_core',
    name: 'Iron Core',
    description: 'Complete a 5-minute plank',
    category: 'performance',
    icon: '🛡️',
    badge_color: 'from-gray-400 to-gray-600',
    rarity: 'epic',
    points: 300,
    requirement: { type: 'duration', value: 300 },
    unlock_message: 'FIVE MINUTES! Your core is forged from iron!',
    share_message: 'Held a 5-minute plank! My core is made of iron! 🛡️ #PlankCoach'
  },
  {
    id: 'personal_best',
    name: 'Personal Best',
    description: 'Beat your previous best by 30+ seconds',
    category: 'performance',
    icon: '📈',
    badge_color: 'from-green-400 to-emerald-500',
    rarity: 'uncommon',
    points: 75,
    requirement: { 
      type: 'improvement', 
      value: 30,
      conditions: { improvement_threshold: 30 }
    },
    unlock_message: 'Amazing improvement! You\'re getting stronger every day!',
    share_message: 'Just beat my personal best by 30+ seconds! 📈 #PlankCoach'
  },
  {
    id: 'double_down',
    name: 'Double Down',
    description: 'Double your initial best time',
    category: 'performance',
    icon: '🎯',
    badge_color: 'from-orange-400 to-red-500',
    rarity: 'rare',
    points: 200,
    requirement: { 
      type: 'improvement', 
      value: 100,
      conditions: { improvement_threshold: 100 }
    },
    unlock_message: 'You\'ve DOUBLED your strength! Incredible progress!',
    share_message: 'Doubled my initial plank time! Progress is real! 🎯 #PlankCoach'
  },

  // EXPLORATION ACHIEVEMENTS
  {
    id: 'exercise_explorer',
    name: 'Exercise Explorer',
    description: 'Try all basic exercises',
    category: 'exploration',
    icon: '🗺️',
    badge_color: 'from-teal-400 to-cyan-500',
    rarity: 'uncommon',
    points: 100,
    requirement: { 
      type: 'variety', 
      value: 5,
      conditions: { exercise_types: ['basic'] }
    },
    unlock_message: 'Adventure calls! You\'ve explored all the basic exercises!',
    share_message: 'Explored all basic exercises! Adventure mode activated! 🗺️ #PlankCoach'
  },
  {
    id: 'variety_seeker',
    name: 'Variety Seeker',
    description: 'Complete 5 different exercises in a week',
    category: 'exploration',
    icon: '🎭',
    badge_color: 'from-pink-400 to-rose-500',
    rarity: 'uncommon',
    points: 75,
    requirement: { 
      type: 'variety', 
      value: 5,
      conditions: { within_timeframe: 7 }
    },
    unlock_message: 'Variety is the spice of fitness! You love to mix things up!',
    share_message: 'Completed 5 different exercises this week! Variety seeker! 🎭 #PlankCoach'
  },
  {
    id: 'challenge_accepted',
    name: 'Challenge Accepted',
    description: 'Complete your first advanced exercise',
    category: 'exploration',
    icon: '🎪',
    badge_color: 'from-violet-400 to-purple-600',
    rarity: 'rare',
    points: 150,
    requirement: { 
      type: 'variety', 
      value: 1,
      conditions: { exercise_types: ['advanced'] }
    },
    unlock_message: 'Challenge accepted and conquered! You\'re ready for anything!',
    share_message: 'Completed my first advanced exercise! Challenge accepted! 🎪 #PlankCoach'
  },

  // MILESTONE ACHIEVEMENTS
  {
    id: 'getting_started',
    name: 'Getting Started',
    description: 'Complete 10 total workouts',
    category: 'milestone',
    icon: '🚀',
    badge_color: 'from-cyan-300 to-blue-400',
    rarity: 'common',
    points: 50,
    requirement: { type: 'count', value: 10 },
    unlock_message: 'Ten workouts complete! Your fitness journey is officially launched!',
    share_message: 'Completed my first 10 workouts! Getting started! 🚀 #PlankCoach'
  },
  {
    id: 'committed',
    name: 'Committed',
    description: 'Complete 25 total workouts',
    category: 'milestone',
    icon: '🎖️',
    badge_color: 'from-emerald-400 to-green-500',
    rarity: 'uncommon',
    points: 100,
    requirement: { type: 'count', value: 25 },
    unlock_message: 'Twenty-five workouts! Your commitment is showing real results!',
    share_message: '25 workouts completed! Commitment level: unlocked! 🎖️ #PlankCoach'
  },
  {
    id: 'dedicated',
    name: 'Dedicated',
    description: 'Complete 50 total workouts',
    category: 'milestone',
    icon: '🏅',
    badge_color: 'from-amber-400 to-orange-500',
    rarity: 'rare',
    points: 200,
    requirement: { type: 'count', value: 50 },
    unlock_message: 'Fifty workouts! Your dedication is truly inspiring!',
    share_message: 'Reached 50 total workouts! Dedication pays off! 🏅 #PlankCoach'
  },
  {
    id: 'expert',
    name: 'Expert',
    description: 'Complete 100 total workouts',
    category: 'milestone',
    icon: '🏆',
    badge_color: 'from-yellow-400 to-amber-500',
    rarity: 'epic',
    points: 500,
    requirement: { type: 'count', value: 100 },
    unlock_message: 'ONE HUNDRED WORKOUTS! You are officially a plank expert!',
    share_message: '100 workouts completed! Expert status achieved! 🏆 #PlankCoach'
  },
  {
    id: 'master',
    name: 'Master',
    description: 'Complete 365 total workouts',
    category: 'milestone',
    icon: '💎',
    badge_color: 'from-indigo-500 to-purple-600',
    rarity: 'legendary',
    points: 1500,
    requirement: { type: 'count', value: 365 },
    unlock_message: 'THREE SIXTY-FIVE! You are a true plank master! Legendary status!',
    share_message: '365 workouts completed! I am a plank master! 💎 #PlankCoach'
  },
  {
    id: 'time_warrior',
    name: 'Time Warrior',
    description: 'Accumulate 1 hour of total plank time',
    category: 'milestone',
    icon: '⏰',
    badge_color: 'from-red-400 to-rose-500',
    rarity: 'uncommon',
    points: 100,
    requirement: { type: 'time_based', value: 3600 },
    unlock_message: 'One full hour of planking! You are a time warrior!',
    share_message: 'Accumulated 1 hour of total plank time! Time warrior! ⏰ #PlankCoach'
  },
  {
    id: 'endurance_champion',
    name: 'Endurance Champion',
    description: 'Accumulate 10 hours of total plank time',
    category: 'milestone',
    icon: '🌟',
    badge_color: 'from-purple-500 to-pink-600',
    rarity: 'epic',
    points: 750,
    requirement: { type: 'time_based', value: 36000 },
    unlock_message: 'TEN HOURS! You are the ultimate endurance champion!',
    share_message: '10 hours of total plank time! Endurance champion! 🌟 #PlankCoach'
  },

  // CARDIO CATEGORY ACHIEVEMENTS (8 achievements)
  {
    id: 'cardio_starter',
    name: 'Cardio Starter',
    description: 'Complete your first cardio exercise',
    category: 'category_specific',
    icon: '❤️',
    badge_color: 'from-red-400 to-pink-500',
    rarity: 'common',
    points: 25,
    requirement: { type: 'category_specific', value: 1, conditions: { exercise_categories: ['cardio'] } },
    unlock_message: 'Your heart is pumping! First cardio exercise completed!',
    share_message: 'Started my cardio journey! ❤️ #PlankCoach'
  },
  {
    id: 'cardio_streak_7',
    name: 'Cardio Week',
    description: '7-day cardio exercise streak',
    category: 'category_specific',
    icon: '💓',
    badge_color: 'from-red-500 to-rose-600',
    rarity: 'uncommon',
    points: 75,
    requirement: { type: 'category_specific', value: 7, conditions: { exercise_categories: ['cardio'], consecutive: true } },
    unlock_message: 'One week of cardio dedication! Your heart loves you!',
    share_message: '7-day cardio streak completed! Heart strong! 💓 #PlankCoach'
  },
  {
    id: 'cardio_25_sessions',
    name: 'Cardio Enthusiast',
    description: 'Complete 25 cardio sessions',
    category: 'category_specific',
    icon: '🏃‍♂️',
    badge_color: 'from-red-400 to-orange-500',
    rarity: 'uncommon',
    points: 100,
    requirement: { type: 'category_specific', value: 25, conditions: { exercise_categories: ['cardio'] } },
    unlock_message: 'Twenty-five cardio sessions! You are a cardio enthusiast!',
    share_message: '25 cardio sessions completed! Enthusiast level! 🏃‍♂️ #PlankCoach'
  },
  {
    id: 'cardio_lifetime_60min',
    name: 'Cardio Hour',
    description: 'Accumulate 60 minutes of cardio exercises',
    category: 'category_specific',
    icon: '⏰',
    badge_color: 'from-red-600 to-pink-700',
    rarity: 'rare',
    points: 150,
    requirement: { type: 'category_specific', value: 3600, conditions: { exercise_categories: ['cardio'] } },
    unlock_message: 'One full hour of cardio! Your endurance is amazing!',
    share_message: '60 minutes of cardio completed! Endurance champion! ⏰ #PlankCoach'
  },
  {
    id: 'cardio_consistency_21',
    name: 'Cardio Consistent',
    description: 'Do cardio exercises for 21 days within a month',
    category: 'category_specific',
    icon: '📅',
    badge_color: 'from-rose-500 to-red-600',
    rarity: 'rare',
    points: 200,
    requirement: { type: 'category_specific', value: 21, conditions: { exercise_categories: ['cardio'], within_timeframe: 30 } },
    unlock_message: 'Incredible cardio consistency! 21 days in a month!',
    share_message: '21 cardio days this month! Consistency king! 📅 #PlankCoach'
  },
  {
    id: 'cardio_streak_30',
    name: 'Cardio Month',
    description: '30-day cardio exercise streak',
    category: 'category_specific',
    icon: '🔥',
    badge_color: 'from-red-700 to-rose-800',
    rarity: 'epic',
    points: 300,
    requirement: { type: 'category_specific', value: 30, conditions: { exercise_categories: ['cardio'], consecutive: true } },
    unlock_message: 'THIRTY DAYS of cardio! You are on fire!',
    share_message: '30-day cardio streak! I am on fire! 🔥 #PlankCoach'
  },
  {
    id: 'cardio_mastery_100',
    name: 'Cardio Master',
    description: 'Complete 100 cardio sessions',
    category: 'category_specific',
    icon: '👑',
    badge_color: 'from-red-800 to-pink-900',
    rarity: 'epic',
    points: 500,
    requirement: { type: 'category_specific', value: 100, conditions: { exercise_categories: ['cardio'] } },
    unlock_message: 'ONE HUNDRED cardio sessions! You are a cardio master!',
    share_message: '100 cardio sessions! Cardio master achieved! 👑 #PlankCoach'
  },
  {
    id: 'cardio_lifetime_300min',
    name: 'Cardio Legend',
    description: 'Accumulate 5 hours (300 minutes) of cardio exercises',
    category: 'category_specific',
    icon: '🏆',
    badge_color: 'from-red-900 to-rose-900',
    rarity: 'legendary',
    points: 750,
    requirement: { type: 'category_specific', value: 18000, conditions: { exercise_categories: ['cardio'] } },
    unlock_message: 'FIVE HOURS of cardio! You are a cardio legend!',
    share_message: '5 hours of cardio completed! Cardio legend! 🏆 #PlankCoach'
  },

  // LEG LIFT CATEGORY ACHIEVEMENTS (8 achievements)
  {
    id: 'leg_lift_starter',
    name: 'Leg Lift Starter',
    description: 'Complete your first leg lift exercise',
    category: 'category_specific',
    icon: '🦵',
    badge_color: 'from-blue-400 to-cyan-500',
    rarity: 'common',
    points: 25,
    requirement: { type: 'category_specific', value: 1, conditions: { exercise_categories: ['leg_lift'] } },
    unlock_message: 'Legs up! First leg lift exercise completed!',
    share_message: 'Started my leg lift journey! 🦵 #PlankCoach'
  },
  {
    id: 'leg_lift_streak_7',
    name: 'Leg Lift Week',
    description: '7-day leg lift exercise streak',
    category: 'category_specific',
    icon: '🦴',
    badge_color: 'from-blue-500 to-cyan-600',
    rarity: 'uncommon',
    points: 75,
    requirement: { type: 'category_specific', value: 7, conditions: { exercise_categories: ['leg_lift'], consecutive: true } },
    unlock_message: 'One week of leg lifts! Your lower body is getting stronger!',
    share_message: '7-day leg lift streak! Lower body strong! 🦴 #PlankCoach'
  },
  {
    id: 'leg_lift_25_sessions',
    name: 'Leg Lift Enthusiast',
    description: 'Complete 25 leg lift sessions',
    category: 'category_specific',
    icon: '💪',
    badge_color: 'from-blue-400 to-indigo-500',
    rarity: 'uncommon',
    points: 100,
    requirement: { type: 'category_specific', value: 25, conditions: { exercise_categories: ['leg_lift'] } },
    unlock_message: 'Twenty-five leg lift sessions! You are a leg lift enthusiast!',
    share_message: '25 leg lift sessions completed! Enthusiast level! 💪 #PlankCoach'
  },
  {
    id: 'leg_lift_lifetime_60min',
    name: 'Leg Lift Hour',
    description: 'Accumulate 60 minutes of leg lift exercises',
    category: 'category_specific',
    icon: '⏱️',
    badge_color: 'from-blue-600 to-cyan-700',
    rarity: 'rare',
    points: 150,
    requirement: { type: 'category_specific', value: 3600, conditions: { exercise_categories: ['leg_lift'] } },
    unlock_message: 'One full hour of leg lifts! Your legs are incredibly strong!',
    share_message: '60 minutes of leg lifts! Leg strength champion! ⏱️ #PlankCoach'
  },
  {
    id: 'leg_lift_consistency_21',
    name: 'Leg Lift Consistent',
    description: 'Do leg lift exercises for 21 days within a month',
    category: 'category_specific',
    icon: '🗓️',
    badge_color: 'from-cyan-500 to-blue-600',
    rarity: 'rare',
    points: 200,
    requirement: { type: 'category_specific', value: 21, conditions: { exercise_categories: ['leg_lift'], within_timeframe: 30 } },
    unlock_message: 'Amazing leg lift consistency! 21 days in a month!',
    share_message: '21 leg lift days this month! Consistency champion! 🗓️ #PlankCoach'
  },
  {
    id: 'leg_lift_streak_30',
    name: 'Leg Lift Month',
    description: '30-day leg lift exercise streak',
    category: 'category_specific',
    icon: '🔥',
    badge_color: 'from-blue-700 to-cyan-800',
    rarity: 'epic',
    points: 300,
    requirement: { type: 'category_specific', value: 30, conditions: { exercise_categories: ['leg_lift'], consecutive: true } },
    unlock_message: 'THIRTY DAYS of leg lifts! Your dedication is incredible!',
    share_message: '30-day leg lift streak! Dedication level: epic! 🔥 #PlankCoach'
  },
  {
    id: 'leg_lift_mastery_100',
    name: 'Leg Lift Master',
    description: 'Complete 100 leg lift sessions',
    category: 'category_specific',
    icon: '🏅',
    badge_color: 'from-blue-800 to-cyan-900',
    rarity: 'epic',
    points: 500,
    requirement: { type: 'category_specific', value: 100, conditions: { exercise_categories: ['leg_lift'] } },
    unlock_message: 'ONE HUNDRED leg lift sessions! You are a leg lift master!',
    share_message: '100 leg lift sessions! Leg lift master achieved! 🏅 #PlankCoach'
  },
  {
    id: 'leg_lift_lifetime_300min',
    name: 'Leg Lift Legend',
    description: 'Accumulate 5 hours (300 minutes) of leg lift exercises',
    category: 'category_specific',
    icon: '🏆',
    badge_color: 'from-blue-900 to-cyan-900',
    rarity: 'legendary',
    points: 750,
    requirement: { type: 'category_specific', value: 18000, conditions: { exercise_categories: ['leg_lift'] } },
    unlock_message: 'FIVE HOURS of leg lifts! You are a leg lift legend!',
    share_message: '5 hours of leg lifts! Leg lift legend! 🏆 #PlankCoach'
  },

  // SEATED EXERCISE CATEGORY ACHIEVEMENTS (8 achievements)
  {
    id: 'seated_starter',
    name: 'Seated Starter',
    description: 'Complete your first seated exercise',
    category: 'category_specific',
    icon: '🪑',
    badge_color: 'from-green-400 to-emerald-500',
    rarity: 'common',
    points: 25,
    requirement: { type: 'category_specific', value: 1, conditions: { exercise_categories: ['seated_exercise'] } },
    unlock_message: 'Seated and strong! First seated exercise completed!',
    share_message: 'Started my seated exercise journey! 🪑 #PlankCoach'
  },
  {
    id: 'seated_streak_7',
    name: 'Seated Week',
    description: '7-day seated exercise streak',
    category: 'category_specific',
    icon: '💺',
    badge_color: 'from-green-500 to-emerald-600',
    rarity: 'uncommon',
    points: 75,
    requirement: { type: 'category_specific', value: 7, conditions: { exercise_categories: ['seated_exercise'], consecutive: true } },
    unlock_message: 'One week of seated exercises! Strength from any position!',
    share_message: '7-day seated exercise streak! Seated strength! 💺 #PlankCoach'
  },
  {
    id: 'seated_25_sessions',
    name: 'Seated Enthusiast',
    description: 'Complete 25 seated exercise sessions',
    category: 'category_specific',
    icon: '🌱',
    badge_color: 'from-green-400 to-teal-500',
    rarity: 'uncommon',
    points: 100,
    requirement: { type: 'category_specific', value: 25, conditions: { exercise_categories: ['seated_exercise'] } },
    unlock_message: 'Twenty-five seated sessions! You are a seated exercise enthusiast!',
    share_message: '25 seated exercise sessions! Enthusiast level! 🌱 #PlankCoach'
  },
  {
    id: 'seated_lifetime_60min',
    name: 'Seated Hour',
    description: 'Accumulate 60 minutes of seated exercises',
    category: 'category_specific',
    icon: '⌚',
    badge_color: 'from-green-600 to-emerald-700',
    rarity: 'rare',
    points: 150,
    requirement: { type: 'category_specific', value: 3600, conditions: { exercise_categories: ['seated_exercise'] } },
    unlock_message: 'One full hour of seated exercises! Accessibility champion!',
    share_message: '60 minutes of seated exercises! Accessibility champion! ⌚ #PlankCoach'
  },
  {
    id: 'seated_consistency_21',
    name: 'Seated Consistent',
    description: 'Do seated exercises for 21 days within a month',
    category: 'category_specific',
    icon: '📆',
    badge_color: 'from-emerald-500 to-green-600',
    rarity: 'rare',
    points: 200,
    requirement: { type: 'category_specific', value: 21, conditions: { exercise_categories: ['seated_exercise'], within_timeframe: 30 } },
    unlock_message: 'Outstanding seated exercise consistency! 21 days in a month!',
    share_message: '21 seated exercise days this month! Consistency master! 📆 #PlankCoach'
  },
  {
    id: 'seated_streak_30',
    name: 'Seated Month',
    description: '30-day seated exercise streak',
    category: 'category_specific',
    icon: '🔥',
    badge_color: 'from-green-700 to-emerald-800',
    rarity: 'epic',
    points: 300,
    requirement: { type: 'category_specific', value: 30, conditions: { exercise_categories: ['seated_exercise'], consecutive: true } },
    unlock_message: 'THIRTY DAYS of seated exercises! Unstoppable dedication!',
    share_message: '30-day seated exercise streak! Unstoppable! 🔥 #PlankCoach'
  },
  {
    id: 'seated_mastery_100',
    name: 'Seated Master',
    description: 'Complete 100 seated exercise sessions',
    category: 'category_specific',
    icon: '👑',
    badge_color: 'from-green-800 to-emerald-900',
    rarity: 'epic',
    points: 500,
    requirement: { type: 'category_specific', value: 100, conditions: { exercise_categories: ['seated_exercise'] } },
    unlock_message: 'ONE HUNDRED seated sessions! You are a seated exercise master!',
    share_message: '100 seated exercise sessions! Seated master achieved! 👑 #PlankCoach'
  },
  {
    id: 'seated_lifetime_300min',
    name: 'Seated Legend',
    description: 'Accumulate 5 hours (300 minutes) of seated exercises',
    category: 'category_specific',
    icon: '🏆',
    badge_color: 'from-green-900 to-emerald-900',
    rarity: 'legendary',
    points: 750,
    requirement: { type: 'category_specific', value: 18000, conditions: { exercise_categories: ['seated_exercise'] } },
    unlock_message: 'FIVE HOURS of seated exercises! You are a seated exercise legend!',
    share_message: '5 hours of seated exercises! Seated legend! 🏆 #PlankCoach'
  },

  // STANDING MOVEMENT CATEGORY ACHIEVEMENTS (8 achievements)
  {
    id: 'standing_starter',
    name: 'Standing Starter',
    description: 'Complete your first standing movement exercise',
    category: 'category_specific',
    icon: '🚶‍♂️',
    badge_color: 'from-purple-400 to-violet-500',
    rarity: 'common',
    points: 25,
    requirement: { type: 'category_specific', value: 1, conditions: { exercise_categories: ['standing_movement'] } },
    unlock_message: 'Standing tall and strong! First standing movement completed!',
    share_message: 'Started my standing movement journey! 🚶‍♂️ #PlankCoach'
  },
  {
    id: 'standing_streak_7',
    name: 'Standing Week',
    description: '7-day standing movement exercise streak',
    category: 'category_specific',
    icon: '🏃',
    badge_color: 'from-purple-500 to-violet-600',
    rarity: 'uncommon',
    points: 75,
    requirement: { type: 'category_specific', value: 7, conditions: { exercise_categories: ['standing_movement'], consecutive: true } },
    unlock_message: 'One week of standing movements! You are always on the move!',
    share_message: '7-day standing movement streak! Always moving! 🏃 #PlankCoach'
  },
  {
    id: 'standing_25_sessions',
    name: 'Standing Enthusiast',
    description: 'Complete 25 standing movement sessions',
    category: 'category_specific',
    icon: '🤸‍♂️',
    badge_color: 'from-purple-400 to-indigo-500',
    rarity: 'uncommon',
    points: 100,
    requirement: { type: 'category_specific', value: 25, conditions: { exercise_categories: ['standing_movement'] } },
    unlock_message: 'Twenty-five standing movement sessions! You are a movement enthusiast!',
    share_message: '25 standing movement sessions! Movement enthusiast! 🤸‍♂️ #PlankCoach'
  },
  {
    id: 'standing_lifetime_60min',
    name: 'Standing Hour',
    description: 'Accumulate 60 minutes of standing movement exercises',
    category: 'category_specific',
    icon: '⏲️',
    badge_color: 'from-purple-600 to-violet-700',
    rarity: 'rare',
    points: 150,
    requirement: { type: 'category_specific', value: 3600, conditions: { exercise_categories: ['standing_movement'] } },
    unlock_message: 'One full hour of standing movements! You never stop moving!',
    share_message: '60 minutes of standing movements! Movement champion! ⏲️ #PlankCoach'
  },
  {
    id: 'standing_consistency_21',
    name: 'Standing Consistent',
    description: 'Do standing movements for 21 days within a month',
    category: 'category_specific',
    icon: '📊',
    badge_color: 'from-violet-500 to-purple-600',
    rarity: 'rare',
    points: 200,
    requirement: { type: 'category_specific', value: 21, conditions: { exercise_categories: ['standing_movement'], within_timeframe: 30 } },
    unlock_message: 'Incredible standing movement consistency! 21 days in a month!',
    share_message: '21 standing movement days this month! Movement consistency! 📊 #PlankCoach'
  },
  {
    id: 'standing_streak_30',
    name: 'Standing Month',
    description: '30-day standing movement exercise streak',
    category: 'category_specific',
    icon: '🔥',
    badge_color: 'from-purple-700 to-violet-800',
    rarity: 'epic',
    points: 300,
    requirement: { type: 'category_specific', value: 30, conditions: { exercise_categories: ['standing_movement'], consecutive: true } },
    unlock_message: 'THIRTY DAYS of standing movements! You are always in motion!',
    share_message: '30-day standing movement streak! Always in motion! 🔥 #PlankCoach'
  },
  {
    id: 'standing_mastery_100',
    name: 'Standing Master',
    description: 'Complete 100 standing movement sessions',
    category: 'category_specific',
    icon: '🏅',
    badge_color: 'from-purple-800 to-violet-900',
    rarity: 'epic',
    points: 500,
    requirement: { type: 'category_specific', value: 100, conditions: { exercise_categories: ['standing_movement'] } },
    unlock_message: 'ONE HUNDRED standing movement sessions! You are a movement master!',
    share_message: '100 standing movement sessions! Movement master achieved! 🏅 #PlankCoach'
  },
  {
    id: 'standing_lifetime_300min',
    name: 'Standing Legend',
    description: 'Accumulate 5 hours (300 minutes) of standing movements',
    category: 'category_specific',
    icon: '🏆',
    badge_color: 'from-purple-900 to-violet-900',
    rarity: 'legendary',
    points: 750,
    requirement: { type: 'category_specific', value: 18000, conditions: { exercise_categories: ['standing_movement'] } },
    unlock_message: 'FIVE HOURS of standing movements! You are a movement legend!',
    share_message: '5 hours of standing movements! Movement legend! 🏆 #PlankCoach'
  },

  // STRENGTH CATEGORY ACHIEVEMENTS (8 achievements)
  {
    id: 'strength_starter',
    name: 'Strength Starter',
    description: 'Complete your first strength exercise',
    category: 'category_specific',
    icon: '💪',
    badge_color: 'from-orange-400 to-red-500',
    rarity: 'common',
    points: 25,
    requirement: { type: 'category_specific', value: 1, conditions: { exercise_categories: ['strength'] } },
    unlock_message: 'Building strength! First strength exercise completed!',
    share_message: 'Started my strength journey! 💪 #PlankCoach'
  },
  {
    id: 'strength_streak_7',
    name: 'Strength Week',
    description: '7-day strength exercise streak',
    category: 'category_specific',
    icon: '🏋️‍♂️',
    badge_color: 'from-orange-500 to-red-600',
    rarity: 'uncommon',
    points: 75,
    requirement: { type: 'category_specific', value: 7, conditions: { exercise_categories: ['strength'], consecutive: true } },
    unlock_message: 'One week of strength training! You are getting stronger every day!',
    share_message: '7-day strength streak! Getting stronger daily! 🏋️‍♂️ #PlankCoach'
  },
  {
    id: 'strength_25_sessions',
    name: 'Strength Enthusiast',
    description: 'Complete 25 strength exercise sessions',
    category: 'category_specific',
    icon: '🔨',
    badge_color: 'from-orange-400 to-amber-500',
    rarity: 'uncommon',
    points: 100,
    requirement: { type: 'category_specific', value: 25, conditions: { exercise_categories: ['strength'] } },
    unlock_message: 'Twenty-five strength sessions! You are a strength enthusiast!',
    share_message: '25 strength sessions completed! Strength enthusiast! 🔨 #PlankCoach'
  },
  {
    id: 'strength_lifetime_60min',
    name: 'Strength Hour',
    description: 'Accumulate 60 minutes of strength exercises',
    category: 'category_specific',
    icon: '⚡',
    badge_color: 'from-orange-600 to-red-700',
    rarity: 'rare',
    points: 150,
    requirement: { type: 'category_specific', value: 3600, conditions: { exercise_categories: ['strength'] } },
    unlock_message: 'One full hour of strength training! You are incredibly powerful!',
    share_message: '60 minutes of strength training! Strength champion! ⚡ #PlankCoach'
  },
  {
    id: 'strength_consistency_21',
    name: 'Strength Consistent',
    description: 'Do strength exercises for 21 days within a month',
    category: 'category_specific',
    icon: '📈',
    badge_color: 'from-red-500 to-orange-600',
    rarity: 'rare',
    points: 200,
    requirement: { type: 'category_specific', value: 21, conditions: { exercise_categories: ['strength'], within_timeframe: 30 } },
    unlock_message: 'Phenomenal strength consistency! 21 days in a month!',
    share_message: '21 strength days this month! Strength consistency! 📈 #PlankCoach'
  },
  {
    id: 'strength_streak_30',
    name: 'Strength Month',
    description: '30-day strength exercise streak',
    category: 'category_specific',
    icon: '🔥',
    badge_color: 'from-orange-700 to-red-800',
    rarity: 'epic',
    points: 300,
    requirement: { type: 'category_specific', value: 30, conditions: { exercise_categories: ['strength'], consecutive: true } },
    unlock_message: 'THIRTY DAYS of strength training! You are incredibly strong!',
    share_message: '30-day strength streak! Incredibly strong! 🔥 #PlankCoach'
  },
  {
    id: 'strength_mastery_100',
    name: 'Strength Master',
    description: 'Complete 100 strength exercise sessions',
    category: 'category_specific',
    icon: '🏆',
    badge_color: 'from-orange-800 to-red-900',
    rarity: 'epic',
    points: 500,
    requirement: { type: 'category_specific', value: 100, conditions: { exercise_categories: ['strength'] } },
    unlock_message: 'ONE HUNDRED strength sessions! You are a strength master!',
    share_message: '100 strength sessions! Strength master achieved! 🏆 #PlankCoach'
  },
  {
    id: 'strength_lifetime_300min',
    name: 'Strength Legend',
    description: 'Accumulate 5 hours (300 minutes) of strength exercises',
    category: 'category_specific',
    icon: '👑',
    badge_color: 'from-orange-900 to-red-900',
    rarity: 'legendary',
    points: 750,
    requirement: { type: 'category_specific', value: 18000, conditions: { exercise_categories: ['strength'] } },
    unlock_message: 'FIVE HOURS of strength training! You are a strength legend!',
    share_message: '5 hours of strength training! Strength legend! 👑 #PlankCoach'
  },

  // PLANKING CATEGORY ACHIEVEMENTS (8 achievements)
  {
    id: 'planking_starter',
    name: 'Planking Starter',
    description: 'Complete your first planking exercise',
    category: 'category_specific',
    icon: '🏁',
    badge_color: 'from-yellow-400 to-amber-500',
    rarity: 'common',
    points: 25,
    requirement: { type: 'category_specific', value: 1, conditions: { exercise_categories: ['planking'] } },
    unlock_message: 'The plank journey begins! First planking exercise completed!',
    share_message: 'Started my planking journey! 🏁 #PlankCoach'
  },
  {
    id: 'planking_streak_7',
    name: 'Planking Week',
    description: '7-day planking exercise streak',
    category: 'category_specific',
    icon: '🔶',
    badge_color: 'from-yellow-500 to-amber-600',
    rarity: 'uncommon',
    points: 75,
    requirement: { type: 'category_specific', value: 7, conditions: { exercise_categories: ['planking'], consecutive: true } },
    unlock_message: 'One week of planking! Your core is getting solid!',
    share_message: '7-day planking streak! Core getting solid! 🔶 #PlankCoach'
  },
  {
    id: 'planking_25_sessions',
    name: 'Planking Enthusiast',
    description: 'Complete 25 planking exercise sessions',
    category: 'category_specific',
    icon: '🏗️',
    badge_color: 'from-yellow-400 to-orange-500',
    rarity: 'uncommon',
    points: 100,
    requirement: { type: 'category_specific', value: 25, conditions: { exercise_categories: ['planking'] } },
    unlock_message: 'Twenty-five planking sessions! You are a planking enthusiast!',
    share_message: '25 planking sessions completed! Planking enthusiast! 🏗️ #PlankCoach'
  },
  {
    id: 'planking_lifetime_60min',
    name: 'Planking Hour',
    description: 'Accumulate 60 minutes of planking exercises',
    category: 'category_specific',
    icon: '⏳',
    badge_color: 'from-yellow-600 to-amber-700',
    rarity: 'rare',
    points: 150,
    requirement: { type: 'category_specific', value: 3600, conditions: { exercise_categories: ['planking'] } },
    unlock_message: 'One full hour of planking! Your core is rock solid!',
    share_message: '60 minutes of planking! Core rock solid! ⏳ #PlankCoach'
  },
  {
    id: 'planking_consistency_21',
    name: 'Planking Consistent',
    description: 'Do planking exercises for 21 days within a month',
    category: 'category_specific',
    icon: '📱',
    badge_color: 'from-amber-500 to-yellow-600',
    rarity: 'rare',
    points: 200,
    requirement: { type: 'category_specific', value: 21, conditions: { exercise_categories: ['planking'], within_timeframe: 30 } },
    unlock_message: 'Amazing planking consistency! 21 days in a month!',
    share_message: '21 planking days this month! Planking consistency! 📱 #PlankCoach'
  },
  {
    id: 'planking_streak_30',
    name: 'Planking Month',
    description: '30-day planking exercise streak',
    category: 'category_specific',
    icon: '🔥',
    badge_color: 'from-yellow-700 to-amber-800',
    rarity: 'epic',
    points: 300,
    requirement: { type: 'category_specific', value: 30, conditions: { exercise_categories: ['planking'], consecutive: true } },
    unlock_message: 'THIRTY DAYS of planking! Your dedication is unbreakable!',
    share_message: '30-day planking streak! Unbreakable dedication! 🔥 #PlankCoach'
  },
  {
    id: 'planking_mastery_100',
    name: 'Planking Master',
    description: 'Complete 100 planking exercise sessions',
    category: 'category_specific',
    icon: '🥇',
    badge_color: 'from-yellow-800 to-amber-900',
    rarity: 'epic',
    points: 500,
    requirement: { type: 'category_specific', value: 100, conditions: { exercise_categories: ['planking'] } },
    unlock_message: 'ONE HUNDRED planking sessions! You are a planking master!',
    share_message: '100 planking sessions! Planking master achieved! 🥇 #PlankCoach'
  },
  {
    id: 'planking_lifetime_300min',
    name: 'Planking Legend',
    description: 'Accumulate 5 hours (300 minutes) of planking exercises',
    category: 'category_specific',
    icon: '🏆',
    badge_color: 'from-yellow-900 to-amber-900',
    rarity: 'legendary',
    points: 750,
    requirement: { type: 'category_specific', value: 18000, conditions: { exercise_categories: ['planking'] } },
    unlock_message: 'FIVE HOURS of planking! You are a planking legend!',
    share_message: '5 hours of planking completed! Planking legend! 🏆 #PlankCoach'
  },

  // CROSS-CATEGORY ACHIEVEMENTS - Multi-Category Explorer Achievements (5 achievements)
  {
    id: 'category_explorer_2',
    name: 'Category Explorer',
    description: 'Complete exercises in 2 different categories',
    category: 'cross_category',
    icon: '🗺️',
    badge_color: 'from-teal-400 to-cyan-500',
    rarity: 'common',
    points: 50,
    requirement: { type: 'cross_category', value: 2, conditions: { minimum_categories: 2 } },
    unlock_message: 'Exploring new territories! You\'ve tried 2 exercise categories!',
    share_message: 'Explored 2 exercise categories! Territory expanding! 🗺️ #PlankCoach'
  },
  {
    id: 'category_explorer_3',
    name: 'Multi-Category Adventurer',
    description: 'Complete exercises in 3 different categories',
    category: 'cross_category',
    icon: '🎒',
    badge_color: 'from-teal-500 to-blue-600',
    rarity: 'uncommon',
    points: 100,
    requirement: { type: 'cross_category', value: 3, conditions: { minimum_categories: 3 } },
    unlock_message: 'Adventure calls! You\'ve conquered 3 exercise categories!',
    share_message: 'Adventured through 3 exercise categories! 🎒 #PlankCoach'
  },
  {
    id: 'category_explorer_4',
    name: 'Fitness Wanderer',
    description: 'Complete exercises in 4 different categories',
    category: 'cross_category',
    icon: '🧭',
    badge_color: 'from-blue-500 to-indigo-600',
    rarity: 'rare',
    points: 200,
    requirement: { type: 'cross_category', value: 4, conditions: { minimum_categories: 4 } },
    unlock_message: 'Wandering through fitness! You\'ve mastered 4 exercise categories!',
    share_message: 'Wandered through 4 exercise categories! 🧭 #PlankCoach'
  },
  {
    id: 'category_explorer_5',
    name: 'Fitness Explorer',
    description: 'Complete exercises in 5 different categories',
    category: 'cross_category',
    icon: '🏔️',
    badge_color: 'from-indigo-500 to-purple-600',
    rarity: 'epic',
    points: 400,
    requirement: { type: 'cross_category', value: 5, conditions: { minimum_categories: 5 } },
    unlock_message: 'Exploring every peak! You\'ve conquered 5 exercise categories!',
    share_message: 'Explored 5 exercise categories! Peak conqueror! 🏔️ #PlankCoach'
  },
  {
    id: 'category_explorer_all',
    name: 'Complete Fitness Explorer',
    description: 'Complete exercises in all 6 categories',
    category: 'cross_category',
    icon: '🌍',
    badge_color: 'from-purple-600 to-pink-700',
    rarity: 'legendary',
    points: 800,
    requirement: { type: 'cross_category', value: 6, conditions: { minimum_categories: 6 } },
    unlock_message: 'WORLD EXPLORER! You\'ve mastered ALL 6 exercise categories!',
    share_message: 'Explored ALL 6 exercise categories! World explorer! 🌍 #PlankCoach'
  },

  // Same-Day Multi-Category Achievements (5 achievements)
  {
    id: 'same_day_2_categories',
    name: 'Daily Variety',
    description: 'Complete exercises from 2 categories in one day',
    category: 'cross_category',
    icon: '🌅',
    badge_color: 'from-pink-400 to-rose-500',
    rarity: 'uncommon',
    points: 75,
    requirement: { type: 'cross_category', value: 2, conditions: { same_day: true, minimum_categories: 2 } },
    unlock_message: 'Variety is the spice of life! 2 categories in one day!',
    share_message: '2 exercise categories in one day! Daily variety! 🌅 #PlankCoach'
  },
  {
    id: 'same_day_3_categories',
    name: 'Triple Threat',
    description: 'Complete exercises from 3 categories in one day',
    category: 'cross_category',
    icon: '🎯',
    badge_color: 'from-rose-400 to-pink-600',
    rarity: 'rare',
    points: 150,
    requirement: { type: 'cross_category', value: 3, conditions: { same_day: true, minimum_categories: 3 } },
    unlock_message: 'Triple threat activated! 3 categories conquered in one day!',
    share_message: '3 exercise categories in one day! Triple threat! 🎯 #PlankCoach'
  },
  {
    id: 'same_day_4_categories',
    name: 'Quadruple Power',
    description: 'Complete exercises from 4 categories in one day',
    category: 'cross_category',
    icon: '💥',
    badge_color: 'from-pink-500 to-purple-700',
    rarity: 'epic',
    points: 300,
    requirement: { type: 'cross_category', value: 4, conditions: { same_day: true, minimum_categories: 4 } },
    unlock_message: 'QUADRUPLE POWER! 4 categories mastered in one incredible day!',
    share_message: '4 exercise categories in one day! Quadruple power! 💥 #PlankCoach'
  },
  {
    id: 'same_day_5_categories',
    name: 'Fitness Tornado',
    description: 'Complete exercises from 5 categories in one day',
    category: 'cross_category',
    icon: '🌪️',
    badge_color: 'from-purple-600 to-indigo-800',
    rarity: 'epic',
    points: 500,
    requirement: { type: 'cross_category', value: 5, conditions: { same_day: true, minimum_categories: 5 } },
    unlock_message: 'FITNESS TORNADO! 5 categories destroyed in one day!',
    share_message: '5 exercise categories in one day! Fitness tornado! 🌪️ #PlankCoach'
  },
  {
    id: 'same_day_all_categories',
    name: 'Fitness Hurricane',
    description: 'Complete exercises from all 6 categories in one day',
    category: 'cross_category',
    icon: '🌀',
    badge_color: 'from-indigo-700 to-purple-900',
    rarity: 'legendary',
    points: 1000,
    requirement: { type: 'cross_category', value: 6, conditions: { same_day: true, minimum_categories: 6 } },
    unlock_message: 'FITNESS HURRICANE! ALL 6 categories conquered in ONE DAY!',
    share_message: 'ALL 6 exercise categories in ONE DAY! Fitness hurricane! 🌀 #PlankCoach'
  },

  // Weekly Multi-Category Achievements (5 achievements)
  {
    id: 'weekly_3_categories',
    name: 'Weekly Variety',
    description: 'Complete exercises from 3 categories within a week',
    category: 'cross_category',
    icon: '📅',
    badge_color: 'from-cyan-400 to-blue-500',
    rarity: 'uncommon',
    points: 100,
    requirement: { type: 'cross_category', value: 3, conditions: { within_timeframe: 7, minimum_categories: 3 } },
    unlock_message: 'Weekly variety achieved! 3 categories conquered this week!',
    share_message: '3 exercise categories this week! Weekly variety! 📅 #PlankCoach'
  },
  {
    id: 'weekly_4_categories',
    name: 'Weekly Warrior',
    description: 'Complete exercises from 4 categories within a week',
    category: 'cross_category',
    icon: '⚔️',
    badge_color: 'from-blue-500 to-indigo-600',
    rarity: 'rare',
    points: 200,
    requirement: { type: 'cross_category', value: 4, conditions: { within_timeframe: 7, minimum_categories: 4 } },
    unlock_message: 'Weekly warrior status! 4 categories dominated this week!',
    share_message: '4 exercise categories this week! Weekly warrior! ⚔️ #PlankCoach'
  },
  {
    id: 'weekly_5_categories',
    name: 'Weekly Champion',
    description: 'Complete exercises from 5 categories within a week',
    category: 'cross_category',
    icon: '🏆',
    badge_color: 'from-indigo-600 to-purple-700',
    rarity: 'epic',
    points: 400,
    requirement: { type: 'cross_category', value: 5, conditions: { within_timeframe: 7, minimum_categories: 5 } },
    unlock_message: 'Weekly champion crowned! 5 categories conquered this week!',
    share_message: '5 exercise categories this week! Weekly champion! 🏆 #PlankCoach'
  },
  {
    id: 'weekly_all_categories',
    name: 'Weekly Perfectionist',
    description: 'Complete exercises from all 6 categories within a week',
    category: 'cross_category',
    icon: '💎',
    badge_color: 'from-purple-700 to-pink-800',
    rarity: 'legendary',
    points: 750,
    requirement: { type: 'cross_category', value: 6, conditions: { within_timeframe: 7, minimum_categories: 6 } },
    unlock_message: 'WEEKLY PERFECTION! All 6 categories mastered this week!',
    share_message: 'ALL 6 exercise categories this week! Weekly perfectionist! 💎 #PlankCoach'
  },
  {
    id: 'balanced_training_month',
    name: 'Balanced Training Master',
    description: 'Complete exercises from all 6 categories for 4 consecutive weeks',
    category: 'cross_category',
    icon: '⚖️',
    badge_color: 'from-pink-700 to-purple-900',
    rarity: 'legendary',
    points: 1500,
    requirement: { type: 'cross_category', value: 4, conditions: { within_timeframe: 28, minimum_categories: 6, consecutive: true } },
    unlock_message: 'BALANCED TRAINING MASTER! 4 weeks of perfect category balance!',
    share_message: '4 weeks of balanced training! Training master! ⚖️ #PlankCoach'
  },

  // Combination Specific Achievements (5 achievements)
  {
    id: 'cardio_strength_combo',
    name: 'Power Combo',
    description: 'Complete both cardio and strength exercises in one session',
    category: 'cross_category',
    icon: '⚡',
    badge_color: 'from-red-500 to-orange-600',
    rarity: 'uncommon',
    points: 75,
    requirement: { type: 'cross_category', value: 1, conditions: { category_combination: ['cardio', 'strength'], same_day: true } },
    unlock_message: 'Power combo activated! Cardio + Strength = Unstoppable!',
    share_message: 'Cardio + Strength combo completed! Power combo! ⚡ #PlankCoach'
  },
  {
    id: 'seated_standing_combo',
    name: 'Mobility Master',
    description: 'Complete both seated and standing exercises in one session',
    category: 'cross_category',
    icon: '🔄',
    badge_color: 'from-green-500 to-purple-600',
    rarity: 'uncommon',
    points: 75,
    requirement: { type: 'cross_category', value: 1, conditions: { category_combination: ['seated_exercise', 'standing_movement'], same_day: true } },
    unlock_message: 'Mobility mastered! Seated + Standing = Complete movement!',
    share_message: 'Seated + Standing combo! Mobility master! 🔄 #PlankCoach'
  },
  {
    id: 'plank_legift_combo',
    name: 'Core Focus',
    description: 'Complete both planking and leg lift exercises in one session',
    category: 'cross_category',
    icon: '🎯',
    badge_color: 'from-yellow-500 to-blue-600',
    rarity: 'uncommon',
    points: 75,
    requirement: { type: 'cross_category', value: 1, conditions: { category_combination: ['planking', 'leg_lift'], same_day: true } },
    unlock_message: 'Core focus achieved! Planking + Leg lifts = Ultimate core!',
    share_message: 'Planking + Leg lift combo! Core focus! 🎯 #PlankCoach'
  },
  {
    id: 'endurance_combo',
    name: 'Endurance Beast',
    description: 'Complete cardio, planking, and leg lift exercises in one session',
    category: 'cross_category',
    icon: '🦣',
    badge_color: 'from-red-600 to-blue-700',
    rarity: 'rare',
    points: 150,
    requirement: { type: 'cross_category', value: 1, conditions: { category_combination: ['cardio', 'planking', 'leg_lift'], same_day: true } },
    unlock_message: 'ENDURANCE BEAST! Triple endurance combo mastered!',
    share_message: 'Cardio + Planking + Leg lift combo! Endurance beast! 🦣 #PlankCoach'
  },
  {
    id: 'complete_workout_combo',
    name: 'Complete Athlete',
    description: 'Complete strength, cardio, and mobility exercises in one session',
    category: 'cross_category',
    icon: '🏃‍♂️',
    badge_color: 'from-orange-600 to-purple-700',
    rarity: 'epic',
    points: 300,
    requirement: { type: 'cross_category', value: 1, conditions: { category_combination: ['strength', 'cardio', 'standing_movement'], same_day: true } },
    unlock_message: 'COMPLETE ATHLETE! Strength + Cardio + Mobility = Perfect workout!',
    share_message: 'Strength + Cardio + Mobility combo! Complete athlete! 🏃‍♂️ #PlankCoach'
  },

  // Advanced Cross-Category Achievements (5 achievements)
  {
    id: 'cross_category_consistency_week',
    name: 'Variety Consistency',
    description: 'Complete exercises from at least 3 categories every day for a week',
    category: 'cross_category',
    icon: '🌈',
    badge_color: 'from-pink-500 to-violet-600',
    rarity: 'epic',
    points: 500,
    requirement: { type: 'cross_category', value: 7, conditions: { minimum_categories: 3, within_timeframe: 7, consecutive: true } },
    unlock_message: 'VARIETY CONSISTENCY! 3+ categories every day for a week!',
    share_message: '3+ categories daily for a week! Variety consistency! 🌈 #PlankCoach'
  },
  {
    id: 'cross_category_mastery_100',
    name: 'Cross-Category Master',
    description: 'Complete 100 total sessions across at least 4 categories',
    category: 'cross_category',
    icon: '🎓',
    badge_color: 'from-violet-600 to-purple-800',
    rarity: 'epic',
    points: 750,
    requirement: { type: 'cross_category', value: 100, conditions: { minimum_categories: 4 } },
    unlock_message: 'CROSS-CATEGORY MASTER! 100 sessions across 4+ categories!',
    share_message: '100 sessions across 4+ categories! Cross-category master! 🎓 #PlankCoach'
  },
  {
    id: 'category_streak_master',
    name: 'Category Streak Master',
    description: 'Maintain 7-day streaks in 3 different categories simultaneously',
    category: 'cross_category',
    icon: '🔗',
    badge_color: 'from-purple-700 to-indigo-900',
    rarity: 'legendary',
    points: 1000,
    requirement: { type: 'cross_category', value: 3, conditions: { minimum_categories: 3, consecutive: true, within_timeframe: 7 } },
    unlock_message: 'CATEGORY STREAK MASTER! 7-day streaks in 3 categories!',
    share_message: '7-day streaks in 3 categories! Category streak master! 🔗 #PlankCoach'
  },
  {
    id: 'ultimate_variety_month',
    name: 'Ultimate Variety Champion',
    description: 'Complete exercises from all 6 categories every week for a month',
    category: 'cross_category',
    icon: '👑',
    badge_color: 'from-indigo-800 to-purple-900',
    rarity: 'legendary',
    points: 2000,
    requirement: { type: 'cross_category', value: 4, conditions: { minimum_categories: 6, within_timeframe: 28, consecutive: true } },
    unlock_message: 'ULTIMATE VARIETY CHAMPION! All 6 categories every week for a month!',
    share_message: 'All 6 categories weekly for a month! Ultimate variety champion! 👑 #PlankCoach'
  },
  {
    id: 'fitness_philosopher',
    name: 'Fitness Philosopher',
    description: 'Accumulate 10 hours total across all 6 exercise categories',
    category: 'cross_category',
    icon: '🧠',
    badge_color: 'from-purple-900 to-indigo-900',
    rarity: 'legendary',
    points: 2500,
    requirement: { type: 'cross_category', value: 36000, conditions: { minimum_categories: 6 } },
    unlock_message: 'FITNESS PHILOSOPHER! 10 hours mastered across ALL 6 categories!',
    share_message: '10 hours across all 6 categories! Fitness philosopher! 🧠 #PlankCoach'
  }
];

// Combine all achievement definitions
const BASE_ACHIEVEMENTS = EXPANDED_ACHIEVEMENTS;
export { EXPANDED_ACHIEVEMENTS as BASE_EXPANDED_ACHIEVEMENTS };
export const ALL_ACHIEVEMENTS: ExpandedAchievement[] = [
  ...BASE_ACHIEVEMENTS,
  ...CATEGORY_ACHIEVEMENTS, 
  ...CROSS_CATEGORY_ACHIEVEMENTS
];

// Update EXPANDED_ACHIEVEMENTS to include all achievements
export const EXPANDED_ACHIEVEMENTS_COMPLETE = ALL_ACHIEVEMENTS;

export class ExpandedAchievementEngine {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  async checkAllAchievements(sessionData?: any): Promise<UserAchievement[]> {
    console.log('Checking all achievements for user:', this.userId);
    
    const newAchievements: UserAchievement[] = [];
    
    // Get existing achievements to avoid duplicates
    const { data: existingAchievements } = await supabase
      .from('user_achievements')
      .select('achievement_name')
      .eq('user_id', this.userId);

    const existingNames = new Set(existingAchievements?.map(a => a.achievement_name) || []);

    // Check each achievement using the complete list
    for (const achievement of ALL_ACHIEVEMENTS) {
      if (existingNames.has(achievement.name)) continue;

      const earned = await this.checkSingleAchievement(achievement, sessionData);
      if (earned) {
        const newAchievement = await this.awardAchievement(achievement);
        if (newAchievement) {
          newAchievements.push(newAchievement);
        }
      }
    }

    return newAchievements;
  }

  private async checkSingleAchievement(achievement: ExpandedAchievement, sessionData?: any): Promise<boolean> {
    switch (achievement.requirement.type) {
      case 'streak':
        return this.checkStreakAchievement(achievement.requirement.value);
      
      case 'duration':
        return this.checkDurationAchievement(achievement.requirement.value, sessionData);
      
      case 'count':
        return this.checkCountAchievement(achievement.requirement.value);
      
      case 'variety':
        return this.checkVarietyAchievement(achievement.requirement.value, achievement.requirement.conditions);
      
      case 'time_based':
        return this.checkTimeBasedAchievement(achievement.requirement.value, achievement.requirement.conditions);
      
      case 'improvement':
        return this.checkImprovementAchievement(achievement.requirement.value, achievement.requirement.conditions, sessionData);
      
      case 'category_specific':
        return this.checkCategorySpecificAchievement(achievement.requirement.value, achievement.requirement.conditions, sessionData);
      
      case 'cross_category':
        return this.checkCrossCategoryAchievement(achievement.requirement.value, achievement.requirement.conditions, sessionData);
      
      default:
        return false;
    }
  }

  private async checkCategorySpecificAchievement(targetValue: number, conditions?: any, sessionData?: any): Promise<boolean> {
    if (!conditions?.exercise_categories?.length) return false;
    
    const category = conditions.exercise_categories[0];
    
    // Get sessions for the specific category
    const { data: exercises } = await supabase
      .from('plank_exercises')
      .select('id')
      .eq('category', category);
    
    const exerciseIds = exercises?.map(e => e.id) || [];
    if (exerciseIds.length === 0) return false;

    const { data: sessions } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('user_id', this.userId)
      .in('exercise_id', exerciseIds);

    return (sessions?.length || 0) >= targetValue;
  }

  private async checkCrossCategoryAchievement(targetValue: number, conditions?: any, sessionData?: any): Promise<boolean> {
    if (!conditions?.minimum_categories) return false;

    // Get all user sessions with exercise category info
    const { data: sessions } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('user_id', this.userId);

    if (!sessions?.length) return false;

    const categories = new Set(sessions.map(s => s.category).filter(Boolean));
    return categories.size >= conditions.minimum_categories;
  }

  private async checkStreakAchievement(targetDays: number): Promise<boolean> {
    const { data: streak } = await supabase
      .from('user_streaks')
      .select('current_streak')
      .eq('user_id', this.userId)
      .maybeSingle();

    return (streak?.current_streak || 0) >= targetDays;
  }

  private async checkDurationAchievement(targetSeconds: number, sessionData?: any): Promise<boolean> {
    // Check if the current session meets the requirement
    if (sessionData?.duration_seconds >= targetSeconds) {
      return true;
    }

    // Check historical sessions
    const { data: sessions } = await supabase
      .from('user_sessions')
      .select('duration_seconds')
      .eq('user_id', this.userId)
      .gte('duration_seconds', targetSeconds)
      .limit(1);

    return (sessions?.length || 0) > 0;
  }

  private async checkCountAchievement(targetCount: number): Promise<boolean> {
    const { data: sessions } = await supabase
      .from('user_sessions')
      .select('id')
      .eq('user_id', this.userId);

    return (sessions?.length || 0) >= targetCount;
  }

  private async checkVarietyAchievement(targetVariety: number, conditions?: any): Promise<boolean> {
    let query = supabase
      .from('user_sessions')
      .select('exercise_id, completed_at')
      .eq('user_id', this.userId);

    // Apply time frame condition if specified
    if (conditions?.within_timeframe) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - conditions.within_timeframe);
      query = query.gte('completed_at', startDate.toISOString());
    }

    const { data: sessions } = await query;
    const uniqueExercises = new Set(sessions?.map(s => s.exercise_id).filter(Boolean));
    
    return uniqueExercises.size >= targetVariety;
  }

  private async checkTimeBasedAchievement(targetValue: number, conditions?: any): Promise<boolean> {
    if (conditions?.time_of_day === 'morning') {
      return this.checkMorningWorkouts(targetValue);
    } else if (conditions?.time_of_day === 'evening') {
      return this.checkEveningWorkouts(targetValue);
    } else if (conditions?.time_of_day === 'weekend') {
      return this.checkWeekendWorkouts(targetValue);
    } else {
      // Total time accumulation
      return this.checkTotalTime(targetValue);
    }
  }

  private async checkMorningWorkouts(targetCount: number): Promise<boolean> {
    const { data: sessions } = await supabase
      .from('user_sessions')
      .select('completed_at')
      .eq('user_id', this.userId);

    const morningCount = sessions?.filter(session => {
      const hour = new Date(session.completed_at || '').getHours();
      return hour >= 5 && hour < 9;
    }).length || 0;

    return morningCount >= targetCount;
  }

  private async checkEveningWorkouts(targetCount: number): Promise<boolean> {
    const { data: sessions } = await supabase
      .from('user_sessions')
      .select('completed_at')
      .eq('user_id', this.userId);

    const eveningCount = sessions?.filter(session => {
      const hour = new Date(session.completed_at || '').getHours();
      return hour >= 19; // 7 PM or later
    }).length || 0;

    return eveningCount >= targetCount;
  }

  private async checkWeekendWorkouts(targetCount: number): Promise<boolean> {
    const { data: sessions } = await supabase
      .from('user_sessions')
      .select('completed_at')
      .eq('user_id', this.userId);

    const weekendCount = sessions?.filter(session => {
      const day = new Date(session.completed_at || '').getDay();
      return day === 0 || day === 6; // Sunday or Saturday
    }).length || 0;

    return weekendCount >= targetCount;
  }

  private async checkTotalTime(targetSeconds: number): Promise<boolean> {
    const { data: sessions } = await supabase
      .from('user_sessions')
      .select('duration_seconds')
      .eq('user_id', this.userId);

    const totalDuration = sessions?.reduce((sum, session) => sum + session.duration_seconds, 0) || 0;
    return totalDuration >= targetSeconds;
  }

  private async checkImprovementAchievement(targetImprovement: number, conditions?: any, sessionData?: any): Promise<boolean> {
    const { data: sessions } = await supabase
      .from('user_sessions')
      .select('duration_seconds, completed_at')
      .eq('user_id', this.userId)
      .order('completed_at', { ascending: true });

    if (!sessions || sessions.length < 2) return false;

    const firstSession = sessions[0].duration_seconds;
    const currentSession = sessionData?.duration_seconds || sessions[sessions.length - 1].duration_seconds;
    const improvement = currentSession - firstSession;

    if (conditions?.improvement_threshold === 100) {
      // Double down achievement - check if current is at least double the first
      return currentSession >= firstSession * 2;
    }

    return improvement >= targetImprovement;
  }

  private async awardAchievement(achievement: ExpandedAchievement): Promise<UserAchievement | null> {
    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .insert({
          user_id: this.userId,
          achievement_type: achievement.category,
          achievement_name: achievement.name,
          description: achievement.description,
          category: achievement.category,
          rarity: achievement.rarity,
          points: achievement.points,
          metadata: {
            icon: achievement.icon,
            badge_color: achievement.badge_color,
            unlock_message: achievement.unlock_message,
            share_message: achievement.share_message
          }
        })
        .select()
        .single();

      if (error) {
        console.error('Error awarding achievement:', error);
        return null;
      }

      console.log('Achievement awarded:', achievement.name);
      return data;
    } catch (error) {
      console.error('Error awarding achievement:', error);
      return null;
    }
  }

  static getAchievementByName(name: string): ExpandedAchievement | undefined {
    return ALL_ACHIEVEMENTS.find(a => a.name === name);
  }

  static getAchievementsByCategory(category: string): ExpandedAchievement[] {
    if (category === 'all') return ALL_ACHIEVEMENTS;
    return ALL_ACHIEVEMENTS.filter(a => a.category === category);
  }

  static getRarityColor(rarity: ExpandedAchievement['rarity']): string {
    const colors = {
      common: 'text-gray-600 bg-gray-100 border-gray-200',
      uncommon: 'text-green-600 bg-green-100 border-green-200',
      rare: 'text-blue-600 bg-blue-100 border-blue-200',
      epic: 'text-purple-600 bg-purple-100 border-purple-200',
      legendary: 'text-yellow-600 bg-yellow-100 border-yellow-200'
    };
    return colors[rarity];
  }

  static getRarityGlow(rarity: ExpandedAchievement['rarity']): string {
    const glows = {
      common: '',
      uncommon: 'shadow-green-200/50',
      rare: 'shadow-blue-200/50', 
      epic: 'shadow-purple-200/50',
      legendary: 'shadow-yellow-200/50 shadow-lg'
    };
    return glows[rarity];
  }
}
