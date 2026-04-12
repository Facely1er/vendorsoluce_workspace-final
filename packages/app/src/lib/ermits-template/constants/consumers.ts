/**
 * Consumer product IDs that use this template.
 * Use when routing framework data or feature flags per product.
 */

export const CONSUMER_IDS = {
  CYBERCAUTION: 'cybercaution',
  CYBERCORRECT: 'cybercorrect',
  VENDORSOLUCE: 'vendorsoluce',
  ASSET_MANAGER: 'asset-manager',
} as const;

export type ConsumerId = (typeof CONSUMER_IDS)[keyof typeof CONSUMER_IDS];
