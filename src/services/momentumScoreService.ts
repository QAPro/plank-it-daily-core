import { supabase } from '@/integrations/supabase/client';

interface MomentumComponents {
  workout_count: number;
  personal_bests: number;
  categories_explored: number;
  avg_difficulty: number;
  base_points: number;
  pb_bonus: number;
  diversity_bonus: number;
  difficulty_bonus: number;
}

// Helper to get Monday of current week
const getMonday = (date: Date): string => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().split('T')[0];
};

export const updateMomentumScore = async (userId: string): Promise<void> => {
  try {
    const weekStartDate = getMonday(new Date());

    // Calculate momentum components using the database function
    const { data: componentsData, error: componentsError } = await supabase
      .rpc('calculate_momentum_components', {
        _user_id: userId,
        _week_start_date: weekStartDate
      });

    if (componentsError) {
      console.error('Error calculating momentum components:', componentsError);
      throw componentsError;
    }

    if (!componentsData) {
      console.error('No momentum components returned');
      return;
    }

    const components = componentsData as unknown as MomentumComponents;

    // Calculate total momentum score
    const momentumScore = 
      (components.base_points || 0) +
      (components.pb_bonus || 0) +
      (components.diversity_bonus || 0) +
      (components.difficulty_bonus || 0);

    console.log('📊 Momentum calculation:', {
      weekStartDate,
      components,
      totalScore: momentumScore
    });

    // Upsert the momentum score
    const { error: upsertError } = await supabase
      .from('user_momentum_scores')
      .upsert({
        user_id: userId,
        week_start_date: weekStartDate,
        momentum_score: Math.round(momentumScore),
        workout_count: components.workout_count || 0,
        personal_bests_count: components.personal_bests || 0,
        category_diversity_score: components.categories_explored || 0,
        difficulty_progression_score: Math.round(components.avg_difficulty || 0),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,week_start_date'
      });

    if (upsertError) {
      console.error('Error upserting momentum score:', upsertError);
      throw upsertError;
    }

    console.log('✅ Momentum score updated:', momentumScore);
  } catch (error) {
    console.error('Failed to update momentum score:', error);
    // Don't throw - we don't want momentum calculation to break session completion
  }
};
