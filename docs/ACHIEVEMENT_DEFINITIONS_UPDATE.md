# Achievement Definitions Update - December 2024

## Summary
This document tracks the resolution of ambiguous achievement criteria identified during the Phase 1 implementation.

## Updated Achievements (9 total)

### ACH_026 - Perfectionist
- **Original Criteria**: "10 sessions without breaks" (ambiguous)
- **New Criteria**: "10 consecutive daily sessions"
- **Unlock Logic**: Complete workouts on 10 consecutive days without missing a day
- **Implementation**: `consecutive_daily_sessions` type with `value: 10`

### ACH_029 - Milestone Master
- **Original Criteria**: "5 personal bests in a month" (definition unclear)
- **New Criteria**: "5 personal bests in month"
- **Unlock Logic**: Achieve 5 sessions with `was_personal_best = true` in a single calendar month
- **Implementation**: `personal_bests_count` type with `value: 5`, `timeframe: 'month'`

### ACH_033 - Personal Best
- **Original Criteria**: "Beat previous best performance" (definition unclear)
- **New Criteria**: "Beat previous best performance"
- **Unlock Logic**: Complete a session where `was_personal_best = true`
- **Implementation**: `personal_best` type with `value: 1`

### ACH_042 - Technique Specialist
- **Original Criteria**: "Master advanced exercise variation" (no exercise variation system)
- **New Criteria**: "Complete 50 sessions of difficulty level 4-5 exercises"
- **Unlock Logic**: Count sessions where `exercises.difficulty_level IN (4, 5)` reaches 50
- **Implementation**: `difficulty_level_count` type with `value: 50`, `difficulty_levels: [4, 5]`
- **Premium**: Now marked as `isPremium: true` (naturally premium-gated by difficulty levels)

### ACH_050 - Spring Fitness Champion (ID changed from ACH_051)
- **Original Criteria**: "Spring program completion" (no program system)
- **New Criteria**: "Complete 30 sessions in Spring (March 1 - May 31)"
- **Unlock Logic**: Count sessions where `completed_at` month is 3, 4, or 5 (March-May)
- **Implementation**: `seasonal_sessions` type with `value: 30`, `months: [3, 4, 5]`

### ACH_052 - Autumn Strength
- **Original Criteria**: "Fall strength program" (no program system)
- **New Criteria**: "Complete 30 sessions in Autumn (September 1 - November 30)"
- **Unlock Logic**: Count sessions where `completed_at` month is 9, 10, or 11 (Sept-Nov)
- **Implementation**: `seasonal_sessions` type with `value: 30`, `months: [9, 10, 11]`

### ACH_053 - Winter Warrior
- **Original Criteria**: "Winter fitness maintenance" (maintenance undefined)
- **New Criteria**: "Complete 20 sessions during Winter (December 1 - February 28/29)"
- **Unlock Logic**: Count sessions where `completed_at` month is 12, 1, or 2 (Dec-Feb)
- **Implementation**: `seasonal_sessions` type with `value: 20`, `months: [12, 1, 2]`

### ACH_056 - Holiday Hustle
- **Original Criteria**: "Holiday season consistency" (period and metric unclear)
- **New Criteria**: "Complete 10 sessions during holiday season (November 20 - January 5)"
- **Unlock Logic**: Count sessions between Nov 20 and Jan 5 (crosses year boundary)
- **Implementation**: `date_range_sessions` type with `value: 10`, `startMonth: 11`, `startDay: 20`, `endMonth: 1`, `endDay: 5`

### ACH_323, ACH_324, ACH_325 - Level Up Series
**Note**: These achievement IDs were not found in the current definitions file. They will be added in a future update with the following criteria:
- **ACH_323 "Level Up"**: Complete sessions at 5 progressively higher difficulty levels
- **ACH_324 "Constant Improvement"**: Complete 25 sessions with increasing difficulty
- **ACH_325 "Always Advancing"**: Complete 100 sessions with progressive difficulty
- **Implementation**: `progressive_difficulty` type tracking level increases

## Disabled Achievements (3 total)

### ACH_046 - Time Manager
- **Reason**: Requires planned duration feature not yet implemented
- **Status**: `isDisabled: true`
- **Future Reactivation**: When workout planning feature is added

### ACH_274 - Share the Fire
- **Reason**: Requires friend activity visibility system
- **Status**: `isDisabled: true`
- **Original Criteria**: "Complete workout on same day as 5 friends"
- **Future Reactivation**: When friend activity feed is implemented

### ACH_275 - Squad Sync
- **Reason**: Requires friend activity visibility system
- **Status**: `isDisabled: true`
- **Original Criteria**: "Complete workout on same day as 10 friends"
- **Future Reactivation**: When friend activity feed is implemented

## New Unlock Criteria Types

The following new criteria types were added to support these achievements:

1. **`consecutive_daily_sessions`**: Tracks workouts on consecutive calendar days
2. **`personal_best`**: Single personal best achievement
3. **`personal_bests_count`**: Multiple personal bests in a timeframe
4. **`difficulty_level_count`**: Sessions at specific difficulty levels
5. **`seasonal_sessions`**: Sessions during specific months
6. **`date_range_sessions`**: Sessions between specific dates (handles year wraparound)
7. **`progressive_difficulty`**: Tracks increasing difficulty over time

## Database Dependencies

These achievements rely on the following database fields:
- `user_sessions.completed_at` - For date/time filtering
- `user_sessions.was_personal_best` - For personal best tracking
- `exercises.difficulty_level` - For difficulty-based achievements

## Next Steps (Phase 2)

1. Create `src/services/achievementProgressService.ts` with calculation logic for each criteria type
2. Implement progress tracking queries for all new criteria types
3. Create `user_achievement_progress` table caching layer
4. Build "What's Next?" recommendation algorithm

## Statistics

- **Total Achievements**: 346
- **Active Achievements**: 343
- **Disabled Achievements**: 3
- **Updated Achievements**: 9
- **Premium Achievements**: Multiple (including ACH_042)
- **Achievements with Extended Criteria**: 9+

---

**Last Updated**: December 2024  
**Phase**: 1 - Foundation & Badge Integration  
**Status**: ✅ Complete
