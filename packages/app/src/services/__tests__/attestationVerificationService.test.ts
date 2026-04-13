'use strict';

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  attestationVerificationService,
} from '../attestationVerificationService';
import type {
  AttestationVerificationResult,
} from '../attestationVerificationService';

const { mockMaybeSingle, mockIsSupabaseEnabled } = vi.hoisted(() => ({
  mockMaybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
  mockIsSupabaseEnabled: vi.fn(() => false),
}));

vi.mock('../../lib/supabase', () => ({
  supabase: {
    schema: vi.fn(() => ({
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: mockMaybeSingle,
          })),
        })),
      })),
    })),
  },
  isSupabaseEnabled: mockIsSupabaseEnabled,
}));

const store = new Map<string, string>();

beforeEach(() => {
  vi.clearAllMocks();
  store.clear();
  mockIsSupabaseEnabled.mockReturnValue(false);
  vi.mocked(localStorage.getItem).mockImplementation((key: string) => store.get(key) ?? null);
  vi.mocked(localStorage.setItem).mockImplementation((key: string, value: string) => {
    store.set(key, value);
  });
  vi.mocked(localStorage.removeItem).mockImplementation((key: string) => {
    store.delete(key);
  });
});

describe('attestationVerificationService', () => {
  it('verifyToken returns valid:false when Supabase is disabled; error contains "not enabled"', async () => {
    const result = await attestationVerificationService.verifyToken('tok-123');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('not enabled');
  });

  it('verifyToken returns valid:false when Supabase returns no record; error is "Token not found."', async () => {
    mockIsSupabaseEnabled.mockReturnValue(true);
    mockMaybeSingle.mockResolvedValue({ data: null, error: null });
    const result = await attestationVerificationService.verifyToken('tok-missing');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Token not found.');
  });

  it('verifyToken returns valid:false when expires_at is in the past; error is "Token has expired."', async () => {
    mockIsSupabaseEnabled.mockReturnValue(true);
    const pastDate = new Date(Date.now() - 86_400_000).toISOString();
    mockMaybeSingle.mockResolvedValue({
      data: {
        token: 'tok-expired',
        framework: 'SOC2',
        level: 'Type II',
        overall_score: 85,
        determination: 'met',
        assessor_org: 'Auditor Inc',
        assessed_at: '2024-01-01',
        expires_at: pastDate,
      },
      error: null,
    });
    const result = await attestationVerificationService.verifyToken('tok-expired');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Token has expired.');
  });

  it('verifyToken returns valid:true with correctly mapped fields when token is valid and expires_at is in the future', async () => {
    mockIsSupabaseEnabled.mockReturnValue(true);
    const futureDate = new Date(Date.now() + 86_400_000 * 365).toISOString();
    mockMaybeSingle.mockResolvedValue({
      data: {
        token: 'tok-valid',
        framework: 'SOC2',
        level: 'Type II',
        overall_score: 92,
        determination: 'met',
        assessor_org: 'Auditor Inc',
        assessed_at: '2024-06-15',
        expires_at: futureDate,
      },
      error: null,
    });
    const result = await attestationVerificationService.verifyToken('tok-valid');
    expect(result.valid).toBe(true);
    expect(result.token).toBe('tok-valid');
    expect(result.framework).toBe('SOC2');
    expect(result.level).toBe('Type II');
    expect(result.overallScore).toBe(92);
    expect(result.determination).toBe('met');
    expect(result.assessorOrg).toBe('Auditor Inc');
    expect(result.assessedAt).toBe('2024-06-15');
    expect(result.expiresAt).toBe(futureDate);
  });

  it('linkAttestationToVendor throws when result.valid is false', async () => {
    const invalidResult: AttestationVerificationResult = {
      valid: false,
      token: 'tok-bad',
      error: 'Token not found.',
    };
    await expect(
      attestationVerificationService.linkAttestationToVendor('v-1', invalidResult),
    ).rejects.toThrow('Cannot link an invalid attestation.');
  });

  it('linkAttestationToVendor persists to localStorage and is idempotent', async () => {
    const validResult: AttestationVerificationResult = {
      valid: true,
      token: 'tok-good',
      framework: 'SOC2',
      level: 'Type II',
      overallScore: 90,
      determination: 'met',
      assessorOrg: 'Auditor Inc',
      assessedAt: '2024-06-15',
      expiresAt: '2025-06-15',
    };
    await attestationVerificationService.linkAttestationToVendor('v-1', validResult);
    await attestationVerificationService.linkAttestationToVendor('v-1', validResult);

    const raw = store.get('vs-attestations-v-1');
    expect(raw).toBeDefined();
    const parsed = JSON.parse(raw!);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].token).toBe('tok-good');
  });

  it('getAttestationsForVendor returns [] when localStorage key is absent', () => {
    const result = attestationVerificationService.getAttestationsForVendor('v-no-data');
    expect(result).toEqual([]);
  });

  it('getAttestationsForVendor returns parsed array when localStorage key is present with valid JSON', () => {
    const items = [
      { id: 'v-1-tok-1', vendorId: 'v-1', token: 'tok-1', verifiedAt: '2024-01-01' },
    ];
    store.set('vs-attestations-v-1', JSON.stringify(items));
    const result = attestationVerificationService.getAttestationsForVendor('v-1');
    expect(result).toEqual(items);
  });
});
