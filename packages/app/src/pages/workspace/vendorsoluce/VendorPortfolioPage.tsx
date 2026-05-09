import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Users, CheckCircle, AlertTriangle } from 'lucide-react';
import { WR } from 'shared/constants/routes';
import { useSubscription } from '../../../hooks/useSubscription';
import { canManageClientPortfolio } from '../../../config/tiers';
import { vendorOrgService } from '../../../services/vendorOrgService';
import { attestationVerificationService } from '../../../services/attestationVerificationService';
import { FeatureGate } from '../../../components/billing/FeatureGate';
import WorkspacePageShell, { WORKSPACE_PAGE_BODY_GRID_CLASS } from '../../../components/vendorsoluce-intelligence/WorkspacePageShell';
import PanelCard from '../../../components/vendorsoluce-intelligence/PanelCard';
import OrgSwitcher from '../../../components/workspace/OrgSwitcher';
import type { ActiveOrg } from '../../../services/vendorOrgService';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type RiskLevel = 'Critical' | 'High' | 'Medium' | 'Low';

function getRiskLevel(v: Record<string, unknown>): RiskLevel | null {
  const raw = v.risk_level;
  if (raw === 'Critical' || raw === 'High' || raw === 'Medium' || raw === 'Low') return raw;
  return null;
}

function getRiskScore(v: Record<string, unknown>): number {
  return typeof v.risk_score === 'number' ? v.risk_score : 0;
}

function isAssessmentComplete(v: Record<string, unknown>): boolean {
  return v.assessment_status === 'complete';
}

function formatDate(raw: unknown): string {
  if (!raw || typeof raw !== 'string') return 'Never';
  try {
    return new Date(raw).toLocaleDateString();
  } catch {
    return 'Never';
  }
}

const RISK_BADGE_CLASSES: Record<RiskLevel, string> = {
  Critical: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  High: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
  Medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
  Low: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
};

// ---------------------------------------------------------------------------
// Attestation badge
// ---------------------------------------------------------------------------

type AttestationBadgeStatus = 'attested' | 'conditional' | 'none';

function getAttestationStatus(vendorId: string): AttestationBadgeStatus {
  const attestations = attestationVerificationService.getAttestationsForVendor(vendorId);
  if (attestations.length === 0) return 'none';
  const best = attestations.find((a) => a.determination === 'met');
  if (best) return 'attested';
  const conditional = attestations.find(
    (a) => a.determination === 'conditional' || a.determination === 'not_met',
  );
  if (conditional) return 'conditional';
  return 'none';
}

const ATTESTATION_BADGE: Record<
  AttestationBadgeStatus,
  { label: string; className: string }
