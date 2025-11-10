import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type ReminderSlot = 'morning' | 'lunch' | 'evening' | 'last_chance';
export type ScheduleType = 'reminder' | 'streak_protection';

export interface NotificationSchedule {
  user_id: string;
  slot: ReminderSlot;
  send_time: string; // HH:MM:SS
  enabled: boolean;
}

export interface StreakProtectionSchedule {
  user_id: string;
  send_time: string;
  enabled: boolean;
  time_zone: string;
}

const DEFAULT_TIMES: Record<ReminderSlot, string> = {
  morning: '09:00:00',
  lunch: '12:00:00',
  evening: '18:00:00',
  last_chance: '20:00:00',
};

const DEFAULT_STREAK_PROTECTION_TIME = '20:00:00';

export function useNotificationSchedules() {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<Record<ReminderSlot, NotificationSchedule>>({
    morning: { user_id: '', slot: 'morning', send_time: DEFAULT_TIMES.morning, enabled: false },
    lunch: { user_id: '', slot: 'lunch', send_time: DEFAULT_TIMES.lunch, enabled: false },
    evening: { user_id: '', slot: 'evening', send_time: DEFAULT_TIMES.evening, enabled: true },
    last_chance: { user_id: '', slot: 'last_chance', send_time: DEFAULT_TIMES.last_chance, enabled: false },
  });
  const [streakProtection, setStreakProtection] = useState<StreakProtectionSchedule | null>(null);
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

      // Fetch streak protection schedule
      const { data: streakData, error: streakError } = await supabase
        .from('notification_schedules_streak_protection')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!streakError && streakData) {
        setStreakProtection(streakData as StreakProtectionSchedule);
      } else if (!streakData) {
        // Set default values if not found
        setStreakProtection({
          user_id: user.id,
          send_time: DEFAULT_STREAK_PROTECTION_TIME,
          enabled: true,
          time_zone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York'
        });
      }

      setLoading(false);
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const upsertSchedule = async (
    slot: ReminderSlot | 'streak_protection',
    partial: Partial<NotificationSchedule> | Partial<StreakProtectionSchedule>,
    scheduleType: ScheduleType = 'reminder'
  ) => {
    if (!user) return { error: new Error('Not authenticated') };

    if (scheduleType === 'streak_protection' || slot === 'streak_protection') {
      const payload = {
        user_id: user.id,
        send_time: (partial as Partial<StreakProtectionSchedule>).send_time ?? streakProtection?.send_time ?? DEFAULT_STREAK_PROTECTION_TIME,
        enabled: (partial as Partial<StreakProtectionSchedule>).enabled ?? streakProtection?.enabled ?? true,
        time_zone: (partial as Partial<StreakProtectionSchedule>).time_zone ?? streakProtection?.time_zone ?? (Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York'),
      };

      const { error } = await supabase
        .from('notification_schedules_streak_protection')
        .upsert(payload, { onConflict: 'user_id' });

      if (!error) {
        setStreakProtection(payload);
      }
      return { error };
    } else {
      const reminderSlot = slot as ReminderSlot;
      const payload = {
        user_id: user.id,
        slot: reminderSlot,
        send_time: (partial as Partial<NotificationSchedule>).send_time ?? schedules[reminderSlot].send_time,
        enabled: (partial as Partial<NotificationSchedule>).enabled ?? schedules[reminderSlot].enabled,
      };

      const { error } = await (supabase as any)
        .from('user_notification_schedules')
        .upsert(payload, { onConflict: 'user_id,slot' });

      if (!error) {
        setSchedules((prev) => ({
          ...prev,
          [reminderSlot]: { ...prev[reminderSlot], ...payload },
        }));
      }
      return { error };
    }
  };

  const asArray = useMemo(() => (Object.values(schedules) as NotificationSchedule[]), [schedules]);

  return { schedules, schedulesArray: asArray, streakProtection, upsertSchedule, loading };
}
