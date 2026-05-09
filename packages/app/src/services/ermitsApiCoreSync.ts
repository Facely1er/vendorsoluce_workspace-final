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

export type ErmitsSbomAnalyzePayload = {
  applicationId?: string;
  criticalVulnerabilities: number;
  highVulnerabilities: number;
  unknownLicenses: number;
  sbomCurrent: boolean;
  ciCdScanning: boolean;
  dependencyOwnerAssigned: boolean;
  complianceSignals: string[];
};

export function sbomAnalysisToErmitsPayload(input: {
  criticalVulnerabilities?: number;
  highVulnerabilities?: number;
  unknownLicenses?: number;
  sbomCurrent?: boolean;
  ciCdScanning?: boolean;
  dependencyOwnerAssigned?: boolean;
  complianceSignals?: string[];
  applicationId?: string;
}): ErmitsSbomAnalyzePayload {
  return {
    ...(input.applicationId ? { applicationId: input.applicationId } : {}),
    criticalVulnerabilities: Math.max(0, Number(input.criticalVulnerabilities ?? 0) || 0),
    highVulnerabilities: Math.max(0, Number(input.highVulnerabilities ?? 0) || 0),
    unknownLicenses: Math.max(0, Number(input.unknownLicenses ?? 0) || 0),
    sbomCurrent: Boolean(input.sbomCurrent ?? true),
    ciCdScanning: Boolean(input.ciCdScanning ?? false),
    dependencyOwnerAssigned: Boolean(input.dependencyOwnerAssigned ?? false),
    complianceSignals:
      Array.isArray(input.complianceSignals) && input.complianceSignals.length
        ? input.complianceSignals.map(String).filter(Boolean)
        : ["NIST SP 800-161"],
  };
}

export async function syncSbomExposureAfterAnalysisComplete(payload: ErmitsSbomAnalyzePayload): Promise<void> {
  const url = new URL("/.netlify/functions/ermits-proxy", window.location.origin);
  url.searchParams.set("path", "ermits-api/v1/sbom/analyze");
  await fetch(url.toString(), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
}
