/**
 * Achievement Criteria Parser
 * Parses human-readable criteria into structured, actionable logic
 */

export interface ParsedCriteria {
  type: string;
  [key: string]: any;
  needsReview?: boolean;
  reviewReason?: string;
}

export interface AchievementWithParsedCriteria {
  id: string;
  name: string;
  criteria: string;
  parsedCriteria: ParsedCriteria;
  needsReview: boolean;
  reviewReason?: string;
}

/**
 * Parse achievement criteria into structured format
 */
export function parseAchievementCriteria(criteria: string, achievementId: string, achievementName: string): ParsedCriteria {
  const lower = criteria.toLowerCase();
  
  // Session count patterns
  if (/complete (\d+) sessions?$/.test(lower)) {
    const match = lower.match(/complete (\d+) sessions?$/);
    return { type: 'session_count', value: parseInt(match![1]) };
  }
  
  // Streak patterns
  if (/(\d+)-day streak/.test(lower)) {
    const match = lower.match(/(\d+)-day streak/);
    return { type: 'streak', days: parseInt(match![1]) };
  }
  
  // Duration patterns (less than or equal)
  if (/session <= (\d+) seconds/.test(lower)) {
    const match = lower.match(/session <= (\d+) seconds/);
    return { type: 'duration', operator: '<=', seconds: parseInt(match![1]) };
  }
  
  // Duration patterns (greater than or equal)
  if (/session >= (\d+) minutes/.test(lower)) {
    const match = lower.match(/session >= (\d+) minutes/);
    return { type: 'duration', operator: '>=', minutes: parseInt(match![1]) };
  }
  
  // Category-specific session count
  if (/(\d+) (cardio|leg_lift|planking|seated_exercise|standing_movement|strength) sessions/.test(lower)) {
    const match = lower.match(/(\d+) (cardio|leg_lift|planking|seated_exercise|standing_movement|strength) sessions/);
    return { type: 'category_sessions', category: match![2], count: parseInt(match![1]) };
  }
  
  // Category-specific streak
  if (/(\d+)-day (cardio|leg_lift|planking|seated_exercise|standing_movement|strength) streak/.test(lower)) {
    const match = lower.match(/(\d+)-day (cardio|leg_lift|planking|seated_exercise|standing_movement|strength) streak/);
    return { type: 'category_streak', category: match![2], days: parseInt(match![1]) };
  }
  
  // Lifetime duration in category
  if (/(\d+) min (cardio|leg_lift|planking|seated_exercise|standing_movement|strength) lifetime/.test(lower)) {
    const match = lower.match(/(\d+) min (cardio|leg_lift|planking|seated_exercise|standing_movement|strength) lifetime/);
    return { type: 'lifetime_duration', category: match![2], minutes: parseInt(match![1]) };
  }
  
  // Time of day patterns
  if (/(\d+) sessions? before (\d+) am/.test(lower)) {
    const match = lower.match(/(\d+) sessions? before (\d+) am/);
    return { type: 'time_of_day', count: parseInt(match![1]), hour: parseInt(match![2]), operator: '<' };
  }
  
  if (/(\d+) sessions? after (\d+) pm/.test(lower)) {
    const match = lower.match(/(\d+) sessions? after (\d+) pm/);
    return { type: 'time_of_day', count: parseInt(match![1]), hour: parseInt(match![2]) + 12, operator: '>' };
  }
  
  // Special dates
  if (/leap day workout/.test(lower)) {
    return { type: 'special_date', date: 'leap_day' };
  }
  
  if (/friday 13th workout/.test(lower)) {
    return { type: 'special_date', date: 'friday_13th' };
  }
  
  if (/eclipse day workout/.test(lower)) {
    return { type: 'special_date', date: 'solar_eclipse' };
  }
  
  if (/palindrome date workout/.test(lower)) {
    return { type: 'special_date', date: 'palindrome_date' };
  }
  
  // Level-based patterns
  if (/(\d+) workouts? with difficulty level = (\d+)/.test(lower)) {
    const match = lower.match(/(\d+) workouts? with difficulty level = (\d+)/);
    return { type: 'level_sessions', level: parseInt(match![2]), count: parseInt(match![1]) };
  }
  
  if (/(\d+) workouts? with level >= (\d+)/.test(lower)) {
    const match = lower.match(/(\d+) workouts? with level >= (\d+)/);
    return { type: 'level_sessions', level: parseInt(match![2]), count: parseInt(match![1]), operator: '>=' };
  }
  
  // Social actions
  if (/send (\d+) cheers?/.test(lower)) {
    const match = lower.match(/send (\d+) cheers?/);
    return { type: 'social_action', action: 'send_cheers', count: parseInt(match![1]) };
  }
  
  if (/receive (\d+) cheers?/.test(lower)) {
    const match = lower.match(/receive (\d+) cheers?/);
    return { type: 'social_action', action: 'receive_cheers', count: parseInt(match![1]) };
  }
  
  if (/have (\d+) friends? in the app/.test(lower)) {
    const match = lower.match(/have (\d+) friends? in the app/);
    return { type: 'social_action', action: 'friend_count', count: parseInt(match![1]) };
  }
  
  // Momentum score
  if (/weekly momentum score >= (\d+)/.test(lower)) {
    const match = lower.match(/weekly momentum score >= (\d+)/);
    return { type: 'momentum', period: 'weekly', value: parseInt(match![1]) };
  }
  
  // Multi-category patterns
  if (/(\d+)\+ sessions? in (\d+) categories/.test(lower)) {
    const match = lower.match(/(\d+)\+ sessions? in (\d+) categories/);
    return { type: 'multi_category', sessions_per_category: parseInt(match![1]), num_categories: parseInt(match![2]) };
  }
  
  // Mastery level
  if (/(cardio|leg_lift|planking|seated_exercise|standing_movement|strength) mastery level (\d+)/.test(lower)) {
    const match = lower.match(/(cardio|leg_lift|planking|seated_exercise|standing_movement|strength) mastery level (\d+)/);
    return { type: 'mastery', category: match![1], level: parseInt(match![2]) };
  }
  
  // Account age milestones
  if (/workout on day (\d+)\+ after account creation/.test(lower)) {
    const match = lower.match(/workout on day (\d+)\+ after account creation/);
    return { type: 'account_age', days: parseInt(match![1]) };
  }
  
  // Consistency patterns
  if (/(\d+) days\/week for (\d+) weeks?/.test(lower)) {
    const match = lower.match(/(\d+) days\/week for (\d+) weeks?/);
    return { type: 'consistency_pattern', days_per_week: parseInt(match![1]), num_weeks: parseInt(match![2]) };
  }
  
  // AMBIGUOUS CRITERIA - Flag for review
  
  // ACH_026 - Perfectionist
  if (achievementId === 'ACH_026' || /10 sessions? without breaks/.test(lower)) {
    return {
      type: 'session_count',
      value: 10,
      modifier: 'consecutive_days',
      needsReview: true,
      reviewReason: 'Unclear what "without breaks" means - interpreted as 10 consecutive daily workouts'
    };
  }
  
  // ACH_029, ACH_033 - Personal bests
  if ((achievementId === 'ACH_029' || achievementId === 'ACH_033') && /personal best/.test(lower)) {
    const count = achievementId === 'ACH_029' ? 5 : 1;
    return {
      type: 'personal_best',
      count,
      period: achievementId === 'ACH_029' ? 'month' : undefined,
      needsReview: true,
      reviewReason: 'Definition of "personal best" unclear - needs specification (duration? level? sessions?)'
    };
  }
  
  // ACH_042 - Technique Specialist
  if (achievementId === 'ACH_042' || /master advanced exercise/.test(lower)) {
    return {
      type: 'mastery',
      category: 'advanced_variation',
      needsReview: true,
      reviewReason: 'Requires exercise variation system not yet defined in app'
    };
  }
  
  // ACH_046 - Time Manager
  if (achievementId === 'ACH_046' || /hit exact planned duration/.test(lower)) {
    return {
      type: 'duration',
      operator: '==',
      needsReview: true,
      reviewReason: 'Requires planned duration feature not in current system'
    };
  }
  
  // ACH_050, ACH_051, ACH_052 - Seasonal programs
  if ((achievementId === 'ACH_050' || achievementId === 'ACH_051' || achievementId === 'ACH_052') && 
      /(spring program|summer challenge|fall strength program)/.test(lower)) {
    return {
      type: 'program_completion',
      program: achievementId === 'ACH_050' ? 'spring' : achievementId === 'ACH_051' ? 'summer' : 'fall',
      needsReview: true,
      reviewReason: 'Requires program/challenge system not yet defined'
    };
  }
  
  // ACH_053 - Winter Warrior
  if (achievementId === 'ACH_053' || /winter fitness maintenance/.test(lower)) {
    return {
      type: 'seasonal_consistency',
      season: 'winter',
      months: ['December', 'January', 'February'],
      needsReview: true,
      reviewReason: 'Definition of "maintenance" unclear - suggest X sessions during winter months (Dec-Feb)'
    };
  }
  
  // ACH_056 - Holiday Hustle
  if (achievementId === 'ACH_056' || /holiday season consistency/.test(lower)) {
    return {
      type: 'seasonal_consistency',
      season: 'holiday',
      needsReview: true,
      reviewReason: 'Holiday period and consistency metric need definition - suggest Thanksgiving to New Year'
    };
  }
  
  // ACH_274, ACH_275 - Share the Fire, Squad Sync
  if ((achievementId === 'ACH_274' || achievementId === 'ACH_275') && /same day as (\d+) friends/.test(lower)) {
    const match = lower.match(/same day as (\d+) friends/);
    return {
      type: 'social_sync',
      friends_count: parseInt(match![1]),
      needsReview: true,
      reviewReason: 'Requires friend activity visibility system to detect same-day workouts'
    };
  }
  
  // ACH_323, ACH_324, ACH_325 - Level Up achievements
  if ((achievementId === 'ACH_323' || achievementId === 'ACH_324' || achievementId === 'ACH_325') && 
      /increase difficulty level (\d+) times/.test(lower)) {
    const match = lower.match(/increase difficulty level (\d+) times/);
    return {
      type: 'level_progression',
      count: parseInt(match![1]),
      needsReview: true,
      reviewReason: 'Unclear if tracking level increases between sessions or cumulative higher-level completions'
    };
  }
  
  // Default fallback - mark as needs review
  return {
    type: 'unknown',
    raw: criteria,
    needsReview: true,
    reviewReason: `Unable to parse criteria: "${criteria}"`
  };
}

/**
 * Get count of ambiguous achievements that need review
 */
export function getAmbiguousAchievementCount(achievements: any[]): number {
  return achievements.filter(ach => {
    const parsed = parseAchievementCriteria(ach.criteria, ach.id, ach.name);
    return parsed.needsReview === true;
  }).length;
}

/**
 * Get list of achievements flagged for review
 */
export function getAmbiguousAchievements(achievements: any[]): AchievementWithParsedCriteria[] {
  return achievements
    .map(ach => {
      const parsedCriteria = parseAchievementCriteria(ach.criteria, ach.id, ach.name);
      return {
        id: ach.id,
        name: ach.name,
        criteria: ach.criteria,
        parsedCriteria,
        needsReview: parsedCriteria.needsReview || false,
        reviewReason: parsedCriteria.reviewReason
      };
    })
    .filter(ach => ach.needsReview);
}
