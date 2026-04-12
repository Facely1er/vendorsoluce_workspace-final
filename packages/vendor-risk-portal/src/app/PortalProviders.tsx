import type { ReactNode } from 'react';
import { ThemeProvider } from '../context/ThemeContext';
import { I18nProvider } from '../context/I18nContext';
import ErrorBoundary from '../components/common/ErrorBoundary';

interface PortalProvidersProps {
  children: ReactNode;
}

export default function PortalProviders({ children }: PortalProvidersProps) {
  return (
    <I18nProvider>
      <ThemeProvider>
        <ErrorBoundary>{children}</ErrorBoundary>
      </ThemeProvider>
    </I18nProvider>
  );
}
