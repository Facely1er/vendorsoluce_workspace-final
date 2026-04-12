import { buildDependencyGraph, extractCriticalPaths } from "@ermits/dependency-graph";
import { supabase } from "../../lib/supabase";
import { getVendorGraphData } from "./vendorGraphDataService";

export async function recomputeVendorCriticalPaths(orgId: string): Promise<void> {
  const dataset = await getVendorGraphData(orgId);
  const graph = buildDependencyGraph(dataset.nodes, dataset.edges);
  const vendorNodes = dataset.nodes.filter((node) => node.nodeType === "vendor");
  const { error: deleteError } = await (supabase.from("vendor_critical_paths") as any).delete().eq("org_id", orgId);
  if (deleteError) throw deleteError;

  const rows = vendorNodes.flatMap((vendor) =>
    extractCriticalPaths(graph, vendor.id, 4, 5).map((path, index) => ({
      org_id: orgId,
      vendor_node_id: vendor.id,
      path_rank: index + 1,
      path_score: path.pathScore,
      path_type: path.pathType,
      node_path: path.nodeIds,
      edge_path: path.edgeIds,
      explanation: {
        summary: `Ranked ${path.pathType} path with score ${path.pathScore.toFixed(2)}`,
      },
    })),
  );

  if (rows.length > 0) {
    const { error } = await (supabase.from("vendor_critical_paths") as any).insert(rows);
    if (error) throw error;
  }
}
