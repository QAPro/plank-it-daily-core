/**
 * One-time data fix script to recalculate all users' streaks based on actual workout history
 * 
 * This script:
 * 1. Fetches all users with streaks
 * 2. Looks at their workout history
 * 3. Calculates the correct current streak
 * 4. Updates the database with the correct value
 * 
 * Run with: npx tsx scripts/fix-streaks.ts
 */

import { createClient } from '@supabase/supabase-js';
import { formatInTimeZone } from 'date-fns-tz';
import { startOfDay, subDays } from 'date-fns';

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables: VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface UserStreak {
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_workout_date: string | null;
}

interface WorkoutDate {
  workout_date: string;
}

async function calculateCorrectStreak(userId: string, userTimezone: string): Promise<{ currentStreak: number; lastWorkoutDate: string | null }> {
  // Get user's workout history grouped by date
  const { data: workouts, error } = await supabase
    .from('user_sessions')
    .select('completed_at')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false });

  if (error) {
    console.error(`❌ Error fetching workouts for user ${userId}:`, error);
    return { currentStreak: 0, lastWorkoutDate: null };
  }

  if (!workouts || workouts.length === 0) {
    return { currentStreak: 0, lastWorkoutDate: null };
  }

  // Convert workout timestamps to dates in user's timezone
  const workoutDates = new Set<string>();
  for (const workout of workouts) {
    const workoutDate = formatInTimeZone(new Date(workout.completed_at), userTimezone, 'yyyy-MM-dd');
    workoutDates.add(workoutDate);
  }

  // Sort dates descending
  const sortedDates = Array.from(workoutDates).sort((a, b) => b.localeCompare(a));
  
  if (sortedDates.length === 0) {
    return { currentStreak: 0, lastWorkoutDate: null };
  }

  const lastWorkoutDate = sortedDates[0];
  
  // Get today in user's timezone
  const nowUtc = new Date();
  const todayInUserTz = formatInTimeZone(nowUtc, userTimezone, 'yyyy-MM-dd');
  
  // Calculate streak by counting consecutive days backwards from most recent workout
  let currentStreak = 0;
  let checkDate = lastWorkoutDate;
  
  for (let i = 0; i < sortedDates.length; i++) {
    const workoutDate = sortedDates[i];
    
    if (workoutDate === checkDate) {
      currentStreak++;
      
      // Move checkDate back one day
      const checkDateObj = new Date(checkDate + 'T00:00:00');
      const previousDay = subDays(checkDateObj, 1);
      checkDate = formatInTimeZone(previousDay, userTimezone, 'yyyy-MM-dd');
    } else {
      // Gap found, streak is broken
      break;
    }
  }
  
  return { currentStreak, lastWorkoutDate };
}

async function fixAllStreaks() {
  console.log('🔧 Starting streak recalculation for all users...\n');
  
  // Get all users with streaks
  const { data: streaks, error: streaksError } = await supabase
    .from('user_streaks')
    .select('user_id, current_streak, longest_streak, last_workout_date');
  
  if (streaksError) {
    console.error('❌ Error fetching user streaks:', streaksError);
    return;
  }
  
  if (!streaks || streaks.length === 0) {
    console.log('ℹ️ No user streaks found');
    return;
  }
  
  console.log(`📊 Found ${streaks.length} users with streak records\n`);
  
  let fixedCount = 0;
  let unchangedCount = 0;
  let errorCount = 0;
  
  for (const streak of streaks) {
    try {
      // Get user's timezone
      const { data: userPrefs } = await supabase
        .from('user_preferences')
        .select('time_zone')
        .eq('user_id', streak.user_id)
        .maybeSingle();
      
      const userTimezone = userPrefs?.time_zone || 'UTC';
      
      // Calculate correct streak
      const { currentStreak, lastWorkoutDate } = await calculateCorrectStreak(streak.user_id, userTimezone);
      
      // Check if update is needed
      if (currentStreak !== streak.current_streak || lastWorkoutDate !== streak.last_workout_date) {
        console.log(`🔄 User ${streak.user_id.substring(0, 8)}...`);
        console.log(`   Old: streak=${streak.current_streak}, last=${streak.last_workout_date}`);
        console.log(`   New: streak=${currentStreak}, last=${lastWorkoutDate}`);
        
        // Update the database
        const { error: updateError } = await supabase
          .from('user_streaks')
          .update({
            current_streak: currentStreak,
            last_workout_date: lastWorkoutDate,
            longest_streak: Math.max(currentStreak, streak.longest_streak || 0),
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', streak.user_id);
        
        if (updateError) {
          console.error(`   ❌ Error updating: ${updateError.message}`);
          errorCount++;
        } else {
          console.log(`   ✅ Updated successfully\n`);
          fixedCount++;
        }
      } else {
        unchangedCount++;
      }
    } catch (error) {
      console.error(`❌ Error processing user ${streak.user_id}:`, error);
      errorCount++;
    }
  }
  
  console.log('\n📈 Summary:');
  console.log(`   ✅ Fixed: ${fixedCount}`);
  console.log(`   ⏭️  Unchanged: ${unchangedCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log(`   📊 Total: ${streaks.length}`);
  console.log('\n✨ Streak recalculation complete!');
}

// Run the fix
fixAllStreaks().catch(console.error);
