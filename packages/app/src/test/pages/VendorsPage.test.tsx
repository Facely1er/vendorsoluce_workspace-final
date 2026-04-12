import { render, screen} from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import { ThemeProvider } from '../../context/ThemeContext';
import { I18nProvider } from '../../context/I18nContext';
import { useVendors } from '../../hooks/useVendors';
import VendorsPage from '../../pages/workspace/VendorsPage';

// Mock the useVendors hook
vi.mock('../../hooks/useVendors');
const mockUseVendors = vi.mocked(useVendors);

// Mock Supabase - must be defined inline in vi.mock to avoid hoisting issues
vi.mock('../../lib/supabase', () => {
  const mockSupabase = {
    auth: {
      getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null })),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn(() => Promise.resolve({ data: null, error: null })),
    })),
  };
  return {
    supabase: mockSupabase,
    isSupabaseEnabled: vi.fn(() => true),
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

describe('VendorsPage', () => {
  const mockVendors = [
    {
      id: '1',
      name: 'Test Vendor 1',
      industry: 'Technology',
      risk_level: 'High',
      risk_score: 75,
      compliance_status: 'Partial',
      created_at: '2025-01-01T00:00:00Z',
    },
    {
      id: '2',
      name: 'Test Vendor 2',
      industry: 'Finance',
      risk_level: 'Low',
      risk_score: 25,
      compliance_status: 'Compliant',
      created_at: '2025-01-02T00:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseVendors.mockReturnValue({
      vendors: mockVendors,
      loading: false,
      error: null,
      createVendor: vi.fn(),
      updateVendor: vi.fn(),
      deleteVendor: vi.fn(),
      refetch: vi.fn(),
    });
  });

  it('renders vendor list correctly', () => {
    render(
      <TestWrapper>
        <VendorsPage />
      </TestWrapper>
    );

    expect(screen.getByText('Test Vendor 1')).toBeInTheDocument();
    expect(screen.getByText('Test Vendor 2')).toBeInTheDocument();
    // Industry may not be displayed directly in the table, check for vendor names instead
  });

  it('shows loading state', () => {
    mockUseVendors.mockReturnValue({
      vendors: [],
      loading: true,
      error: null,
      createVendor: vi.fn(),
      updateVendor: vi.fn(),
      deleteVendor: vi.fn(),
      refetch: vi.fn(),
    });

    render(
      <TestWrapper>
        <VendorsPage />
      </TestWrapper>
    );

    const loadingIndicator =
      document.querySelector('.animate-spin') ||
      document.querySelector('.animate-pulse') ||
      screen.queryByText(/loading/i);
    expect(loadingIndicator).toBeTruthy();
  });

  it('shows error state', () => {
    mockUseVendors.mockReturnValue({
      vendors: [],
      loading: false,
      error: 'Failed to load vendors',
      createVendor: vi.fn(),
      updateVendor: vi.fn(),
      deleteVendor: vi.fn(),
      refetch: vi.fn(),
    });

    render(
      <TestWrapper>
        <VendorsPage />
      </TestWrapper>
    );

    // Error message includes prefix "Error loading vendors: "
    expect(screen.getByText(/Error loading vendors/i)).toBeInTheDocument();
    expect(screen.getByText(/Failed to load vendors/i)).toBeInTheDocument();
  });

  it('displays risk distribution correctly', () => {
    render(
      <TestWrapper>
        <VendorsPage />
      </TestWrapper>
    );

    expect(screen.getAllByText('High').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Low').length).toBeGreaterThan(0);
  });

  it('handles empty vendor list', () => {
    mockUseVendors.mockReturnValue({
      vendors: [],
      loading: false,
      error: null,
      createVendor: vi.fn(),
      updateVendor: vi.fn(),
      deleteVendor: vi.fn(),
      refetch: vi.fn(),
    });

    render(
      <TestWrapper>
        <VendorsPage />
      </TestWrapper>
    );

    expect(screen.getAllByText(/No vendors/i).length).toBeGreaterThan(0);
  });
});

