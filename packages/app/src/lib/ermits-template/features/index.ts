/**
 * Feature registry: activate features as needed per product.
 */

export {
  FEATURE_IDS,
  DEFAULT_FEATURES_BY_PRODUCT,
  getDefaultFeaturesForProduct,
  isFeatureEnabled,
} from './registry';
export type { FeatureId, FeatureFlags } from './registry';
