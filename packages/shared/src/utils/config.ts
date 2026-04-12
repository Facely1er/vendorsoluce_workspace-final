/**
 * Configuration management for the application
 */

interface AppConfig {
  supabase: {
    url: string;
    anonKey: string;
    /** True when VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set */
    enabled: boolean;
  };
  app: {
    env: string;
    version: string;
    name: string;
    isDemo: boolean;
    isTrial: boolean;
    demoMode: boolean;
    /** When true, app uses license key instead of Stripe (enterprise/on-premise build). */
    licenseMode: boolean;
    /** Marketing website URL for "Learn more" link (platform landing). e.g. https://www.vendorsoluce.com */
    websiteUrl: string;
    /**
     * When true, routes wrapped in ProtectedRoute render without auth (QA / full UI audit only).
     * Dev server: on by default; set VITE_UNGATE_PROTECTED_ROUTES=false to test sign-in flows.
     * Production build: only when VITE_UNGATE_PROTECTED_ROUTES=true (never on public production).
     */
    ungateProtectedRoutes: boolean;
    /** Optional URL for enterprise (on-premise) build download ZIP. If set, Downloads page shows a direct download link. */
    enterpriseDownloadUrl: string;
    /**
     * TechnoSoluce™ SBOM entry URL (funnel from VendorSoluce nav). Set VITE_TECHNOSOLUCE_SBOM_URL or VITE_TECHNOSOLUCE_URL.
     */
    technoSoluceSbomUrl: string;
  };
  api: {
    baseUrl: string;
    timeout: number;
    retries: number;
  };
  vendorPortal: {
    domain: string;
    url: string;
  };
  features: {
    vendorAssessments: boolean;
    advancedAnalytics: boolean;
    performanceMonitoring: boolean;
  };
  analytics: {
    gaId?: string;
    enabled: boolean;
  };
  rateLimiting: {
    maxRequests: number;
    windowMs: number;
  };
}

// Get environment variables - SECURITY: No hardcoded fallbacks
// All credentials must be provided via environment variables
const _getEnvVar = (key: string, defaultValue?: string): string => {
  const value = import.meta.env[key];
  return value || defaultValue || '';
};

// Optional env vars (never throw; used for Supabase when app is deployed without backend)
const getOptionalEnvVar = (key: string): string => {
  const value = _getEnvVar(key);
  if (import.meta.env.DEV && !value) {
    console.warn(`⚠️  Optional env ${key} not set. Set in .env.local for auth/data features.`);
  }
  return value;
};

// Supabase configuration - OPTIONAL for deployments that don't use auth (e.g. marketing-only)
// When missing, the app loads; auth and Supabase-backed features will not work until vars are set.
const SUPABASE_URL = getOptionalEnvVar('VITE_SUPABASE_URL').trim();
const SUPABASE_ANON_KEY = getOptionalEnvVar('VITE_SUPABASE_ANON_KEY').trim();
const hasSupabase = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
if (!hasSupabase && import.meta.env.PROD) {
  console.warn('VendorSoluce: Supabase not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY for auth and data.');
}
if (import.meta.env.DEV && typeof window !== 'undefined') {
  console.debug(
    'VendorSoluce Supabase:',
    hasSupabase ? 'enabled' : 'disabled',
    hasSupabase ? `(URL: ${SUPABASE_URL.slice(0, 30)}...)` : `(VITE_SUPABASE_URL=${!!SUPABASE_URL}, VITE_SUPABASE_ANON_KEY=${!!SUPABASE_ANON_KEY}). Restart dev server after changing .env.local.`
  );
}

// Detect demo/trial mode
const appEnv = import.meta.env.VITE_APP_ENV || 'development';
const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
const isDemo = appEnv === 'demo' || hostname.includes('demo.') || hostname.includes('trial.');
const isTrial = appEnv === 'trial' || hostname.includes('trial.');

/** When true, bypasses Supabase auth and uses a mock user for demo/testing. Set VITE_DEMO_MODE=true */
export const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';

const ungateExplicitTrue = import.meta.env.VITE_UNGATE_PROTECTED_ROUTES === 'true';
const ungateExplicitFalse = import.meta.env.VITE_UNGATE_PROTECTED_ROUTES === 'false';
/** Open protected routes + full dashboard previews without sign-in (see AppConfig.app.ungateProtectedRoutes). */
const ungateProtectedRoutes =
  ungateExplicitTrue || (import.meta.env.DEV && !ungateExplicitFalse);

export const config: AppConfig = {
  supabase: {
    url: SUPABASE_URL,
    anonKey: SUPABASE_ANON_KEY,
    enabled: hasSupabase,
  },
  app: {
    env: appEnv,
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    name: isDemo || isDemoMode ? 'VendorSoluce (Demo)' : 'VendorSoluce',
    isDemo,
    isTrial,
    demoMode: isDemoMode,
    licenseMode: import.meta.env.VITE_LICENSE_MODE === 'true',
    websiteUrl: import.meta.env.VITE_WEBSITE_URL || 'https://www.vendorsoluce.com',
    enterpriseDownloadUrl: getOptionalEnvVar('VITE_ENTERPRISE_DOWNLOAD_URL'),
    ungateProtectedRoutes,
    technoSoluceSbomUrl:
      getOptionalEnvVar('VITE_TECHNOSOLUCE_SBOM_URL').trim() ||
      getOptionalEnvVar('VITE_TECHNOSOLUCE_URL').trim() ||
      '',
  },
  vendorPortal: {
    domain: import.meta.env.VITE_VENDOR_PORTAL_DOMAIN || 'portal.vendorsoluce.com',
    url: import.meta.env.VITE_VENDOR_PORTAL_URL || 'https://www.portal.vendorsoluce.com',
  },
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'https://api.vendorsoluce.com',
    timeout: 30000,
    retries: 3,
  },
  features: {
    vendorAssessments: import.meta.env.VITE_ENABLE_VENDOR_ASSESSMENTS === 'true',
    advancedAnalytics: import.meta.env.VITE_ENABLE_ADVANCED_ANALYTICS === 'true',
    performanceMonitoring: import.meta.env.PROD && !isDemo,
  },
  analytics: {
    gaId: import.meta.env.VITE_GA_MEASUREMENT_ID,
    enabled: (import.meta.env.PROD || isDemo) && !!import.meta.env.VITE_GA_MEASUREMENT_ID,
  },
  rateLimiting: {
    maxRequests: parseInt(import.meta.env.VITE_API_RATE_LIMIT || (isDemo ? '50' : '100'), 10) || (isDemo ? 50 : 100),
    windowMs: parseInt(import.meta.env.VITE_API_RATE_WINDOW || '60000', 10) || 60000,
  },
};

// Expose config in development for debugging
if (import.meta.env.DEV && typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).__APP_CONFIG__ = config;
}