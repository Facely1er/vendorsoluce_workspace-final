import type { ActionItem, EvidenceType, WorkspaceState } from './types'

function nowIso() {
  return new Date().toISOString()
}

const requiredEvidenceByCriticality: Record<
  'Low' | 'Medium' | 'High',
  EvidenceType[]
> = {
  Low: ['Vendor documentation'],
  Medium: ['Vendor documentation', 'Contracts'],
  High: ['Vendor documentation', 'Contracts', 'Assessments'],
}

function stableReplaceOrInsert(existing: ActionItem[], next: ActionItem): ActionItem[] {
  const idx = existing.findIndex((a) => a.id === next.id)
  if (idx === -1) return [next, ...existing]
  const prev = existing[idx]
  const merged: ActionItem = {
    ...next,
    status: prev.status,
    completedAt: prev.completedAt,
    createdAt: prev.createdAt ?? next.createdAt,
  }
  return [merged, ...existing.filter((a) => a.id !== next.id)]
}

export function computeDerivedActions(state: WorkspaceState): ActionItem[] {
  const existing = state.actions ?? []
  const manual = existing.filter((a) => a.source === 'Manual')
  const derivedExisting = existing.filter((a) => a.source !== 'Manual')

  const byVendorId = new Map(state.vendors.map((v) => [v.id, v]))
  const evidenceByVendor = new Map<string, Set<EvidenceType>>()
  for (const e of state.evidence) {
    const set = evidenceByVendor.get(e.vendorId) ?? new Set<EvidenceType>()
    set.add(e.type)
    evidenceByVendor.set(e.vendorId, set)
  }

  let out: ActionItem[] = [...manual]

  for (const v of state.vendors) {
    // Keep the prior critical vendor action (existing behavior).
    if (v.criticality === 'High') {
      const id = `derived_critical_${v.id}`
      const item: ActionItem = {
        id,
        vendorId: v.id,
        title: `Review critical vendor: ${v.name}`,
        rationale: 'High criticality requires active oversight and validation of controls.',
        source: 'Criticality',
        status: 'Open',
        createdAt: nowIso(),
      }
      out = stableReplaceOrInsert([...derivedExisting, ...out], item)
    }

    const required = requiredEvidenceByCriticality[v.criticality]
    const present = evidenceByVendor.get(v.id) ?? new Set<EvidenceType>()
    const hasAnyEvidence = present.size > 0

    // v1.1: If no evidence exists at all, generate a single “collect evidence” remediation action.
    if (!hasAnyEvidence) {
      const id = `derived_collect_evidence_${v.id}`
      const item: ActionItem = {
        id,
        vendorId: v.id,
        title: 'Collect vendor security and compliance evidence',
        rationale: 'No evidence is on file for this vendor. Collect baseline documentation to support readiness.',
        source: 'Missing evidence',
        status: 'Open',
        createdAt: nowIso(),
      }
      out = stableReplaceOrInsert([...derivedExisting, ...out], item)
    }

    for (const req of required) {
      if (present.has(req)) continue
      const id = `derived_missing_evidence_${v.id}_${req}`
      const item: ActionItem = {
        id,
        vendorId: v.id,
        title: `Collect ${req}: ${v.name}`,
        rationale: 'Missing evidence reduces readiness and increases residual risk.',
        source: 'Missing evidence',
        status: 'Open',
        createdAt: nowIso(),
      }
      out = stableReplaceOrInsert([...derivedExisting, ...out], item)
    }
  }

  // v1.1: Map specific intake-generated risks → a single vendor-level remediation action (avoid duplicates).
  const mappedActionByVendorKey = new Set<string>()
  for (const r of state.risks) {
    if (r.status !== 'Open') continue
    const v = byVendorId.get(r.vendorId)
    if (!v) continue

    let mapped: { key: string; title: string; rationale: string } | null = null
    if (r.title === 'High dependency on critical vendor') {
      mapped = {
        key: `high_dependency_${v.id}`,
        title: 'Review business continuity and exit plan',
        rationale: 'High dependency requires validated continuity, exit, and substitution planning.',
      }
    } else if (r.title === 'Sensitive data exposure through vendor') {
      mapped = {
        key: `sensitive_exposure_${v.id}`,
        title: 'Confirm data protection and contractual safeguards',
        rationale: 'Sensitive data handling must be protected by controls and enforceable contractual terms.',
      }
    } else if (r.title === 'Operational dependency on external service provider') {
      mapped = {
        key: `operational_dependency_${v.id}`,
        title: 'Review service availability and incident response commitments',
        rationale: 'Operational dependency requires clarity on uptime, SLAs, incident response, and communication.',
      }
    }

    if (mapped) {
      if (!mappedActionByVendorKey.has(mapped.key)) {
        mappedActionByVendorKey.add(mapped.key)
        const id = `derived_mapped_${mapped.key}`
        const item: ActionItem = {
          id,
          vendorId: v.id,
          title: mapped.title,
          rationale: mapped.rationale,
          source: 'Unresolved risks',
          status: 'Open',
          createdAt: nowIso(),
        }
        out = stableReplaceOrInsert([...derivedExisting, ...out], item)
      }
      continue
    }

    // Fallback: still create one action per open risk.
    const id = `derived_open_risk_${r.id}`
    const item: ActionItem = {
      id,
      vendorId: r.vendorId,
      title: `Resolve risk: ${r.title}${v ? ` (${v.name})` : ''}`,
      rationale: 'Unresolved risks drive the action plan until mitigated.',
      source: 'Unresolved risks',
      status: 'Open',
      createdAt: nowIso(),
    }
    out = stableReplaceOrInsert([...derivedExisting, ...out], item)
  }

  // De-duplicate (stableReplaceOrInsert may merge lists above).
  const seen = new Set<string>()
  return out.filter((a) => {
    if (seen.has(a.id)) return false
    seen.add(a.id)
    return true
  })
}

