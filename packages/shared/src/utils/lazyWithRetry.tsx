import React, { lazy, ComponentType } from 'react';
import { logger } from './logger';

const RELOAD_GUARD_KEY = 'vendorsoluce:lazy-reload-attempted';

function isRecoverableLazyLoadError(error: Error): boolean {
  const message = error.message.toLowerCase();
  return (
    message.includes('failed to fetch dynamically imported module') ||
    message.includes('error loading dynamically imported module') ||
    message.includes('importing a module script failed') ||
    message.includes('loading chunk') ||
    message.includes('chunkloaderror')
  );
}

/**
 * Creates a lazy-loaded component with retry logic for failed dynamic imports.
 * This helps handle network issues, incorrect base paths, or temporary failures.
 * 
 * @param importFn - Function that returns a dynamic import promise
 * @param retries - Number of retry attempts (default: 3)
 * @param retryDelay - Delay between retries in milliseconds (default: 1000)
 * @returns Lazy-loaded React component
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  retries: number = 3,
  retryDelay: number = 1000
): React.LazyExoticComponent<T> {
  return lazy(async () => {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const module = await importFn();
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem(RELOAD_GUARD_KEY);
        }
        return module;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        // Log the error for debugging
        logger.warn(`Dynamic import failed (attempt ${attempt}/${retries}):`, {
          error: lastError.message,
          stack: lastError.stack,
          url: typeof window !== 'undefined' ? window.location.href : 'server-side',
        });

        // If this is the last attempt, throw the error
        if (attempt === retries) {
          // One-time hard reload to recover from stale hashed chunks after deployments.
          if (
            typeof window !== 'undefined' &&
            isRecoverableLazyLoadError(lastError)
          ) {
            const hasReloaded = sessionStorage.getItem(RELOAD_GUARD_KEY) === '1';
            if (!hasReloaded) {
              sessionStorage.setItem(RELOAD_GUARD_KEY, '1');
              logger.warn('Recoverable lazy-load failure detected. Reloading page once.', {
                error: lastError.message,
                url: window.location.href,
              });
              window.location.reload();
              return new Promise(() => {});
            }
          }

          // Enhance error message with helpful context
          const enhancedError = new Error(
            `Failed to load module after ${retries} attempts. ` +
            `Original error: ${lastError.message}. ` +
            `This may be due to network issues, incorrect base path configuration, or missing build files. ` +
            `Please check your network connection and try refreshing the page.`
          );
          enhancedError.stack = lastError.stack;
          throw enhancedError;
        }

        // Wait before retrying (exponential backoff)
        const delay = retryDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    // This should never be reached, but TypeScript needs it
    throw lastError || new Error('Failed to load module');
  });
}

