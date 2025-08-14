
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PlankTimer from '../PlankTimer';
import { createMockExercise } from '@/__tests__/utils/test-utils';
import { setupSupabaseMocks } from '@/__tests__/utils/mock-supabase';

setupSupabaseMocks();

// Mock dependencies
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'test-user' },
  }),
}));

vi.mock('@/hooks/useEnhancedSessionTracking', () => ({
  useEnhancedSessionTracking: () => ({
    selectedExercise: createMockExercise(),
    sessionDuration: 0,
    isTimerRunning: false,
    startSession: vi.fn(),
    pauseSession: vi.fn(),
    resumeSession: vi.fn(),
    endSession: vi.fn(),
    completeSession: vi.fn(),
    completedSession: null,
    isCompleting: false,
  }),
}));

vi.mock('@/hooks/useTimerAudio', () => ({
  useTimerAudio: () => ({
    soundEnabled: true,
    playCompletionSound: vi.fn(),
    toggleSound: vi.fn(),
  }),
}));

vi.mock('@/hooks/useTimerState', () => ({
  useTimerState: ({ duration, onComplete }: any) => ({
    timeLeft: duration,
    state: 'ready',
    handleStart: vi.fn(),
    handlePause: vi.fn(),
    handleResume: vi.fn(),
    handleStop: vi.fn(),
    handleReset: vi.fn(),
  }),
}));

describe('PlankTimer', () => {
  const mockProps = {
    selectedExercise: createMockExercise(),
    onExerciseChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render timer interface', () => {
    render(<PlankTimer {...mockProps} />);
    
    expect(screen.getByText('Standard Plank')).toBeInTheDocument();
    expect(screen.getByText('Basic plank exercise')).toBeInTheDocument();
  });

  it('should display exercise instructions', () => {
    render(<PlankTimer {...mockProps} />);
    
    expect(screen.getByText('Get into plank position')).toBeInTheDocument();
    expect(screen.getByText('Hold for target time')).toBeInTheDocument();
  });

  it('should show timer controls', () => {
    render(<PlankTimer {...mockProps} />);
    
    // Should show start button when timer is ready
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
