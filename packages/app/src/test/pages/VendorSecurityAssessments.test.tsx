import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import VendorSecurityAssessments from '../../pages/workspace/VendorSecurityAssessments';
import { AuthProvider } from '../../context/AuthContext';
import { ThemeProvider } from '../../context/ThemeContext';
import { I18nProvider } from '../../context/I18nContext';

// Mock the hooks (real hooks used by page: useVendors, useVendorAssessments)
vi.mock('../../hooks/useVendors', () => ({
  useVendors: () => ({
    vendors: [
      {
        id: 'vendor-1',
        name: 'Test Vendor',
        contact_email: 'test@vendor.com'
      }
    ],
    loading: false
  })
}));

vi.mock('../../hooks/useVendorAssessments', () => ({
  useVendorAssessments: () => ({
    assessments: [
      {
        id: 'assessment-1',
        vendor: {
          id: 'vendor-1',
          name: 'Test Vendor',
          contact_email: 'test@vendor.com'
        },
        framework: {
          id: 'framework-1',
          name: 'CMMC Level 1',
          description: 'Basic cyber hygiene',
          framework_type: 'cmmc_level_1',
          question_count: 17,
          estimated_time: '30 minutes'
        },
        status: 'pending',
        due_date: '2025-02-01',
        overall_score: null,
        created_at: '2025-01-15T10:00:00Z'
      }
    ],
    frameworks: [
      {
        id: 'framework-1',
        name: 'CMMC Level 1',
        description: 'Basic cyber hygiene',
        framework_type: 'cmmc_level_1',
        question_count: 17,
        estimated_time: '30 minutes',
        is_active: true
      }
    ],
    loading: false,
    error: null,
    createAssessment: vi.fn(),
    sendAssessment: vi.fn(),
    deleteAssessment: vi.fn(),
    getAssessmentProgress: () => 0,
    getAssessmentStats: () => ({
      total: 1,
      completed: 0,
      inProgress: 0,
      overdue: 0,
      averageScore: 0,
      completionRate: 0
    }),
    refetch: vi.fn().mockResolvedValue(undefined)
  })
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <I18nProvider>
        <ThemeProvider>
          <AuthProvider>
            {component}
          </AuthProvider>
        </ThemeProvider>
      </I18nProvider>
    </BrowserRouter>
  );
};

describe('VendorSecurityAssessments', () => {
  test('renders assessment dashboard', async () => {
    renderWithProviders(<VendorSecurityAssessments />);
    
    await waitFor(() => {
      expect(screen.getByText('Vendor Security Assessments')).toBeInTheDocument();
    });
    
    // Check for main heading
    expect(screen.getByText(/Send CMMC and NIST Privacy Framework assessments/i)).toBeInTheDocument();
  });

  test('shows create assessment button', () => {
    renderWithProviders(<VendorSecurityAssessments />);
    
    expect(screen.getByText('Create Assessment')).toBeInTheDocument();
  });

  test('displays assessment progress tracker', () => {
    renderWithProviders(<VendorSecurityAssessments />);
    
    // Use getAllByText since "In Progress" appears multiple times
    expect(screen.getAllByText('In Progress').length).toBeGreaterThan(0);
    // Check for specific text elements individually
    expect(screen.getByText('Completion Rate')).toBeInTheDocument();
    expect(screen.getByText('Avg Compliance Score')).toBeInTheDocument();
  });
});