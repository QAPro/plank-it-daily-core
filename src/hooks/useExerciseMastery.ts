import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ExerciseMastery {
  id: string;
  user_id: string;
  exercise_id: string;
  mastery_level: number;
  technique_score: number;
  consistency_score: number;
  progression_score: number;
  total_sessions: number;
  best_performance: Record<string, any>;
  validation_data: Record<string, any>;
  last_practice_at?: string;
  mastery_unlocked_at?: string;
  created_at: string;
  updated_at: string;
}

interface Certification {
  id: string;
  user_id: string;
  exercise_id: string;
  certification_level: string;
  certification_data: Record<string, any>;
  validator_id?: string;
  validation_type: string;
  evidence_urls: string[];
  approved_at?: string;
  expires_at?: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  created_at: string;
}

interface SkillRequirement {
  id: string;
  exercise_id: string;
  required_exercise_id: string;
  required_mastery_level: number;
  requirement_type: string;
  unlock_data: Record<string, any>;
}

export const useExerciseMastery = () => {
  const queryClient = useQueryClient();

  const { data: masteries, isLoading } = useQuery({
    queryKey: ['exercise-masteries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exercise_masteries')
        .select('*')
        .order('mastery_level', { ascending: false });

      if (error) throw error;
      return data as ExerciseMastery[];
    }
  });

  const { data: certifications } = useQuery({
    queryKey: ['certifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('certifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Certification[];
    }
  });

  const { data: skillRequirements } = useQuery({
    queryKey: ['skill-requirements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('skill_requirements')
        .select('*');

      if (error) throw error;
      return data as SkillRequirement[];
    }
  });

  const updateMasteryMutation = useMutation({
    mutationFn: async ({ exerciseId, scores }: {
      exerciseId: string;
      scores: {
        technique_score?: number;
        consistency_score?: number;
        progression_score?: number;
        total_sessions?: number;
        best_performance?: Record<string, any>;
      }
    }) => {
      const { data, error } = await supabase
        .from('exercise_masteries')
        .upsert({
          exercise_id: exerciseId,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          ...scores,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercise-masteries'] });
    }
  });

  const requestCertificationMutation = useMutation({
    mutationFn: async ({ exerciseId, certificationLevel, evidenceUrls }: {
      exerciseId: string;
      certificationLevel: string;
      evidenceUrls: string[];
    }) => {
      const { data, error } = await supabase
        .from('certifications')
        .insert({
          exercise_id: exerciseId,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          certification_level: certificationLevel,
          evidence_urls: evidenceUrls,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certifications'] });
    }
  });

  const getExerciseMastery = (exerciseId: string) => {
    return masteries?.find(m => m.exercise_id === exerciseId);
  };

  const getCertification = (exerciseId: string) => {
    return certifications?.find(c => c.exercise_id === exerciseId && c.status === 'approved');
  };

  const getRequiredExercises = (exerciseId: string) => {
    return skillRequirements?.filter(r => r.exercise_id === exerciseId) || [];
  };

  const canUnlockExercise = (exerciseId: string) => {
    const requirements = getRequiredExercises(exerciseId);
    if (!requirements.length) return true;

    return requirements.every(req => {
      const mastery = getExerciseMastery(req.required_exercise_id);
      return mastery && mastery.mastery_level >= req.required_mastery_level;
    });
  };

  const getTotalMasteryScore = () => {
    if (!masteries?.length) return 0;
    return masteries.reduce((sum, m) => sum + m.mastery_level, 0) / masteries.length;
  };

  return {
    masteries: masteries || [],
    certifications: certifications || [],
    skillRequirements: skillRequirements || [],
    isLoading,
    updateMastery: updateMasteryMutation.mutate,
    requestCertification: requestCertificationMutation.mutate,
    isUpdatingMastery: updateMasteryMutation.isPending,
    isRequestingCertification: requestCertificationMutation.isPending,
    getExerciseMastery,
    getCertification,
    getRequiredExercises,
    canUnlockExercise,
    getTotalMasteryScore
  };
};