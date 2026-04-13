import type { ReactNode } from 'react';
import { ThemeProvider } from 'shared/context/ThemeContext';
import { I18nProvider } from 'shared/context/I18nContext';
import ErrorBoundary from 'shared/components/common/ErrorBoundary';

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
