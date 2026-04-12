/**
 * License key validation and storage for enterprise (on-premise) builds.
 * No Stripe dependency. License stored in localStorage after validation.
 */

import type { TierKey } from '../config/tiers';
import { isLicenseMode } from '../config/license';
import { logger } from '../utils/logger';

const STORAGE_KEY = 'vs_license';

export interface LicensePayload {
  /** Tier: starter | professional | enterprise | federal */
  t: TierKey;
  /** Expiry timestamp (ms). Optional; if missing, license never expires. */
  exp?: number;
  /** Max user seats. Optional; -1 or missing = unlimited. */
  seats?: number;
}

export interface License {
  tier: TierKey;
  expiry: number | null;
  seats: number;
  /** Original key (masked) for display */
  keyPreview: string;
}

function getStoredLicense(): License | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as License;
  } catch {
    return null;
  }
}

function setStoredLicense(license: License, rawKey: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(license));
    localStorage.setItem(STORAGE_KEY + '_key', rawKey);
  } catch (e) {
    logger.error('Failed to store license', e);
  }
}

function clearStoredLicense(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_KEY + '_key');
  } catch {
    // ignore
  }
}

/**
 * Decode and validate a license key.
 * Key format: base64url(JSON.stringify({ t, exp?, seats? })).
 * In production you would verify a signature or call a license server.
 */
export function validateLicenseKey(key: string): { valid: true; license: License } | { valid: false; error: string } {
  key = key.trim();
  if (!key) {
    return { valid: false, error: 'License key is required.' };
  }

  try {
    const decoded = atob(key.replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(decoded) as LicensePayload;
    if (!payload || typeof payload.t !== 'string') {
      return { valid: false, error: 'Invalid license key format.' };
    }

    const tier = payload.t as TierKey;
    const validTiers: TierKey[] = ['starter', 'professional', 'enterprise', 'federal'];
    if (!validTiers.includes(tier)) {
      return { valid: false, error: `Unknown tier: ${tier}.` };
    }

    const now = Date.now();
    if (payload.exp != null && payload.exp < now) {
      return { valid: false, error: 'License has expired.' };
    }

    const seats = payload.seats != null && payload.seats >= 0 ? payload.seats : -1;
    const keyPreview = key.length > 12 ? `${key.slice(0, 6)}…${key.slice(-4)}` : '••••••';

    const license: License = {
      tier,
      expiry: payload.exp ?? null,
      seats,
      keyPreview,
    };

    return { valid: true, license };
  } catch (e) {
    logger.error('License key decode error', e);
    return { valid: false, error: 'Invalid license key. Check the key and try again.' };
  }
}

/**
 * Get current license (from storage). Returns null if not in license mode or no valid license.
 */
export function getLicense(): License | null {
  if (!isLicenseMode()) return null;
  const license = getStoredLicense();
  if (!license) return null;
  if (license.expiry != null && license.expiry < Date.now()) {
    clearStoredLicense();
    return null;
  }
  return license;
}

/**
 * Get current tier when in license mode. Returns null if not in license mode or no license.
 */
export function getLicenseTier(): TierKey | null {
  const license = getLicense();
  return license ? license.tier : null;
}

/**
 * Activate a license key: validate, store, and return the license.
 */
export function setLicense(key: string): { success: true; license: License } | { success: false; error: string } {
  const result = validateLicenseKey(key);
  if (!result.valid) {
    return { success: false, error: result.error };
  }
  setStoredLicense(result.license, key);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('vs_license_change'));
  }
  return { success: true, license: result.license };
}

/**
 * Clear stored license (e.g. logout or "Remove license" in UI).
 */
export function clearLicense(): void {
  clearStoredLicense();
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('vs_license_change'));
  }
}
