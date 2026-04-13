import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '../../context/ThemeContext';
import { I18nProvider } from '../../context/I18nContext';
import Contact from '../../pages/public/Contact';

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <I18nProvider>
      <ThemeProvider>{children}</ThemeProvider>
    </I18nProvider>
  </BrowserRouter>
);

describe('Contact', () => {
  const replace = vi.fn();
  const assign = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('location', {
      ...window.location,
      replace,
      assign,
      href: 'http://localhost/contact',
    } as Location);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders redirect messaging and triggers location.replace to marketing contact URL', () => {
    render(
      <TestWrapper>
        <Contact />
      </TestWrapper>
    );

    expect(screen.getByRole('heading', { name: 'Contact Us' })).toBeInTheDocument();
    expect(screen.getByText(/Redirecting you to the VendorSoluce contact page/)).toBeInTheDocument();
    expect(replace).toHaveBeenCalledWith('https://www.vendorsoluce.com/contact');
  });

  it('Go to contact page button uses location.assign with the same URL', () => {
    render(
      <TestWrapper>
        <Contact />
      </TestWrapper>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Go to contact page' }));
    expect(assign).toHaveBeenCalledWith('https://www.vendorsoluce.com/contact');
  });
});
