import type { Database } from '../../lib/database.types';

type VendorRow = Database['public']['Tables']['vs_vendors']['Row'];
type VendorInsert = Database['public']['Tables']['vs_vendors']['Insert'];
type VendorUpdate = Database['public']['Tables']['vs_vendors']['Update'];
type AssessmentRow = Database['public']['Tables']['vs_supply_chain_assessments']['Row'];
type AssessmentUpdate = Database['public']['Tables']['vs_supply_chain_assessments']['Update'];

const KEYS = {
  vendors: 'vendorsoluce.local.vendors',
  assessments: 'vendorsoluce.local.assessments',
};

const isBrowser = typeof window !== 'undefined';

export type LocalWorkspaceStorageIssueCode = 'quota_exceeded' | 'storage_unavailable' | 'write_failed' | 'read_failed';

export interface LocalWorkspaceStorageIssue {
  code: LocalWorkspaceStorageIssueCode;
  operation: 'read' | 'write';
  key: string;
  message: string;
}

export type LocalWorkspaceStorageWriteResult =
  | { ok: true }
  | { ok: false; issue: LocalWorkspaceStorageIssue };

export class LocalWorkspaceStorageError extends Error {
  readonly issue: LocalWorkspaceStorageIssue;

  constructor(issue: LocalWorkspaceStorageIssue) {
    super(issue.message);
    this.name = 'LocalWorkspaceStorageError';
    this.issue = issue;
  }
}

let lastStorageIssue: LocalWorkspaceStorageIssue | null = null;

function setLastStorageIssue(issue: LocalWorkspaceStorageIssue | null): void {
  lastStorageIssue = issue;
}

export function getLocalWorkspaceStorageIssue(): LocalWorkspaceStorageIssue | null {
  return lastStorageIssue;
}

export function clearLocalWorkspaceStorageIssue(): void {
  setLastStorageIssue(null);
}

function isQuotaExceededError(error: unknown): boolean {
  return (
    (typeof DOMException !== 'undefined' && error instanceof DOMException && error.name === 'QuotaExceededError') ||
    (typeof error === 'object' && error !== null && 'name' in error && (error as { name?: string }).name === 'QuotaExceededError')
  );
}

function buildStorageIssue(
  operation: 'read' | 'write',
  key: string,
  error: unknown
): LocalWorkspaceStorageIssue {
  if (isQuotaExceededError(error)) {
    return {
      code: 'quota_exceeded',
      operation,
      key,
      message:
        'Browser storage quota exceeded. Export/download your workspace data now to avoid data loss, then clear space and retry.',
    };
  }

  return {
    code: isBrowser ? `${operation}_failed` : 'storage_unavailable',
    operation,
    key,
    message:
      operation === 'write'
        ? 'Unable to save workspace changes in browser storage. Export/download your workspace data and retry after freeing browser storage.'
        : 'Unable to read workspace data from browser storage.',
  };
}

function readJson<T>(key: string, fallback: T): T {
  if (!isBrowser) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    const parsed = raw ? (JSON.parse(raw) as T) : fallback;
    if (lastStorageIssue?.operation === 'read') setLastStorageIssue(null);
    return parsed;
  } catch (error) {
    setLastStorageIssue(buildStorageIssue('read', key, error));
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): LocalWorkspaceStorageWriteResult {
  if (!isBrowser) {
    const issue = buildStorageIssue('write', key, null);
    setLastStorageIssue(issue);
    return { ok: false, issue };
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    if (lastStorageIssue?.operation === 'write' && lastStorageIssue?.key === key) {
      setLastStorageIssue(null);
    }
    return { ok: true };
  } catch (error) {
    const issue = buildStorageIssue('write', key, error);
    setLastStorageIssue(issue);
    return { ok: false, issue };
  }
}

function nowIso(): string {
  return new Date().toISOString();
}

function localId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
}

