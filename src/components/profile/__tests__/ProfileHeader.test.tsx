
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ProfileHeader from '../ProfileHeader';
import { supabase } from '@/integrations/supabase/client';

// Mock all dependencies
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'test-user', email: 'test@example.com' },
    session: { access_token: 'token' }
  })
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn()
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn()
      }))
    }))
  }
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>
  }
}));

const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast })
}));

// Mock child components
vi.mock('../AvatarSelector', () => ({
  default: ({ onSelect }: any) => (
    <div data-testid="avatar-selector" onClick={() => onSelect('test-avatar.jpg')}>
      Avatar Selector
    </div>
  )
}));

vi.mock('../UsernameInput', () => ({
  default: ({ value, onChange }: any) => (
    <input 
      data-testid="username-input"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Username input"
    />
  )
}));

vi.mock('../EmailChangeDialog', () => ({
  default: ({ open, onOpenChange }: any) => 
    open ? <div data-testid="email-change-dialog">Email Change Dialog</div> : null
}));

vi.mock('../PendingEmailChangeBanner', () => ({
  default: ({ pendingEmail }: any) => (
    <div data-testid="pending-email-banner">Pending: {pendingEmail}</div>
  )
}));

vi.mock('@/utils/usernameValidation', () => ({
  validateUsernameFormat: vi.fn(() => ({ isValid: true }))
}));

const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn()
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('ProfileHeader', () => {
  const mockSupabaseFrom = vi.mocked(supabase.from);
  
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    
    // Mock successful profile fetch
    const mockSelect = vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(() => Promise.resolve({
          data: {
            id: 'test-user',
            full_name: 'Test User',
            username: 'testuser',
            avatar_url: 'test-avatar.jpg'
          },
          error: null
        }))
      }))
    }));
    
    mockSupabaseFrom.mockReturnValue({
      select: mockSelect,
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null }))
      }))
    } as any);
  });

  it('renders user profile information', async () => {
    render(<ProfileHeader />);
    
    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('@testuser')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });
  });

  it('shows pending email change banner when present', () => {
    localStorageMock.getItem.mockReturnValue('pending@example.com');
    
    render(<ProfileHeader />);
    
    expect(screen.getByTestId('pending-email-banner')).toBeInTheDocument();
    expect(screen.getByText('Pending: pending@example.com')).toBeInTheDocument();
  });

  it('enters edit mode when edit button is clicked', async () => {
    render(<ProfileHeader />);
    
    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });
    
    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);
    
    expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
    expect(screen.getByTestId('username-input')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Edit mode activated',
      description: 'You can now edit your profile information.'
    });
  });

  it('cancels edit mode and resets form', async () => {
    render(<ProfileHeader />);
    
    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });
    
    // Enter edit mode
    fireEvent.click(screen.getByText('Edit'));
    
    // Modify the form
    const nameInput = screen.getByDisplayValue('Test User');
    fireEvent.change(nameInput, { target: { value: 'Modified Name' } });
    
    // Cancel
    fireEvent.click(screen.getByText('Cancel'));
    
    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.queryByDisplayValue('Modified Name')).not.toBeInTheDocument();
    });
    
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Changes cancelled',
      description: 'Your profile changes have been discarded.'
    });
  });

  it('saves profile changes successfully', async () => {
    const mockUpdate = vi.fn(() => ({ eq: vi.fn(() => Promise.resolve({ error: null })) }));
    mockSupabaseFrom.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({
            data: {
              id: 'test-user',
              full_name: 'Test User',
              username: 'testuser',
              avatar_url: 'test-avatar.jpg'
            },
            error: null
          }))
        }))
      })),
      update: mockUpdate
    } as any);
    
    render(<ProfileHeader />);
    
    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });
    
    // Enter edit mode
    fireEvent.click(screen.getByText('Edit'));
    
    // Modify the form
    const nameInput = screen.getByDisplayValue('Test User');
    fireEvent.change(nameInput, { target: { value: 'Updated Name' } });
    
    // Save
    fireEvent.click(screen.getByText('Save'));
    
    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith({
        full_name: 'Updated Name',
        username: 'testuser',
        avatar_url: 'test-avatar.jpg',
        updated_at: expect.any(String)
      });
    });
    
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Profile updated successfully',
      description: 'Your profile information has been saved.'
    });
  });

  it('handles username validation error during save', async () => {
    const { validateUsernameFormat } = await import('@/utils/usernameValidation');
    vi.mocked(validateUsernameFormat).mockReturnValue({
      isValid: false,
      error: 'Username is too short'
    });
    
    render(<ProfileHeader />);
    
    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });
    
    // Enter edit mode
    fireEvent.click(screen.getByText('Edit'));
    
    // Save with invalid username
    fireEvent.click(screen.getByText('Save'));
    
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Invalid username',
      description: 'Username is too short',
      variant: 'destructive'
    });
  });

  it('handles database unique constraint error', async () => {
    const mockUpdate = vi.fn(() => ({ 
      eq: vi.fn(() => Promise.resolve({ 
        error: { code: '23505', message: 'duplicate key value violates unique constraint "username"' } 
      })) 
    }));
    
    mockSupabaseFrom.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({
            data: {
              id: 'test-user',
              full_name: 'Test User',
              username: 'testuser',
              avatar_url: 'test-avatar.jpg'
            },
            error: null
          }))
        }))
      })),
      update: mockUpdate
    } as any);
    
    render(<ProfileHeader />);
    
    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });
    
    // Enter edit mode and save
    fireEvent.click(screen.getByText('Edit'));
    fireEvent.click(screen.getByText('Save'));
    
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Username not available',
        description: 'This username is already taken. Please choose a different one.',
        variant: 'destructive'
      });
    });
  });

  it('opens email change dialog', async () => {
    render(<ProfileHeader />);
    
    await waitFor(() => {
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });
    
    const changeButton = screen.getByText('Change');
    fireEvent.click(changeButton);
    
    expect(screen.getByTestId('email-change-dialog')).toBeInTheDocument();
  });

  it('handles avatar selection in edit mode', async () => {
    render(<ProfileHeader />);
    
    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });
    
    // Enter edit mode
    fireEvent.click(screen.getByText('Edit'));
    
    // Select avatar
    const avatarSelector = screen.getByTestId('avatar-selector');
    fireEvent.click(avatarSelector);
    
    // The avatar URL should be updated in the form state
    // This would be tested through the save functionality
  });
});
