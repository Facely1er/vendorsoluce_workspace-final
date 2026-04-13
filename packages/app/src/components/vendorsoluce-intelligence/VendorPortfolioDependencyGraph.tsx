import React, { useEffect, useId, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { GraphEdge, GraphNode } from '@ermits/dependency-graph';
import { WR } from 'shared/constants/routes';
import type { IntegratedVendorRiskRecord } from 'shared/domain/vendorsoluce';
import { config } from '../../utils/config';
import { isSupabaseEnabled } from '../../lib/supabase';
import {
  buildDemoVendorGraphFromRecords,
  getVendorGraphData,
  type VendorGraphDataset,
} from '../../services/vendorsoluce/vendorGraphDataService';
import { cn } from '../../utils/cn';

const VIEW_W = 920;
const VIEW_H = 420;
const MAX_NODES = 72;

const NODE_FILL: Record<GraphNode['nodeType'], string> = {
  vendor: '#047857',
  service: '#0ea5e9',
  asset: '#6366f1',
  processing: '#d97706',
  data_domain: '#8b5cf6',
  jurisdiction: '#64748b',
  control: '#be123c',
};

/** Legend swatches (match NODE_FILL; avoid inline styles in markup). */
const NODE_LEGEND_CLASS: Record<GraphNode['nodeType'], string> = {
  vendor: 'bg-emerald-700',
  service: 'bg-sky-500',
  asset: 'bg-indigo-500',
  processing: 'bg-amber-600',
  data_domain: 'bg-violet-500',
  jurisdiction: 'bg-slate-500',
  control: 'bg-rose-700',
};

function circleLayout(
  nodeIds: string[],
  width: number,
  height: number
): Map<string, { x: number; y: number }> {
  const map = new Map<string, { x: number; y: number }>();
  const cx = width / 2;
  const cy = height / 2;
  const r = Math.min(width, height) * 0.36;
  const n = Math.max(nodeIds.length, 1);
  nodeIds.forEach((id, i) => {
    const a = (2 * Math.PI * i) / n - Math.PI / 2;
    map.set(id, { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) });
  });
  return map;
}

function pickNodesForView(nodes: GraphNode[]): GraphNode[] {
  if (nodes.length <= MAX_NODES) return nodes;
  const vendors = nodes.filter((n) => n.nodeType === 'vendor');
  const other = nodes.filter((n) => n.nodeType !== 'vendor');
  const merged = [...vendors, ...other];
  return merged.slice(0, MAX_NODES);
}

function filterEdgesForNodes(edges: GraphEdge[], nodeIds: Set<string>): GraphEdge[] {
  return edges.filter((e) => nodeIds.has(e.sourceNodeId) && nodeIds.has(e.targetNodeId));
}

interface VendorPortfolioDependencyGraphProps {
  orgId: string | null;
  integratedRiskRecords: IntegratedVendorRiskRecord[];
}

/**
 * Portfolio-level dependency visualization: live data from `graph_nodes` / `graph_edges`,
 * or a synthetic ring of demo vendors when graph tables are unavailable.
 */
