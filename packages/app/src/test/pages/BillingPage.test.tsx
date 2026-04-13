import { render, screen} from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import { ThemeProvider } from '../../context/ThemeContext';
import { I18nProvider } from '../../context/I18nContext';
import { useSubscription } from '../../hooks/useSubscription';
import BillingPage from '../../pages/workspace/BillingPage';

// Mock the hooks
vi.mock('../../hooks/useSubscription', async () => {
  const actual = await vi.importActual('../../hooks/useSubscription');
  return {
    ...actual,
    useSubscription: vi.fn(),
    useUsageTracking: vi.fn((feature: string) => ({
      usage: {
        feature,
        used: 10,
        limit: 50,
        canUse: true,
        percentageUsed: 20,
      },
      loading: false,
      trackUsage: vi.fn(() => Promise.resolve(true)),
      refetch: vi.fn(),
    })),
  };
});

const mockUseSubscription = vi.mocked(useSubscription);

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

describe('BillingPage', () => {
  const mockSubscription = {
    id: 'sub_123',
    tier: 'professional' as const,
    status: 'active',
    current_period_end: '2025-02-01T00:00:00Z',
    cancel_at_period_end: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSubscription.mockReturnValue({
      subscription: mockSubscription,
      loading: false,
      error: null,
      tier: 'professional',
      checkFeatureAccess: vi.fn(() => true),
      getLimit: vi.fn(() => 50),
      isActive: vi.fn(() => true),
      isTrialing: vi.fn(() => false),
      isCanceled: vi.fn(() => false),
      daysUntilRenewal: vi.fn(() => 15),
      refetch: vi.fn(),
    });
  });

  it('renders billing page correctly', () => {
    render(
      <TestWrapper>
        <BillingPage />
      </TestWrapper>
    );

    expect(screen.getByText('Billing & subscription')).toBeInTheDocument();
    expect(screen.getByText('Manage billing, invoices, and subscription usage.')).toBeInTheDocument();
  });

  it('shows current subscription tier', () => {
    render(
      <TestWrapper>
        <BillingPage />
      </TestWrapper>
    );

    expect(screen.getByText(/Your .* benefits/i)).toBeInTheDocument();
  });

  it('displays feature usage summary', () => {
    render(
      <TestWrapper>
        <BillingPage />
      </TestWrapper>
    );

    expect(screen.getByText('Feature usage')).toBeInTheDocument();
    expect(screen.getByText('SBOM Scans')).toBeInTheDocument();
    expect(screen.getByText('Vendors')).toBeInTheDocument();
    expect(screen.getByText('Assessments')).toBeInTheDocument();
    expect(screen.getByText('API Calls')).toBeInTheDocument();
  });

  it('shows plan benefits', () => {
    render(
      <TestWrapper>
        <BillingPage />
      </TestWrapper>
    );

    expect(screen.getByText(/Your Professional benefits/i)).toBeInTheDocument();
  });

  it('displays quick actions', () => {
    render(
      <TestWrapper>
        <BillingPage />
      </TestWrapper>
    );

    expect(screen.getByText(/Quick actions/i)).toBeInTheDocument();
    expect(screen.getByText(/Upgrade plan/i)).toBeInTheDocument();
    expect(screen.getByText(/Payment support/i)).toBeInTheDocument();
  });

  it('shows loading state', () => {
    mockUseSubscription.mockReturnValue({
      subscription: null,
      loading: true,
      error: null,
      tier: 'free',
      checkFeatureAccess: vi.fn(() => false),
      getLimit: vi.fn(() => 5),
      isActive: vi.fn(() => false),
      isTrialing: vi.fn(() => false),
      isCanceled: vi.fn(() => false),
      daysUntilRenewal: vi.fn(() => 0),
      refetch: vi.fn(),
    });

    render(
      <TestWrapper>
        <BillingPage />
      </TestWrapper>
    );

    expect(screen.getByText('Loading subscription and billing controls…')).toBeInTheDocument();
  });

  it('handles free tier correctly', () => {
    mockUseSubscription.mockReturnValue({
      subscription: null,
      loading: false,
      error: null,
      tier: 'free',
      checkFeatureAccess: vi.fn(() => false),
      getLimit: vi.fn(() => 5),
      isActive: vi.fn(() => false),
      isTrialing: vi.fn(() => false),
      isCanceled: vi.fn(() => false),
      daysUntilRenewal: vi.fn(() => 0),
      refetch: vi.fn(),
    });

    render(
      <TestWrapper>
        <BillingPage />
      </TestWrapper>
    );

    expect(screen.getByText(/Your Free benefits/i)).toBeInTheDocument();
  });
});

