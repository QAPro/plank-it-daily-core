import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type ReminderSlot = 'morning' | 'lunch' | 'evening' | 'last_chance';

export interface NotificationSchedule {
  user_id: string;
  slot: ReminderSlot;
  send_time: string; // HH:MM:SS
  enabled: boolean;
}

const DEFAULT_TIMES: Record<ReminderSlot, string> = {
  morning: '09:00:00',
  lunch: '12:00:00',
  evening: '18:00:00',
  last_chance: '20:00:00',
};

export function useNotificationSchedules() {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<Record<ReminderSlot, NotificationSchedule>>({
    morning: { user_id: '', slot: 'morning', send_time: DEFAULT_TIMES.morning, enabled: false },
    lunch: { user_id: '', slot: 'lunch', send_time: DEFAULT_TIMES.lunch, enabled: false },
    evening: { user_id: '', slot: 'evening', send_time: DEFAULT_TIMES.evening, enabled: true },
    last_chance: { user_id: '', slot: 'last_chance', send_time: DEFAULT_TIMES.last_chance, enabled: false },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      setLoading(true);

      // Try new table first
      const { data, error } = await (supabase as any)
        .from('user_notification_schedules')
        .select('user_id, slot, send_time, enabled')
        .eq('user_id', user.id);

      let rows: any[] | null = data || null;

      if (error && error.message?.toLowerCase().includes('relation')) {
        // Fallback to legacy table for reads
        const legacy = await (supabase as any)
          .from('user_reminder_slots')
          .select('user_id, slot, reminder_time, enabled')
          .eq('user_id', user.id);
        if (!legacy.error) {
          rows = (legacy.data || []).map((r: any) => ({
            user_id: r.user_id,
            slot: r.slot,
            send_time: r.reminder_time,
            enabled: r.enabled,
          }));
        }
      }

      const next = { ...schedules };
      (rows || []).forEach((r: any) => {
        const slot = r.slot as ReminderSlot;
        next[slot] = {
          user_id: r.user_id,
          slot,
          send_time: r.send_time || DEFAULT_TIMES[slot],
          enabled: !!r.enabled,
        };
      });
      setSchedules(next);
      setLoading(false);
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const upsertSchedule = async (slot: ReminderSlot, partial: Partial<NotificationSchedule>) => {
    if (!user) return { error: new Error('Not authenticated') };
    const payload = {
      user_id: user.id,
      slot,
      send_time: partial.send_time ?? schedules[slot].send_time,
      enabled: partial.enabled ?? schedules[slot].enabled,
    };

    const { error } = await (supabase as any)
      .from('user_notification_schedules')
      .upsert(payload, { onConflict: 'user_id,slot' });

    if (!error) {
      setSchedules((prev) => ({
        ...prev,
        [slot]: { ...prev[slot], ...payload },
      }));
    }
    return { error };
  };

  const asArray = useMemo(() => (Object.values(schedules) as NotificationSchedule[]), [schedules]);

  return { schedules, schedulesArray: asArray, upsertSchedule, loading };
}
