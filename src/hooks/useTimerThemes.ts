
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface TimerTheme {
  id: string;
  name: string;
  description?: string;
  color_scheme?: Record<string, string>;
  visual_effects?: Record<string, any>;
}

export const useTimerThemes = () => {
  const [themes, setThemes] = useState<TimerTheme[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchThemes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('timer_themes')
      .select('*')
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching timer themes:', error);
    } else {
      setThemes((data || []) as TimerTheme[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchThemes();
  }, []);

  const getThemeByName = (name?: string) => {
    if (!name) return undefined;
    return themes.find(t => t.name.toLowerCase() === name.toLowerCase());
  };

  return { themes, loading, getThemeByName };
};
