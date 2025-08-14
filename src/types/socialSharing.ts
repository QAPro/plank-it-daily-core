
export interface ShareTemplate {
  id: string;
  name: string;
  type: 'workout' | 'achievement' | 'streak' | 'progress' | 'challenge';
  template_data: {
    background_color: string;
    text_color: string;
    accent_color?: string;
    layout: string;
    elements: ShareElement[];
  };
  is_public: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ShareElement {
  type: 'text' | 'stat' | 'image' | 'chart' | 'badge';
  content: string;
  position: { x: number; y: number };
  style: {
    fontSize?: number;
    fontWeight?: string;
    textAlign?: 'left' | 'center' | 'right';
    color?: string;
    opacity?: number;
    width?: number;
    height?: number;
  };
}

export interface EnhancedShareData {
  // Workout data
  exercise?: string;
  duration?: number;
  difficulty_level?: number;
  calories_burned?: number;
  
  // Achievement data
  achievement?: string;
  achievement_description?: string;
  achievement_rarity?: string;
  
  // Streak data
  streakDays?: number;
  streak_type?: string;
  
  // Progress data
  total_sessions?: number;
  total_time?: number;
  improvement_percentage?: number;
  weekly_sessions?: number;
  
  // Challenge data
  challenge_name?: string;
  challenge_type?: string;
  participants_count?: number;
  
  // Meta data
  personalBest?: boolean;
  is_milestone?: boolean;
  user_name?: string;
  app_name?: string;
}

export interface CommunityChallenge {
  id: string;
  created_by: string;
  title: string;
  description?: string;
  challenge_type: string;
  target_data: any;
  start_date: string;
  end_date: string;
  is_public: boolean;
  participant_count: number;
  template_id?: string;
  created_at: string;
}

export interface ShareAnalytics {
  id: string;
  user_id: string;
  platform: string;
  content_type: string;
  template_id?: string;
  shared_at: string;
  engagement_data: {
    clicks?: number;
    likes?: number;
    shares?: number;
    comments?: number;
  };
}
