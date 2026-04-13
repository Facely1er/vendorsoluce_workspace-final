import type { AnalysisResult } from '../sbomIntegrationService';

const KEY = 'vendorsoluce.local.sbom_analyses.v1';
const isBrowser = typeof window !== 'undefined';

function readJson<T>(fallback: T): T {
  if (!isBrowser) return fallback;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(value: T): void {
  if (!isBrowser) return;
  window.localStorage.setItem(KEY, JSON.stringify(value));
}

type StoredAnalysis = {
  id: string;
  createdAt: string;
  vendorId?: string;
  assessmentId?: string;
  result: AnalysisResult['result'];
};

type StoreState = Record<string, StoredAnalysis[]>;

function scopeKey(userId?: string): string {
  return userId ? `user:${userId}` : 'anon';
}

function makeId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `sbom_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function listLocalSbomAnalyses(userId?: string): StoredAnalysis[] {
  const state = readJson<StoreState>({});
  const key = scopeKey(userId);
  return Array.isArray(state[key]) ? state[key] : [];
}

export function saveLocalSbomAnalysis(
  result: AnalysisResult['result'],
  opts: { vendorId?: string; assessmentId?: string; userId?: string }
): StoredAnalysis {
  const state = readJson<StoreState>({});
  const key = scopeKey(opts.userId);
  const existing = Array.isArray(state[key]) ? state[key] : [];
  const stored: StoredAnalysis = {
    id: makeId(),
    createdAt: new Date().toISOString(),
    vendorId: opts.vendorId,
    assessmentId: opts.assessmentId,
    result,
  };
  state[key] = [stored, ...existing].slice(0, 50);
  writeJson(state);
  return stored;
}

