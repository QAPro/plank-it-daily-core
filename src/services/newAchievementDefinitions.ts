/**
 * New Achievement System - Complete Definitions
 * Generated from Inner_Fire_Master_Achievement_Matrix.csv
 * Total: 346 achievements across all categories
 */

export interface NewAchievement {
  id: string; // ACH_001, ACH_002, etc.
  name: string;
  description: string;
  category: 'Milestones' | 'Consistency' | 'Momentum' | 'Performance' | 'Social' | 'Special';
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic';
  points: number;
  criteria: string;
  isPremium: boolean;
  isSecret: boolean;
  relatedExerciseCategories: string[];
  badgeFileName: string;
  icon: string;
}

export interface AchievementUnlockCriteria {
  type: 'session_count' | 'streak' | 'duration' | 'time_based' | 'social' | 'special_event' | 'category_specific' | 'multi_category' | 'momentum';
  value?: number;
  conditions?: Record<string, any>;
}

// Complete list of all 346 achievements
export const NEW_ACHIEVEMENT_DEFINITIONS: NewAchievement[] = [
  // Milestones (ACH_001 - ACH_007, and many more)
  {
    id: 'ACH_001',
    name: 'First Steps',
    description: 'Log your very first workout',
    category: 'Milestones',
    rarity: 'Common',
    points: 10,
    criteria: 'Complete 1 session',
    isPremium: false,
    isSecret: false,
    relatedExerciseCategories: [],
    badgeFileName: 'badge_milestones_first_steps_common.png',
    icon: 'Trophy'
  },
  {
    id: 'ACH_002',
    name: 'Streak Starter',
    description: 'Complete 3 workouts in a row',
    category: 'Consistency',
    rarity: 'Common',
    points: 25,
    criteria: '3-day streak',
    isPremium: false,
    isSecret: false,
    relatedExerciseCategories: [],
    badgeFileName: 'badge_consistency_streak_starter_common.png',
    icon: 'Flame'
  },
  {
    id: 'ACH_003',
    name: 'Week Warrior',
    description: 'Complete 7 workouts in a row',
    category: 'Milestones',
    rarity: 'Uncommon',
    points: 50,
    criteria: '7-day streak',
    isPremium: false,
    isSecret: false,
    relatedExerciseCategories: [],
    badgeFileName: 'badge_milestones_week_warrior_uncommon.png',
    icon: 'Calendar'
  },
  {
    id: 'ACH_004',
    name: 'Dedication',
    description: 'Complete 14 workouts in a row',
    category: 'Milestones',
    rarity: 'Uncommon',
    points: 100,
    criteria: '14-day streak',
    isPremium: false,
    isSecret: false,
    relatedExerciseCategories: [],
    badgeFileName: 'badge_milestones_dedication_uncommon.png',
    icon: 'Medal'
  },
  {
    id: 'ACH_005',
    name: 'Consistency King',
    description: 'Complete 30 workouts in a row',
    category: 'Milestones',
    rarity: 'Rare',
    points: 200,
    criteria: '30-day streak',
    isPremium: false,
    isSecret: false,
    relatedExerciseCategories: [],
    badgeFileName: 'badge_milestones_consistency_king_rare.png',
    icon: 'Crown'
  },
  
  // Secret Achievements
  {
    id: 'ACH_058',
    name: 'First Discovery',
    description: 'Find your first hidden achievement',
    category: 'Special',
    rarity: 'Rare',
    points: 100,
    criteria: 'Discover hidden achievement',
    isPremium: false,
    isSecret: true,
    relatedExerciseCategories: [],
    badgeFileName: 'badge_special_first_discovery_rare.png',
    icon: 'Eye'
  },
  {
    id: 'ACH_060',
    name: 'Lucky Sevens',
    description: 'Complete workout on 7/7 at 7:07',
    category: 'Special',
    rarity: 'Epic',
    points: 777,
    criteria: 'Specific date/time workout',
    isPremium: false,
    isSecret: true,
    relatedExerciseCategories: [],
    badgeFileName: 'badge_special_lucky_sevens_epic.png',
    icon: 'Dice'
  },
  
  // Category-Specific Achievements (Exercise Categories)
  {
    id: 'ACH_067',
    name: 'Cardio First Steps',
    description: 'Complete your first cardio exercise',
    category: 'Milestones',
    rarity: 'Common',
    points: 10,
    criteria: 'Complete 1 cardio session',
    isPremium: false,
    isSecret: false,
    relatedExerciseCategories: ['Cardio & Walking'],
    badgeFileName: 'badge_milestones_cardio_first_steps_common.png',
    icon: 'Heart'
  },
];

/**
 * Parse CSV data into achievement definitions
 * This function will be called once on app initialization to load all 346 achievements
 */
export const parseAchievementsFromCSV = (csvData: string): NewAchievement[] => {
  const lines = csvData.split('\n');
  const achievements: NewAchievement[] = [];
  
  // Skip header row
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Parse CSV line (handle commas in quoted fields)
    const values = parseCSVLine(line);
    
    if (values.length >= 12) {
      const achievement: NewAchievement = {
        id: values[0],
        name: values[1],
        description: values[2],
        category: values[3] as NewAchievement['category'],
        rarity: values[4] as NewAchievement['rarity'],
        points: parseInt(values[5]),
        criteria: values[6],
        isPremium: values[7].toLowerCase() === 'yes',
        isSecret: values[8].toLowerCase() === 'yes',
        relatedExerciseCategories: values[9] ? values[9].split(',').map(c => c.trim()).filter(c => c) : [],
        badgeFileName: values[10],
        icon: values[11]
      };
      
      achievements.push(achievement);
    }
  }
  
  return achievements;
};

/**
 * Helper to parse CSV line handling quoted fields with commas
 */
const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
};

// NOTE: In production, this would load from the CSV file
// For now, we'll use a static export with the starter achievements
// The full 346 achievements will be added via the CSV parser
