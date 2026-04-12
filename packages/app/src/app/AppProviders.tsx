import type { ReactNode } from 'react';
import { AuthProvider } from '../context/AuthContext';
import { SubscriptionProvider } from '../context/SubscriptionContext';
import { ThemeProvider } from '../context/ThemeContext';
import { I18nProvider } from '../context/I18nContext';
import { ChatbotProvider } from '../components/chatbot/ChatbotProvider';
import ErrorBoundary from '../components/common/ErrorBoundary';

interface AppProvidersProps {
  children: ReactNode;
}

export default function AppProviders({ children }: AppProvidersProps) {
  return (
    <I18nProvider>
      <ThemeProvider>
        <ErrorBoundary>
          <AuthProvider>
            <SubscriptionProvider>
              <ChatbotProvider>{children}</ChatbotProvider>
            </SubscriptionProvider>
          </AuthProvider>
        </ErrorBoundary>
      </ThemeProvider>
    </I18nProvider>
  );
}
