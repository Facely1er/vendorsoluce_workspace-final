import React from 'react';
import { Download, FileSearch, GitBranch, RadioTower, RefreshCw, ShieldAlert, Zap } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useVendorStore } from '../../../stores/vendorStore';
import { supabase, isSupabaseEnabled } from '../../../lib/supabase';
import { exportVendorCascadeHtml, recomputeVendorCriticalPaths, recomputeVendorMetrics, runVendorScenario } from '../../../services/vendorsoluce';
import { Button } from '../../../components/ui/Button';
import WorkspacePageShell from '../../../components/vendorsoluce-intelligence/WorkspacePageShell';
import PanelCard from '../../../components/vendorsoluce-intelligence/PanelCard';
import { MetricPill } from '../../../components/vendorsoluce-intelligence/MetricPill';
import { formatPercent, resolveOrgId, riskTone } from './utils';
import { config } from '../../../utils/config';

interface CriticalPathRow {
  id: string;
  path_rank: number;
  path_score: number;
  path_type: string;
  node_path: string[];
}

function buildDemoCriticalPaths(graphNodeId: string): CriticalPathRow[] {
  return [
    {
      id: 'demo-path-1',
      path_rank: 1,
      path_score: 0.92,
      path_type: 'supply_chain',
      node_path: [graphNodeId, 'demo-service-edge', 'demo-processing-hub'],
    },
    {
      id: 'demo-path-2',
      path_rank: 2,
      path_score: 0.71,
      path_type: 'data_flow',
      node_path: [graphNodeId, 'demo-subprocessor-a'],
    },
  ];
}

function buildDemoScenario() {
  return {
    scenario_type: 'outage',
    affected_nodes: ['demo-service-edge', 'demo-processing-hub', 'demo-app-consumer'],
    blast_radius_score: 68,
    operational_impact_score: 72,
    privacy_impact_score: 41,
  };
}

