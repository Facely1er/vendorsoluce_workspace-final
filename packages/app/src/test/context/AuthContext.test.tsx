import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import { ThemeProvider } from '../../context/ThemeContext';
import { I18nProvider } from '../../context/I18nContext';
import { useAuth } from '../../context/AuthContext';

// Mock Supabase - must be defined inline in vi.mock to avoid hoisting issues
vi.mock('../../lib/supabase', () => {
  const mockSupabase = {
    auth: {
      signInWithPassword: vi.fn(() => Promise.resolve({ data: { user: null, session: null }, error: null })),
      signUp: vi.fn(() => Promise.resolve({ data: { user: null, session: null }, error: null })),
      signOut: vi.fn(() => Promise.resolve({ error: null })),
      getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null })),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(() => Promise.resolve({ data: null, error: null })),
    })),
  };
  return {
    supabase: mockSupabase,
    isSupabaseEnabled: () => true,
  };
});

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <I18nProvider>
      <ThemeProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </ThemeProvider>
    </I18nProvider>
  </BrowserRouter>
);

describe('AuthContext', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const { supabase } = await import('../../lib/supabase');
    vi.mocked(supabase.auth.getSession).mockResolvedValue({ data: { session: null }, error: null });
    vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } });
  });

  it('provides authentication context', async () => {
    const TestComponent = () => {
      const { user, isLoading, isAuthenticated } = useAuth();
      return (
        <div>
          <div data-testid="user">{user ? 'authenticated' : 'not authenticated'}</div>
          <div data-testid="loading">{isLoading ? 'loading' : 'not loading'}</div>
          <div data-testid="authenticated">{isAuthenticated ? 'true' : 'false'}</div>
        </div>
      );
    };

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not loading');
    });
    expect(screen.getByTestId('user')).toHaveTextContent('not authenticated');
    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
  });

  it('handles sign in', async () => {
    const TestComponent = () => {
      const { signIn } = useAuth();
      
      const handleSignIn = async () => {
        try {
          await signIn('test@example.com', 'password123');
        } catch (error) {
          console.error('Sign in failed:', error);
        }
      };

      return (
        <button onClick={handleSignIn} data-testid="signin-btn">
          Sign In
        </button>
      );
    };

    const { supabase } = await import('../../lib/supabase');
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({ 
      data: { user: { id: '123' } as any, session: null }, 
      error: null 
    });

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    const signInButton = screen.getByTestId('signin-btn');
    fireEvent.click(signInButton);

    await waitFor(async () => {
      const { supabase } = await import('../../lib/supabase');
      expect(vi.mocked(supabase.auth.signInWithPassword)).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  it('handles sign up', async () => {
    const TestComponent = () => {
      const { signUp } = useAuth();
      
      const handleSignUp = async () => {
        try {
          await signUp('test@example.com', 'password123', 'Test User');
        } catch (error) {
          console.error('Sign up failed:', error);
        }
      };

      return (
        <button onClick={handleSignUp} data-testid="signup-btn">
          Sign Up
        </button>
      );
    };

    const { supabase } = await import('../../lib/supabase');
    vi.mocked(supabase.auth.signUp).mockResolvedValue({ 
      data: { user: { id: '123' } as any, session: null }, 
      error: null 
    });

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    const signUpButton = screen.getByTestId('signup-btn');
    fireEvent.click(signUpButton);

    await waitFor(async () => {
      const { supabase } = await import('../../lib/supabase');
      expect(vi.mocked(supabase.auth.signUp)).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: {
          data: {
            full_name: 'Test User',
          },
          emailRedirectTo: 'http://localhost:3000/',
        },
      });
    });
  });

  it('handles sign out', async () => {
    const TestComponent = () => {
      const { signOut } = useAuth();
      
      const handleSignOut = async () => {
        try {
          await signOut();
        } catch (error) {
          console.error('Sign out failed:', error);
        }
      };

      return (
        <button onClick={handleSignOut} data-testid="signout-btn">
          Sign Out
        </button>
      );
    };

    const { supabase } = await import('../../lib/supabase');
    vi.mocked(supabase.auth.signOut).mockResolvedValue({ error: null });

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    const signOutButton = screen.getByTestId('signout-btn');
    fireEvent.click(signOutButton);

    await waitFor(async () => {
      const { supabase } = await import('../../lib/supabase');
      expect(vi.mocked(supabase.auth.signOut)).toHaveBeenCalled();
    });
  });

  it('handles authentication errors', async () => {
    const TestComponent = () => {
      const { signIn } = useAuth();
      const [error, setError] = React.useState<string | null>(null);
      
      const handleSignIn = async () => {
        try {
          await signIn('test@example.com', 'wrongpassword');
        } catch (err: any) {
          setError(err.message);
        }
      };

      return (
        <div>
          <button onClick={handleSignIn} data-testid="signin-btn">
            Sign In
          </button>
          {error && <div data-testid="error">{error}</div>}
        </div>
      );
    };

    const { supabase } = await import('../../lib/supabase');
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({ 
      data: null, 
      error: { message: 'Invalid credentials' } as any
    });

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    const signInButton = screen.getByTestId('signin-btn');
    fireEvent.click(signInButton);

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Invalid credentials');
    });
  });
});

