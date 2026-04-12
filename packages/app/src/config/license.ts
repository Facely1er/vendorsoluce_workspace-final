/**
 * License (enterprise) build configuration.
 * Re-exports tier definitions so enterprise build does not import Stripe.
 * Use when VITE_LICENSE_MODE === 'true'.
 */

export {
  PRODUCTS,
  FEATURE_FLAGS,
  canAccessFeature,
  getUsageLimit,
  type TierKey,
  type TierLimits,
  type TierProduct,
} from './tiers';

export function isLicenseMode(): boolean {
  return import.meta.env.VITE_LICENSE_MODE === 'true';
}
