/**
 * Sentry error monitoring configuration
 */

import * as Sentry from '@sentry/react';

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;
const APP_ENV = import.meta.env.VITE_APP_ENV || 'development';
const APP_VERSION = import.meta.env.VITE_APP_VERSION || '0.1.0';

export function initSentry() {
  // Only initialize in production or if DSN is provided
  if (!SENTRY_DSN) {
    console.info('Sentry not initialized: No DSN provided');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: APP_ENV,
    release: `vendorsoluce@${APP_VERSION}`,
    integrations: [
      Sentry.browserTracingIntegration({
        tracePropagationTargets: ['localhost', 'vendorsoluce.com', 'portal.vendorsoluce.com', /^\//],
      } as Record<string, unknown>),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
    tracesSampleRate: APP_ENV === 'production' ? 0.1 : 1.0,
    beforeSend(event, hint) {
      if (event.exception) {
        const error = hint.originalException as Error | undefined;
        if (APP_ENV === 'development' && error?.name === 'NetworkError') {
          return null;
        }
        if (error?.name === 'AbortError') {
          return null;
        }
        
        // Filter out certain URLs
        if (event.request?.url?.includes('/health')) {
          return null;
        }
      }
      
      // Remove sensitive data
      if (event.request) {
        delete event.request.cookies;
        delete event.request.headers?.authorization;
      }
      
      return event;
    },
    
    // User feedback
    beforeSendTransaction(event) {
      if (event.transaction?.includes('/health')) {
        return null;
      }
      return event;
    },
  });

  // Set initial user context
  Sentry.setContext('app', {
    version: APP_VERSION,
    environment: APP_ENV,
  });
  
  console.info('Sentry initialized successfully');
}

// Helper functions for manual error capturing
export const captureError = (error: Error, context?: any) => {
  // Sentry will handle error logging, but we also log to console for development
  if (import.meta.env.DEV) {
    console.error('Application error:', error);
  }
  Sentry.captureException(error, {
    contexts: {
      custom: context,
    },
  });
};

export const captureMessage = (message: string, level: Sentry.SeverityLevel = 'info') => {
  Sentry.captureMessage(message, level);
};

export const setUserContext = (user: { id: string; email?: string }) => {
  Sentry.setUser({
    id: user.id,
    email: user.email,
  });
};

export const clearUserContext = () => {
  Sentry.setUser(null);
};

export const addBreadcrumb = (breadcrumb: {
  message: string;
  category?: string;
  level?: Sentry.SeverityLevel;
  data?: any;
}) => {
  Sentry.addBreadcrumb(breadcrumb);
};

// Export function as reportError for compatibility
export const reportError = captureError;

// Error boundary component
export const SentryErrorBoundary = Sentry.ErrorBoundary;

// Profiler component for performance monitoring
export const SentryProfiler = Sentry.Profiler;

export default {
  init: initSentry,
  captureError,
  captureMessage,
  setUserContext,
  clearUserContext,
  addBreadcrumb,
  reportError,
  ErrorBoundary: SentryErrorBoundary,
  Profiler: SentryProfiler,
};