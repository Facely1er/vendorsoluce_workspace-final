import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import { ThemeProvider } from '../../context/ThemeContext';
import { I18nProvider } from '../../context/I18nContext';

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
      invoke: vi.fn(() => Promise.resolve({ data: null, error: null })),
    },
  };
  return { supabase: mockSupabase, isSupabaseEnabled: () => true };
});

vi.mock('../../lib/stripe', () => ({
  getStripe: vi.fn(() => Promise.resolve({
    redirectToCheckout: vi.fn(() => Promise.resolve({ error: null })),
  })),
}));

vi.mock('../../config/stripe', () => ({
  PRODUCTS: {
    starter: {
      name: 'Starter',
      price: 29,
      priceId: 'price_starter_test',
      features: ['Feature 1'],
    },
    professional: {
      name: 'Professional',
      price: 99,
      priceId: 'price_professional_test',
      features: ['Feature 1', 'Feature 2'],
    },
    enterprise: {
      name: 'Enterprise',
      price: 299,
      priceId: 'price_enterprise_test',
      features: ['Feature 1', 'Feature 2', 'Feature 3'],
    },
  },
  getPaymentLink: vi.fn(() => 'https://checkout.stripe.test/mock-link'),
  getPlanPriceLabel: vi.fn((plan: string) => {
    if (plan === 'starter') return '$29/month';
    if (plan === 'professional') return '$99/month';
    if (plan === 'enterprise') return '$299/month';
    return '$0';
  }),
}));

const renderCheckout = async (plan = 'professional') => {
  const Checkout = (await import('../../pages/public/Checkout')).default;
  return render(
    <MemoryRouter initialEntries={[`/checkout?plan=${plan}`]}>
      <I18nProvider>
        <ThemeProvider>
          <AuthProvider>
            <Checkout />
          </AuthProvider>
        </ThemeProvider>
      </I18nProvider>
    </MemoryRouter>
  );
};

describe('Checkout Integration', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const { supabase } = await import('../../lib/supabase');
    vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    });
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 404,
        text: () => Promise.resolve(''),
      } as Response)
    );
  });

  it('renders the checkout page with plan name and pricing', async () => {
    await renderCheckout('professional');

    await waitFor(() => {
      expect(screen.getAllByText(/Professional/).length).toBeGreaterThan(0);
    });
  });

  it('renders the plan summary section', async () => {
    await renderCheckout();

    await waitFor(() => {
      expect(screen.getByText('Plan Summary')).toBeInTheDocument();
    });
  });

  it('renders policy documents section', async () => {
    await renderCheckout();

    await waitFor(() => {
      expect(screen.getByText('Policy Documents')).toBeInTheDocument();
    });
  });

  it('shows policy acceptance requirement', async () => {
    await renderCheckout();

    await waitFor(() => {
      expect(screen.getByText(/I have read and agree/i)).toBeInTheDocument();
    });
  });

  it('shows other policy links section', async () => {
    await renderCheckout();

    await waitFor(() => {
      expect(screen.getAllByText(/Master Terms of Service/i).length).toBeGreaterThan(0);
    });
  });
});
