import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import { ThemeProvider } from '../../context/ThemeContext';
import { I18nProvider } from '../../context/I18nContext';
import SignInPage from '../../pages/auth/SignInPage';
import type { User, Session, AuthError } from '@supabase/supabase-js';

// Mock Supabase - must be defined inline in vi.mock to avoid hoisting issues
vi.mock('../../lib/supabase', () => {
  const mockSupabase = {
    auth: {
      signInWithPassword: vi.fn(() => Promise.resolve({ data: { user: null, session: null }, error: null })),
      signUp: vi.fn(() => Promise.resolve({ data: { user: null, session: null }, error: null })),
      signOut: vi.fn(() => Promise.resolve({ error: null })),
      getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null })),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      getUser: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })),
      resend: vi.fn(() => Promise.resolve({ error: null })),
      resetPasswordForEmail: vi.fn(() => Promise.resolve({ error: null })),
      updateUser: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(() => Promise.resolve({ data: null, error: null })),
    })),
    functions: {
      invoke: vi.fn(() => Promise.resolve({ data: { linked: true }, error: null })),
    },
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

describe('SignInPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders sign in form correctly', () => {
    render(
      <TestWrapper>
        <SignInPage />
      </TestWrapper>
    );

    expect(screen.getByText(/Sign in to VendorSoluce/)).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
  });

  it('keeps form visible when sign in is attempted with empty fields', async () => {
    render(
      <TestWrapper>
        <SignInPage />
      </TestWrapper>
    );

    const signInButton = screen.getByRole('button', { name: 'Sign in' });
    fireEvent.click(signInButton);

    await waitFor(() => {
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
    });
  });

  it('handles successful sign in', async () => {
    const { supabase } = await import('../../lib/supabase');
    const mockUser = { id: '123' } as unknown as User;
    const mockSession = {
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
      expires_in: 3600,
      expires_at: Date.now() / 1000 + 3600,
      token_type: 'bearer' as const,
      user: mockUser,
    } as unknown as Session;
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({ 
      data: { user: mockUser, session: mockSession }, 
      error: null 
    });

    render(
      <TestWrapper>
        <SignInPage />
      </TestWrapper>
    );

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const signInButton = screen.getByRole('button', { name: 'Sign in' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(signInButton);

    await waitFor(async () => {
      const { supabase } = await import('../../lib/supabase');
      expect(vi.mocked(supabase.auth.signInWithPassword)).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  it('handles sign in error', async () => {
    const { supabase } = await import('../../lib/supabase');
    const mockError = { message: 'Invalid credentials' } as unknown as AuthError;
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
      data: { user: null, session: null },
      error: mockError
    });

    render(
      <TestWrapper>
        <SignInPage />
      </TestWrapper>
    );

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const signInButton = screen.getByRole('button', { name: 'Sign in' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(signInButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid email or password. Please try again.')).toBeInTheDocument();
    });
  });

  it('switches to sign up mode', () => {
    render(
      <TestWrapper>
        <SignInPage />
      </TestWrapper>
    );

    const switchButton = screen.getByText('Sign up');
    fireEvent.click(switchButton);

    expect(screen.getByText('Create an Account')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up|create account/i })).toBeInTheDocument();
  });

  it('shows payment success message when from_checkout and session_id are in URL', () => {
    render(
      <MemoryRouter initialEntries={['/signin?from_checkout=true&session_id=cs_test_123']}>
        <I18nProvider>
          <ThemeProvider>
            <AuthProvider>
              <SignInPage />
            </AuthProvider>
          </ThemeProvider>
        </I18nProvider>
      </MemoryRouter>
    );

    expect(screen.getByText(/Payment successful/)).toBeInTheDocument();
    expect(screen.getByText(/Sign in or create an account to access your subscription/)).toBeInTheDocument();
  });
});

