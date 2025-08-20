
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import EmailChangeDialog from '../EmailChangeDialog';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      updateUser: vi.fn()
    }
  }
}));

// Mock toast
const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast })
}));

// Mock localStorage
const localStorageMock = {
  setItem: vi.fn(),
  removeItem: vi.fn(),
  getItem: vi.fn()
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

const mockUpdateUser = vi.mocked(supabase.auth.updateUser);

describe('EmailChangeDialog', () => {
  const mockOnOpenChange = vi.fn();
  
  const defaultProps = {
    open: true,
    onOpenChange: mockOnOpenChange,
    currentEmail: 'current@example.com'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders dialog with current email', () => {
    render(<EmailChangeDialog {...defaultProps} />);
    
    expect(screen.getByDisplayValue('current@example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('current@example.com')).toBeDisabled();
    expect(screen.getByText('Change Email Address')).toBeInTheDocument();
  });

  it('shows validation error for empty email', async () => {
    render(<EmailChangeDialog {...defaultProps} />);
    
    const submitButton = screen.getByText('Send Verification');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Email address is required')).toBeInTheDocument();
    });
    
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Invalid email',
      description: 'Email address is required',
      variant: 'destructive'
    });
  });

  it('shows validation error for invalid email format', async () => {
    render(<EmailChangeDialog {...defaultProps} />);
    
    const input = screen.getByPlaceholderText(/Enter your new email address/);
    fireEvent.change(input, { target: { value: 'invalid-email' } });
    
    const submitButton = screen.getByText('Send Verification');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    });
  });

  it('shows validation error for same email', async () => {
    render(<EmailChangeDialog {...defaultProps} />);
    
    const input = screen.getByPlaceholderText(/Enter your new email address/);
    fireEvent.change(input, { target: { value: 'current@example.com' } });
    
    const submitButton = screen.getByText('Send Verification');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Please enter a different email address')).toBeInTheDocument();
    });
  });

  it('clears validation error when user types', async () => {
    render(<EmailChangeDialog {...defaultProps} />);
    
    const input = screen.getByPlaceholderText(/Enter your new email address/);
    
    // Trigger validation error
    fireEvent.change(input, { target: { value: 'invalid-email' } });
    const submitButton = screen.getByText('Send Verification');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    });
    
    // Clear error by typing
    fireEvent.change(input, { target: { value: 'new@example.com' } });
    
    expect(screen.queryByText('Please enter a valid email address')).not.toBeInTheDocument();
  });

  it('submits email change successfully', async () => {
    mockUpdateUser.mockResolvedValue({ 
      data: { user: null }, 
      error: null 
    });
    
    render(<EmailChangeDialog {...defaultProps} />);
    
    const input = screen.getByPlaceholderText(/Enter your new email address/);
    fireEvent.change(input, { target: { value: 'new@example.com' } });
    
    const submitButton = screen.getByText('Send Verification');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith(
        { email: 'new@example.com' },
        { emailRedirectTo: `${window.location.origin}/auth/verify` }
      );
    });
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith('pendingEmailChange', 'new@example.com');
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Verification email sent',
      description: 'Please check new@example.com and click the verification link to complete the change.'
    });
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('handles email already in use error', async () => {
    mockUpdateUser.mockResolvedValue({
      data: { user: null },
      error: { 
        message: 'email address is already in use',
        code: 'email_address_in_use',
        status: 400,
        __isAuthError: true,
        name: 'AuthError'
      }
    });
    
    render(<EmailChangeDialog {...defaultProps} />);
    
    const input = screen.getByPlaceholderText(/Enter your new email address/);
    fireEvent.change(input, { target: { value: 'existing@example.com' } });
    
    const submitButton = screen.getByText('Send Verification');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('This email is already associated with another account.')).toBeInTheDocument();
    });
    
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Email change failed',
      description: 'This email is already associated with another account.',
      variant: 'destructive'
    });
  });

  it('handles rate limit error', async () => {
    mockUpdateUser.mockResolvedValue({
      data: { user: null },
      error: { 
        message: 'rate limit exceeded',
        code: 'rate_limit_exceeded',
        status: 429,
        __isAuthError: true,
        name: 'AuthError'
      }
    });
    
    render(<EmailChangeDialog {...defaultProps} />);
    
    const input = screen.getByPlaceholderText(/Enter your new email address/);
    fireEvent.change(input, { target: { value: 'new@example.com' } });
    
    const submitButton = screen.getByText('Send Verification');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Please wait a few minutes before trying again.')).toBeInTheDocument();
    });
  });

  it('shows loading state during submission', async () => {
    mockUpdateUser.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    render(<EmailChangeDialog {...defaultProps} />);
    
    const input = screen.getByPlaceholderText(/Enter your new email address/);
    fireEvent.change(input, { target: { value: 'new@example.com' } });
    
    const submitButton = screen.getByText('Send Verification');
    fireEvent.click(submitButton);
    
    expect(screen.getByText('Sending...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  it('resets form when dialog closes', () => {
    render(<EmailChangeDialog {...defaultProps} />);
    
    const input = screen.getByPlaceholderText(/Enter your new email address/);
    fireEvent.change(input, { target: { value: 'test@example.com' } });
    
    // Close dialog
    fireEvent.click(screen.getByText('Cancel'));
    
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });
});
