
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import UsernameInput from '../UsernameInput';
import * as usernameValidation from '@/utils/usernameValidation';
import * as useUsernameAvailability from '@/hooks/useUsernameAvailability';

// Mock the hooks and utilities
vi.mock('@/utils/usernameValidation');
vi.mock('@/hooks/useUsernameAvailability');
vi.mock('@/hooks/useDebounce', () => ({
  useDebounce: (value: string) => value
}));

const mockValidateUsernameFormat = vi.mocked(usernameValidation.validateUsernameFormat);
const mockGenerateUsernameSuggestions = vi.mocked(usernameValidation.generateUsernameSuggestions);
const mockUseUsernameAvailability = vi.mocked(useUsernameAvailability.useUsernameAvailability);

describe('UsernameInput', () => {
  const mockOnChange = vi.fn();
  
  const defaultProps = {
    value: '',
    onChange: mockOnChange,
    currentUsername: undefined,
    className: '',
    placeholder: 'Username placeholder'
  };

  const mockAvailabilityResult = {
    isChecking: false,
    isAvailable: null as boolean | null,
    error: null as string | null,
    lastCheckedUsername: null as string | null,
    retry: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseUsernameAvailability.mockReturnValue(mockAvailabilityResult);
    mockValidateUsernameFormat.mockReturnValue({ isValid: true });
    mockGenerateUsernameSuggestions.mockReturnValue([]);
  });

  it('renders with placeholder text', () => {
    render(<UsernameInput {...defaultProps} />);
    
    expect(screen.getByPlaceholderText('Username placeholder')).toBeInTheDocument();
  });

  it('calls onChange when input value changes', async () => {
    render(<UsernameInput {...defaultProps} />);
    
    const input = screen.getByPlaceholderText('Username placeholder');
    fireEvent.change(input, { target: { value: 'testuser' } });
    
    expect(mockOnChange).toHaveBeenCalledWith('testuser');
  });

  it('removes @ symbol from input', async () => {
    render(<UsernameInput {...defaultProps} />);
    
    const input = screen.getByPlaceholderText('Username placeholder');
    fireEvent.change(input, { target: { value: '@testuser' } });
    
    expect(mockOnChange).toHaveBeenCalledWith('testuser');
  });

  it('shows format validation error', () => {
    mockValidateUsernameFormat.mockReturnValue({
      isValid: false,
      error: 'Username must be at least 3 characters long'
    });

    render(<UsernameInput {...defaultProps} value="ab" />);
    
    expect(screen.getByText('Username must be at least 3 characters long')).toBeInTheDocument();
  });

  it('shows checking availability state', () => {
    mockValidateUsernameFormat.mockReturnValue({ isValid: true });
    mockUseUsernameAvailability.mockReturnValue({
      ...mockAvailabilityResult,
      isChecking: true
    });

    render(<UsernameInput {...defaultProps} value="testuser" />);
    
    expect(screen.getByText('Checking availability...')).toBeInTheDocument();
  });

  it('shows username available state', () => {
    mockValidateUsernameFormat.mockReturnValue({ isValid: true });
    mockUseUsernameAvailability.mockReturnValue({
      ...mockAvailabilityResult,
      isAvailable: true
    });

    render(<UsernameInput {...defaultProps} value="testuser" />);
    
    expect(screen.getByText('✓ @testuser is available')).toBeInTheDocument();
  });

  it('shows username unavailable state', () => {
    mockValidateUsernameFormat.mockReturnValue({ isValid: true });
    mockUseUsernameAvailability.mockReturnValue({
      ...mockAvailabilityResult,
      isAvailable: false
    });

    render(<UsernameInput {...defaultProps} value="testuser" />);
    
    expect(screen.getByText('✗ @testuser is already taken')).toBeInTheDocument();
  });

  it('shows suggestions when username is unavailable', () => {
    mockValidateUsernameFormat.mockReturnValue({ isValid: true });
    mockUseUsernameAvailability.mockReturnValue({
      ...mockAvailabilityResult,
      isAvailable: false
    });
    mockGenerateUsernameSuggestions.mockReturnValue(['testuser123', 'testuser_2024', 'my_testuser']);

    render(<UsernameInput {...defaultProps} value="testuser" />);
    
    expect(screen.getByText('Try these instead:')).toBeInTheDocument();
    expect(screen.getByText('@testuser123')).toBeInTheDocument();
    expect(screen.getByText('@testuser_2024')).toBeInTheDocument();
    expect(screen.getByText('@my_testuser')).toBeInTheDocument();
  });

  it('handles suggestion click', async () => {
    mockValidateUsernameFormat.mockReturnValue({ isValid: true });
    mockUseUsernameAvailability.mockReturnValue({
      ...mockAvailabilityResult,
      isAvailable: false
    });
    mockGenerateUsernameSuggestions.mockReturnValue(['testuser123']);

    render(<UsernameInput {...defaultProps} value="testuser" />);
    
    const suggestion = screen.getByText('@testuser123');
    fireEvent.click(suggestion);
    
    expect(mockOnChange).toHaveBeenCalledWith('testuser123');
  });

  it('shows error state with retry button', () => {
    mockValidateUsernameFormat.mockReturnValue({ isValid: true });
    mockUseUsernameAvailability.mockReturnValue({
      ...mockAvailabilityResult,
      error: 'Network error occurred'
    });

    render(<UsernameInput {...defaultProps} value="testuser" />);
    
    expect(screen.getByText('Network error occurred')).toBeInTheDocument();
    expect(screen.getByTitle('Retry check')).toBeInTheDocument();
  });

  it('handles retry button click', () => {
    const mockRetry = vi.fn();
    mockValidateUsernameFormat.mockReturnValue({ isValid: true });
    mockUseUsernameAvailability.mockReturnValue({
      ...mockAvailabilityResult,
      error: 'Network error occurred',
      retry: mockRetry
    });

    render(<UsernameInput {...defaultProps} value="testuser" />);
    
    const retryButton = screen.getByTitle('Retry check');
    fireEvent.click(retryButton);
    
    expect(mockRetry).toHaveBeenCalled();
  });

  it('shows neutral state for current username', () => {
    mockValidateUsernameFormat.mockReturnValue({ isValid: true });
    
    render(<UsernameInput {...defaultProps} value="currentuser" currentUsername="currentuser" />);
    
    // Should not show availability check for current username
    expect(screen.queryByText('Checking availability...')).not.toBeInTheDocument();
    expect(screen.queryByText('✓ @currentuser is available')).not.toBeInTheDocument();
  });
});