> = {
  attested: {
    label: 'Attested',
    className: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  },
  conditional: {
    label: 'Conditional',
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
  },
  none: {
    label: 'None',
    className: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
  },
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

const VendorPortfolioPage: React.FC = () => {
  const { tier } = useSubscription();
  const hasAccess = canManageClientPortfolio(tier);

  const [activeOrg, setActiveOrg] = React.useState<ActiveOrg | null>(() =>
    vendorOrgService.getActiveOrg(),
  );
  const [vendors, setVendors] = React.useState<Record<string, unknown>[]>(() =>
    vendorOrgService.getVendorsForOrg(activeOrg?.orgId ?? ''),
  );

  // Fire-and-forget hydration on mount
  React.useEffect(() => {
    void vendorOrgService.hydrateFromSupabase().then(() => {
      const org = vendorOrgService.getActiveOrg();
      setActiveOrg(org);
      setVendors(vendorOrgService.getVendorsForOrg(org?.orgId ?? ''));
    });
  }, []);

  // Reload vendors when active org changes
  React.useEffect(() => {
    setVendors(vendorOrgService.getVendorsForOrg(activeOrg?.orgId ?? ''));
  }, [activeOrg]);

  // Listen for OrgSwitcher changes (poll localStorage on focus)
  React.useEffect(() => {
    const onFocus = () => {
      const org = vendorOrgService.getActiveOrg();
      setActiveOrg((prev) => {
        if (prev?.orgId !== org?.orgId) {
          setVendors(vendorOrgService.getVendorsForOrg(org?.orgId ?? ''));
          return org;
        }
        return prev;
      });
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  // Derived counts
  const criticalHighCount = vendors.filter((v) => {
    const level = getRiskLevel(v);
    return level === 'Critical' || level === 'High';
  }).length;

  const assessmentsCompleteCount = vendors.filter(isAssessmentComplete).length;

  const attestedCount = vendors.filter(
    (v) => getAttestationStatus(v.id as string) !== 'none',
  ).length;

  const unattestedCount = vendors.length - attestedCount;
  const attestedPct = vendors.length > 0 ? Math.round((attestedCount / vendors.length) * 100) : 0;
  const unattestedPct = vendors.length > 0 ? 100 - attestedPct : 0;

  const top10 = vendors
    .slice()
    .sort((a, b) => getRiskScore(b) - getRiskScore(a))
    .slice(0, 10);

  const isSolo = vendorOrgService.isSoloUser();

  const headerActionsSlot = (
    <OrgSwitcher />
  );

  return (
    <WorkspacePageShell
      title="Vendor Portfolio"
      description={activeOrg?.orgName ?? 'Personal workspace'}
      headerActionsSlot={headerActionsSlot}
      stats={[
        {
          label: 'Total vendors',
          value: vendors.length,
          hint: 'Vendors in this org context',
        },
        {
          label: 'Critical / High risk',
          value: criticalHighCount,
          hint: 'Vendors at Critical or High risk level',
        },
        {
          label: 'Assessments complete',
          value: assessmentsCompleteCount,
          hint: 'Vendors with completed assessments',
        },
        {
          label: 'Attested',
          value: attestedCount,
          hint: 'Vendors with at least one valid attestation',
        },
      ]}
    >
      {!hasAccess ? (
        <FeatureGate feature="vendor_portfolio_management" requiredTier="enterprise">
          {null}
        </FeatureGate>
      ) : (
        <>
          {/* Empty state */}
          {vendors.length === 0 && isSolo ? (
            <PanelCard
              title="No vendors yet"
              description="Your personal workspace is empty."
            >
              <div className="space-y-3 rounded-2xl border border-dashed border-gray-300 p-8 text-center dark:border-gray-700">
                <Users className="mx-auto h-8 w-8 text-gray-400" aria-hidden="true" />
                <div>
                  <div className="text-base font-semibold text-gray-900 dark:text-white">
                    No vendors in your portfolio yet.
                  </div>
                  <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Add your first vendor to get started.
                  </div>
                </div>
                <Link
                  to={WR.VENDOR_GRAPH_IMPORT}
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200/70 px-4 py-2 text-sm font-medium text-gray-900 transition hover:bg-gray-50 dark:border-gray-800 dark:text-white dark:hover:bg-gray-900/60"
                >
                  Import vendors
                </Link>
              </div>
            </PanelCard>
          ) : null}

          {/* Attestation coverage */}
          <PanelCard
            title="Attestation Coverage"
            description="Proportion of vendors in this org context with at least one linked attestation."
          >
            <div className={`${WORKSPACE_PAGE_BODY_GRID_CLASS} sm:grid-cols-2`}>
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
                  Attested
                </div>
                <div className="mt-1.5 text-2xl font-semibold tabular-nums text-gray-950 dark:text-white">
                  {attestedCount}
                  <span className="ml-2 text-base font-normal text-gray-500 dark:text-gray-400">
                    {attestedPct}%
                  </span>
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
                  Unattested
                </div>
                <div className="mt-1.5 text-2xl font-semibold tabular-nums text-gray-950 dark:text-white">
                  {unattestedCount}
                  <span className="ml-2 text-base font-normal text-gray-500 dark:text-gray-400">
                    {unattestedPct}%
                  </span>
                </div>
              </div>
            </div>
            {vendors.length > 0 ? (
              <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  className={`h-full rounded-full bg-emerald-500 transition-all duration-500 w-[${attestedPct}%]`}
                  role="progressbar"
                  aria-valuenow={attestedPct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Attestation coverage"
                />
              </div>
            ) : null}
          </PanelCard>

          {/* Top vendors by risk */}
          <PanelCard
            title="Top Vendors by Risk"
            description="Top 10 vendors ranked by risk score descending."
          >
            {top10.length === 0 ? (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                No vendor records are available in this org context.
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-gray-200/70 dark:border-gray-800">
                <div className="grid grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))] gap-4 border-b border-gray-200/70 bg-gray-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:border-gray-800 dark:bg-gray-900/60 dark:text-gray-400">
                  <div>Vendor Name</div>
                  <div>Risk Tier</div>
                  <div>Last Assessment</div>
                  <div>Attestation</div>
                </div>
                <div className="divide-y divide-gray-200/70 dark:divide-gray-800">
                  {top10.map((v) => {
                    const id = v.id as string;
                    const name = typeof v.name === 'string' ? v.name : id;
                    const riskLevel = getRiskLevel(v);
                    const attStatus = getAttestationStatus(id);
                    const attBadge = ATTESTATION_BADGE[attStatus];
                    const lastAssessment = formatDate(v.last_assessment_date);

                    return (
                      <Link
                        key={id}
                        to={WR.VENDOR_INTELLIGENCE_DETAIL.replace(':vendorId', id)}
                        className="grid grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))] gap-4 px-4 py-4 transition hover:bg-emerald-50/50 dark:hover:bg-emerald-950/10"
                      >
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold text-gray-950 dark:text-white">
                            {name}
                          </div>
                        </div>
                        <div>
                          {riskLevel ? (
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${RISK_BADGE_CLASSES[riskLevel]}`}
                            >
                              {riskLevel}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400 dark:text-gray-500">—</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          {lastAssessment}
                        </div>
                        <div>
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${attBadge.className}`}
                          >
                            {attBadge.label}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </PanelCard>

          {/* Summary signals */}
          <PanelCard
            title="Portfolio signals"
            description="Quick risk summary for the current org context."
          >
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-gray-200/70 p-4 dark:border-gray-800">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                  <AlertTriangle className="h-4 w-4 text-orange-500" aria-hidden="true" />
                  Critical / High
                </div>
                <div className="mt-2 text-2xl font-semibold tabular-nums text-gray-950 dark:text-white">
                  {criticalHighCount}
                </div>
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  vendors requiring immediate attention
                </div>
              </div>
              <div className="rounded-2xl border border-gray-200/70 p-4 dark:border-gray-800">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                  <CheckCircle className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                  Assessed
                </div>
                <div className="mt-2 text-2xl font-semibold tabular-nums text-gray-950 dark:text-white">
                  {assessmentsCompleteCount}
                </div>
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  vendors with completed assessments
                </div>
              </div>
              <div className="rounded-2xl border border-gray-200/70 p-4 dark:border-gray-800">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                  <Shield className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                  Attested
                </div>
                <div className="mt-2 text-2xl font-semibold tabular-nums text-gray-950 dark:text-white">
                  {attestedCount}
                </div>
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  vendors with verified attestations
                </div>
              </div>
            </div>
          </PanelCard>
        </>
      )}
    </WorkspacePageShell>
  );
};

export default VendorPortfolioPage;
