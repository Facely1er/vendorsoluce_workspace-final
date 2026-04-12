/**
 * Framework registry: NIST standards that feed CyberCorrect, CyberCaution, VendorSoluce, AssetManager.
 * Implementations load by standardId or frameworkId and extend with product-specific data.
 */

import type { Framework } from '../types/framework';
import type { NISTStandardId } from '../types/framework';

/** Placeholder frameworks — each product can replace with full control sets (e.g. from AssetManager cmmc.ts, nist80053.ts). */
export const FRAMEWORK_IDS = {
  NIST_CSF_2: 'nist-csf-2',
  NIST_800_53: 'nist-800-53',
  CMMC_V2: 'cmmc-v2',
  FISMA: 'fisma',
} as const;

export function getFrameworkPlaceholder(standardId: NISTStandardId): Framework {
  const id = standardId;
  const name =
    id === FRAMEWORK_IDS.NIST_CSF_2
      ? 'NIST CSF 2.0'
      : id === FRAMEWORK_IDS.NIST_800_53
        ? 'NIST 800-53'
        : id === FRAMEWORK_IDS.CMMC_V2
          ? 'CMMC v2'
          : id === FRAMEWORK_IDS.FISMA
            ? 'FISMA (NIST 800-53 baseline)'
            : 'Custom Framework';
  return {
    id,
    name,
    description: `Framework definition for ${name}. Load full controls from your implementation (e.g. AssetManager frameworks).`,
    version: '1.0.0',
    standardId: id,
    sections: [],
  };
}

export function listStandardIds(): NISTStandardId[] {
  return [FRAMEWORK_IDS.NIST_CSF_2, FRAMEWORK_IDS.NIST_800_53, FRAMEWORK_IDS.CMMC_V2, FRAMEWORK_IDS.FISMA];
}
