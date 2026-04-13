import type { Database } from "../../lib/database.types";
import { supabase } from "../../lib/supabase";
import type { IntegratedVendorRiskRecord, VendorIntelligenceSnapshot, VendorNodeLink } from "shared/domain/vendorsoluce";

type VendorRow = Database["public"]["Tables"]["vs_vendors"]["Row"];

function demoHash(id: string, salt: number): number {
  let h = salt >>> 0;
  for (let i = 0; i < id.length; i++) {
    h = (Math.imul(31, h) + id.charCodeAt(i)) >>> 0;
  }
  return h;
}

function demoPercent(id: string, salt: number, min = 18, max = 92): number {
  const h = demoHash(id, salt);
  return min + (h % (max - min + 1));
}

/** Deterministic 0–1 float for snapshot fields that mirror DB metric columns. */
function demoUnit(id: string, salt: number): number {
  return (demoHash(id, salt) % 10000) / 10000;
}

function normalizeKey(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function toPercentageScore(value: number | null | undefined): number | null {
  if (typeof value !== "number" || Number.isNaN(value)) return null;
  return Math.max(0, Math.min(100, Math.round(value * 100)));
}

function resolveVendorNodeLink(vendor: VendorRow, nodes: any[]): VendorNodeLink | null {
  const vendorName = normalizeKey(vendor.name);
  const websiteKey = normalizeKey(vendor.website);
  for (const node of nodes) {
    if (node.node_type !== "vendor") continue;
    if (String(node.id) === vendor.id) return { vendorId: vendor.id, graphNodeId: String(node.id), matchType: "id", confidence: 1 };
    const externalKey = normalizeKey(node.external_key);
    if (externalKey && websiteKey && externalKey === websiteKey) return { vendorId: vendor.id, graphNodeId: String(node.id), matchType: "external_key", confidence: 0.95 };
    if (externalKey && externalKey === vendorName) return { vendorId: vendor.id, graphNodeId: String(node.id), matchType: "external_key", confidence: 0.9 };
    const nodeName = normalizeKey(node.name);
    if (nodeName && nodeName === vendorName) return { vendorId: vendor.id, graphNodeId: String(node.id), matchType: "name", confidence: 0.8 };
    const aliases = Array.isArray(node.metadata?.aliases) ? node.metadata.aliases.map((v: unknown) => normalizeKey(String(v))) : [];
    if (aliases.includes(vendorName)) return { vendorId: vendor.id, graphNodeId: String(node.id), matchType: "metadata", confidence: 0.7 };
  }
  return null;
}

export async function buildIntegratedVendorRiskRecords(orgId: string, vendors: VendorRow[]): Promise<{ intelligence: Record<string, VendorIntelligenceSnapshot>; records: IntegratedVendorRiskRecord[] }> {
  const [{ data: nodes, error: nodesError }, { data: metrics, error: metricsError }] = await Promise.all([
    (supabase.from("graph_nodes") as any).select("id, org_id, node_type, external_key, name, metadata").eq("org_id", orgId),
    (supabase.from("vendor_centrality_metrics") as any).select("*").eq("org_id", orgId),
  ]);
  if (nodesError) throw nodesError;
  if (metricsError) throw metricsError;

  const metricByNodeId = new Map<string, any>((metrics ?? []).map((row: any) => [String(row.node_id), row]));
  const intelligence: Record<string, VendorIntelligenceSnapshot> = {};
  const records = vendors.map((vendor) => {
    const link = resolveVendorNodeLink(vendor, nodes ?? []);
    const metric = link ? metricByNodeId.get(link.graphNodeId) : null;
    const snapshot: VendorIntelligenceSnapshot = {
      vendorId: vendor.id,
      graphNodeId: link?.graphNodeId,
      nodeName: link ? (nodes ?? []).find((node: any) => String(node.id) === link.graphNodeId)?.name : undefined,
      linked: Boolean(link),
      matchType: link?.matchType,
      confidence: link?.confidence ?? 0,
      weightedDegree: metric?.weighted_degree ?? undefined,
      betweenness: metric?.betweenness ?? undefined,
      closeness: metric?.closeness ?? undefined,
      eigenvector: metric?.eigenvector ?? undefined,
      concentrationFactor: metric?.concentration_factor ?? undefined,
      hiddenConcentrationScore: metric?.hidden_concentration_score ?? undefined,
      systemicDependencyScore: metric?.systemic_dependency_score ?? undefined,
      propagationRiskScore: metric?.propagation_risk_score ?? undefined,
      blastRadiusWeightedImpact: metric?.blast_radius_weighted_impact ?? undefined,
      confidenceScore: metric?.confidence_score ?? undefined,
    };
    intelligence[vendor.id] = snapshot;

    const inherentRiskScore = vendor.risk_score ?? null;
    const systemicDependencyScore = toPercentageScore(metric?.systemic_dependency_score ?? null);
    const propagationRiskScore = toPercentageScore(metric?.propagation_risk_score ?? null);
    const concentrationFactor = toPercentageScore(metric?.concentration_factor ?? null);
    const blastRadiusWeightedImpact = toPercentageScore(metric?.blast_radius_weighted_impact ?? null);
    const graphConfidenceScore = toPercentageScore(metric?.confidence_score ?? null);

    const riskInputs = [inherentRiskScore, systemicDependencyScore, propagationRiskScore].filter((value): value is number => typeof value === "number");
    const finalRiskScore = riskInputs.length > 0 ? Math.round(riskInputs.reduce((sum, value) => sum + value, 0) / riskInputs.length) : null;

    return {
      vendorId: vendor.id,
      vendorName: vendor.name,
      userId: vendor.user_id,
      inherentRiskScore,
      systemicDependencyScore,
      propagationRiskScore,
      concentrationFactor,
      blastRadiusWeightedImpact,
      graphConfidenceScore,
      finalRiskScore,
      graphNodeId: snapshot.graphNodeId,
      graphNodeName: snapshot.nodeName,
      graphLinked: snapshot.linked,
    };
  });

  return { intelligence, records };
}

/**
 * Synthetic graph intelligence for demo mode or when Supabase is not configured.
 * Keeps portfolio and detail views usable without live graph_nodes / metrics tables.
 */
export function buildDemoIntegratedVendorRiskRecords(
  vendors: VendorRow[],
): { intelligence: Record<string, VendorIntelligenceSnapshot>; records: IntegratedVendorRiskRecord[] } {
  const intelligence: Record<string, VendorIntelligenceSnapshot> = {};
  const records: IntegratedVendorRiskRecord[] = [];

  for (const vendor of vendors) {
    const graphNodeId = `demo-graph-node-${vendor.id}`;
    const systemicPct = demoPercent(vendor.id, 11);
    const propagationPct = demoPercent(vendor.id, 22);
    const concentrationPct = demoPercent(vendor.id, 33);
    const blastPct = demoPercent(vendor.id, 44);
    const confidencePct = demoPercent(vendor.id, 55, 62, 96);

    const inherentRiskScore = vendor.risk_score ?? null;
    const systemicDependencyScore = systemicPct;
    const propagationRiskScore = propagationPct;
    const concentrationFactor = concentrationPct;
    const blastRadiusWeightedImpact = blastPct;
    const graphConfidenceScore = confidencePct;

    const riskInputs = [inherentRiskScore, systemicDependencyScore, propagationRiskScore].filter(
      (value): value is number => typeof value === "number",
    );
    const finalRiskScore =
      riskInputs.length > 0 ? Math.round(riskInputs.reduce((sum, value) => sum + value, 0) / riskInputs.length) : null;

    intelligence[vendor.id] = {
      vendorId: vendor.id,
      graphNodeId,
      nodeName: vendor.name,
      linked: true,
      matchType: "name",
      confidence: 0.88,
      weightedDegree: 0.15 + demoUnit(vendor.id, 1) * 0.55,
      betweenness: 0.05 + demoUnit(vendor.id, 2) * 0.35,
      closeness: 0.1 + demoUnit(vendor.id, 3) * 0.4,
      eigenvector: 0.05 + demoUnit(vendor.id, 4) * 0.25,
      concentrationFactor: concentrationPct / 100,
      hiddenConcentrationScore: demoUnit(vendor.id, 5) * 0.4,
      systemicDependencyScore: systemicPct / 100,
      propagationRiskScore: propagationPct / 100,
      blastRadiusWeightedImpact: blastPct / 100,
      confidenceScore: confidencePct / 100,
    };

    records.push({
      vendorId: vendor.id,
      vendorName: vendor.name,
      userId: vendor.user_id,
      inherentRiskScore,
      systemicDependencyScore,
      propagationRiskScore,
      concentrationFactor,
      blastRadiusWeightedImpact,
      graphConfidenceScore,
      finalRiskScore,
      graphNodeId,
      graphNodeName: vendor.name,
      graphLinked: true,
    });
  }

  return { intelligence, records };
}
