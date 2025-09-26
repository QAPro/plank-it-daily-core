import { 
  Navigation, 
  Users, 
  Calendar, 
  Trophy, 
  Zap,
  BarChart3,
  Target,
  Share2,
  UserPlus,
  Activity,
  Medal
} from 'lucide-react';

export type UIImpactType = 'navigation' | 'page_section' | 'button' | 'feature' | 'analytics';

export type UIImpact = {
  type: UIImpactType;
  element: string;
  description: string;
  icon: typeof Navigation;
};

export const FEATURE_UI_IMPACTS: Record<string, UIImpact[]> = {
  // Competition/Social Challenges
  social_challenges: [
    { type: 'navigation', element: 'Compete Tab', description: 'Main competition interface', icon: Trophy },
    { type: 'page_section', element: 'Leaderboards', description: 'Competition rankings display', icon: BarChart3 },
    { type: 'feature', element: 'Challenge Creation', description: 'Create new social challenges', icon: Target },
    { type: 'analytics', element: 'Competition Analytics', description: 'Challenge performance metrics', icon: BarChart3 }
  ],
  
  competition: [
    { type: 'navigation', element: 'Compete Tab', description: 'Competition navigation tab', icon: Trophy },
    { type: 'page_section', element: 'Challenge List', description: 'Available competitions display', icon: Trophy }
  ],
  
  competitions: [
    { type: 'navigation', element: 'Compete Tab', description: 'Competition navigation tab', icon: Trophy },
    { type: 'page_section', element: 'Tournament View', description: 'Tournament brackets and results', icon: Medal }
  ],

  competitive_leagues: [
    { type: 'navigation', element: 'Compete Tab', description: 'Main competition interface', icon: Trophy },
    { type: 'page_section', element: 'League System', description: 'Competitive league participation', icon: Trophy },
    { type: 'feature', element: 'League Rankings', description: 'View and participate in leagues', icon: BarChart3 }
  ],
  
  tournaments: [
    { type: 'navigation', element: 'Compete Tab', description: 'Main competition interface', icon: Trophy },
    { type: 'page_section', element: 'Tournament System', description: 'Tournament participation and brackets', icon: Medal },
    { type: 'feature', element: 'Tournament Registration', description: 'Join and compete in tournaments', icon: Users }
  ],

  // Friend System
  friend_system: [
    { type: 'navigation', element: 'Friends Tab', description: 'Friend management interface', icon: Users },
    { type: 'button', element: 'Add Friend Button', description: 'Connect with other users', icon: UserPlus },
    { type: 'feature', element: 'Friend Requests', description: 'Send and manage friend requests', icon: Users },
    { type: 'page_section', element: 'Friends List', description: 'View and manage friends', icon: Users }
  ],

  // Social Features (General)
  social_features: [
    { type: 'navigation', element: 'Friends Tab', description: 'Social connections interface', icon: Users },
    { type: 'feature', element: 'Social Sharing', description: 'Share workouts and achievements', icon: Share2 },
    { type: 'page_section', element: 'Activity Feed', description: 'Friends\' activity updates', icon: Activity }
  ],

  // Events System
  events: [
    { type: 'navigation', element: 'Events Tab', description: 'Event calendar and management', icon: Calendar },
    { type: 'page_section', element: 'Event List', description: 'Upcoming events display', icon: Calendar },
    { type: 'feature', element: 'Event Registration', description: 'Join upcoming events', icon: Calendar }
  ],

  seasonal_events: [
    { type: 'navigation', element: 'Events Tab', description: 'Seasonal event interface', icon: Calendar },
    { type: 'page_section', element: 'Special Events', description: 'Holiday and seasonal challenges', icon: Calendar }
  ],

  // Analytics Features
  analytics_dashboard: [
    { type: 'navigation', element: 'Analytics Tab', description: 'Advanced analytics interface', icon: BarChart3 },
    { type: 'page_section', element: 'Performance Metrics', description: 'Detailed workout analytics', icon: Zap },
    { type: 'feature', element: 'Data Export', description: 'Export workout data', icon: BarChart3 }
  ],

  advanced_stats: [
    { type: 'page_section', element: 'Advanced Statistics', description: 'Detailed performance breakdowns', icon: BarChart3 },
    { type: 'analytics', element: 'Trend Analysis', description: 'Long-term progress tracking', icon: BarChart3 }
  ]
};

export const getUIImpactIcon = (type: UIImpactType) => {
  switch (type) {
    case 'navigation': return Navigation;
    case 'page_section': return BarChart3;
    case 'button': return Target;
    case 'feature': return Zap;
    case 'analytics': return BarChart3;
    default: return Zap;
  }
};

export const getUIImpactColor = (type: UIImpactType) => {
  switch (type) {
    case 'navigation': return 'text-blue-600 bg-blue-50';
    case 'page_section': return 'text-green-600 bg-green-50';
    case 'button': return 'text-orange-600 bg-orange-50';
    case 'feature': return 'text-purple-600 bg-purple-50';
    case 'analytics': return 'text-cyan-600 bg-cyan-50';
    default: return 'text-gray-600 bg-gray-50';
  }
};