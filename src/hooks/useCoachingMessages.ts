
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

type MessageType = 'encouragement' | 'form_reminder' | 'breathing' | 'milestone';

interface CoachingMessage {
  id: string;
  message_type: MessageType;
  content: string;
  voice_variant?: string;
  trigger_condition?: Record<string, any>;
  is_active?: boolean;
}

export const useCoachingMessages = () => {
  const [messages, setMessages] = useState<CoachingMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('coaching_messages')
        .select('*')
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching coaching messages:', error);
      } else {
        setMessages((data || []) as CoachingMessage[]);
      }
      setLoading(false);
    };

    fetchMessages();
  }, []);

  const byType = useMemo(() => {
    const map: Record<MessageType, CoachingMessage[]> = {
      encouragement: [],
      form_reminder: [],
      breathing: [],
      milestone: [],
    };
    for (const m of messages) {
      if (map[m.message_type]) map[m.message_type].push(m);
    }
    return map;
  }, [messages]);

  const randomOfType = (type: MessageType) => {
    const list = byType[type] || [];
    if (list.length === 0) return null;
    return list[Math.floor(Math.random() * list.length)]?.content ?? null;
  };

  return { loading, messages, randomOfType };
};
