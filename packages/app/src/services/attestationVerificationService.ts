import { supabase, isSupabaseEnabled } from '../lib/supabase';

// ---------------------------------------------------------------------------
// Schema helpers
// ---------------------------------------------------------------------------

function sharedSchema() {
  return supabase.schema('shared' as never) as typeof supabase;
}

function vsSchema() {
  return supabase.schema('vs' as never) as typeof supabase;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AttestationVerificationResult {
  valid: boolean;
  token: string;
  framework?: string;
  level?: string;
  overallScore?: number;
  determination?: 'met' | 'conditional' | 'not_met';
  assessorOrg?: string;
  assessedAt?: string;
  expiresAt?: string;
  error?: string;
}

export interface LinkedAttestation {
  id: string;
  vendorId: string;
  token: string;
  framework?: string;
  level?: string;
  overallScore?: number;
  determination?: 'met' | 'conditional' | 'not_met';
  assessorOrg?: string;
  assessedAt?: string;
  verifiedAt: string;
  expiresAt?: string;
}

// ---------------------------------------------------------------------------
// localStorage helpers
// ---------------------------------------------------------------------------

function storageKey(vendorId: string): string {
  return `vs-attestations-${vendorId}`;
}

function readAttestations(vendorId: string): LinkedAttestation[] {
  try {
    const raw = localStorage.getItem(storageKey(vendorId));
    return raw ? (JSON.parse(raw) as LinkedAttestation[]) : [];
  } catch {
    return [];
  }
}

function writeAttestations(vendorId: string, items: LinkedAttestation[]): void {
  localStorage.setItem(storageKey(vendorId), JSON.stringify(items));
}

// ---------------------------------------------------------------------------
// Service (singleton)
// ---------------------------------------------------------------------------

class AttestationVerificationService {
  /**
   * Verify an attestation token against the shared.attestation_tokens table.
   * Returns immediately with a soft error when Supabase is not enabled.
   */
  async verifyToken(token: string): Promise<AttestationVerificationResult> {
    if (!isSupabaseEnabled()) {
      return {
        valid: false,
        token,
        error: 'Supabase is not enabled. Token verification requires a database connection.',
      };
    }

    try {
      const { data, error } = await sharedSchema()
        .from('attestation_tokens')
        .select(
          'token, framework, level, overall_score, determination, assessor_org, assessed_at, expires_at',
        )
        .eq('token', token)
        .maybeSingle();

      if (error) {
        return { valid: false, token, error: 'Verification failed.' };
      }

      if (!data) {
        return { valid: false, token, error: 'Token not found.' };
      }

      const record = data as Record<string, unknown>;

      if (record.expires_at) {
        const expiresAt = new Date(record.expires_at as string);
        if (expiresAt < new Date()) {
          return { valid: false, token, error: 'Token has expired.' };
        }
      }

      return {
        valid: true,
        token,
        framework: record.framework as string | undefined,
        level: record.level as string | undefined,
        overallScore:
          record.overall_score != null ? Number(record.overall_score) : undefined,
        determination: record.determination as
          | 'met'
          | 'conditional'
          | 'not_met'
          | undefined,
        assessorOrg: record.assessor_org as string | undefined,
        assessedAt: record.assessed_at as string | undefined,
        expiresAt: record.expires_at as string | undefined,
      };
    } catch {
      return { valid: false, token, error: 'Verification failed.' };
    }
  }

  /**
   * Link a verified attestation to a vendor.
   * Throws if the result is invalid.
   * Persists to localStorage immediately, then background-syncs to Supabase.
   */
  async linkAttestationToVendor(
    vendorId: string,
    result: AttestationVerificationResult,
  ): Promise<LinkedAttestation> {
    if (!result.valid) {
      throw new Error('Cannot link an invalid attestation.');
    }

    const linked: LinkedAttestation = {
      id: `${vendorId}-${result.token}`,
      vendorId,
      token: result.token,
      framework: result.framework,
      level: result.level,
      overallScore: result.overallScore,
      determination: result.determination,
      assessorOrg: result.assessorOrg,
      assessedAt: result.assessedAt,
      verifiedAt: new Date().toISOString(),
      expiresAt: result.expiresAt,
    };

    // Upsert by token (idempotent)
    const existing = readAttestations(vendorId);
    const updated = [
      ...existing.filter((a) => a.token !== result.token),
      linked,
    ];
    writeAttestations(vendorId, updated);

    // Background sync — fire and forget
    if (isSupabaseEnabled()) {
      void (async () => {
        try {
          await vsSchema()
            .from('vendor_attestations')
            .upsert(
              {
                id: linked.id,
                vendor_id: vendorId,
                token: linked.token,
                framework: linked.framework ?? null,
                level: linked.level ?? null,
                overall_score: linked.overallScore ?? null,
                determination: linked.determination ?? null,
                assessor_org: linked.assessorOrg ?? null,
                assessed_at: linked.assessedAt ?? null,
                verified_at: linked.verifiedAt,
                expires_at: linked.expiresAt ?? null,
              },
              { onConflict: 'id' },
            );
        } catch (err) {
          console.warn('linkAttestationToVendor: background sync failed', err);
        }
      })();
    }

    return linked;
  }

  /**
   * Return all attestations linked to a vendor from localStorage.
   */
  getAttestationsForVendor(vendorId: string): LinkedAttestation[] {
    return readAttestations(vendorId);
  }

  /**
   * Remove a linked attestation from localStorage (and background-sync deletion).
   */
  removeAttestationFromVendor(vendorId: string, token: string): void {
    const existing = readAttestations(vendorId);
    const updated = existing.filter((a) => a.token !== token);
    writeAttestations(vendorId, updated);

    if (isSupabaseEnabled()) {
      void (async () => {
        try {
          const id = `${vendorId}-${token}`;
          await vsSchema()
            .from('vendor_attestations')
            .delete()
            .eq('id', id);
        } catch (err) {
          console.warn('removeAttestationFromVendor: background sync failed', err);
        }
      })();
    }
  }
}

export const attestationVerificationService = new AttestationVerificationService();
