/**
 * Button component tests
 */

import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { AuthProvider } from '../../context/AuthContext';
import { ThemeProvider } from '../../context/ThemeContext';
import { I18nProvider } from '../../context/I18nContext';
import Button from '../ui/Button';

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <I18nProvider>
      <ThemeProvider>
        <AuthProvider>{children}</AuthProvider>
      </ThemeProvider>
    </I18nProvider>
  </BrowserRouter>
);

describe('Button Component', () => {
  it('renders with children text', () => {
    render(
      <TestWrapper>
        <Button>Click me</Button>
      </TestWrapper>
    );
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(
      <TestWrapper>
        <Button onClick={handleClick}>Click me</Button>
      </TestWrapper>
    );
    
    const button = screen.getByText('Click me');
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies variant styles correctly', () => {
    const { rerender } = render(
      <TestWrapper>
        <Button variant="primary">Primary</Button>
      </TestWrapper>
    );
    let button = screen.getByText('Primary');
    expect(button).toHaveClass('bg-vendorsoluce-green');
    
    rerender(
      <TestWrapper>
        <Button variant="secondary">Secondary</Button>
      </TestWrapper>
    );
    button = screen.getByText('Secondary');
    expect(button).toHaveClass('bg-white');
    
    rerender(
      <TestWrapper>
        <Button variant="outline">Outline</Button>
      </TestWrapper>
    );
    button = screen.getByText('Outline');
    expect(button).toHaveClass('border-vendorsoluce-green');
  });

  it('disables button when disabled prop is true', () => {
    const handleClick = vi.fn();
    render(
      <TestWrapper>
        <Button disabled onClick={handleClick}>
          Disabled
        </Button>
      </TestWrapper>
    );
    
    const button = screen.getByText('Disabled');
    expect(button).toBeDisabled();
    
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('applies custom className', () => {
    render(
      <TestWrapper>
        <Button className="custom-class">Custom</Button>
      </TestWrapper>
    );
    
    const button = screen.getByText('Custom');
    expect(button).toHaveClass('custom-class');
  });

  it('handles different sizes', () => {
    const { rerender } = render(
      <TestWrapper>
        <Button size="sm">Small</Button>
      </TestWrapper>
    );
    let button = screen.getByRole('button', { name: 'Small' });
    expect(button).toHaveClass('px-3', 'py-1.5');
    
    rerender(
      <TestWrapper>
        <Button size="md">Medium</Button>
      </TestWrapper>
    );
    button = screen.getByRole('button', { name: 'Medium' });
    expect(button).toHaveClass('px-4', 'py-2');
    
    rerender(
      <TestWrapper>
        <Button size="lg">Large</Button>
      </TestWrapper>
    );
    button = screen.getByRole('button', { name: 'Large' });
    expect(button).toHaveClass('px-6', 'py-3');
  });

  it('supports standard aria attributes', () => {
    render(
      <TestWrapper>
        <Button 
          aria-label="Submit form"
          disabled
        >
          Submit
        </Button>
      </TestWrapper>
    );
    
    const button = screen.getByRole('button', { name: 'Submit form' });
    expect(button).toHaveAttribute('aria-label', 'Submit form');
    expect(button).toBeDisabled();
  });
});