function seedVendors(userId: string): VendorRow[] {
  const createdAt = nowIso();
  return [
    {
      id: localId('vendor'),
      user_id: userId,
      name: 'CloudCore Hosting',
      industry: 'Cloud Infrastructure',
      risk_score: 78,
      risk_level: 'High',
      compliance_status: 'Partial',
      last_assessment_date: createdAt,
      assessment_status: 'completed',
      contract_renewal_date: null,
      contact_email: 'vendor@cloudcore.example',
      contact_name: 'Operations Lead',
      contact_phone: null,
      description: 'Primary infrastructure and hosting provider supporting customer-facing services.',
      website: 'https://example.com',
      annual_spend: null,
      criticality: 'Critical',
      created_at: createdAt,
      updated_at: createdAt,
    },
    {
      id: localId('vendor'),
      user_id: userId,
      name: 'PayFlow Services',
      industry: 'Payments',
      risk_score: 62,
      risk_level: 'Medium',
      compliance_status: 'Partial',
      last_assessment_date: createdAt,
      assessment_status: 'in_progress',
      contract_renewal_date: null,
      contact_email: 'security@payflow.example',
      contact_name: 'Security Team',
      contact_phone: null,
      description: 'Payment processing partner with elevated concentration and continuity implications.',
      website: 'https://example.com',
      annual_spend: null,
      criticality: 'High',
      created_at: createdAt,
      updated_at: createdAt,
    },
  ];
}

function seedAssessments(userId: string, vendors: VendorRow[]): AssessmentRow[] {
  const createdAt = nowIso();
  return [
    {
      id: localId('assessment'),
      user_id: userId,
      vendor_id: vendors[0]?.id ?? null,
      vendor_name: vendors[0]?.name ?? 'CloudCore Hosting',
      framework: 'NIST SP 800-161',
      assessment_name: 'Critical vendor baseline review',
      status: 'completed',
      overall_score: 78,
      section_scores: [{ section: 'Governance', score: 82 }, { section: 'Resilience', score: 74 }],
      answers: { governance: 'partial', resilience: 'needs-improvement' },
      due_date: null,
      completed_at: createdAt,
      created_at: createdAt,
      updated_at: createdAt,
    },
  ];
}

export function getLocalVendors(userId: string): VendorRow[] {
  const vendors = readJson<VendorRow[]>(KEYS.vendors, []);
  if (vendors.length > 0) return vendors.filter((vendor) => vendor.user_id === userId);
  const seeded = seedVendors(userId);
  writeJson(KEYS.vendors, seeded);
  return seeded;
}

export function saveLocalVendors(vendors: VendorRow[]): LocalWorkspaceStorageWriteResult {
  return writeJson(KEYS.vendors, vendors);
}

export function createLocalVendor(userId: string, vendorData: Omit<VendorInsert, 'user_id'>): VendorRow {
  const vendors = getLocalVendors(userId);
  const timestamp = nowIso();
  const vendor: VendorRow = {
    id: localId('vendor'),
    user_id: userId,
    name: vendorData.name,
    industry: vendorData.industry ?? null,
    risk_score: vendorData.risk_score ?? 0,
    risk_level: vendorData.risk_level ?? null,
    compliance_status: vendorData.compliance_status ?? null,
    last_assessment_date: vendorData.last_assessment_date ?? null,
    assessment_status: vendorData.assessment_status ?? null,
    contract_renewal_date: vendorData.contract_renewal_date ?? null,
    contact_email: vendorData.contact_email ?? null,
    contact_name: vendorData.contact_name ?? null,
    contact_phone: vendorData.contact_phone ?? null,
    description: vendorData.description ?? null,
    website: vendorData.website ?? null,
    annual_spend: vendorData.annual_spend ?? null,
    criticality: vendorData.criticality ?? null,
    created_at: timestamp,
    updated_at: timestamp,
  };
  const next = [vendor, ...vendors];
  const saveResult = saveLocalVendors(next);
  if (!saveResult.ok) throw new LocalWorkspaceStorageError(saveResult.issue);
  return vendor;
}

export function updateLocalVendor(userId: string, id: string, updates: VendorUpdate): VendorRow {
  const vendors = getLocalVendors(userId);
  let updatedVendor: VendorRow | null = null;
  const next = vendors.map((vendor) => {
    if (vendor.id !== id) return vendor;
    updatedVendor = { ...vendor, ...updates, updated_at: nowIso() };
    return updatedVendor as VendorRow;
  });
  const saveResult = saveLocalVendors(next);
  if (!saveResult.ok) throw new LocalWorkspaceStorageError(saveResult.issue);
  if (!updatedVendor) throw new Error('Vendor not found');
  return updatedVendor;
}

