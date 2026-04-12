begin;

create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'graph_node_type') then
    create type public.graph_node_type as enum (
      'vendor',
      'service',
      'asset',
      'processing',
      'data_domain',
      'jurisdiction',
      'control'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'graph_edge_type') then
    create type public.graph_edge_type as enum (
      'supports',
      'relies_on',
      'integrates_with',
      'processes',
      'enables',
      'subject_to',
      'depends_on_control'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'visibility_level') then
    create type public.visibility_level as enum (
      'known',
      'partial',
      'inferred'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'vendor_status') then
    create type public.vendor_status as enum (
      'active',
      'inactive',
      'planned',
      'retired'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'scenario_type') then
    create type public.scenario_type as enum (
      'outage',
      'breach',
      'degradation'
    );
  end if;
end $$;

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sector text,
  region text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.graph_nodes (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,

  node_type public.graph_node_type not null,
  external_key text,
  name text not null,

  vendor_status public.vendor_status,
  vendor_type text,
  service_category text,

  criticality numeric(5,4),
  inherent_risk numeric(5,4),
  substitution_difficulty numeric(5,4),
  sensitivity numeric(5,4),
  regulatory_weight numeric(5,4),

  internet_exposed boolean,
  cross_border boolean,
  special_category_flag boolean,

  business_owner text,
  environment text,

  metadata jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint graph_nodes_scores_chk check (
    (criticality is null or (criticality >= 0 and criticality <= 1)) and
    (inherent_risk is null or (inherent_risk >= 0 and inherent_risk <= 1)) and
    (substitution_difficulty is null or (substitution_difficulty >= 0 and substitution_difficulty <= 1)) and
    (sensitivity is null or (sensitivity >= 0 and sensitivity <= 1)) and
    (regulatory_weight is null or (regulatory_weight >= 0 and regulatory_weight <= 1))
  )
);

create index if not exists idx_graph_nodes_org on public.graph_nodes(org_id);
create index if not exists idx_graph_nodes_type on public.graph_nodes(org_id, node_type);
create index if not exists idx_graph_nodes_name on public.graph_nodes(org_id, name);
create unique index if not exists idx_graph_nodes_org_external_key
  on public.graph_nodes(org_id, external_key)
  where external_key is not null;

create table if not exists public.graph_edges (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,

  source_node_id uuid not null references public.graph_nodes(id) on delete cascade,
  target_node_id uuid not null references public.graph_nodes(id) on delete cascade,

  edge_type public.graph_edge_type not null,
  weight numeric(5,4) not null,
  dependency_strength numeric(5,4),
  operational_criticality numeric(5,4),
  data_sensitivity_factor numeric(5,4),
  substitution_penalty numeric(5,4),

  tier_level integer,
  visibility_level public.visibility_level not null default 'known',

  direct_or_indirect text,
  shared_infrastructure_flag boolean default false,
  write_access_flag boolean default false,
  transfer_flag boolean default false,

  metadata jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint graph_edges_weight_chk check (weight >= 0 and weight <= 1),
  constraint graph_edges_factor_chk check (
    (dependency_strength is null or (dependency_strength >= 0 and dependency_strength <= 1)) and
    (operational_criticality is null or (operational_criticality >= 0 and operational_criticality <= 1)) and
    (data_sensitivity_factor is null or (data_sensitivity_factor >= 0 and data_sensitivity_factor <= 1)) and
    (substitution_penalty is null or (substitution_penalty >= 0 and substitution_penalty <= 1))
  ),
  constraint graph_edges_no_self check (source_node_id <> target_node_id)
);

create index if not exists idx_graph_edges_org on public.graph_edges(org_id);
create index if not exists idx_graph_edges_source on public.graph_edges(org_id, source_node_id);
create index if not exists idx_graph_edges_target on public.graph_edges(org_id, target_node_id);
create index if not exists idx_graph_edges_type on public.graph_edges(org_id, edge_type);

create table if not exists public.vendor_centrality_metrics (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  node_id uuid not null references public.graph_nodes(id) on delete cascade,

  weighted_degree numeric(12,6) not null default 0,
  in_weighted_degree numeric(12,6) not null default 0,
  out_weighted_degree numeric(12,6) not null default 0,

  betweenness numeric(12,6) not null default 0,
  eigenvector numeric(12,6) not null default 0,
  closeness numeric(12,6) not null default 0,

  concentration_factor numeric(12,6) not null default 0,
  hidden_concentration_score numeric(12,6) not null default 0,

  systemic_dependency_score numeric(12,6) not null default 0,
  propagation_risk_score numeric(12,6) not null default 0,

  blast_radius_service_count integer not null default 0,
  blast_radius_processing_count integer not null default 0,
  blast_radius_jurisdiction_count integer not null default 0,
  blast_radius_weighted_impact numeric(12,6) not null default 0,

  confidence_score numeric(12,6) not null default 0,
  computed_at timestamptz not null default now(),

  unique (org_id, node_id)
);

create index if not exists idx_vendor_centrality_org on public.vendor_centrality_metrics(org_id);
create index if not exists idx_vendor_centrality_sds on public.vendor_centrality_metrics(org_id, systemic_dependency_score desc);
create index if not exists idx_vendor_centrality_prs on public.vendor_centrality_metrics(org_id, propagation_risk_score desc);

create table if not exists public.vendor_critical_paths (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  vendor_node_id uuid not null references public.graph_nodes(id) on delete cascade,

  path_rank integer not null,
  path_score numeric(12,6) not null,
  path_type text not null,

  node_path jsonb not null,
  edge_path jsonb not null,
  explanation jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now()
);

create index if not exists idx_vendor_critical_paths_org_vendor
  on public.vendor_critical_paths(org_id, vendor_node_id, path_rank);

create table if not exists public.vendor_scenario_runs (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  vendor_node_id uuid not null references public.graph_nodes(id) on delete cascade,

  scenario_type public.scenario_type not null,
  scenario_name text,
  assumptions jsonb not null default '{}'::jsonb,

  affected_nodes jsonb not null default '[]'::jsonb,
  affected_services jsonb not null default '[]'::jsonb,
  affected_processing_activities jsonb not null default '[]'::jsonb,
  affected_jurisdictions jsonb not null default '[]'::jsonb,

  blast_radius_score numeric(12,6) not null default 0,
  operational_impact_score numeric(12,6) not null default 0,
  privacy_impact_score numeric(12,6) not null default 0,
  threat_amplification_score numeric(12,6) not null default 0,
  confidence_score numeric(12,6) not null default 0,

  narrative jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_vendor_scenario_runs_org_vendor
  on public.vendor_scenario_runs(org_id, vendor_node_id, created_at desc);

create table if not exists public.vendor_aliases (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  canonical_node_id uuid not null references public.graph_nodes(id) on delete cascade,
  alias text not null,
  alias_type text,
  created_at timestamptz not null default now(),
  unique (org_id, alias)
);

commit;
