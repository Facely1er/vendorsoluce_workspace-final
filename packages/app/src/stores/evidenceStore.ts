import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { EvidenceVaultItem, EvidenceStatus, VendorTier } from '../types/workspace';
import { SUPPLIER_CRITICALITY_MATRIX } from '../catalog/nistScrm800161Controls';

interface EvidenceState {
  items: EvidenceVaultItem[];

  addEvidenceItem: (item: Omit<EvidenceVaultItem, 'id'>) => void;
  updateEvidenceItem: (id: string, updates: Partial<EvidenceVaultItem>) => void;
  approveEvidenceItem: (id: string, approved_by: string) => void;
  rejectEvidenceItem: (id: string) => void;
  deleteEvidenceItem: (id: string) => void;

  getItemsByVendor: (vendor_id: string) => EvidenceVaultItem[];
  getExpiringItems: (days: number) => EvidenceVaultItem[];
  getExpiredItems: () => EvidenceVaultItem[];
  getMissingRequiredItems: (vendor_id: string, tier: VendorTier) => string[];
  getExpirySummary: () => {
    valid: number;
    expiring_soon_30_days: number;
    expired: number;
    missing_required: number;
  };
}

function generateId(): string {
  return `ev-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function computeExpiryStatus(expiry_date: string | null): EvidenceStatus {
  if (!expiry_date) return 'valid';
  const now = Date.now();
  const expiry = new Date(expiry_date).getTime();
  const daysUntil = Math.floor((expiry - now) / (1000 * 60 * 60 * 24));
  if (daysUntil < 0) return 'expired';
  if (daysUntil <= 30) return 'expiring_soon';
  return 'valid';
}

function computeDaysUntilExpiry(expiry_date: string | null): number | null {
  if (!expiry_date) return null;
  const now = Date.now();
  const expiry = new Date(expiry_date).getTime();
  return Math.floor((expiry - now) / (1000 * 60 * 60 * 24));
}

export const useEvidenceStore = create<EvidenceState>()(
  devtools(
    persist(
      (set, get) => ({
        items: [],

        addEvidenceItem: (item) =>
          set(
            (state) => ({
              items: [
                ...state.items,
                {
                  ...item,
                  id: generateId(),
                  expiry_status: computeExpiryStatus(item.expiry_date),
                  days_until_expiry: computeDaysUntilExpiry(item.expiry_date),
                },
              ],
            }),
            false,
            'evidenceStore/addEvidenceItem'
          ),

        updateEvidenceItem: (id, updates) =>
          set(
            (state) => ({
              items: state.items.map((i) => {
                if (i.id !== id) return i;
                const merged = { ...i, ...updates };
                return {
                  ...merged,
                  expiry_status: computeExpiryStatus(merged.expiry_date),
                  days_until_expiry: computeDaysUntilExpiry(merged.expiry_date),
                };
              }),
            }),
            false,
            'evidenceStore/updateEvidenceItem'
          ),

        approveEvidenceItem: (id, approved_by) =>
          set(
            (state) => ({
              items: state.items.map((i) =>
                i.id === id
                  ? { ...i, approval_status: 'approved' as const, approved_by }
                  : i
              ),
            }),
            false,
            'evidenceStore/approveEvidenceItem'
          ),

        rejectEvidenceItem: (id) =>
          set(
            (state) => ({
              items: state.items.map((i) =>
                i.id === id ? { ...i, approval_status: 'rejected' as const } : i
              ),
            }),
            false,
            'evidenceStore/rejectEvidenceItem'
          ),

        deleteEvidenceItem: (id) =>
          set(
            (state) => ({ items: state.items.filter((i) => i.id !== id) }),
            false,
            'evidenceStore/deleteEvidenceItem'
          ),

        getItemsByVendor: (vendor_id) =>
          get().items.filter((i) => i.vendor_id === vendor_id),

        getExpiringItems: (days) => {
          const now = Date.now();
          return get().items.filter((i) => {
            if (!i.expiry_date) return false;
            const expiry = new Date(i.expiry_date).getTime();
            const daysUntil = Math.floor((expiry - now) / (1000 * 60 * 60 * 24));
            return daysUntil >= 0 && daysUntil <= days;
          });
        },

        getExpiredItems: () =>
          get().items.filter((i) => i.expiry_status === 'expired'),

        getMissingRequiredItems: (vendor_id, tier) => {
          const matrix = SUPPLIER_CRITICALITY_MATRIX.find((m) => m.tier === tier);
          if (!matrix) return [];
          const vendorItems = get().items.filter((i) => i.vendor_id === vendor_id);
          const presentTypes = new Set(vendorItems.map((i) => i.type));
          return matrix.evidence_requirements.filter((req) => !presentTypes.has(req));
        },

        getExpirySummary: () => {
          const items = get().items;
          const now = Date.now();
          let valid = 0;
          let expiring_soon_30_days = 0;
          let expired = 0;
          let missing_required = 0;

          for (const item of items) {
            if (item.expiry_status === 'expired') {
              expired++;
            } else if (item.expiry_status === 'missing') {
              missing_required++;
            } else if (item.expiry_date) {
              const daysUntil = Math.floor(
                (new Date(item.expiry_date).getTime() - now) / (1000 * 60 * 60 * 24)
              );
              if (daysUntil <= 30) {
                expiring_soon_30_days++;
              } else {
                valid++;
              }
            } else {
              valid++;
            }
          }

          return { valid, expiring_soon_30_days, expired, missing_required };
        },
      }),
      {
        name: 'vendorsoluce-evidence-store-v1',
        partialize: (state) => ({ items: state.items }),
      }
    ),
    { name: 'vendorsoluce-evidence-store-v1' }
  )
);
