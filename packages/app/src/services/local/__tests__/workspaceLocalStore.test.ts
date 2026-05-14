import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearLocalWorkspaceStorageIssue,
  createLocalVendor,
  getLocalWorkspaceStorageIssue,
  saveLocalVendors,
} from '../workspaceLocalStore';

const storage = new Map<string, string>();

beforeEach(() => {
  storage.clear();
  clearLocalWorkspaceStorageIssue();
  vi.clearAllMocks();

  vi.mocked(localStorage.getItem).mockImplementation((key: string) => storage.get(key) ?? null);
  vi.mocked(localStorage.setItem).mockImplementation((key: string, value: string) => {
    storage.set(key, value);
  });
  vi.mocked(localStorage.removeItem).mockImplementation((key: string) => {
    storage.delete(key);
  });
});

describe('workspaceLocalStore storage resilience', () => {
  it('returns ok and keeps no storage issue after successful local save', () => {
    const result = saveLocalVendors([]);

    expect(result).toEqual({ ok: true });
    expect(getLocalWorkspaceStorageIssue()).toBeNull();
  });

  it('captures quota failures with export guidance so UI can warn users', () => {
    const quotaError =
      typeof DOMException !== 'undefined'
        ? new DOMException('Quota exceeded', 'QuotaExceededError')
        : Object.assign(new Error('Quota exceeded'), { name: 'QuotaExceededError' });

    vi.mocked(localStorage.setItem).mockImplementation(() => {
      throw quotaError;
    });

    const result = saveLocalVendors([]);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issue.code).toBe('quota_exceeded');
      expect(result.issue.message).toContain('Export/download');
    }
    expect(getLocalWorkspaceStorageIssue()?.code).toBe('quota_exceeded');
  });

  it('throws when creating a local vendor cannot be persisted', () => {
    const quotaError =
      typeof DOMException !== 'undefined'
        ? new DOMException('Quota exceeded', 'QuotaExceededError')
        : Object.assign(new Error('Quota exceeded'), { name: 'QuotaExceededError' });

    vi.mocked(localStorage.setItem).mockImplementation(() => {
      throw quotaError;
    });

    const vendorData: Parameters<typeof createLocalVendor>[1] = {
      name: 'Blocked vendor',
    };

    expect(() =>
      createLocalVendor('user-1', vendorData)
    ).toThrow('Export/download');
  });
});