const VendorPortfolioDependencyGraph: React.FC<VendorPortfolioDependencyGraphProps> = ({
  orgId,
  integratedRiskRecords,
}) => {
  const navigate = useNavigate();
  const markerId = useId().replace(/:/g, '');
  const useLiveGraph = isSupabaseEnabled() && !config.app.demoMode && !!orgId;
  const [dataset, setDataset] = useState<VendorGraphDataset | null>(null);
  const [loading, setLoading] = useState(useLiveGraph);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!useLiveGraph) {
      setDataset(null);
      setLoading(false);
      setError(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    void (async () => {
      try {
        const data = await getVendorGraphData(orgId!);
        if (!cancelled) setDataset(data);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load graph');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [useLiveGraph, orgId]);

  const effectiveDataset: VendorGraphDataset | null = useMemo(() => {
    if (useLiveGraph) return dataset;
    if (integratedRiskRecords.length === 0) return null;
    return buildDemoVendorGraphFromRecords(integratedRiskRecords);
  }, [useLiveGraph, dataset, integratedRiskRecords]);

  const vendorIdByGraphNodeId = useMemo(() => {
    const m = new Map<string, string>();
    for (const r of integratedRiskRecords) {
      if (r.graphNodeId) m.set(r.graphNodeId, r.vendorId);
    }
    return m;
  }, [integratedRiskRecords]);

  const { nodes, edges, positions, truncated } = useMemo(() => {
    if (!effectiveDataset || effectiveDataset.nodes.length === 0) {
      return { nodes: [] as GraphNode[], edges: [] as GraphEdge[], positions: new Map(), truncated: false };
    }
    const picked = pickNodesForView(effectiveDataset.nodes);
    const idSet = new Set(picked.map((n) => n.id));
    const edgeSubset = filterEdgesForNodes(effectiveDataset.edges, idSet);
    const pos = circleLayout(
      picked.map((n) => n.id),
      VIEW_W,
      VIEW_H
    );
    return {
      nodes: picked,
      edges: edgeSubset,
      positions: pos,
      truncated: effectiveDataset.nodes.length > picked.length,
    };
  }, [effectiveDataset]);

  if (loading) {
    return (
      <div className="flex min-h-[220px] items-center justify-center text-sm text-gray-500 dark:text-gray-400">
        Loading dependency graph…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
        {error}
      </div>
    );
  }

  if (!effectiveDataset || nodes.length === 0) {
    return (
      <p className="text-sm text-gray-600 dark:text-gray-400">
        No graph nodes to render. Import the four-file dependency bundle (vendors, services, processing, edges) to
        populate the live graph, or add vendors to see the demo ring layout.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
        <span>
          {useLiveGraph ? (
            <>
              <span className="font-medium text-gray-700 dark:text-gray-300">Live graph</span> — {effectiveDataset.nodes.length}{' '}
              nodes, {effectiveDataset.edges.length} edges
            </>
          ) : (
            <>
              <span className="font-medium text-gray-700 dark:text-gray-300">Preview layout</span> — demo ring from portfolio
              vendors (import graph data for full services and processing nodes)
            </>
          )}
        </span>
        {truncated ? (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-900 dark:bg-amber-950/50 dark:text-amber-200">
            Showing {MAX_NODES} of {effectiveDataset.nodes.length} nodes
          </span>
        ) : null}
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200/80 bg-white dark:border-gray-800 dark:bg-gray-950">
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="h-auto w-full min-w-[640px]"
          role="img"
          aria-label="Vendor dependency graph"
        >
          <defs>
            <marker id={markerId} markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <polygon points="0 0, 6 3, 0 6" fill="#94a3b8" />
            </marker>
          </defs>
          {edges.map((e) => {
            const a = positions.get(e.sourceNodeId);
            const b = positions.get(e.targetNodeId);
            if (!a || !b) return null;
            return (
              <line
                key={e.id}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke="#cbd5e1"
                strokeWidth={1.25}
                className="dark:stroke-slate-600"
                markerEnd={`url(#${markerId})`}
              />
            );
          })}
          {nodes.map((n) => {
            const p = positions.get(n.id);
            if (!p) return null;
            const fill = NODE_FILL[n.nodeType] ?? '#64748b';
            const vendorId = vendorIdByGraphNodeId.get(n.id);
            const label = n.name.length > 22 ? `${n.name.slice(0, 20)}…` : n.name;
            const go = () => {
              if (vendorId) navigate(WR.VENDOR_INTELLIGENCE_DETAIL.replace(':vendorId', vendorId));
            };
            return (
              <g
                key={n.id}
                transform={`translate(${p.x},${p.y})`}
                onClick={vendorId ? go : undefined}
                className={vendorId ? 'cursor-pointer outline-none' : undefined}
              >
                <title>{vendorId ? `${n.name} — open vendor intelligence` : n.name}</title>
                <circle r={n.nodeType === 'vendor' ? 14 : 10} fill={fill} className="stroke-white stroke-2 dark:stroke-gray-950" />
                <text
                  y={n.nodeType === 'vendor' ? 28 : 24}
                  textAnchor="middle"
                  className="pointer-events-none fill-gray-700 text-[10px] leading-tight dark:fill-gray-200"
                >
                  {label}
                </text>
                <text
                  y={n.nodeType === 'vendor' ? 40 : 36}
                  textAnchor="middle"
                  className="pointer-events-none fill-gray-400 text-[9px] leading-tight"
                >
                  {n.nodeType}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-gray-500 dark:text-gray-400">
        {(Object.keys(NODE_FILL) as GraphNode['nodeType'][]).map((k) => (
          <li key={k} className="flex items-center gap-1.5">
            <span className={cn('inline-block h-2.5 w-2.5 rounded-full', NODE_LEGEND_CLASS[k])} />
            <span className="capitalize">{k.replace(/_/g, ' ')}</span>
          </li>
        ))}
      </ul>
      <p className="text-xs text-gray-500 dark:text-gray-500">
        Per-vendor critical paths, scenarios, and cascade export live on each vendor&apos;s intelligence page. This view is a
        portfolio-wide map of nodes and edges.
      </p>
    </div>
  );
};

export default VendorPortfolioDependencyGraph;
