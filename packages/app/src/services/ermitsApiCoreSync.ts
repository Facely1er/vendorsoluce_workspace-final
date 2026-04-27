/**
 * Optional forward of vendor risk signals to ERMITS API Core (`POST /v1/vendors/risk-score`).
 *
 * Configure `VITE_ERMITS_API_BASE_URL` (e.g. https://ref.supabase.co/functions/v1/ermits-api) and
 * `VITE_ERMITS_API_KEY` only in trusted environments. Keys in Vite are visible in the client
 * bundle — for production multi-tenant SaaS, prefer a same-origin proxy or Edge Function that
 * holds the org-scoped secret server-side.
 */

function env(name: string): string | undefined {
  const v = import.meta.env[name as keyof ImportMetaEnv] as string | undefined;
  return v?.trim() || undefined;
}

/** Derive API Core vendor payload from completed assessment score (higher score ⇒ stronger controls). */
export function vendorAssessmentToErmitsPayload(
  row: { vendor_id: string | null },
  overallScore: number
): Record<string, unknown> {
  const s = Math.max(0, Math.min(100, overallScore));
  return {
    vendorId: row.vendor_id,
    processesSensitiveData: s < 92,
    criticalService: s < 88,
    contractReviewed: s >= 52,
    breachNotificationSla: s >= 55,
    subprocessorVisibility: s >= 58,
    securityAttestationAvailable: s >= 62,
    knownIncidents: s < 45 ? 2 : s < 65 ? 1 : 0,
  };
}

export async function syncVendorRiskAfterAssessmentComplete(
  row: { vendor_id: string | null },
  overallScore: number
): Promise<void> {
  const base = env('VITE_ERMITS_API_BASE_URL');
  const key = env('VITE_ERMITS_API_KEY');
  if (!base || !key) return;

  const url = `${base.replace(/\/$/, '')}/v1/vendors/risk-score`;
  const payload = vendorAssessmentToErmitsPayload(row, overallScore);

  await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-ermits-api-key': key,
    },
    body: JSON.stringify(payload),
  });
}
