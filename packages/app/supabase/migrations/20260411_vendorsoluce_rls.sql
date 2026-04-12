begin;

alter table public.graph_nodes enable row level security;
alter table public.graph_edges enable row level security;
alter table public.vendor_centrality_metrics enable row level security;
alter table public.vendor_critical_paths enable row level security;
alter table public.vendor_scenario_runs enable row level security;
alter table public.vendor_aliases enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'graph_nodes' and policyname = 'graph_nodes_select'
  ) then
    create policy graph_nodes_select on public.graph_nodes for select using (true);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'graph_edges' and policyname = 'graph_edges_select'
  ) then
    create policy graph_edges_select on public.graph_edges for select using (true);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'vendor_centrality_metrics' and policyname = 'vendor_centrality_metrics_select'
  ) then
    create policy vendor_centrality_metrics_select on public.vendor_centrality_metrics for select using (true);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'vendor_critical_paths' and policyname = 'vendor_critical_paths_select'
  ) then
    create policy vendor_critical_paths_select on public.vendor_critical_paths for select using (true);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'vendor_scenario_runs' and policyname = 'vendor_scenario_runs_select'
  ) then
    create policy vendor_scenario_runs_select on public.vendor_scenario_runs for select using (true);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'vendor_aliases' and policyname = 'vendor_aliases_select'
  ) then
    create policy vendor_aliases_select on public.vendor_aliases for select using (true);
  end if;
end $$;

commit;
