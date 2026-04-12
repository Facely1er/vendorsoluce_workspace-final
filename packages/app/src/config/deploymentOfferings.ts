/**
 * Commercial deployment tracks: how the app runs and where tier limits are enforced.
 * Complements Stripe SKUs (tiers.ts) — copy for each track lives in i18n (`deployment.tracks.*`).
 */

export type DeploymentTrackId = 'standalone_no_backend' | 'client_backend' | 'custom_integration';

export const DEPLOYMENT_TRACK_IDS: DeploymentTrackId[] = [
  'standalone_no_backend',
  'client_backend',
  'custom_integration',
];
