
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Dashboard from '../Dashboard';
import { setupSupabaseMocks } from '@/__tests__/utils/mock-supabase';

setupSupabaseMocks();

// Mock all the tab components
vi.mock('@/components/tabs/HomeTab', () => ({
  default: () => <div>Home Tab Content</div>,
}));

vi.mock('@/components/tabs/WorkoutTab', () => ({
  default: () => <div>Workout Tab Content</div>,
}));

vi.mock('@/components/tabs/StatsTab', () => ({
  default: () => <div>Stats Tab Content</div>,
}));

vi.mock('@/components/tabs/AchievementsTab', () => ({
  default: () => <div>Achievements Tab Content</div>,
}));

vi.mock('@/components/tabs/ProfileTab', () => ({
  default: () => <div>Profile Tab Content</div>,
}));

describe('Dashboard', () => {
  it('should render dashboard with tab navigation', () => {
    render(<Dashboard />);
    
    // Check if main navigation tabs are present
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Workout')).toBeInTheDocument();
    expect(screen.getByText('Stats')).toBeInTheDocument();
    expect(screen.getByText('Achievements')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });

  it('should show home tab by default', () => {
    render(<Dashboard />);
    
    expect(screen.getByText('Home Tab Content')).toBeInTheDocument();
  });

  it('should switch tabs when clicked', () => {
    render(<Dashboard />);
    
    // Click on workout tab
    fireEvent.click(screen.getByText('Workout'));
    expect(screen.getByText('Workout Tab Content')).toBeInTheDocument();
    
    // Click on stats tab
    fireEvent.click(screen.getByText('Stats'));
    expect(screen.getByText('Stats Tab Content')).toBeInTheDocument();
  });

  it('should navigate to achievements tab', () => {
    render(<Dashboard />);
    
    fireEvent.click(screen.getByText('Achievements'));
    expect(screen.getByText('Achievements Tab Content')).toBeInTheDocument();
  });

  it('should navigate to profile tab', () => {
    render(<Dashboard />);
    
    fireEvent.click(screen.getByText('Profile'));
    expect(screen.getByText('Profile Tab Content')).toBeInTheDocument();
  });
});
