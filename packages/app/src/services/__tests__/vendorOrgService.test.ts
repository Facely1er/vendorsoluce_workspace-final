'use strict';

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { vendorOrgService } from '../vendorOrgService';
import type { ActiveOrg, OrgMembership } from '../vendorOrgService';

vi.mock('../../lib/supabase', () => ({
  supabase: {},
  isSupabaseEnabled: vi.fn(() => false),
}));

const store = new Map<string, string>();

beforeEach(() => {
  vi.clearAllMocks();
  store.clear();
  vi.mocked(localStorage.getItem).mockImplementation((key: string) => store.get(key) ?? null);
  vi.mocked(localStorage.setItem).mockImplementation((key: string, value: string) => {
    store.set(key, value);
  });
  vi.mocked(localStorage.removeItem).mockImplementation((key: string) => {
    store.delete(key);
  });
});

describe('vendorOrgService', () => {
  it('getActiveOrg returns null when localStorage is empty', () => {
    expect(vendorOrgService.getActiveOrg()).toBeNull();
  });

  it('setActiveOrg writes to vs-active-org; getActiveOrg returns the written value', () => {
    const org: ActiveOrg = { orgId: 'org-1', orgName: 'Acme' };
    vendorOrgService.setActiveOrg(org);
    expect(localStorage.setItem).toHaveBeenCalledWith('vs-active-org', JSON.stringify(org));
    expect(vendorOrgService.getActiveOrg()).toEqual(org);
  });

  it('clearActiveOrg removes vs-active-org; getActiveOrg returns null after clear', () => {
    const org: ActiveOrg = { orgId: 'org-1', orgName: 'Acme' };
    vendorOrgService.setActiveOrg(org);
    vendorOrgService.clearActiveOrg();
    expect(localStorage.removeItem).toHaveBeenCalledWith('vs-active-org');
    expect(vendorOrgService.getActiveOrg()).toBeNull();
  });

  it('getMemberships returns [] when localStorage is empty', () => {
    expect(vendorOrgService.getMemberships()).toEqual([]);
  });

  it('isSoloUser returns true when getMemberships is empty; returns false when a membership exists in localStorage', () => {
    expect(vendorOrgService.isSoloUser()).toBe(true);
    const memberships: OrgMembership[] = [
      { orgId: 'org-1', orgName: 'Acme', role: 'member', joinedAt: '2024-01-01' },
    ];
    store.set('vs-org-memberships', JSON.stringify(memberships));
    expect(vendorOrgService.isSoloUser()).toBe(false);
  });
});
