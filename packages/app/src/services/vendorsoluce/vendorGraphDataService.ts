import type { GraphEdge, GraphNode } from "@ermits/dependency-graph";
import { supabase } from "../../lib/supabase";

export interface VendorGraphDataset {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export async function getVendorGraphData(orgId: string): Promise<VendorGraphDataset> {
  const [{ data: nodes, error: nodesError }, { data: edges, error: edgesError }] = await Promise.all([
    (supabase.from("graph_nodes") as any).select("*").eq("org_id", orgId),
    (supabase.from("graph_edges") as any).select("*").eq("org_id", orgId),
  ]);

  if (nodesError) throw nodesError;
  if (edgesError) throw edgesError;

  return {
    nodes: (nodes ?? []) as GraphNode[],
    edges: (edges ?? []) as GraphEdge[],
  };
}
