import { supabase } from '@/integrations/supabase/client';

export interface UserReputation {
  id: string;
  user_id: string;
  domain: string;
  expertise_score: number;
  karma_score: number;
  total_upvotes: number;
  total_contributions: number;
  last_updated: string;
}

export interface ReputationEvent {
  id?: string;
  user_id: string;
  actor_id: string;
  event_type: string;
  domain?: string;
  points: number;
  note?: string;
  created_at?: string;
}

export interface UserStatusTrack {
  id: string;
  user_id: string;
  track_name: string;
  track_level: number;
  awarded_at: string;
  updated_at: string;
}

export class ReputationService {
  static async getUserReputation(userId: string): Promise<UserReputation[]> {
    const { data, error } = await supabase
      .from('user_reputation')
      .select('*')
      .eq('user_id', userId)
      .order('karma_score', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async awardReputation(event: Omit<ReputationEvent, 'id' | 'created_at'>): Promise<void> {
    const { error } = await supabase
      .from('reputation_events')
      .insert(event);

    if (error) throw error;
  }

  static async getUserStatusTracks(userId: string): Promise<UserStatusTrack[]> {
    const { data, error } = await supabase
      .from('user_status_tracks')
      .select('*')
      .eq('user_id', userId)
      .order('track_level', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getTopUsers(domain?: string, limit = 10): Promise<UserReputation[]> {
    let query = supabase
      .from('user_reputation')
      .select('*')
      .order('karma_score', { ascending: false })
      .limit(limit);

    if (domain) {
      query = query.eq('domain', domain);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  static getReputationLevel(karmaScore: number): string {
    if (karmaScore >= 1000) return 'Expert';
    if (karmaScore >= 500) return 'Advanced';
    if (karmaScore >= 100) return 'Intermediate';
    if (karmaScore >= 25) return 'Novice';
    return 'Newcomer';
  }

  static getReputationBadgeColor(level: string): string {
    switch (level) {
      case 'Expert': return 'bg-gradient-to-r from-purple-500 to-pink-500';
      case 'Advanced': return 'bg-gradient-to-r from-blue-500 to-purple-500';
      case 'Intermediate': return 'bg-gradient-to-r from-green-500 to-blue-500';
      case 'Novice': return 'bg-gradient-to-r from-yellow-500 to-green-500';
      default: return 'bg-gradient-to-r from-gray-400 to-gray-500';
    }
  }
}