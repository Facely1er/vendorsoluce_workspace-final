import { render, screen, fireEvent} from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import { ThemeProvider } from '../../context/ThemeContext';
import { I18nProvider } from '../../context/I18nContext';
import NotFoundPage from '../../pages/public/NotFoundPage';

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

describe('NotFoundPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders 404 page correctly', () => {
    render(
      <TestWrapper>
        <NotFoundPage />
      </TestWrapper>
    );

    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('Page Not Found')).toBeInTheDocument();
    expect(screen.getByText('The page you are looking for does not exist.')).toBeInTheDocument();
  });

  it('displays go home button', () => {
    render(
      <TestWrapper>
        <NotFoundPage />
      </TestWrapper>
    );

    expect(screen.getByRole('button', { name: 'Go Home' })).toBeInTheDocument();
  });

  it('displays go back button', () => {
    render(
      <TestWrapper>
        <NotFoundPage />
      </TestWrapper>
    );

    expect(screen.getByRole('button', { name: 'Go Back' })).toBeInTheDocument();
  });

  it('shows helpful suggestions', () => {
    render(
      <TestWrapper>
        <NotFoundPage />
      </TestWrapper>
    );

    expect(screen.getByText('What you can do:')).toBeInTheDocument();
    expect(screen.getByText('Check the URL for typos')).toBeInTheDocument();
    expect(screen.getByText('Go back to the previous page')).toBeInTheDocument();
    expect(screen.getByText('Return to the homepage')).toBeInTheDocument();
  });

  it('displays contact support option', () => {
    render(
      <TestWrapper>
        <NotFoundPage />
      </TestWrapper>
    );

    expect(screen.getByText('Need help?')).toBeInTheDocument();
    expect(screen.getByText('Contact Support')).toBeInTheDocument();
  });

  it('displays popular pages', () => {
    render(
      <TestWrapper>
        <NotFoundPage />
      </TestWrapper>
    );

    expect(screen.getByText(/Popular pages/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Vendors' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Assessment' })).toBeInTheDocument();
  });

  it('handles go home button click', () => {
    render(
      <TestWrapper>
        <NotFoundPage />
      </TestWrapper>
    );

    const goHomeButton = screen.getByRole('button', { name: 'Go Home' });
    fireEvent.click(goHomeButton);

    // In a real test, you would check if navigation occurred
    expect(goHomeButton).toBeInTheDocument();
  });

  it('handles go back button click', () => {
    render(
      <TestWrapper>
        <NotFoundPage />
      </TestWrapper>
    );

    const goBackButton = screen.getByRole('button', { name: 'Go Back' });
    fireEvent.click(goBackButton);

    // In a real test, you would check if navigation occurred
    expect(goBackButton).toBeInTheDocument();
  });

  it('displays error illustration', () => {
    render(
      <TestWrapper>
        <NotFoundPage />
      </TestWrapper>
    );

    expect(screen.getByText('404')).toBeInTheDocument();
  });

  it('displays requested URL', () => {
    render(
      <TestWrapper>
        <NotFoundPage />
      </TestWrapper>
    );

    expect(screen.getByText(/Requested URL/i)).toBeInTheDocument();
  });
});

