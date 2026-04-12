import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type {
  WorkflowPhase,
  WorkspaceBlocker,
  WorkspaceVendor,
  PhaseStatus,
  PhaseHealth,
  VendorTier,
  VendorEvidenceItem,
  WorkspaceHealthStatus,
  PhaseComment,
} from '../types/workspace';

interface WorkspaceState {
  phases: WorkflowPhase[];
  blockers: WorkspaceBlocker[];
  workspaceVendors: WorkspaceVendor[];

  // Phase actions
  updatePhaseStatus: (id: string, status: PhaseStatus) => void;
  updatePhaseHealth: (id: string, health: PhaseHealth) => void;
  addPhaseComment: (phase_id: string, comment: Omit<PhaseComment, 'id'>) => void;
  setPhaseBlocker: (phase_id: string, blocker_id: string) => void;
  resolvePhaseBlocker: (phase_id: string) => void;

  // Blocker actions
  addBlocker: (blocker: Omit<WorkspaceBlocker, 'id'>) => void;
  resolveBlocker: (id: string) => void;

  // Workspace vendor actions
  upsertWorkspaceVendor: (vendor: WorkspaceVendor) => void;
  setVendorTier: (id: string, tier: VendorTier) => void;
  setVendorDpa: (id: string, dpa_status: WorkspaceVendor['dpa_status'], dpa_expiry: string | null) => void;
  setVendorEvidenceItem: (vendor_id: string, key: string, item: VendorEvidenceItem) => void;
  setVendorBlocker: (vendor_id: string, blocker: string) => void;
  clearVendorBlocker: (vendor_id: string) => void;

  // Computed selectors
  getPhaseById: (id: string) => WorkflowPhase | undefined;
  getWorkspaceProgress: () => { completed: number; total: number; percent: number };
  getHealthStatus: () => WorkspaceHealthStatus;
  getBlockedPhases: () => WorkflowPhase[];
  getVendorCoverage: () => { assessed: number; total: number; percent: number };
}

