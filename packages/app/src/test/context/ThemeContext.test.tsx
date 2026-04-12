import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ThemeProvider } from '../../context/ThemeContext';
import { useTheme } from '../../context/ThemeContext';

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>
    {children}
  </ThemeProvider>
);

describe('ThemeContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(localStorage.getItem).mockReturnValue(null);
    document.documentElement.classList.remove('dark');
  });

  it('provides theme context with default light theme', () => {
    const TestComponent = () => {
      const { theme } = useTheme();
      return <div data-testid="theme">{theme}</div>;
    };

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    expect(screen.getByTestId('theme')).toHaveTextContent('light');
  });

  it('toggles theme from light to dark', () => {
    const TestComponent = () => {
      const { theme, toggleTheme } = useTheme();
      return (
        <div>
          <div data-testid="theme">{theme}</div>
          <button onClick={toggleTheme} data-testid="toggle-btn">
            Toggle Theme
          </button>
        </div>
      );
    };

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    expect(screen.getByTestId('theme')).toHaveTextContent('light');

    const toggleButton = screen.getByTestId('toggle-btn');
    fireEvent.click(toggleButton);

    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
  });

  it('toggles theme from dark to light', () => {
    const TestComponent = () => {
      const { theme, toggleTheme } = useTheme();
      return (
        <div>
          <div data-testid="theme">{theme}</div>
          <button onClick={toggleTheme} data-testid="toggle-btn">
            Toggle Theme
          </button>
        </div>
      );
    };

    vi.mocked(localStorage.getItem).mockReturnValue('dark');

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    expect(screen.getByTestId('theme')).toHaveTextContent('dark');

    const toggleButton = screen.getByTestId('toggle-btn');
    fireEvent.click(toggleButton);

    expect(screen.getByTestId('theme')).toHaveTextContent('light');
  });

  it('persists theme preference in localStorage', () => {
    const TestComponent = () => {
      const { theme, toggleTheme } = useTheme();
      return (
        <div>
          <div data-testid="theme">{theme}</div>
          <button onClick={toggleTheme} data-testid="toggle-btn">
            Toggle Theme
          </button>
        </div>
      );
    };

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    const toggleButton = screen.getByTestId('toggle-btn');
    fireEvent.click(toggleButton);

    expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'dark');
  });

  it('applies dark class to document when theme is dark', () => {
    const TestComponent = () => {
      const { toggleTheme } = useTheme();
      return (
        <button onClick={toggleTheme} data-testid="toggle-btn">
          Toggle Theme
        </button>
      );
    };

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    const toggleButton = screen.getByTestId('toggle-btn');
    fireEvent.click(toggleButton);

    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('removes dark class from document when theme is light', () => {
    const TestComponent = () => {
      const { toggleTheme } = useTheme();
      return (
        <button onClick={toggleTheme} data-testid="toggle-btn">
          Toggle Theme
        </button>
      );
    };

    vi.mocked(localStorage.getItem).mockReturnValue('dark');
    document.documentElement.classList.add('dark');

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    const toggleButton = screen.getByTestId('toggle-btn');
    fireEvent.click(toggleButton);

    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('uses system preference when no saved preference exists', () => {
    // Mock system preference
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    const TestComponent = () => {
      const { theme } = useTheme();
      return <div data-testid="theme">{theme}</div>;
    };

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
  });
});

