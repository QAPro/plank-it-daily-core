
import { ReactNode } from 'react';
import CrossSystemGuard from './CrossSystemGuard';
import type { CrossSystemRequirement } from './CrossSystemGuard';

interface AdvancedFeatureGuardProps {
  feature: 'advanced_analytics' | 'photo_sharing' | 'playlist_sharing' | 'unlimited_posts' | 'moderator_tools' | 'exercise_mastery';
  children: ReactNode;
  upgradeAction?: () => void;
}

const AdvancedFeatureGuard = ({ 
  feature, 
  children, 
  upgradeAction = () => {}
}) => {
  const getFeatureRequirements = (featureType: string): {
    requirements: CrossSystemRequirement[];
    title: string;
    description: string;
  } => {
    switch (featureType) {
      case 'advanced_analytics':
        return {
          requirements: [
            {
              type: 'analytics_tier',
              description: 'Reach Level 5+ in at least 2 different status tracks'
            }
          ],
          title: 'Advanced Analytics Locked',
          description: 'Access deeper insights and cross-track analytics by demonstrating mastery across multiple areas.'
        };

      case 'photo_sharing':
        return {
          requirements: [
            {
              type: 'photo_sharing',
              description: 'Build community reputation and maintain consistency'
            }
          ],
          title: 'Photo Sharing Locked',
          description: 'Share your fitness victories with the community after proving your commitment and building trust.'
        };

      case 'playlist_sharing':
        return {
          requirements: [
            {
              type: 'playlist_sharing',
              description: 'Demonstrate social engagement and workout consistency'
            }
          ],
          title: 'Playlist Sharing Locked',
          description: 'Share your workout playlists once you\'ve shown active community participation and regular workout habits.'
        };

      case 'unlimited_posts':
        return {
          requirements: [
            {
              type: 'post_limits',
              description: 'Build community reputation to unlock unlimited posting'
            }
          ],
          title: 'Post Limits Active',
          description: 'Your posting frequency is limited based on community reputation. Contribute positively to unlock more posting freedom.'
        };

      case 'moderator_tools':
        return {
          requirements: [
            {
              type: 'leadership_role',
              leadershipRole: 'moderator',
              description: 'Achieve leadership status through exceptional community contribution'
            }
          ],
          title: 'Moderator Tools Locked',
          description: 'Moderation capabilities are reserved for trusted community leaders who have demonstrated expertise and positive engagement.'
        };

      case 'exercise_mastery':
        return {
          requirements: [
            {
              type: 'track_level',
              track: 'consistency',
              level: 3,
              description: 'Demonstrate consistent workout habits'
            },
            {
              type: 'track_level', 
              track: 'strength',
              level: 2,
              description: 'Show basic strength development'
            }
          ],
          title: 'Exercise Mastery Locked',
          description: 'Advanced skill tracking and certification features unlock as you build consistent workout habits and demonstrate exercise progression.'
        };

      default:
        return {
          requirements: [],
          title: 'Feature Locked',
          description: 'This feature requires additional progress.'
        };
    }
  };

  const { requirements, title, description } = getFeatureRequirements(feature);

  return (
    <CrossSystemGuard
      requirements={requirements}
      fallbackTitle={title}
      fallbackDescription={description}
      upgradeAction={upgradeAction}
    >
      {children}
    </CrossSystemGuard>
  );
};

export default AdvancedFeatureGuard;