const VendorIntelligenceDetailPage: React.FC = () => {
  const { vendorId = '' } = useParams();
  const { user } = useAuth();
  const { vendors, integratedRiskRecords, intelligenceByVendorId, fetchVendors } = useVendorStore();
  const orgId = React.useMemo(() => resolveOrgId(user), [user]);
  const [criticalPaths, setCriticalPaths] = React.useState<CriticalPathRow[]>([]);
  const [latestScenario, setLatestScenario] = React.useState<Record<string, unknown> | null>(null);
  const [busy, setBusy] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const graphLive = isSupabaseEnabled() && !config.app.demoMode;
  const useDemoDetail = !graphLive;

  React.useEffect(() => {
    if (user?.id && orgId) void fetchVendors(user.id, orgId);
  }, [fetchVendors, orgId, user?.id]);

  const record = integratedRiskRecords.find((item) => item.vendorId === vendorId) ?? null;
  const vendor = vendors.find((item) => item.id === vendorId) ?? null;
  const intelligence = intelligenceByVendorId[vendorId];

  const loadDetail = React.useCallback(async () => {
    if (!orgId || !record?.graphNodeId) return;
    setError(null);
    if (useDemoDetail) {
      setCriticalPaths(buildDemoCriticalPaths(record.graphNodeId));
      setLatestScenario(buildDemoScenario());
      return;
    }
    const [{ data: paths, error: pathsError }, { data: scenario, error: scenarioError }] = await Promise.all([
      (supabase.from('vendor_critical_paths') as any)
        .select('id, path_rank, path_score, path_type, node_path')
        .eq('org_id', orgId)
        .eq('vendor_node_id', record.graphNodeId)
        .order('path_rank', { ascending: true })
        .limit(5),
      (supabase.from('vendor_scenario_runs') as any)
        .select('*')
        .eq('org_id', orgId)
        .eq('vendor_node_id', record.graphNodeId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);
    if (pathsError) setError(pathsError.message);
    if (scenarioError) setError(scenarioError.message);
    setCriticalPaths((paths ?? []) as CriticalPathRow[]);
    setLatestScenario(scenario ?? null);
  }, [orgId, record?.graphNodeId, useDemoDetail]);

  React.useEffect(() => {
    void loadDetail();
  }, [loadDetail]);

  const runScenario = async (scenarioType: 'outage' | 'breach' | 'degradation') => {
    if (!graphLive || !orgId || !record?.graphNodeId) return;
    setBusy(scenarioType);
    setError(null);
    try {
      await runVendorScenario(orgId, record.graphNodeId, scenarioType);
      await loadDetail();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to run scenario');
    } finally {
      setBusy(null);
    }
  };

  const refreshMetrics = async () => {
    if (!graphLive || !orgId || !user?.id) return;
    setBusy('refresh');
    setError(null);
    try {
      await recomputeVendorMetrics(orgId);
      await recomputeVendorCriticalPaths(orgId);
      await fetchVendors(user.id, orgId);
      await loadDetail();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to recompute metrics');
    } finally {
      setBusy(null);
    }
  };

  const exportCascade = async () => {
    if (!graphLive || !orgId || !record?.graphNodeId) return;
    setBusy('export');
    setError(null);
    try {
      const html = await exportVendorCascadeHtml(orgId, record.graphNodeId);
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${record.vendorName.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-cascade-brief.html`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to export cascade brief');
    } finally {
      setBusy(null);
    }
  };

  if (!vendor || !record) {
    return (
      <WorkspacePageShell
        title="Vendor detail unavailable"
        description="The requested vendor was not found in the current workspace context."
      >
        <PanelCard title="No vendor record" description="Refresh the portfolio or open a vendor from the intelligence table.">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            No integrated vendor record could be resolved for this id.
          </div>
        </PanelCard>
      </WorkspacePageShell>
    );
  }

  const headerActionsSlot = (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="outline" disabled={!graphLive || busy === 'refresh'} onClick={() => void refreshMetrics()}>
        Recompute metrics
      </Button>
      <Button variant="primary" disabled={!graphLive || busy === 'export'} onClick={() => void exportCascade()}>
        Export cascade brief
      </Button>
    </div>
  );

  const scenario = latestScenario as {
    scenario_type?: string;
    affected_nodes?: unknown[];
    blast_radius_score?: number;
    operational_impact_score?: number;
    privacy_impact_score?: number;
  } | null;

  return (
    <WorkspacePageShell
      title={record.vendorName}
      description="Dependency-aware vendor detail with graph linkage, critical path context, and scenario simulation."
      headerActionsSlot={headerActionsSlot}
      stats={[
        { label: 'Final risk', value: formatPercent(record.finalRiskScore), hint: 'Integrated score' },
        { label: 'Propagation', value: formatPercent(record.propagationRiskScore), hint: 'Downstream spread risk' },
        { label: 'Systemic', value: formatPercent(record.systemicDependencyScore), hint: 'Portfolio structural importance' },
        { label: 'Confidence', value: formatPercent(record.graphConfidenceScore), hint: 'Graph match and metrics confidence' },
      ]}
    >
      {useDemoDetail ? (
        <div className="rounded-xl border border-blue-200 bg-blue-50/80 px-4 py-3 text-sm text-blue-900 dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-200">
          Demo sample: critical paths and scenario values are illustrative. Connect a database and turn off demo mode for live
          import, recomputation, and exports.
        </div>
      ) : null}
      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/70 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      ) : null}
      <div className="grid gap-6 xl:grid-cols-[1.3fr,1fr]">
        <div className="grid gap-6">
          <PanelCard
            title="Integrated risk profile"
            description="Assessment and graph metrics side by side for one vendor."
          >
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <MetricPill label="Assessment / inherent" value={formatPercent(record.inherentRiskScore)} tone={riskTone(record.inherentRiskScore)} />
              <MetricPill label="Propagation risk" value={formatPercent(record.propagationRiskScore)} tone={riskTone(record.propagationRiskScore)} />
              <MetricPill label="Systemic dependency" value={formatPercent(record.systemicDependencyScore)} tone={riskTone(record.systemicDependencyScore)} />
              <MetricPill label="Concentration" value={formatPercent(record.concentrationFactor)} tone={riskTone(record.concentrationFactor)} />
              <MetricPill label="Blast radius impact" value={formatPercent(record.blastRadiusWeightedImpact)} tone={riskTone(record.blastRadiusWeightedImpact)} />
              <MetricPill label="Graph linkage" value={record.graphLinked ? 'Linked' : 'Not linked'} tone={record.graphLinked ? 'good' : 'warn'} />
            </div>
            {intelligence ? (
              <div className="mt-5 rounded-2xl border border-gray-200/70 bg-gray-50/70 p-4 text-sm dark:border-gray-800 dark:bg-gray-900/50">
                <div className="font-medium text-gray-900 dark:text-white">Graph match details</div>
                <div className="mt-2 grid gap-2 text-gray-600 dark:text-gray-300 sm:grid-cols-2">
                  <div>
                    Match type: <span className="font-medium">{intelligence.matchType ?? '—'}</span>
                  </div>
                  <div>
                    Graph node: <span className="font-medium">{intelligence.nodeName ?? '—'}</span>
                  </div>
                </div>
              </div>
            ) : null}
          </PanelCard>
          <PanelCard
            title="Critical dependency paths"
            description="Highest-ranked paths anchored to this vendor after graph computation."
          >
            {criticalPaths.length === 0 ? (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                No critical paths are stored yet. Recompute metrics to generate them.
              </div>
            ) : (
              <div className="space-y-3">
                {criticalPaths.map((path) => (
                  <div key={path.id} className="rounded-2xl border border-gray-200/70 p-4 dark:border-gray-800">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                        <GitBranch className="h-4 w-4 text-emerald-600" />
                        Path #{path.path_rank}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        {path.path_type} · score {path.path_score.toFixed(2)}
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-600 dark:text-gray-300">
                      {path.node_path?.map((nodeId) => (
                        <span key={nodeId} className="rounded-full border border-gray-200 px-2.5 py-1 dark:border-gray-700">
                          {nodeId}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </PanelCard>
        </div>
        <div className="grid gap-6">
          <PanelCard title="Scenario simulation" description="Run a single-vendor scenario and update the latest impact narrative.">
            <div className="grid gap-3">
              <Button variant="outline" disabled={!graphLive} onClick={() => void runScenario('outage')}>
                <Zap className="h-4 w-4" />
                {busy === 'outage' ? 'Running outage…' : 'Run outage scenario'}
              </Button>
              <Button variant="outline" disabled={!graphLive} onClick={() => void runScenario('breach')}>
                <ShieldAlert className="h-4 w-4" />
                {busy === 'breach' ? 'Running breach…' : 'Run breach scenario'}
              </Button>
              <Button variant="outline" disabled={!graphLive} onClick={() => void runScenario('degradation')}>
                <RadioTower className="h-4 w-4" />
                {busy === 'degradation' ? 'Running degradation…' : 'Run degradation scenario'}
              </Button>
            </div>
            {scenario ? (
              <div className="mt-5 rounded-2xl border border-gray-200/70 bg-gray-50/70 p-4 text-sm dark:border-gray-800 dark:bg-gray-900/50">
                <div className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                  <FileSearch className="h-4 w-4 text-emerald-600" />
                  Latest {scenario.scenario_type} scenario
                </div>
                <div className="mt-3 grid gap-2 text-gray-600 dark:text-gray-300">
                  <div>Affected nodes: {scenario.affected_nodes?.length ?? 0}</div>
                  <div>Blast radius: {formatPercent(scenario.blast_radius_score)}</div>
                  <div>Operational impact: {formatPercent(scenario.operational_impact_score)}</div>
                  <div>Privacy impact: {formatPercent(scenario.privacy_impact_score)}</div>
                </div>
              </div>
            ) : null}
          </PanelCard>
          <PanelCard title="Actions" description="Operational actions aligned to the same workspace rhythm across pages.">
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
              <button
                type="button"
                className="flex w-full items-center justify-between rounded-xl border border-gray-200/70 px-4 py-3 text-left transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:hover:bg-gray-900/60"
                disabled={!graphLive}
                onClick={() => void refreshMetrics()}
              >
                <span className="font-medium text-gray-900 dark:text-white">Refresh graph metrics</span>
                <RefreshCw className="h-4 w-4 text-gray-400" />
              </button>
              <button
                type="button"
                className="flex w-full items-center justify-between rounded-xl border border-gray-200/70 px-4 py-3 text-left transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:hover:bg-gray-900/60"
                disabled={!graphLive}
                onClick={() => void exportCascade()}
              >
                <span className="font-medium text-gray-900 dark:text-white">Export cascade brief</span>
                <Download className="h-4 w-4 text-gray-400" />
              </button>
            </div>
          </PanelCard>
        </div>
      </div>
    </WorkspacePageShell>
  );
};

export default VendorIntelligenceDetailPage;
