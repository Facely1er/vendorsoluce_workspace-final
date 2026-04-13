/**
 * Production Environment Configuration Validator
 * 
 * This utility validates that all required environment variables are properly
 * configured before the application starts, preventing runtime errors.
 */

import { logger } from './monitoring';

interface EnvironmentVariable {
  key: string;
  required: boolean;
  description: string;
  validator?: (value: string) => boolean;
  errorMessage?: string;
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  missingRequired: string[];
  missingOptional: string[];
}

const ENVIRONMENT_VARIABLES: EnvironmentVariable[] = [
  // Supabase optional - app can run without it (e.g. marketing-only deploy)
  {
    key: 'VITE_SUPABASE_URL',
    required: false,
    description: 'Supabase project URL (required for auth/data)',
    validator: (value: string) => !value || (value.startsWith('https://') && value.includes('.supabase.co')),
    errorMessage: 'Must be a valid Supabase URL (https://xxx.supabase.co)'
  },
  {
    key: 'VITE_SUPABASE_ANON_KEY',
    required: false,
    description: 'Supabase anonymous/public key (required for auth/data)',
    validator: (value: string) => !value || value.length > 50,
    errorMessage: 'Must be a valid Supabase anon key'
  },

  // Optional variables
  {
    key: 'VITE_APP_ENV',
    required: false,
    description: 'Application environment (development, staging, production)',
    validator: (value: string) => ['development', 'staging', 'production'].includes(value),
    errorMessage: 'Must be one of: development, staging, production'
  },
  {
    key: 'VITE_APP_VERSION',
    required: false,
    description: 'Application version number'
  },
  {
    key: 'VITE_API_BASE_URL',
    required: false,
    description: 'API base URL for backend services',
    validator: (value: string) => value.startsWith('https://'),
    errorMessage: 'Must be a valid HTTPS URL'
  },
  {
    key: 'VITE_API_RATE_LIMIT',
    required: false,
    description: 'Maximum API requests per time window',
    validator: (value: string) => !isNaN(parseInt(value)) && parseInt(value) > 0,
    errorMessage: 'Must be a positive integer'
  },
  {
    key: 'VITE_API_RATE_WINDOW',
    required: false,
    description: 'API rate limit time window in milliseconds',
    validator: (value: string) => !isNaN(parseInt(value)) && parseInt(value) > 0,
    errorMessage: 'Must be a positive integer'
  },
  {
    key: 'VITE_ENABLE_VENDOR_ASSESSMENTS',
    required: false,
    description: 'Enable vendor assessments feature (true/false)',
    validator: (value: string) => ['true', 'false'].includes(value.toLowerCase()),
    errorMessage: 'Must be "true" or "false"'
  },
  {
    key: 'VITE_ENABLE_ADVANCED_ANALYTICS',
    required: false,
    description: 'Enable advanced analytics feature (true/false)',
    validator: (value: string) => ['true', 'false'].includes(value.toLowerCase()),
    errorMessage: 'Must be "true" or "false"'
  },
  {
    key: 'VITE_GA_MEASUREMENT_ID',
    required: false,
    description: 'Google Analytics measurement ID',
    validator: (value: string) => value.startsWith('G-') || value.startsWith('UA-'),
    errorMessage: 'Must be a valid Google Analytics ID (G-XXXXXXXXXX or UA-XXXXXXXXX-X)'
  },
  {
    key: 'VITE_SENTRY_DSN',
    required: false,
    description: 'Sentry DSN for error tracking',
    validator: (value: string) => value.startsWith('https://') && value.includes('sentry.io'),
    errorMessage: 'Must be a valid Sentry DSN URL'
  },
  {
    key: 'VITE_STRIPE_PUBLISHABLE_KEY',
    required: false,
    description: 'Stripe publishable key for payments',
    validator: (value: string) => value.startsWith('pk_'),
    errorMessage: 'Must be a valid Stripe publishable key (starts with pk_)'
  }
];

/**
 * Validate all environment variables
 */
