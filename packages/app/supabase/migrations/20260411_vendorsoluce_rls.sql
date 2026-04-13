begin;

alter table public.graph_nodes enable row level security;
alter table public.graph_edges enable row level security;
alter table public.vendor_centrality_metrics enable row level security;
alter table public.vendor_critical_paths enable row level security;
alter table public.vendor_scenario_runs enable row level security;
alter table public.vendor_aliases enable row level security;

drop policy if exists graph_nodes_select on public.graph_nodes;
create policy graph_nodes_select on public.graph_nodes for select using (true);

drop policy if exists graph_edges_select on public.graph_edges;
create policy graph_edges_select on public.graph_edges for select using (true);

drop policy if exists vendor_centrality_metrics_select on public.vendor_centrality_metrics;
create policy vendor_centrality_metrics_select on public.vendor_centrality_metrics for select using (true);

drop policy if exists vendor_critical_paths_select on public.vendor_critical_paths;
create policy vendor_critical_paths_select on public.vendor_critical_paths for select using (true);

drop policy if exists vendor_scenario_runs_select on public.vendor_scenario_runs;
create policy vendor_scenario_runs_select on public.vendor_scenario_runs for select using (true);

drop policy if exists vendor_aliases_select on public.vendor_aliases;
create policy vendor_aliases_select on public.vendor_aliases for select using (true);

commit;
