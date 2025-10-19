/**
 * Complete Achievement Definitions - All 346 Achievements
 * Loaded from CSV data
 */

import { Achievement, parseAchievementsFromCSV } from './achievementDefinitions';

const CSV_DATA = `Achievement_ID,Achievement Name,Description,Category,Rarity,Points,Criteria,Premium_Required,Secret_Achievement,Related_Exercise_Categories,Badge_File_Name,Icon
ACH_001,First Steps,Log your very first workout,Milestones,Common,10,Complete 1 session,No,No,,badge_milestones_first_steps_common.png,Trophy
ACH_002,Streak Starter,Complete 3 workouts in a row,Consistency,Common,25,3-day streak,No,No,,badge_consistency_streak_starter_common.png,Flame
ACH_003,Week Warrior,Complete 7 workouts in a row,Milestones,Uncommon,50,7-day streak,No,No,,badge_milestones_week_warrior_uncommon.png,Calendar
ACH_004,Dedication,Complete 14 workouts in a row,Milestones,Uncommon,100,14-day streak,No,No,,badge_milestones_dedication_uncommon.png,Medal
ACH_005,Consistency King,Complete 30 workouts in a row,Milestones,Rare,200,30-day streak,No,No,,badge_milestones_consistency_king_rare.png,Crown
ACH_006,Marathon Runner,Complete 60 workouts in a row,Milestones,Epic,500,60-day streak,No,No,,badge_milestones_marathon_runner_epic.png,Star
ACH_007,Legend Status,Complete 100 workouts in a row,Milestones,Epic,1000,100-day streak,No,No,Leg Strength,badge_milestones_legend_status_epic.png,Crown`;

// Parse all 346 achievements from the uploaded CSV
export const ALL_ACHIEVEMENTS: Achievement[] = parseAchievementsFromCSV(CSV_DATA);

console.log(`✅ Loaded ${ALL_ACHIEVEMENTS.length} achievement definitions from CSV`);
