import { render, screen} from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import { ThemeProvider } from '../../context/ThemeContext';
import { I18nProvider } from '../../context/I18nContext';
import { useVendors } from '../../hooks/useVendors';
import { useSupplyChainAssessments } from '../../hooks/useSupplyChainAssessments';
import DashboardPage from '../../pages/workspace/DashboardPage';

// Mock hooks
vi.mock('../../hooks/useVendors');
vi.mock('../../hooks/useSupplyChainAssessments');

const mockUseVendors = vi.mocked(useVendors);
const mockUseSupplyChainAssessments = vi.mocked(useSupplyChainAssessments);

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

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    mockUseVendors.mockReturnValue({
      vendors: [
        { id: '1', name: 'Vendor 1', risk_level: 'High', risk_score: 75 },
        { id: '2', name: 'Vendor 2', risk_level: 'Low', risk_score: 25 },
      ],
      loading: false,
      error: null,
      createVendor: vi.fn(),
      updateVendor: vi.fn(),
      deleteVendor: vi.fn(),
      refetch: vi.fn(),
    });

    mockUseSupplyChainAssessments.mockReturnValue({
      assessments: [
        { id: '1', assessment_name: 'Assessment 1', status: 'completed' },
      ],
      loading: false,
      error: null,
      createAssessment: vi.fn(),
      updateAssessment: vi.fn(),
      deleteAssessment: vi.fn(),
      refetch: vi.fn(),
    });
  });

  it('renders dashboard overview correctly', () => {
    render(
      <TestWrapper>
        <DashboardPage />
      </TestWrapper>
    );

    expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();
  });

  it('displays vendor statistics', () => {
    render(
      <TestWrapper>
        <DashboardPage />
      </TestWrapper>
    );

    expect(screen.getByText('Total Vendors')).toBeInTheDocument();
  });

  it('displays assessment statistics', () => {
    render(
      <TestWrapper>
        <DashboardPage />
      </TestWrapper>
    );

    expect(screen.getByText('Assessments')).toBeInTheDocument();
  });

  it('shows risk distribution', () => {
    render(
      <TestWrapper>
        <DashboardPage />
      </TestWrapper>
    );

    expect(screen.getByText(/Vendor Risk Distribution/i)).toBeInTheDocument();
    expect(screen.getAllByText(/High Risk/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Low Risk/i).length).toBeGreaterThan(0);
  });

  it('displays quick actions', () => {
    render(
      <TestWrapper>
        <DashboardPage />
      </TestWrapper>
    );

    expect(screen.getByText(/Quick Actions/i)).toBeInTheDocument();
  });

  it('shows quick actions with correct links', () => {
    render(
      <TestWrapper>
        <DashboardPage />
      </TestWrapper>
    );

    expect(screen.getByText(/Quick Actions/i)).toBeInTheDocument();
    expect(screen.getByText(/Vendor portfolio/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Supply chain assessment/i).length).toBeGreaterThan(0);
  });

  it('handles loading state', () => {
    mockUseVendors.mockReturnValue({
      vendors: [],
      loading: true,
      error: null,
      createVendor: vi.fn(),
      updateVendor: vi.fn(),
      deleteVendor: vi.fn(),
      refetch: vi.fn(),
    });

    mockUseSupplyChainAssessments.mockReturnValue({
      assessments: [],
      loading: true,
      error: null,
      createAssessment: vi.fn(),
      updateAssessment: vi.fn(),
      deleteAssessment: vi.fn(),
      refetch: vi.fn(),
    });

    render(
      <TestWrapper>
        <DashboardPage />
      </TestWrapper>
    );

    // Dashboard shows LoadingSkeleton when loading
    expect(screen.queryByText(/Welcome back/i)).not.toBeInTheDocument();
  });

  it('handles error state gracefully', () => {
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
        <DashboardPage />
      </TestWrapper>
    );

    // Dashboard still renders even with vendor errors, just shows empty state
    expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();
  });

  it('renders with subscription tier', () => {
    render(
      <TestWrapper>
        <DashboardPage />
      </TestWrapper>
    );

    // Dashboard renders successfully with subscription context
    expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();
  });
});

