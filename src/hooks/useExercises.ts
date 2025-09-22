
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type Exercise = Tables<'plank_exercises'>;

export const useExercises = () => {
  return useQuery({
    queryKey: ['exercises'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('plank_exercises')
        .select('*')
        .order('difficulty_level', { ascending: true });

      if (error) {
        console.error('Error fetching exercises:', error);
        throw error;
      }

      return data as Exercise[];
    },
  });
};

export const useExerciseById = (id: string | null) => {
  return useQuery({
    queryKey: ['exercise', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('plank_exercises')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching exercise:', error);
        throw error;
      }

      return data as Exercise | null;
    },
    enabled: !!id,
  });
};