const INITIAL_PHASES: WorkflowPhase[] = [
  {
    id: 'phase_v01',
    name: 'Governance & Policy Setup',
    status: 'in_progress',
    health: 'yellow',
    duration_days: 14,
    duration_type: 'fixed',
    days_remaining: 7,
    activities_count: 11,
    deliverables_count: 2,
    roles: ['GRC Lead', 'CISO', 'Procurement'],
    dependencies: {
      predecessor_phases: [],
      blocked_by: null,
      can_override: false,
    },
    artifacts: {
      deliverables: [
        { name: 'Vendor Risk Management Policy', status: 'in_progress' },
        { name: 'RACI Matrix', status: 'not_started' },
      ],
      evidence: [],
    },
    comments: [],
  },
  {
    id: 'phase_v02',
    name: 'Supplier Identification',
    status: 'pending',
    health: 'not_started',
    duration_days: 21,
    duration_type: 'fixed',
    activities_count: 7,
    deliverables_count: 3,
    roles: ['Vendor Manager', 'Risk Analyst'],
    dependencies: {
      predecessor_phases: ['phase_v01'],
      predecessor_status_required: 'complete',
      blocked_by: null,
      can_override: true,
      override_roles: ['GRC Lead', 'CISO'],
    },
    artifacts: {
      deliverables: [
        { name: 'Vendor Register', status: 'not_started' },
        { name: 'Sub-tier Mapping', status: 'not_started' },
        { name: 'Tier Classification', status: 'not_started' },
      ],
      evidence: [],
    },
    comments: [],
  },
  {
    id: 'phase_v03',
    name: 'Risk Assessment & Due Diligence',
    status: 'blocked',
    health: 'red',
    duration_days: 42,
    duration_type: 'fixed',
    activities_count: 13,
    deliverables_count: 2,
    roles: ['Risk Analyst', 'Security Architect', 'GRC Lead'],
    dependencies: {
      predecessor_phases: ['phase_v01', 'phase_v02'],
      predecessor_status_required: 'complete',
      blocked_by: {
        type: 'vendor_non_response',
        description: 'Critical vendor has not responded to questionnaire request.',
        raised_date: new Date().toISOString(),
        expected_resolution: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      },
      can_override: true,
      override_roles: ['GRC Lead', 'CISO'],
    },
    artifacts: {
      deliverables: [
        { name: 'Risk Assessment Report', status: 'not_started' },
        { name: 'Due Diligence Findings', status: 'not_started' },
      ],
      evidence: [],
    },
    comments: [],
  },
  {
    id: 'phase_v04',
    name: 'Continuous Monitoring',
    status: 'pending',
    health: 'not_started',
    duration_days: 365,
    duration_type: 'ongoing',
    activities_count: 3,
    deliverables_count: 2,
    roles: ['Vendor Manager', 'Risk Analyst'],
    dependencies: {
      predecessor_phases: ['phase_v03'],
      predecessor_status_required: 'in_progress',
      blocked_by: null,
      can_override: false,
    },
    artifacts: {
      deliverables: [
        { name: 'Monitoring Schedule', status: 'not_started' },
        { name: 'Risk Score Trends', status: 'not_started' },
      ],
      evidence: [],
    },
    comments: [],
  },
  {
    id: 'phase_v05',
    name: 'Remediation & Closure',
    status: 'pending',
    health: 'not_started',
    duration_days: 90,
    duration_type: 'ongoing',
    activities_count: 8,
    deliverables_count: 3,
    roles: ['GRC Lead', 'Vendor Manager', 'Risk Analyst'],
    dependencies: {
      predecessor_phases: ['phase_v03'],
      predecessor_status_required: 'in_progress',
      blocked_by: null,
      can_override: false,
    },
    artifacts: {
      deliverables: [
        { name: 'Remediation Register', status: 'not_started' },
        { name: 'Closure Evidence', status: 'not_started' },
        { name: 'Lessons Learned', status: 'not_started' },
      ],
      evidence: [],
    },
    comments: [],
  },
];

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  devtools(
    persist(
      (set, get) => ({
        phases: INITIAL_PHASES,
        blockers: [],
        workspaceVendors: [],

        updatePhaseStatus: (id, status) =>
          set(
            (state) => ({
              phases: state.phases.map((p) => (p.id === id ? { ...p, status } : p)),
            }),
            false,
            'workspaceStore/updatePhaseStatus'
          ),

        updatePhaseHealth: (id, health) =>
          set(
            (state) => ({
              phases: state.phases.map((p) => (p.id === id ? { ...p, health } : p)),
            }),
            false,
            'workspaceStore/updatePhaseHealth'
          ),

        addPhaseComment: (phase_id, comment) =>
          set(
            (state) => ({
              phases: state.phases.map((p) =>
                p.id === phase_id
                  ? {
                      ...p,
                      comments: [
                        ...p.comments,
                        { ...comment, id: generateId() },
                      ],
                    }
                  : p
              ),
            }),
            false,
            'workspaceStore/addPhaseComment'
          ),

        setPhaseBlocker: (phase_id, blocker_id) =>
          set(
            (state) => {
              const blocker = state.blockers.find((b) => b.id === blocker_id);
              if (!blocker) return state;
              return {
                phases: state.phases.map((p) =>
                  p.id === phase_id
                    ? {
                        ...p,
                        status: 'blocked' as PhaseStatus,
                        health: 'red' as PhaseHealth,
                        dependencies: {
                          ...p.dependencies,
                          blocked_by: {
                            type: 'blocker',
                            description: blocker.description,
                            vendor: blocker.affected_vendor,
                            raised_date: blocker.raised_date,
                            expected_resolution: blocker.expected_resolution,
                          },
                        },
                      }
                    : p
                ),
              };
            },
            false,
            'workspaceStore/setPhaseBlocker'
          ),

        resolvePhaseBlocker: (phase_id) =>
          set(
            (state) => ({
              phases: state.phases.map((p) =>
                p.id === phase_id
                  ? {
                      ...p,
                      dependencies: { ...p.dependencies, blocked_by: null },
                    }
                  : p
              ),
            }),
            false,
            'workspaceStore/resolvePhaseBlocker'
          ),

        addBlocker: (blocker) =>
          set(
            (state) => ({
              blockers: [...state.blockers, { ...blocker, id: generateId() }],
            }),
            false,
            'workspaceStore/addBlocker'
          ),

        resolveBlocker: (id) =>
          set(
            (state) => ({
              blockers: state.blockers.map((b) =>
                b.id === id ? { ...b, status: 'resolved' as const } : b
              ),
            }),
            false,
            'workspaceStore/resolveBlocker'
          ),

        upsertWorkspaceVendor: (vendor) =>
          set(
            (state) => {
              const exists = state.workspaceVendors.find((v) => v.id === vendor.id);
              return {
                workspaceVendors: exists
                  ? state.workspaceVendors.map((v) => (v.id === vendor.id ? vendor : v))
                  : [...state.workspaceVendors, vendor],
              };
            },
            false,
            'workspaceStore/upsertWorkspaceVendor'
          ),

        setVendorTier: (id, tier) =>
          set(
            (state) => ({
              workspaceVendors: state.workspaceVendors.map((v) =>
                v.id === id ? { ...v, tier } : v
              ),
            }),
            false,
            'workspaceStore/setVendorTier'
          ),

        setVendorDpa: (id, dpa_status, dpa_expiry) =>
          set(
            (state) => ({
              workspaceVendors: state.workspaceVendors.map((v) =>
                v.id === id ? { ...v, dpa_status, dpa_expiry } : v
              ),
            }),
            false,
            'workspaceStore/setVendorDpa'
          ),

        setVendorEvidenceItem: (vendor_id, key, item) =>
          set(
            (state) => ({
              workspaceVendors: state.workspaceVendors.map((v) =>
                v.id === vendor_id
                  ? { ...v, evidence: { ...v.evidence, [key]: item } }
                  : v
              ),
            }),
            false,
            'workspaceStore/setVendorEvidenceItem'
          ),

        setVendorBlocker: (vendor_id, blocker) =>
          set(
            (state) => ({
              workspaceVendors: state.workspaceVendors.map((v) =>
                v.id === vendor_id ? { ...v, blocker } : v
              ),
            }),
            false,
            'workspaceStore/setVendorBlocker'
          ),

        clearVendorBlocker: (vendor_id) =>
          set(
            (state) => ({
              workspaceVendors: state.workspaceVendors.map((v) =>
                v.id === vendor_id ? { ...v, blocker: null } : v
              ),
            }),
            false,
            'workspaceStore/clearVendorBlocker'
          ),

        getPhaseById: (id) => get().phases.find((p) => p.id === id),

        getWorkspaceProgress: () => {
          const phases = get().phases;
          const completed = phases.filter((p) => p.status === 'complete').length;
          const total = phases.length;
          return { completed, total, percent: total > 0 ? Math.round((completed / total) * 100) : 0 };
        },

        getHealthStatus: (): WorkspaceHealthStatus => {
          const phases = get().phases;
          const hasBlocked = phases.some((p) => p.health === 'red');
          const hasAtRisk = phases.some((p) => p.health === 'yellow');
          if (hasBlocked) return 'critical';
          if (hasAtRisk) return 'at_risk';
          return 'healthy';
        },

        getBlockedPhases: () => get().phases.filter((p) => p.status === 'blocked'),

        getVendorCoverage: () => {
          const vendors = get().workspaceVendors;
          const assessed = vendors.filter(
            (v) => v.assessment_status === 'complete' || v.assessment_status === 'in_progress'
          ).length;
          const total = vendors.length;
          return { assessed, total, percent: total > 0 ? Math.round((assessed / total) * 100) : 0 };
        },
      }),
      {
        name: 'vendorsoluce-workspace-store-v1',
        partialize: (state) => ({
          phases: state.phases,
          blockers: state.blockers,
          workspaceVendors: state.workspaceVendors,
        }),
      }
    ),
    { name: 'vendorsoluce-workspace-store-v1' }
  )
);
