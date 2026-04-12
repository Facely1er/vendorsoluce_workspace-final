/**
 * Suggested destination route or workflow entry point after onboarding, by primary use case.
 * Products can override or extend; this provides a template default so workflow aligns with client choice.
 */

import type { PrimaryUseCase } from '../types/onboarding';

const DESTINATIONS: Record<string, string> = {
  cmmc: '/dashboard/cmmc-assessment',
  fisma: '/dashboard/fisma-assessment',
  'nist-csf': '/dashboard/assessment',
  'vendor-risk': '/dashboard/supply-chain/vendors',
  ransomware: '/assessments/ransomware',
  privacy: '/dashboard/privacy-assessment',
  both: '/dashboard/cmmc-assessment',
};

const DEFAULT = '/dashboard';

/**
 * Returns the suggested route or workflow entry point after onboarding for the given use case.
 * Implementations (CyberCaution, CyberCorrect, VendorSoluce, AssetManager) may map to their own paths.
 */
export function getOnboardingDestination(useCase: PrimaryUseCase | null): string {
  if (!useCase) return DEFAULT;
  return DESTINATIONS[useCase] ?? DEFAULT;
}
