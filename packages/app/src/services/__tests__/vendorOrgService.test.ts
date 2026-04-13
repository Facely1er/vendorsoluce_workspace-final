'use strict';

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { vendorOrgService } from '../vendorOrgService';

vi.mock('../lib/supabase', () => ({
  isSupabaseEnabled: vi.fn(() => false),
}));

vi.mocked(localStorage.getItem).mockReturnValue(null);
const setItemSpy = vi.spyOn(localStorage, 'setItem');
const removeItemSpy = vi.spyOn(localStorage, 'removeItem');

beforeEach(() => {
  vi.clearAllMocks();
});

describe('vendorOrgService', () => {
  it('getActiveOrg returns null when localStorage is empty', () => {
    expect(vendorOrgService.getActiveOrg()).toBeNull();
  });

  it('setActiveOrg writes to vs-active-org; getActiveOrg returns the written value', () => {
    vendorOrgService.setActiveOrg('some-org');
    expect(setItemSpy).toHaveBeenCalledWith('vs-active-org', 'some-org');
    expect(vendorOrgService.getActiveOrg()).toBe('some-org');
  });

  it('clearActiveOrg removes vs-active-org; getActiveOrg returns null after clear', () => {
    vendorOrgService.setActiveOrg('some-org');
    vendorOrgService.clearActiveOrg();
    expect(removeItemSpy).toHaveBeenCalledWith('vs-active-org');
    expect(vendorOrgService.getActiveOrg()).toBeNull();
  });

  it('getMemberships returns [] when localStorage is empty', () => {
    expect(vendorOrgService.getMemberships()).toEqual([]);
  });

  it('isSoloUser returns true when getMemberships is empty; returns false when a membership exists in localStorage', () => {
    expect(vendorOrgService.isSoloUser()).toBe(true);
    vendorOrgService.setMemberships(['some-membership']);
    expect(vendorOrgService.isSoloUser()).toBe(false);
  });
});
