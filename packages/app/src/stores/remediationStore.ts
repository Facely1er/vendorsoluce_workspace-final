import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { RemediationItem } from '../types/workspace';

interface RemediationState {
  items: RemediationItem[];

  addRemediationItem: (item: Omit<RemediationItem, 'id'>) => void;
  updateRemediationItem: (id: string, updates: Partial<RemediationItem>) => void;
  resolveRemediationItem: (id: string, completed_date: string) => void;
  deleteRemediationItem: (id: string) => void;

  getOpenItems: () => RemediationItem[];
  getItemsByVendor: (vendor_id: string) => RemediationItem[];
  getAgingDaysAvg: () => number;
  getOverdueItems: () => RemediationItem[];
}

function generateId(): string {
  return `rem-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export const useRemediationStore = create<RemediationState>()(
  devtools(
    persist(
      (set, get) => ({
        items: [],

        addRemediationItem: (item) =>
          set(
            (state) => ({ items: [...state.items, { ...item, id: generateId() }] }),
            false,
            'remediationStore/addRemediationItem'
          ),

        updateRemediationItem: (id, updates) =>
          set(
            (state) => ({
              items: state.items.map((i) => (i.id === id ? { ...i, ...updates } : i)),
            }),
            false,
            'remediationStore/updateRemediationItem'
          ),

        resolveRemediationItem: (id, completed_date) =>
          set(
            (state) => ({
              items: state.items.map((i) =>
                i.id === id ? { ...i, status: 'resolved' as const, completed_date } : i
              ),
            }),
            false,
            'remediationStore/resolveRemediationItem'
          ),

        deleteRemediationItem: (id) =>
          set(
            (state) => ({ items: state.items.filter((i) => i.id !== id) }),
            false,
            'remediationStore/deleteRemediationItem'
          ),

        getOpenItems: () =>
          get().items.filter((i) => i.status === 'open' || i.status === 'in_progress'),

        getItemsByVendor: (vendor_id) =>
          get().items.filter((i) => i.vendor_id === vendor_id),

        getAgingDaysAvg: () => {
          const open = get().items.filter((i) => i.status !== 'resolved');
          if (open.length === 0) return 0;
          const totalDays = open.reduce((acc, i) => {
            const raised = new Date(i.raised_date).getTime();
            const now = Date.now();
            return acc + Math.floor((now - raised) / (1000 * 60 * 60 * 24));
          }, 0);
          return Math.round(totalDays / open.length);
        },

        getOverdueItems: () => {
          const today = new Date().toISOString().slice(0, 10);
          return get().items.filter(
            (i) => i.target_completion < today && i.status !== 'resolved'
          );
        },
      }),
      {
        name: 'vendorsoluce-remediation-store-v1',
        partialize: (state) => ({ items: state.items }),
      }
    ),
    { name: 'vendorsoluce-remediation-store-v1' }
  )
);
