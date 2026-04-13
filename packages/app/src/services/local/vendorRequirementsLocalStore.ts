import type {
  VendorRequirement,
  ControlRequirement,
  RequirementGap,
} from '../../types/requirements';

export interface CreateRequirementInput {
  vendorId: string;
  vendorName: string;
  riskTier: 'Critical' | 'High' | 'Medium' | 'Low';
  riskScore: number;
  requirements: ControlRequirement[];
  gaps?: RequirementGap[];
}

export interface UpdateRequirementInput {
  requirements?: ControlRequirement[];
  gaps?: RequirementGap[];
  status?: 'pending' | 'in_progress' | 'completed';
}

const STORAGE_KEY = 'vs_vendor_requirements_v1';

type StoreState = Record<string, VendorRequirement[]>;

function safeParse(raw: string | null): StoreState {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed as StoreState;
  } catch {
    return {};
  }
}

function getScopeKey(userId?: string): string {
  return userId ? `user:${userId}` : 'anon';
}

function loadAll(): StoreState {
  return safeParse(localStorage.getItem(STORAGE_KEY));
}

function saveAll(next: StoreState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

function makeId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `req_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function listLocalVendorRequirements(userId?: string): VendorRequirement[] {
  const state = loadAll();
  const scope = getScopeKey(userId);
  return Array.isArray(state[scope]) ? state[scope] : [];
}

export function upsertLocalVendorRequirementsBulk(
  inputs: CreateRequirementInput[],
  userId?: string
): VendorRequirement[] {
  const state = loadAll();
  const scope = getScopeKey(userId);
  const existing = Array.isArray(state[scope]) ? state[scope] : [];
  const byVendorId = new Map(existing.map((r) => [r.vendorId, r]));
  const now = new Date().toISOString();

  const saved = inputs.map((input) => {
    const prev = byVendorId.get(input.vendorId);
    const next: VendorRequirement = {
      id: prev?.id || makeId(),
      vendorId: input.vendorId,
      vendorName: input.vendorName,
      riskTier: input.riskTier,
      riskScore: input.riskScore,
      requirements: input.requirements,
      gaps: input.gaps || [],
      status: prev?.status || 'pending',
      createdAt: prev?.createdAt || now,
      updatedAt: now,
    };
    byVendorId.set(input.vendorId, next);
    return next;
  });

  const merged = Array.from(byVendorId.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  state[scope] = merged;
  saveAll(state);
  return saved;
}

export function updateLocalVendorRequirement(
  requirementId: string,
  updates: UpdateRequirementInput,
  userId?: string
): VendorRequirement {
  const state = loadAll();
  const scope = getScopeKey(userId);
  const existing = Array.isArray(state[scope]) ? state[scope] : [];
  const idx = existing.findIndex((r) => r.id === requirementId);
  if (idx < 0) throw new Error('Requirement not found');

  const now = new Date().toISOString();
  const prev = existing[idx];
  const next: VendorRequirement = {
    ...prev,
    requirements: updates.requirements ?? prev.requirements,
    gaps: updates.gaps ?? prev.gaps,
    status: updates.status ?? prev.status,
    updatedAt: now,
  };

  const copied = existing.slice();
  copied[idx] = next;
  state[scope] = copied;
  saveAll(state);
  return next;
}

export function deleteLocalVendorRequirement(requirementId: string, userId?: string): void {
  const state = loadAll();
  const scope = getScopeKey(userId);
  const existing = Array.isArray(state[scope]) ? state[scope] : [];
  state[scope] = existing.filter((r) => r.id !== requirementId);
  saveAll(state);
}

export function getLocalVendorRequirementByVendorId(vendorId: string, userId?: string): VendorRequirement | null {
  const list = listLocalVendorRequirements(userId);
  return list.find((r) => r.vendorId === vendorId) ?? null;
}

