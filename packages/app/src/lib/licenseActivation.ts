/**
 * License activation for VendorSoluce.
 * Supports:
 * - JWT (RS256): signed token with { tier, exp?, product? }; verified with public key from env.
 * - Demo keys: "demo:<tier>" (only in dev or when VITE_ALLOW_DEMO_LICENSE is set).
 *
 * No network calls. No telemetry. Ever.
 */
export type VendorSoluceTier = 'trial' | 'workspace' | 'workspace+portal';

export const LICENSE_STORAGE_KEY = 'vs-license-token';
export const VALID_TIERS: VendorSoluceTier[] = ['trial', 'workspace', 'workspace+portal'];

const ACTIVE_TIER_STORAGE_KEY = 'vs-active-tier';
const PORTAL_ENABLED_STORAGE_KEY = 'vs-portal-enabled';

function safeLocalStorageGet(key: string): string | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeLocalStorageSet(key: string, value: string): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    window.localStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

function safeLocalStorageRemove(key: string): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

function base64UrlDecode(str: string): Uint8Array {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const pad = base64.length % 4;
  const padded = pad ? base64 + '='.repeat(4 - pad) : base64;
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function isValidTier(tier: string): tier is VendorSoluceTier {
  return VALID_TIERS.includes(tier as VendorSoluceTier);
}

/**
 * Verify a demo key (demo:<tier>). Only allowed in dev or when VITE_ALLOW_DEMO_LICENSE is set.
 */
export function verifyDemoKey(token: string): { tier: VendorSoluceTier } | null {
  const allowDemo =
    typeof import.meta.env !== 'undefined' &&
    (import.meta.env.DEV === true || import.meta.env.VITE_ALLOW_DEMO_LICENSE === 'true');
  if (!allowDemo) return null;
  if (!token.startsWith('demo:')) return null;
  const tierPart = token.slice(5).trim();
  if (!tierPart) return null;
  if (!isValidTier(tierPart)) return null;
  return { tier: tierPart };
}

/**
 * Verify JWT (RS256). Payload must contain { tier: string, exp?: number, product?: string }.
 * Public key from VITE_LICENSE_PUBLIC_KEY (PEM) or empty to skip JWT verification.
 */
export async function verifyJwt(
  token: string
): Promise<{ tier: VendorSoluceTier; exp?: number } | null> {
  const pem =
    typeof import.meta.env !== 'undefined' && (import.meta.env.VITE_LICENSE_PUBLIC_KEY as string);
  if (!pem || typeof pem !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== 3) return null;

  try {
    const [headerB64, payloadB64, sigB64] = parts;
    const payloadBytes = base64UrlDecode(payloadB64);
    const payloadJson = new TextDecoder().decode(payloadBytes);
    const payload = JSON.parse(payloadJson) as { tier?: string; exp?: number; product?: string };
    const tier = payload.tier;
    if (!tier) return null;
    if (!isValidTier(tier)) return null;

    if (payload.product != null && payload.product !== 'vendorsoluce') return null;

    if (payload.exp != null && payload.exp * 1000 < Date.now()) return null;

    const data = new TextEncoder().encode(headerB64 + '.' + payloadB64);
    const sigBytes = base64UrlDecode(sigB64);

    const pemContents = pem
      .replace(/-----BEGIN PUBLIC KEY-----/, '')
      .replace(/-----END PUBLIC KEY-----/, '')
      .replace(/\s/g, '');
    const binaryKey = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0));
    const key = await crypto.subtle.importKey(
      'spki',
      binaryKey.buffer,
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['verify']
    );
    const valid = await crypto.subtle.verify(
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      key,
      sigBytes,
      data
    );
    if (!valid) return null;
    return { tier, exp: payload.exp };
  } catch {
    return null;
  }
}

export interface LicenseResult {
  success: boolean;
  tier?: VendorSoluceTier;
  expiresAt?: string;
  hasPortal?: boolean;
  error?: string;
}

/**
 * Verify license token (demo or JWT) and return tier if valid.
 */
export async function verifyLicenseToken(token: string): Promise<LicenseResult> {
  const trimmed = token?.trim();
  if (!trimmed) return { success: false, error: 'License key is required.' };

  const demo = verifyDemoKey(trimmed);
  if (demo) {
    const tier = demo.tier;
    return {
      success: true,
      tier,
      hasPortal: tier === 'workspace+portal',
    };
  }

  const jwt = await verifyJwt(trimmed);
  if (jwt) {
    const expiresAt = jwt.exp != null ? new Date(jwt.exp * 1000).toISOString() : undefined;
    return {
      success: true,
      tier: jwt.tier,
      expiresAt,
      hasPortal: jwt.tier === 'workspace+portal',
    };
  }

  return { success: false, error: 'Invalid or expired license key.' };
}

/**
 * Apply a license token: verify, update local tier flags, and optionally store token.
 */
export async function applyLicenseToken(
  token: string,
  persistToken = true
): Promise<LicenseResult> {
  const result = await verifyLicenseToken(token);
  if (!result.success || !result.tier) return result;

  safeLocalStorageSet(ACTIVE_TIER_STORAGE_KEY, result.tier);
  safeLocalStorageSet(PORTAL_ENABLED_STORAGE_KEY, result.tier === 'workspace+portal' ? 'true' : 'false');
  if (persistToken) safeLocalStorageSet(LICENSE_STORAGE_KEY, token);
  return result;
}

/**
 * Return stored license token if any.
 */
export function getStoredLicenseToken(): string | null {
  return safeLocalStorageGet(LICENSE_STORAGE_KEY);
}

/**
 * Clear stored license token (does not change active tier).
 */
export function clearStoredLicenseToken(): void {
  safeLocalStorageRemove(LICENSE_STORAGE_KEY);
}

export function getActiveTier(): VendorSoluceTier | null {
  const raw = safeLocalStorageGet(ACTIVE_TIER_STORAGE_KEY);
  if (!raw || typeof raw !== 'string') return null;
  if (!isValidTier(raw)) return null;
  return raw;
}

export function isPortalEnabled(): boolean {
  return safeLocalStorageGet(PORTAL_ENABLED_STORAGE_KEY) === 'true';
}

/**
 * Re-apply stored license on app load; returns true if a stored token was applied.
 */
export async function applyStoredLicenseIfPresent(): Promise<boolean> {
  const token = getStoredLicenseToken();
  if (!token) return false;
  const result = await applyLicenseToken(token, true);
  return result.success;
}
