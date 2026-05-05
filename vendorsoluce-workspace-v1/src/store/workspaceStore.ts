import { useSyncExternalStore } from 'react'
import { clearWorkspaceStorage, loadJson, saveJson } from './storage'
import type {
  ActionItem,
  Criticality,
  DataHandled,
  Evidence,
  EvidenceType,
  Risk,
  RiskStatus,
  RiskType,
  ServiceType,
  UUID,
  Vendor,
  WorkspaceState,
  WorkspaceSettings,
} from './types'
import { computeDerivedActions } from './workspaceDerived'

function nowIso() {
  return new Date().toISOString()
}

function makeId(): UUID {
  // good-enough collision resistance for local-only workspace
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`
}

const defaultState: WorkspaceState = {
  vendors: [],
  risks: [],
  evidence: [],
  actions: [],
  settings: { theme: 'system' },
  updatedAt: nowIso(),
}

function normalizeLoadedState(s: WorkspaceState): WorkspaceState {
  return {
    ...s,
    vendors: (s.vendors ?? []).map((v) => ({
      ...v,
      dataHandled: v.dataHandled ?? [],
    })),
    risks: s.risks ?? [],
    evidence: s.evidence ?? [],
    actions: s.actions ?? [],
    settings: s.settings ?? { theme: 'system' },
    updatedAt: s.updatedAt ?? nowIso(),
  }
}

let state: WorkspaceState = normalizeLoadedState(loadJson<WorkspaceState>(defaultState))
const listeners = new Set<() => void>()
const selectorCache = new WeakMap<
  (s: WorkspaceState) => unknown,
  { stateRef: WorkspaceState; selected: unknown }
>()

function emit() {
  for (const l of listeners) l()
}

function setState(next: WorkspaceState) {
  state = normalizeLoadedState({ ...next, updatedAt: nowIso() })
  saveJson(state)
  emit()
}

function update(mutator: (draft: WorkspaceState) => WorkspaceState) {
  const next = mutator(state)
  // Always keep system-generated actions in sync (but preserve manual ones).
  const derived = computeDerivedActions(next)
  setState({ ...next, actions: derived })
}

export const workspaceActions = {
  addVendor(input: { name: string; service: string; criticality: Criticality }) {
    const vendorId = makeId()
    const createdAt = nowIso()
    update((s) => ({
      ...s,
      vendors: [{ id: vendorId, createdAt, ...input }, ...s.vendors],
    }))
    return vendorId
  },

  addVendorFromIntake(input: {
    name: string
    serviceType: ServiceType
    serviceDescription?: string
    dataHandled: DataHandled[]
    criticality: Criticality
    contractOwner?: string
    reviewDueDate?: string
  }) {
    const vendorId = makeId()
    const createdAt = nowIso()
    update((s) => {
      const vendor: Vendor = {
        id: vendorId,
        name: input.name,
        service: input.serviceType,
        criticality: input.criticality,
        serviceType: input.serviceType,
        dataHandled: input.dataHandled,
        serviceDescription: input.serviceDescription,
        contractOwner: input.contractOwner,
        reviewDueDate: input.reviewDueDate,
        createdAt,
      }

      const sensitiveSet = new Set<DataHandled>([
        'Financial data',
        'Health data',
        'Customer personal data',
        'Employee data',
        'Authentication/security data',
      ])
      const handlesSensitive = input.dataHandled.some((d) => sensitiveSet.has(d))
      const operationalServiceTypes = new Set<ServiceType>([
        'Cloud hosting',
        'SaaS application',
        'Payment processor',
        'IT/security provider',
      ])

      const risksToCreate: Array<Pick<Risk, 'type' | 'title' | 'notes'>> = []

      if (input.criticality === 'High') {
        risksToCreate.push({
          type: 'Vendor dependency',
          title: 'High dependency on critical vendor',
          notes: 'Critical service dependency requires continuity planning and active oversight.',
        })
      }
      if (handlesSensitive) {
        risksToCreate.push({
          type: 'Data exposure',
          title: 'Sensitive data exposure through vendor',
          notes: 'Validate data handling, access controls, encryption, and contractual safeguards.',
        })
      }
      if (operationalServiceTypes.has(input.serviceType)) {
        risksToCreate.push({
          type: 'Supply chain risk',
          title: 'Operational dependency on external service provider',
          notes: 'Review availability, incident response, and change management commitments.',
        })
      }

      const existingKeys = new Set(
        s.risks
          .filter((r) => r.vendorId === vendorId)
          .map((r) => `${r.type}:${r.title}`),
      )
      const newRisks: Risk[] = risksToCreate
        .filter((r) => !existingKeys.has(`${r.type}:${r.title}`))
        .map((r) => ({
          id: makeId(),
          vendorId,
          type: r.type,
          title: r.title,
          notes: r.notes,
          status: 'Open',
          createdAt,
        }))

      return {
        ...s,
        vendors: [vendor, ...s.vendors],
        risks: [...newRisks, ...s.risks],
      }
    })
    return vendorId
  },
  updateVendor(id: UUID, patch: Partial<Pick<Vendor, 'name' | 'service' | 'criticality'>>) {
    update((s) => ({
      ...s,
      vendors: s.vendors.map((v) => (v.id === id ? { ...v, ...patch } : v)),
    }))
  },
  removeVendor(id: UUID) {
    update((s) => ({
      ...s,
      vendors: s.vendors.filter((v) => v.id !== id),
      risks: s.risks.filter((r) => r.vendorId !== id),
      evidence: s.evidence.filter((e) => e.vendorId !== id),
      actions: s.actions.filter((a) => a.vendorId !== id),
    }))
  },

  addRisk(input: { vendorId: UUID; type: RiskType; title: string; notes: string }) {
    const risk: Risk = {
      id: makeId(),
      vendorId: input.vendorId,
      type: input.type,
      title: input.title,
      notes: input.notes,
      status: 'Open',
      createdAt: nowIso(),
    }
    update((s) => ({ ...s, risks: [risk, ...s.risks] }))
  },
  setRiskStatus(id: UUID, status: RiskStatus) {
    update((s) => ({
      ...s,
      risks: s.risks.map((r) =>
        r.id === id
          ? { ...r, status, resolvedAt: status === 'Mitigated' ? nowIso() : undefined }
          : r,
      ),
    }))
  },
  removeRisk(id: UUID) {
    update((s) => ({ ...s, risks: s.risks.filter((r) => r.id !== id) }))
  },

  addEvidence(input: { vendorId: UUID; type: EvidenceType; title: string; url?: string; notes?: string }) {
    const ev: Evidence = { id: makeId(), createdAt: nowIso(), ...input }
    update((s) => ({ ...s, evidence: [ev, ...s.evidence] }))
  },
  removeEvidence(id: UUID) {
    update((s) => ({ ...s, evidence: s.evidence.filter((e) => e.id !== id) }))
  },

  addManualAction(input: { vendorId?: UUID; title: string; rationale: string }) {
    const a: ActionItem = {
      id: makeId(),
      vendorId: input.vendorId,
      title: input.title,
      rationale: input.rationale,
      source: 'Manual',
      status: 'Open',
      createdAt: nowIso(),
    }
    update((s) => ({ ...s, actions: [a, ...s.actions] }))
  },
  setActionStatus(id: UUID, status: 'Open' | 'In Progress' | 'Completed') {
    update((s) => ({
      ...s,
      actions: s.actions.map((a) =>
        a.id === id
          ? { ...a, status, completedAt: status === 'Completed' ? nowIso() : undefined }
          : a,
      ),
    }))
  },
  removeAction(id: UUID) {
    update((s) => ({ ...s, actions: s.actions.filter((a) => a.id !== id) }))
  },

  updateSettings(patch: Partial<WorkspaceSettings>) {
    update((s) => ({ ...s, settings: { ...s.settings, ...patch } }))
  },

  resetWorkspace() {
    clearWorkspaceStorage()
    setState(defaultState)
  },
}

export function useWorkspaceStore<T>(selector: (s: WorkspaceState) => T): T {
  const getSnapshot = () => {
    const cached = selectorCache.get(selector)
    if (cached && cached.stateRef === state) return cached.selected as T
    const selected = selector(state)
    selectorCache.set(selector, { stateRef: state, selected })
    return selected
  }
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    getSnapshot,
    getSnapshot,
  )
}

export function getWorkspaceState(): WorkspaceState {
  return state
}

