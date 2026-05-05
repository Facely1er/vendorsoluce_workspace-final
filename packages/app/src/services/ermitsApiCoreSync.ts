/**
 * Optional forward of vendor risk signals to ERMITS API Core (`POST /v1/vendors/risk-score`).
 *
 * Security: this call must be proxied server-side so no API key is shipped to the browser.
 */

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
  const url = new URL("/.netlify/functions/ermits-proxy", window.location.origin);
  url.searchParams.set("path", "ermits-api/v1/vendors/risk-score");
  const payload = vendorAssessmentToErmitsPayload(row, overallScore);

  await fetch(url.toString(), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
}
