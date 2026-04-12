import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import { ThemeProvider } from '../../context/ThemeContext';
import { I18nProvider } from '../../context/I18nContext';
import Contact from '../../pages/public/Contact';
import { supabase } from '../../lib/supabase';

// Mock Supabase - must include isSupabaseEnabled for AuthProvider
vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null })),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
    functions: {
      invoke: vi.fn().mockResolvedValue({ error: null }),
    },
  },
  isSupabaseEnabled: () => true,
}));

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

describe('Contact', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(supabase.functions.invoke).mockResolvedValue({ error: null });
  });

  it('renders contact page correctly', () => {
    render(
      <TestWrapper>
        <Contact />
      </TestWrapper>
    );

    expect(screen.getByText('Contact Us')).toBeInTheDocument();
    expect(screen.getByText(/We're here to help you secure your supply chain/)).toBeInTheDocument();
  });

  it('shows contact form with Get in Touch heading', () => {
    render(
      <TestWrapper>
        <Contact />
      </TestWrapper>
    );

    expect(screen.getByText('Get in Touch')).toBeInTheDocument();
    expect(screen.getByLabelText(/First Name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Last Name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Message/)).toBeInTheDocument();
  });

  it('displays form submission button', () => {
    render(
      <TestWrapper>
        <Contact />
      </TestWrapper>
    );

    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
  });

  it('calls Supabase contact-form edge function on valid submission', async () => {
    render(
      <TestWrapper>
        <Contact />
      </TestWrapper>
    );

    fireEvent.change(screen.getByLabelText(/First Name/), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/Last Name/), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText(/Email Address/), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/Message/), { target: { value: 'Test message' } });
    fireEvent.click(screen.getByLabelText(/I agree to the/));

    const submitButton = screen.getByRole('button', { name: 'Submit' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(supabase.functions.invoke).toHaveBeenCalledWith('contact-form', expect.objectContaining({
        body: expect.objectContaining({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          message: 'Test message',
        }),
      }));
    });
  });

  it('displays contact information sidebar', () => {
    render(
      <TestWrapper>
        <Contact />
      </TestWrapper>
    );

    expect(screen.getByText('Contact Information')).toBeInTheDocument();
    expect(screen.getByText('contact@ermits.com')).toBeInTheDocument();
    expect(screen.getByText('+1 (240) 599-0102')).toBeInTheDocument();
  });
});
