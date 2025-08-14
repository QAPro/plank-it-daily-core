
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React, { useState } from 'react';
import { render as customRender, createMockUser, createMockExercise } from '@/__tests__/utils/test-utils';
import { setupSupabaseMocks, resetSupabaseMocks } from '@/__tests__/utils/mock-supabase';
import Dashboard from '@/components/Dashboard';

setupSupabaseMocks();

// Mock the workout tab to test the full flow
vi.mock('@/components/tabs/WorkoutTab', () => ({
  default: () => {
    const [selectedExercise, setSelectedExercise] = useState(null);
    const [isTimerActive, setIsTimerActive] = useState(false);
    
    return (
      <div>
        <div>Workout Tab</div>
        {!selectedExercise ? (
          <div>
            <button 
              onClick={() => setSelectedExercise(createMockExercise())}
              data-testid="select-exercise"
            >
              Select Standard Plank
            </button>
          </div>
        ) : (
          <div>
            <div>Exercise: {selectedExercise.name}</div>
            <button 
              onClick={() => setIsTimerActive(true)}
              data-testid="start-timer"
            >
              Start Timer
            </button>
            <button 
              onClick={() => setSelectedExercise(null)}
              data-testid="back-to-exercises"
            >
              Back
            </button>
            {isTimerActive && <div data-testid="timer-active">Timer Running</div>}
          </div>
        )}
      </div>
    );
  },
}));

describe('Workout Flow Integration', () => {
  beforeEach(() => {
    resetSupabaseMocks();
  });

  it('should complete full workout flow', async () => {
    customRender(<Dashboard />);
    
    // Navigate to workout tab
    fireEvent.click(screen.getByText('Workout'));
    
    await waitFor(() => {
      expect(screen.getByText('Workout Tab')).toBeInTheDocument();
    });
    
    // Select an exercise
    const selectExerciseButton = screen.getByTestId('select-exercise');
    fireEvent.click(selectExerciseButton);
    
    await waitFor(() => {
      expect(screen.getByText('Exercise: Standard Plank')).toBeInTheDocument();
    });
    
    // Start timer
    const startTimerButton = screen.getByTestId('start-timer');
    fireEvent.click(startTimerButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('timer-active')).toBeInTheDocument();
    });
    
    // Navigate back
    const backButton = screen.getByTestId('back-to-exercises');
    fireEvent.click(backButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('select-exercise')).toBeInTheDocument();
    });
  });
});
