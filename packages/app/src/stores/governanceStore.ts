import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type {
  NistScrm10Control,
  NistScrm10ControlId,
  NistScrm10ControlStatus,
  GovernanceGap,
  RoadmapMilestone,
} from '../types/workspace';
import { NIST_SCRM_800161_CONTROLS } from '../catalog/nistScrm800161Controls';

interface GovernanceState {
  controls: NistScrm10Control[];
  gaps: GovernanceGap[];
  milestones: RoadmapMilestone[];

  updateControlStatus: (id: NistScrm10ControlId, status: NistScrm10ControlStatus) => void;
  updateMilestoneStatus: (name: string, status: RoadmapMilestone['status']) => void;
  addGap: (gap: GovernanceGap) => void;
  resolveGap: (control: NistScrm10ControlId) => void;

  getFrameworkCompletion: () => {
    total: number;
    complete: number;
    in_progress: number;
    not_started: number;
    percent: number;
  };
  getGapSummary: () => {
    critical_gaps: number;
    high_gaps: number;
    medium_gaps: number;
    low_gaps: number;
  };
  getActiveGaps: () => GovernanceGap[];
}

const INITIAL_GAPS: GovernanceGap[] = [
  {
    control: 'C-SCRM-1',
    description: 'No formal vendor risk management policy exists.',
    severity: 'critical',
    recommended_action: 'Draft and approve a vendor risk management policy aligned to NIST SP 800-161.',
    assigned_to: null,
    target_date: null,
  },
  {
    control: 'C-SCRM-5',
    description: 'No continuous monitoring programme for supplier security posture.',
    severity: 'high',
    recommended_action: 'Implement vendor risk scoring automation and monitoring cadence.',
    assigned_to: null,
    target_date: null,
  },
];

const INITIAL_MILESTONES: RoadmapMilestone[] = [
  {
    name: 'Governance Foundation Complete',
    target_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    status: 'on_track',
  },
  {
    name: 'All Critical Vendors Assessed',
    target_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    status: 'planned',
  },
  {
    name: 'Full NIST SP 800-161 Compliance',
    target_date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    status: 'planned',
  },
];

export const useGovernanceStore = create<GovernanceState>()(
  devtools(
    persist(
      (set, get) => ({
        controls: NIST_SCRM_800161_CONTROLS,
        gaps: INITIAL_GAPS,
        milestones: INITIAL_MILESTONES,

        updateControlStatus: (id, status) =>
          set(
            (state) => ({
              controls: state.controls.map((c) =>
                c.id === id ? { ...c, status } : c
              ),
            }),
            false,
            'governanceStore/updateControlStatus'
          ),

        updateMilestoneStatus: (name, status) =>
          set(
            (state) => ({
              milestones: state.milestones.map((m) =>
                m.name === name ? { ...m, status } : m
              ),
            }),
            false,
            'governanceStore/updateMilestoneStatus'
          ),

        addGap: (gap) =>
          set(
            (state) => ({ gaps: [...state.gaps, gap] }),
            false,
            'governanceStore/addGap'
          ),

        resolveGap: (control) =>
          set(
            (state) => ({
              gaps: state.gaps.filter((g) => g.control !== control),
            }),
            false,
            'governanceStore/resolveGap'
          ),

        getFrameworkCompletion: () => {
          const controls = get().controls;
          const total = controls.length;
          const complete = controls.filter((c) => c.status === 'complete').length;
          const in_progress = controls.filter((c) => c.status === 'in_progress').length;
          const not_started = controls.filter((c) => c.status === 'not_started').length;
          return {
            total,
            complete,
            in_progress,
            not_started,
            percent: total > 0 ? Math.round((complete / total) * 100) : 0,
          };
        },

        getGapSummary: () => {
          const gaps = get().gaps;
          return {
            critical_gaps: gaps.filter((g) => g.severity === 'critical').length,
            high_gaps: gaps.filter((g) => g.severity === 'high').length,
            medium_gaps: gaps.filter((g) => g.severity === 'medium').length,
            low_gaps: gaps.filter((g) => g.severity === 'low').length,
          };
        },

        getActiveGaps: () => get().gaps,
      }),
      {
        name: 'vendorsoluce-governance-store-v1',
        partialize: (state) => ({
          controls: state.controls,
          gaps: state.gaps,
          milestones: state.milestones,
        }),
      }
    ),
    { name: 'vendorsoluce-governance-store-v1' }
  )
);