export function deleteLocalVendor(userId: string, id: string): void {
  const next = getLocalVendors(userId).filter((vendor) => vendor.id !== id);
  const saveResult = saveLocalVendors(next);
  if (!saveResult.ok) throw new LocalWorkspaceStorageError(saveResult.issue);
}

export function getLocalAssessments(userId: string): AssessmentRow[] {
  const assessments = readJson<AssessmentRow[]>(KEYS.assessments, []);
  if (assessments.length > 0) return assessments.filter((assessment) => assessment.user_id === userId);
  const seeded = seedAssessments(userId, getLocalVendors(userId));
  writeJson(KEYS.assessments, seeded);
  return seeded;
}

export function saveLocalAssessments(assessments: AssessmentRow[]): LocalWorkspaceStorageWriteResult {
  return writeJson(KEYS.assessments, assessments);
}

export function upsertLocalAssessment(
  userId: string,
  currentAssessmentId: string | null,
  assessmentData: Partial<AssessmentUpdate>,
  answers: Record<string, string>
): AssessmentRow {
  const assessments = getLocalAssessments(userId);
  const timestamp = nowIso();
  if (currentAssessmentId) {
    let updated: AssessmentRow | null = null;
    const next = assessments.map((assessment) => {
      if (assessment.id !== currentAssessmentId) return assessment;
      updated = {
        ...assessment,
        ...assessmentData,
        answers,
        updated_at: timestamp,
      };
      return updated as AssessmentRow;
    });
    const saveResult = saveLocalAssessments(next);
    if (!saveResult.ok) throw new LocalWorkspaceStorageError(saveResult.issue);
    if (!updated) throw new Error('Assessment not found');
    return updated;
  }

  const created: AssessmentRow = {
    id: localId('assessment'),
    user_id: userId,
    vendor_id: (assessmentData.vendor_id as string | null | undefined) ?? null,
    vendor_name: (assessmentData.vendor_name as string | null | undefined) ?? null,
    framework: (assessmentData.framework as string | null | undefined) ?? 'NIST SP 800-161',
    assessment_name: (assessmentData.assessment_name as string | null | undefined) ?? 'Supply Chain Assessment',
    status: (assessmentData.status as string | null | undefined) ?? 'in_progress',
    overall_score: (assessmentData.overall_score as number | null | undefined) ?? null,
    section_scores: (assessmentData.section_scores as AssessmentRow['section_scores']) ?? null,
    answers,
    due_date: (assessmentData.due_date as string | null | undefined) ?? null,
    completed_at: (assessmentData.completed_at as string | null | undefined) ?? null,
    created_at: timestamp,
    updated_at: timestamp,
  };
  const next = [created, ...assessments];
  const saveResult = saveLocalAssessments(next);
  if (!saveResult.ok) throw new LocalWorkspaceStorageError(saveResult.issue);
  return created;
}

export function completeLocalAssessment(
  userId: string,
  assessmentId: string,
  overallScore: number,
  sectionScores: Array<{ section: string; score: number }>
): AssessmentRow {
  const assessments = getLocalAssessments(userId);
  let completed: AssessmentRow | null = null;
  const next = assessments.map((assessment) => {
    if (assessment.id !== assessmentId) return assessment;
    completed = {
      ...assessment,
      overall_score: overallScore,
      section_scores: sectionScores,
      status: 'completed',
      completed_at: nowIso(),
      updated_at: nowIso(),
    };
    return completed as AssessmentRow;
  });
  const saveResult = saveLocalAssessments(next);
  if (!saveResult.ok) throw new LocalWorkspaceStorageError(saveResult.issue);
  if (!completed) throw new Error('Assessment not found');
  return completed;
}

export function deleteLocalAssessment(userId: string, id: string): void {
  const next = getLocalAssessments(userId).filter((assessment) => assessment.id !== id);
  const saveResult = saveLocalAssessments(next);
  if (!saveResult.ok) throw new LocalWorkspaceStorageError(saveResult.issue);
}
