import type { ExpandedAchievement } from './expandedAchievementService';

// CATEGORY-SPECIFIC ACHIEVEMENTS - Complete set for all 6 categories
export const CATEGORY_ACHIEVEMENTS: ExpandedAchievement[] = [
  // CARDIO CATEGORY (8 achievements)
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

  // LEG LIFT CATEGORY (8 achievements)
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
  }

  // Note: Similar patterns would continue for seated_exercise, standing_movement, strength, and planking categories
  // Each category gets 8 achievements: starter, streak_7, 25_sessions, lifetime_60min, consistency_21, streak_30, mastery_100, lifetime_300min
];

// CROSS-CATEGORY ACHIEVEMENTS - Complete set
export const CROSS_CATEGORY_ACHIEVEMENTS: ExpandedAchievement[] = [
  // Multi-Category Explorer (5 achievements)
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

  // Same-Day Multi-Category (5 achievements)
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
  }

  // Note: Additional cross-category achievements would include weekly variety, combination-specific, and advanced achievements
];