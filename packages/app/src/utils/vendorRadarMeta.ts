/**
 * Optional Vendor Risk Radar fields (service type, population impacted) are persisted in
 * vs_vendors.notes via a small HTML-comment marker so we avoid DB migrations and keep
 * backward compatibility with plain-text notes.
 */
const RADAR_META_RE = /<!--\s*vendorsoluce:radar\s+(\{[\s\S]*?\})\s*-->\s*$/;

export type VendorRadarNotesMeta = {
  serviceType?: string;
  populationImpacted?: string;
  /** VIRA calculator / quick intake: factor id → 1–5 (persisted for unified rescoring). */
  intakeFactors?: Record<string, number>;
};

export function stripRadarMetaFromNotes(notes: string | null | undefined): string {
  if (!notes) return '';
  return notes.replace(RADAR_META_RE, '').trimEnd();
}

export function parseRadarMetaFromNotes(notes: string | null | undefined): VendorRadarNotesMeta {
  if (!notes) return {};
  const m = notes.match(RADAR_META_RE);
  if (!m) return {};
  try {
    const parsed = JSON.parse(m[1]) as VendorRadarNotesMeta;
    const intakeFactors =
      parsed.intakeFactors && typeof parsed.intakeFactors === 'object' && !Array.isArray(parsed.intakeFactors)
        ? (parsed.intakeFactors as Record<string, number>)
        : undefined;
    return {
      serviceType: typeof parsed.serviceType === 'string' ? parsed.serviceType : undefined,
      populationImpacted:
        typeof parsed.populationImpacted === 'string' ? parsed.populationImpacted : undefined,
      intakeFactors,
    };
  } catch {
    return {};
  }
}

export function mergeRadarMetaIntoNotes(
  notes: string | null | undefined,
  meta: VendorRadarNotesMeta
): string {
  const prev = parseRadarMetaFromNotes(notes);
  const base = stripRadarMetaFromNotes(notes);
  const merged: VendorRadarNotesMeta = { ...prev, ...meta };
  const hasIntake =
    merged.intakeFactors &&
    typeof merged.intakeFactors === 'object' &&
    Object.keys(merged.intakeFactors).length > 0;
  const hasMeta = Boolean(
    (merged.serviceType && merged.serviceType.trim()) ||
      (merged.populationImpacted && merged.populationImpacted.trim()) ||
      hasIntake
  );
  if (!hasMeta) return base;
  const payload = JSON.stringify({
    ...(merged.serviceType?.trim() ? { serviceType: merged.serviceType.trim() } : {}),
    ...(merged.populationImpacted?.trim()
      ? { populationImpacted: merged.populationImpacted.trim() }
      : {}),
    ...(hasIntake ? { intakeFactors: merged.intakeFactors } : {}),
  });
  const block = `<!-- vendorsoluce:radar ${payload} -->`;
  return base ? `${base}\n\n${block}` : block;
}
