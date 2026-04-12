import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { AuditLogEntry } from '../types/workspace';

const MAX_ENTRIES = 500;

interface AuditState {
  entries: AuditLogEntry[];

  log: (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => void;
  clearLog: () => void;
  exportLog: (format: 'json' | 'csv') => string;

  getEntriesByEntity: (entity_type: string, entity_id: string) => AuditLogEntry[];
  getRecentEntries: (n: number) => AuditLogEntry[];
}

function generateId(): string {
  return `audit-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function escapeCsv(value: unknown): string {
  const str = String(value ?? '');
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export const useAuditStore = create<AuditState>()(
  devtools(
    persist(
      (set, get) => ({
        entries: [],

        log: (entry) =>
          set(
            (state) => {
              const newEntry: AuditLogEntry = {
                ...entry,
                id: generateId(),
                timestamp: new Date().toISOString(),
              };
              const updated = [newEntry, ...state.entries].slice(0, MAX_ENTRIES);
              return { entries: updated };
            },
            false,
            'auditStore/log'
          ),

        clearLog: () => set({ entries: [] }, false, 'auditStore/clearLog'),

        exportLog: (format) => {
          const entries = get().entries;
          if (format === 'json') {
            return JSON.stringify(entries, null, 2);
          }
          const headers = [
            'id', 'timestamp', 'actor', 'action', 'entity_type', 'entity_id', 'details', 'comment',
          ];
          const rows = entries.map((e) =>
            [e.id, e.timestamp, e.actor, e.action, e.entity_type, e.entity_id, e.details, e.comment ?? '']
              .map(escapeCsv)
              .join(',')
          );
          return [headers.join(','), ...rows].join('\n');
        },

        getEntriesByEntity: (entity_type, entity_id) =>
          get().entries.filter(
            (e) => e.entity_type === entity_type && e.entity_id === entity_id
          ),

        getRecentEntries: (n) => get().entries.slice(0, n),
      }),
      {
        name: 'vendorsoluce-audit-store-v1',
        partialize: (state) => ({ entries: state.entries }),
      }
    ),
    { name: 'vendorsoluce-audit-store-v1' }
  )
);