export function validateEnvironment(): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
    missingRequired: [],
    missingOptional: []
  };

  for (const envVar of ENVIRONMENT_VARIABLES) {
    const value = import.meta.env[envVar.key];

    // Check if variable exists
    if (!value || value === '') {
      if (envVar.required) {
        result.missingRequired.push(envVar.key);
        result.errors.push(
          `❌ Missing required environment variable: ${envVar.key} - ${envVar.description}`
        );
        result.valid = false;
      } else {
        result.missingOptional.push(envVar.key);
        result.warnings.push(
          `⚠️  Optional environment variable not set: ${envVar.key} - ${envVar.description}`
        );
      }
      continue;
    }

    // Validate value if validator exists
    if (envVar.validator) {
      try {
        const isValid = envVar.validator(value);
        if (!isValid) {
          const errorMsg = envVar.errorMessage || 'Invalid value';
          if (envVar.required) {
            result.errors.push(`❌ Invalid ${envVar.key}: ${errorMsg}`);
            result.valid = false;
          } else {
            result.warnings.push(`⚠️  Invalid ${envVar.key}: ${errorMsg}`);
          }
        }
      } catch (error) {
        result.errors.push(`❌ Error validating ${envVar.key}: ${error}`);
        result.valid = false;
      }
    }
  }

  return result;
}

/**
 * Print validation results to console
 */
export function printValidationResults(result: ValidationResult): void {
  // [removed console.log]
  // [removed console.log]

  if (result.valid) {
    // [removed console.log]
  } else {
    // [removed console.log]
  }

  // Print errors
  if (result.errors.length > 0) {
    // [removed console.log]
    result.errors.forEach(_error => { /* [removed console.log] */ });
  }

  // Print warnings
  if (result.warnings.length > 0) {
    // [removed console.log]
    result.warnings.forEach(_warning => { /* [removed console.log] */ });
  }

  // Print summary
  // [removed console.log]
  // [removed console.log]
  // [removed console.log]
  
  // [removed console.log]
  // [removed console.log]
}

/**
 * Validate environment on application startup (production only)
 */
export function validateProductionEnvironment(): void {
  // Only validate in production
  if (import.meta.env.DEV) {
    logger.info('Environment validation skipped in development mode');
    return;
  }

  const result = validateEnvironment();
  
  // Log results
  if (result.errors.length > 0) {
    logger.error('Environment validation failed', {
      errors: result.errors,
      warnings: result.warnings
    });
  } else if (result.warnings.length > 0) {
    logger.warn('Environment validation passed with warnings', {
      warnings: result.warnings
    });
  } else {
    logger.info('Environment validation passed successfully');
  }

  // In production, fail fast if required variables are missing
  if (!result.valid && import.meta.env.PROD) {
    console.error('\n❌ FATAL: Missing required environment variables');
    console.error('Application cannot start without proper configuration\n');
    printValidationResults(result);
    throw new Error('Environment validation failed - missing required variables');
  }

  // Print results in development or if there are warnings
  if (import.meta.env.DEV || result.warnings.length > 0) {
    printValidationResults(result);
  }
}

/**
 * Check if a specific feature is enabled via environment variable
 */
export function isFeatureEnabled(featureName: string): boolean {
  const envKey = `VITE_ENABLE_${featureName.toUpperCase()}`;
  const value = import.meta.env[envKey];
  return value === 'true' || value === true;
}

/**
 * Get environment variable with fallback
 */
export function getEnvVar(key: string, fallback: string = ''): string {
  return import.meta.env[key] || fallback;
}

/**
 * Check if running in production
 */
export function isProduction(): boolean {
  return import.meta.env.PROD || import.meta.env.VITE_APP_ENV === 'production';
}

/**
 * Check if running in staging
 */
export function isStaging(): boolean {
  return import.meta.env.VITE_APP_ENV === 'staging';
}

/**
 * Check if running in development
 */
export function isDevelopment(): boolean {
  return import.meta.env.DEV || import.meta.env.VITE_APP_ENV === 'development';
}

// Export environment info for debugging
export const environmentInfo = {
  nodeEnv: import.meta.env.MODE,
  appEnv: import.meta.env.VITE_APP_ENV || 'development',
  version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  isProduction: isProduction(),
  isStaging: isStaging(),
  isDevelopment: isDevelopment()
};
