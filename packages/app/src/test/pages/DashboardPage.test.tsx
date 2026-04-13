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

  it('displays risk tier summary cards', () => {
    render(
      <TestWrapper>
        <DashboardPage />
      </TestWrapper>
    );

    expect(screen.getAllByText('Critical').length).toBeGreaterThan(0);
    expect(screen.getAllByText('High').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Medium').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Low').length).toBeGreaterThan(0);
  });

  it('shows priorities section', () => {
    render(
      <TestWrapper>
        <DashboardPage />
      </TestWrapper>
    );

    expect(screen.getByText('Priorities')).toBeInTheDocument();
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

    // When loading, the content sections should not render yet.
    expect(screen.queryByText('Priorities')).not.toBeInTheDocument();
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

