// NOTE: vs.vendors is the operational vendor table for this workspace.
// Canonical vendor records will migrate to shared.vendors in a future data migration.
// Tracked in ermits-deploy bridge/vs_to_unified.sql.

import { supabase, isSupabaseEnabled } from '../lib/supabase';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface OrgMembership {
  orgId: string;
  orgName: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
}

export interface ActiveOrg {
  orgId: string;
  orgName: string;
}

// ---------------------------------------------------------------------------
// localStorage keys
// ---------------------------------------------------------------------------

const KEYS = {
  activeOrg: 'vs-active-org',
  memberships: 'vs-org-memberships',
  workspaceVendors: 'vendorsoluce.local.vendors',
  radarVendors: 'vendorsoluce_vendors',
} as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

// ---------------------------------------------------------------------------
// Service (singleton)
// ---------------------------------------------------------------------------

class VendorOrgService {
  // ── Active org ──────────────────────────────────────────────────────────

  getActiveOrg(): ActiveOrg | null {
    return readJson<ActiveOrg | null>(KEYS.activeOrg, null);
  }

  setActiveOrg(org: ActiveOrg): void {
    localStorage.setItem(KEYS.activeOrg, JSON.stringify(org));
  }

  clearActiveOrg(): void {
    localStorage.removeItem(KEYS.activeOrg);
  }

  // ── Memberships ─────────────────────────────────────────────────────────

  getMemberships(): OrgMembership[] {
    return readJson<OrgMembership[]>(KEYS.memberships, []);
  }

  isSoloUser(): boolean {
    return this.getMemberships().length === 0;
  }

  // ── Supabase hydration ──────────────────────────────────────────────────

  async hydrateFromSupabase(): Promise<void> {
    if (!isSupabaseEnabled()) return;

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .schema('shared' as never)
        .from('org_members')
        .select('org_id, role, joined_at, organizations:org_id(id, name)')
        .eq('user_id', user.id);

      if (error) {
        console.warn('hydrateFromSupabase: failed to fetch memberships', error);
        return;
      }

      if (!data || data.length === 0) return;

      const memberships: OrgMembership[] = data.map((row: Record<string, unknown>) => {
        const org = row.organizations as Record<string, unknown> | null;
        return {
          orgId: row.org_id as string,
          orgName: org?.name ? String(org.name) : '',
          role: row.role as OrgMembership['role'],
          joinedAt: (row.joined_at as string) ?? new Date().toISOString(),
        };
      });

      localStorage.setItem(KEYS.memberships, JSON.stringify(memberships));

      if (this.getActiveOrg() === null && memberships.length > 0) {
        this.setActiveOrg({
          orgId: memberships[0].orgId,
          orgName: memberships[0].orgName,
        });
      }
    } catch (err) {
      console.warn('hydrateFromSupabase: unexpected error', err);
    }
  }

  // ── Vendor Supabase hydration ────────────────────────────────────────────

  async hydrateVendorsFromSupabase(orgId: string): Promise<void> {
    if (!isSupabaseEnabled()) return;

    try {
      const { data, error } = await supabase
        .schema('shared' as never)
        .from('vendors')
        .select('*')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('hydrateVendorsFromSupabase: failed to fetch vendors', error);
        return;
      }

      if (!data || data.length === 0) return;

      const local = readJson<Record<string, unknown>[]>(KEYS.workspaceVendors, []);
      const remote = data as Record<string, unknown>[];

      // Merge: local first, then Supabase — Supabase wins on id conflict
      const merged = [...local, ...remote].reduce(
        (acc, v) => {
          const id = v.id as string;
          if (id) acc[id] = v;
          return acc;
        },
        {} as Record<string, Record<string, unknown>>,
      );

      localStorage.setItem(KEYS.workspaceVendors, JSON.stringify(Object.values(merged)));
    } catch (err) {
      console.warn('hydrateVendorsFromSupabase: unexpected error', err);
    }
  }

  // ── Vendors for org ─────────────────────────────────────────────────────

  getVendorsForOrg(orgId: string): Record<string, unknown>[] {
    // Fire-and-forget: hydrate from Supabase shared.vendors in the background
    void this.hydrateVendorsFromSupabase(orgId);

    const workspace = readJson<Record<string, unknown>[]>(KEYS.workspaceVendors, []);
    const radar = readJson<Record<string, unknown>[]>(KEYS.radarVendors, []);

    // Merge by vendor id — workspace record wins on conflict
    const merged = [...radar, ...workspace].reduce(
      (acc, v) => {
        const id = v.id as string;
        if (id) acc[id] = v;
        return acc;
      },
      {} as Record<string, Record<string, unknown>>,
    );

    return Object.values(merged).filter((v) => {
      const vOrgId = v.org_id;
      return vOrgId === orgId || vOrgId == null;
    });
  }
}

export const vendorOrgService = new VendorOrgService();
