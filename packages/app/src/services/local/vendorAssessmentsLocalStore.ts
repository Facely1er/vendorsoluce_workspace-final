import type { Database } from '../../lib/database.types';

type VendorAssessment = Database['public']['Tables']['vs_vendor_assessments']['Row'];
type VendorAssessmentInsert = Database['public']['Tables']['vs_vendor_assessments']['Insert'];
type VendorAssessmentUpdate = Database['public']['Tables']['vs_vendor_assessments']['Update'];
type AssessmentFramework = Database['public']['Tables']['vs_assessment_frameworks']['Row'];

const KEY = 'vendorsoluce.local.vendor_assessments.v1';
const KEY_FRAMEWORKS = 'vendorsoluce.local.assessment_frameworks.v1';

const isBrowser = typeof window !== 'undefined';

function readJson<T>(key: string, fallback: T): T {
  if (!isBrowser) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  if (!isBrowser) return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function nowIso(): string {
  return new Date().toISOString();
}

function localId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
}

function ensureFrameworksSeeded(): AssessmentFramework[] {
  const stored = readJson<AssessmentFramework[]>(KEY_FRAMEWORKS, []);
  if (stored.length > 0) return stored;
  const seeded: AssessmentFramework[] = [
    {
      id: 'local-nist-800-161',
      name: 'NIST SP 800-161 (Supply Chain)',
      description: 'Offline starter framework for vendor security assessments.',
      framework_type: 'nist',
      question_count: 0,
      estimated_time: '15-30m',
      is_active: true,
      created_at: nowIso(),
      updated_at: nowIso(),
    },
  ];
  writeJson(KEY_FRAMEWORKS, seeded);
  return seeded;
}

export function getLocalAssessmentFrameworks(): AssessmentFramework[] {
  return ensureFrameworksSeeded().filter((f) => f.is_active);
}

type StoreState = Record<string, VendorAssessment[]>;

function scopeKey(userId?: string): string {
  return userId ? `user:${userId}` : 'anon';
}

function loadAll(): StoreState {
  return readJson<StoreState>(KEY, {});
}

function saveAll(next: StoreState): void {
  writeJson(KEY, next);
}

export function listLocalVendorAssessments(userId?: string): VendorAssessment[] {
  const state = loadAll();
  const key = scopeKey(userId);
  return Array.isArray(state[key]) ? state[key] : [];
}

export function createLocalVendorAssessment(
  assessmentData: Omit<VendorAssessmentInsert, 'user_id'>,
  userId?: string
): VendorAssessment {
  const state = loadAll();
  const key = scopeKey(userId);
  const existing = Array.isArray(state[key]) ? state[key] : [];
  const ts = nowIso();
  const created: VendorAssessment = {
    id: localId('va'),
    user_id: userId ?? null,
    vendor_id: assessmentData.vendor_id ?? null,
    framework_id: assessmentData.framework_id ?? null,
    assessment_name: assessmentData.assessment_name ?? null,
    status: (assessmentData.status as VendorAssessment['status']) ?? 'pending',
    contact_email: assessmentData.contact_email ?? null,
    due_date: assessmentData.due_date ?? null,
    instructions: assessmentData.instructions ?? null,
    overall_score: assessmentData.overall_score ?? null,
    section_scores: assessmentData.section_scores ?? null,
    sent_at: assessmentData.sent_at ?? null,
    completed_at: assessmentData.completed_at ?? null,
    created_at: ts,
    updated_at: ts,
  };
  state[key] = [created, ...existing];
  saveAll(state);
  return created;
}

export function updateLocalVendorAssessment(
  id: string,
  updates: VendorAssessmentUpdate,
  userId?: string
): VendorAssessment {
  const state = loadAll();
  const key = scopeKey(userId);
  const existing = Array.isArray(state[key]) ? state[key] : [];
  let updated: VendorAssessment | null = null;
  const next = existing.map((a) => {
    if (a.id !== id) return a;
    updated = { ...a, ...updates, updated_at: nowIso() };
    return updated as VendorAssessment;
  });
  if (!updated) throw new Error('Assessment not found');
  state[key] = next;
  saveAll(state);
  return updated;
}

export function deleteLocalVendorAssessment(id: string, userId?: string): void {
  const state = loadAll();
  const key = scopeKey(userId);
  const existing = Array.isArray(state[key]) ? state[key] : [];
  state[key] = existing.filter((a) => a.id !== id);
  saveAll(state);
}

