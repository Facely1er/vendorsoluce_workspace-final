import { useMemo } from 'react'
import { useWorkspaceStore } from './workspaceStore'
import type { EvidenceType, WorkspaceState } from './types'

const requiredEvidenceByCriticality: Record<'Low' | 'Medium' | 'High', EvidenceType[]> = {
  Low: ['Vendor documentation'],
  Medium: ['Vendor documentation', 'Contracts'],
  High: ['Vendor documentation', 'Contracts', 'Assessments'],
}

function calcStats(s: WorkspaceState) {
  const vendors = s.vendors
  const openRisks = s.risks.filter((r) => r.status === 'Open')
  const evidenceByVendor = new Map<string, Set<EvidenceType>>()
  for (const e of s.evidence) {
    const set = evidenceByVendor.get(e.vendorId) ?? new Set<EvidenceType>()
    set.add(e.type)
    evidenceByVendor.set(e.vendorId, set)
  }

  let requiredTotal = 0
  let presentTotal = 0
  let missingRequired = 0
  let vendorsWithNoEvidence = 0
  let criticalVendors = 0

  for (const v of vendors) {
    if (v.criticality === 'High') criticalVendors++
    const required = requiredEvidenceByCriticality[v.criticality]
    const present = evidenceByVendor.get(v.id) ?? new Set<EvidenceType>()
    requiredTotal += required.length
    for (const req of required) {
      if (present.has(req)) presentTotal++
      else missingRequired++
    }
    if (present.size === 0) vendorsWithNoEvidence++
  }

  const coveragePct =
    requiredTotal === 0 ? 100 : Math.round((presentTotal / requiredTotal) * 100)

  // Readiness score: intentionally simple and explainable.
  let score = 100
  score -= missingRequired * 10
  score -= openRisks.length * 8
  score -= vendorsWithNoEvidence * 5
  score = Math.max(0, Math.min(100, score))

  return {
    vendors: {
      total: vendors.length,
      critical: criticalVendors,
    },
    risks: {
      total: s.risks.length,
      open: openRisks.length,
    },
    evidence: {
      total: s.evidence.length,
      coveragePct,
      missingRequired,
    },
    actions: {
      total: s.actions.length,
      open: s.actions.filter((a) => a.status === 'Open').length,
    },
    score,
  }
}

export function useWorkspaceStats() {
  const s = useWorkspaceStore((st) => st)
  return useMemo(() => calcStats(s), [s])
}

