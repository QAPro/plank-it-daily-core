import { supabase } from '@/integrations/supabase/client';

export interface MentorProfile {
  id: string;
  user_id: string;
  specialization_tracks: string[];
  min_mentee_level: number;
  max_mentees: number;
  current_mentees: number;
  is_accepting_mentees: boolean;
  mentor_since: string;
  total_mentees: number;
  average_rating: number;
  bio?: string;
  // Joined user data
  username?: string;
  full_name?: string;
  track_levels?: Record<string, number>;
}

export interface MentorRelationship {
  id: string;
  mentor_id: string;
  mentee_id: string;
  status: 'pending' | 'accepted' | 'active' | 'completed' | 'declined';
  mentor_track: string;
  mentee_goals: string[];
  matched_at: string;
  accepted_at?: string;
  completed_at?: string;
  rating?: number;
  feedback?: string;
  // Joined data
  mentor_username?: string;
  mentor_name?: string;
  mentee_username?: string;
  mentee_name?: string;
}

export interface MentorMatchCriteria {
  track: string;
  min_mentor_level: number;
  goals: string[];
}

class MentorService {
  // Get available mentors for a track
  async findMentors(criteria: MentorMatchCriteria): Promise<MentorProfile[]> {
    const { data, error } = await supabase
      .from('mentor_profiles')
      .select('*')
      .eq('is_accepting_mentees', true)
      .contains('specialization_tracks', [criteria.track])
      .order('average_rating', { ascending: false });

    if (error) throw error;

    // Get user details separately
    const mentorIds = data?.map(m => m.user_id) || [];
    if (mentorIds.length === 0) return [];

    const { data: users } = await supabase
      .from('users')
      .select('id, username, full_name')
      .in('id', mentorIds);

    return data?.map(mentor => {
      const user = users?.find(u => u.id === mentor.user_id);
      return {
        ...mentor,
        username: user?.username,
        full_name: user?.full_name,
      };
    }) || [];
  }

  // Create mentor profile
  async createMentorProfile(profile: Omit<MentorProfile, 'id' | 'user_id' | 'mentor_since' | 'total_mentees' | 'average_rating' | 'current_mentees'>): Promise<void> {
    const user = await supabase.auth.getUser();
    const { error } = await supabase
      .from('mentor_profiles')
      .insert({
        user_id: user.data.user?.id,
        specialization_tracks: profile.specialization_tracks,
        min_mentee_level: profile.min_mentee_level,
        max_mentees: profile.max_mentees,
        is_accepting_mentees: profile.is_accepting_mentees,
        bio: profile.bio
      });

    if (error) throw error;
  }

  // Update mentor profile
  async updateMentorProfile(updates: Partial<MentorProfile>): Promise<void> {
    const { error } = await supabase
      .from('mentor_profiles')
      .update(updates)
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

    if (error) throw error;
  }

  // Request mentorship
  async requestMentorship(mentorId: string, track: string, goals: string[]): Promise<void> {
    const user = await supabase.auth.getUser();
    const { error } = await supabase
      .from('mentor_relationships')
      .insert({
        mentor_id: mentorId,
        mentee_id: user.data.user?.id,
        mentor_track: track,
        mentee_goals: goals,
        status: 'pending'
      });

    if (error) throw error;
  }

  // Accept/decline mentorship request
  async respondToRequest(relationshipId: string, accept: boolean): Promise<void> {
    const { error } = await supabase
      .from('mentor_relationships')
      .update({
        status: accept ? 'accepted' : 'declined',
        accepted_at: accept ? new Date().toISOString() : null
      })
      .eq('id', relationshipId);

    if (error) throw error;
  }

  // Get mentor relationships (as mentor)
  async getMentorRelationships(): Promise<MentorRelationship[]> {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    
    const { data, error } = await supabase
      .from('mentor_relationships')
      .select('*')
      .eq('mentor_id', userId)
      .order('matched_at', { ascending: false });

    if (error) throw error;

    if (!data || data.length === 0) return [];

    // Get mentee user details
    const menteeIds = data.map(r => r.mentee_id);
    const { data: users } = await supabase
      .from('users')
      .select('id, username, full_name')
      .in('id', menteeIds);

    return data.map(rel => {
      const user = users?.find(u => u.id === rel.mentee_id);
      return {
        ...rel,
        status: rel.status as MentorRelationship['status'],
        mentee_username: user?.username,
        mentee_name: user?.full_name,
      };
    });
  }

  // Get mentee relationships (as mentee)
  async getMenteeRelationships(): Promise<MentorRelationship[]> {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    
    const { data, error } = await supabase
      .from('mentor_relationships')
      .select('*')
      .eq('mentee_id', userId)
      .order('matched_at', { ascending: false });

    if (error) throw error;

    if (!data || data.length === 0) return [];

    // Get mentor user details
    const mentorIds = data.map(r => r.mentor_id);
    const { data: users } = await supabase
      .from('users')
      .select('id, username, full_name')
      .in('id', mentorIds);

    return data.map(rel => {
      const user = users?.find(u => u.id === rel.mentor_id);
      return {
        ...rel,
        status: rel.status as MentorRelationship['status'],
        mentor_username: user?.username,
        mentor_name: user?.full_name,
      };
    });
  }

  // Complete mentorship with rating
  async completeMentorship(relationshipId: string, rating: number, feedback?: string): Promise<void> {
    const { error } = await supabase
      .from('mentor_relationships')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        rating,
        feedback
      })
      .eq('id', relationshipId);

    if (error) throw error;
  }

  // Get mentor profile by user ID
  async getMentorProfile(userId?: string): Promise<MentorProfile | null> {
    const targetUserId = userId || (await supabase.auth.getUser()).data.user?.id;
    
    const { data, error } = await supabase
      .from('mentor_profiles')
      .select('*')
      .eq('user_id', targetUserId)
      .single();

    if (error) return null;

    if (!data) return null;

    // Get user details
    const { data: user } = await supabase
      .from('users')
      .select('username, full_name')
      .eq('id', targetUserId)
      .single();

    return {
      ...data,
      username: user?.username,
      full_name: user?.full_name,
    };
  }

  // Get mentor statistics
  async getMentorStats(userId?: string): Promise<{
    totalMentees: number;
    activeMentees: number;
    averageRating: number;
    completedMentorships: number;
  }> {
    const targetUserId = userId || (await supabase.auth.getUser()).data.user?.id;
    
    const [profile, relationships] = await Promise.all([
      this.getMentorProfile(targetUserId),
      supabase
        .from('mentor_relationships')
        .select('status, rating')
        .eq('mentor_id', targetUserId)
    ]);

    const activeMentees = relationships.data?.filter(r => r.status === 'accepted').length || 0;
    const completedMentorships = relationships.data?.filter(r => r.status === 'completed').length || 0;

    return {
      totalMentees: profile?.total_mentees || 0,
      activeMentees,
      averageRating: profile?.average_rating || 0,
      completedMentorships
    };
  }
}

export const mentorService = new MentorService();