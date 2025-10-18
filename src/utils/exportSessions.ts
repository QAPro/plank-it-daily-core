import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

const formatDuration = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds} sec`;
  }
  
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  
  if (secs === 0) {
    return `${mins} min`;
  }
  
  return `${mins} min ${secs} sec`;
};

export const exportSessionsToCSV = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data: sessions } = await supabase
    .from('user_sessions')
    .select(`
      completed_at,
      duration_seconds,
      category,
      notes,
      momentum_points_earned,
      was_personal_best,
      exercises (name, difficulty_level)
    `)
    .eq('user_id', user.id)
    .order('completed_at', { ascending: false });

  if (!sessions || sessions.length === 0) {
    throw new Error('No sessions to export');
  }

  // Convert to CSV
  const headers = [
    'Date', 
    'Exercise', 
    'Category', 
    'Duration', 
    'Momentum Score Earned',
    'Personal Best',
    'Difficulty Level',
    'Notes'
  ];
  const rows = sessions.map(session => [
    format(new Date(session.completed_at!), 'yyyy-MM-dd HH:mm'),
    session.exercises?.name || 'Unknown',
    session.category || 'N/A',
    formatDuration(session.duration_seconds),
    session.momentum_points_earned?.toString() || '0',
    session.was_personal_best ? 'Yes' : 'No',
    session.exercises?.difficulty_level?.toString() || 'N/A',
    session.notes || '',
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  // Download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `workout-history-${format(new Date(), 'yyyy-MM-dd')}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
