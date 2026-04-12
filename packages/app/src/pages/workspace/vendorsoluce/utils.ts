import type { User } from '@supabase/supabase-js';
export function resolveOrgId(user: User | null): string | null {
  const metadata = (user?.user_metadata ?? {}) as Record<string, unknown>;
  const candidates = [metadata.org_id, metadata.organization_id, metadata.tenant_id, metadata.workspace_id, user?.id];
  for (const candidate of candidates) if (typeof candidate === 'string' && candidate.trim()) return candidate;
  return null;
}
export function formatPercent(value?: number | null): string { if (typeof value !== 'number' || Number.isNaN(value)) return '—'; return `${Math.round(value)}%`; }
export function riskTone(value?: number | null): 'default'|'good'|'warn'|'danger' { if (typeof value !== 'number') return 'default'; if (value >= 75) return 'danger'; if (value >= 50) return 'warn'; return 'good'; }
