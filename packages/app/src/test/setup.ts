/**
 * Vitest test setup and configuration
 */

import '@testing-library/jest-dom';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Ensure fetch API is available for jsdom (fixes webidl-conversions error)
// This must be set up before jsdom initializes to prevent webidl-conversions errors
// Node.js 18+ has native fetch, but we need to ensure it's available globally

// Polyfill fetch if not available (for Node.js < 18 or when not available)
if (typeof global.fetch === 'undefined') {
  // Try to use native fetch from Node.js 18+
  try {
    // @ts-expect-error - fetch might be available but not typed
    if (typeof fetch !== 'undefined') {
      global.fetch = fetch as any;
    } else {
      throw new Error('fetch not available');
    }
  } catch {
    // Fallback: create a minimal fetch mock
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: () => Promise.resolve({}),
        text: () => Promise.resolve(''),
        blob: () => Promise.resolve(new Blob()),
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
        headers: {} as any,
        redirected: false,
        type: 'default' as Response['type'],
        url: '',
        clone: vi.fn(),
        body: null,
        bodyUsed: false,
      } as Response)
    ) as any;
  }
}

// Ensure Headers, Request, and Response are available globally
// These are required by jsdom's webidl-conversions
if (typeof global.Headers === 'undefined') {
  try {
    // @ts-expect-error - Headers might be available but not typed
    if (typeof Headers !== 'undefined') {
      global.Headers = Headers as any;
    } else {
      // Create a minimal Headers mock
      global.Headers = class {
        get = vi.fn(() => null);
        set = vi.fn();
        has = vi.fn(() => false);
        delete = vi.fn();
        append = vi.fn();
        forEach = vi.fn();
      } as any;
    }
  } catch {
    global.Headers = class {
      get = vi.fn(() => null);
      set = vi.fn();
      has = vi.fn(() => false);
      delete = vi.fn();
      append = vi.fn();
      forEach = vi.fn();
    } as any;
  }
}

if (typeof global.Request === 'undefined') {
  try {
    // @ts-expect-error - Request might be available but not typed
    if (typeof Request !== 'undefined') {
      global.Request = Request as any;
    } else {
      global.Request = class {} as any;
    }
  } catch {
    global.Request = class {} as any;
  }
}

if (typeof global.Response === 'undefined') {
  try {
    // @ts-expect-error - Response might be available but not typed
    if (typeof Response !== 'undefined') {
      global.Response = Response as any;
    } else {
      global.Response = class {} as any;
    }
  } catch {
    global.Response = class {} as any;
  }
}

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
globalThis.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
})) as any;

// Mock ResizeObserver
globalThis.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
})) as any;

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock Supabase client
vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null })),
      signInWithPassword: vi.fn(() => Promise.resolve({ data: { user: null, session: null }, error: null })),
      signInWithEmail: vi.fn(() => Promise.resolve({ data: { user: null, session: null }, error: null })),
      signUp: vi.fn(() => Promise.resolve({ data: { user: null, session: null }, error: null })),
      signOut: vi.fn(() => Promise.resolve({ error: null })),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null })),
          limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
        order: vi.fn(() => Promise.resolve({ data: [], error: null })),
      })),
      insert: vi.fn(() => Promise.resolve({ data: null, error: null })),
      update: vi.fn(() => Promise.resolve({ data: null, error: null })),
      delete: vi.fn(() => Promise.resolve({ data: null, error: null })),
    })),
  },
}));

// Mock environment variables
vi.stubEnv('VITE_SUPABASE_URL', 'https://test.supabase.co');
vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-anon-key');
vi.stubEnv('VITE_APP_ENV', 'test');
vi.stubEnv('VITE_APP_VERSION', '0.0.0-test');
// Keep auth gating tests stable (dev server defaults to ungated routes when unset).
vi.stubEnv('VITE_UNGATE_PROTECTED_ROUTES', 'false');

// Mock lazyWithRetry to work synchronously in tests
// This ensures dynamic imports work correctly in the test environment
vi.mock('../utils/lazyWithRetry', async () => {
  const actual = await vi.importActual('../utils/lazyWithRetry');
  const React = await import('react');
  return {
    ...actual,
    lazyWithRetry: (importFn: () => Promise<any>) => {
      // In tests, we want to load modules synchronously
      // So we use React.lazy directly without retry logic
      return React.lazy(importFn);
    },
  };
});