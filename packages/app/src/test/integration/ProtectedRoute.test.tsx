import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import { ThemeProvider } from '../../context/ThemeContext';
import { I18nProvider } from '../../context/I18nContext';
import ProtectedRoute from '../../components/auth/ProtectedRoute';

const mockUseErmitsEntitlement = vi.fn(() => ({
  result: {
    access: true,
    isTrial: false,
    productRole: 'viewer',
    trialEndsAt: null,
    usageRemaining: null,
    organizationId: '',
    organizationSlug: '',
    productId: '',
  },
  loading: false,
}));

vi.mock('../../hooks/useErmitsEntitlement', () => ({
  useErmitsEntitlement: (...args: unknown[]) => mockUseErmitsEntitlement(...args),
}));

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
  };
  return { supabase: mockSupabase, isSupabaseEnabled: () => true };
});

const ProtectedContent = () => <div data-testid="protected">Protected Content</div>;
const SignInPage = () => <div data-testid="signin">Sign In Page</div>;

const renderWithRouter = (initialRoute: string, _isAuthenticated: boolean) => {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <I18nProvider>
        <ThemeProvider>
          <AuthProvider>
            <Routes>
              <Route path="/signin" element={<SignInPage />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <ProtectedContent />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </AuthProvider>
        </ThemeProvider>
      </I18nProvider>
    </MemoryRouter>
  );
};

describe('ProtectedRoute Integration', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    mockUseErmitsEntitlement.mockReturnValue({
      result: {
        access: true,
        isTrial: false,
        productRole: 'viewer',
        trialEndsAt: null,
        usageRemaining: null,
        organizationId: '',
        organizationSlug: '',
        productId: '',
      },
      loading: false,
    });
    const { supabase } = await import('../../lib/supabase');
    vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });
  });

  it('redirects unauthenticated users to sign in', async () => {
    const { supabase } = await import('../../lib/supabase');
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    });

    renderWithRouter('/dashboard', false);

    await waitFor(() => {
      expect(screen.getByTestId('signin')).toBeInTheDocument();
    });
  });

  it('shows protected content for authenticated users', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      email_confirmed_at: new Date().toISOString(),
      app_metadata: {},
      user_metadata: { full_name: 'Test User' },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    };
    const mockSession = {
      access_token: 'mock-token',
      refresh_token: 'mock-refresh',
      expires_in: 3600,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      token_type: 'bearer' as const,
      user: mockUser,
    };

    const { supabase } = await import('../../lib/supabase');
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: mockSession as any },
      error: null,
    });
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: mockUser as any },
      error: null,
    });

    renderWithRouter('/dashboard', true);

    await waitFor(() => {
      expect(screen.getByTestId('protected')).toBeInTheDocument();
    });
  });

  it('shows loading state while checking authentication', async () => {
    const { supabase } = await import('../../lib/supabase');
    vi.mocked(supabase.auth.getSession).mockReturnValue(
      new Promise(() => {}) as any
    );

    renderWithRouter('/dashboard', false);

    expect(screen.getByText(/checking authentication/i)).toBeInTheDocument();
  });
});
