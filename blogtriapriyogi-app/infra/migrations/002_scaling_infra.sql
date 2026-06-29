create extension if not exists pgcrypto;
create extension if not exists citext;

create table if not exists app_settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value jsonb not null default '{}'::jsonb,
  scope text not null default 'global',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists tenant_limits (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  max_posts int not null default 100,
  max_media_mb int not null default 500,
  max_members int not null default 3,
  max_domains int not null default 1,
  max_ai_requests_monthly int not null default 100,
  max_analytics_events_monthly bigint not null default 100000,
  allow_custom_domain boolean not null default false,
  allow_team boolean not null default false,
  allow_ai boolean not null default true,
  allow_payment boolean not null default false,
  allow_api_access boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id)
);

create table if not exists cache_entries (
  key text primary key,
  tenant_id uuid references tenants(id) on delete cascade,
  namespace text not null default 'global',
  value jsonb not null,
  tags text[] not null default '{}',
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists job_queues (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  concurrency int not null default 1,
  retry_limit int not null default 3,
  timeout_seconds int not null default 60,
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);

insert into job_queues (name, description, concurrency, retry_limit, timeout_seconds)
values
('default', 'General background jobs', 2, 3, 60),
('email', 'Email sending jobs', 2, 5, 90),
('ai', 'AI generation jobs', 1, 2, 180),
('seo', 'SEO audit jobs', 2, 3, 120),
('media', 'Media optimization jobs', 2, 3, 180),
('analytics', 'Analytics aggregation jobs', 3, 3, 120),
('billing', 'Payment and invoice jobs', 1, 5, 180)
on conflict (name) do nothing;

create table if not exists jobs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade,
  queue_name text not null references job_queues(name),
  type text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending',
  priority int not null default 100,
  attempts int not null default 0,
  max_attempts int not null default 3,
  run_after timestamptz not null default now(),
  locked_at timestamptz,
  locked_by text,
  started_at timestamptz,
  finished_at timestamptz,
  error_message text,
  result jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint jobs_status_check check (
    status in ('pending', 'running', 'success', 'failed', 'cancelled')
  )
);

create table if not exists storage_buckets (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade,
  name text not null,
  provider text not null default 'supabase',
  public_base_url text,
  private_base_url text,
  max_file_size_mb int not null default 25,
  allowed_mime_types text[] not null default '{}',
  is_public boolean not null default true,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, name)
);

create table if not exists storage_assets (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  bucket_id uuid references storage_buckets(id) on delete set null,
  owner_profile_id uuid references profiles(id) on delete set null,
  file_name text not null,
  original_file_name text,
  mime_type text,
  extension text,
  size_bytes bigint not null default 0,
  width int,
  height int,
  duration_seconds numeric(12,2),
  storage_path text not null,
  public_url text,
  cdn_url text,
  alt_text text,
  caption text,
  blurhash text,
  checksum text,
  status text not null default 'ready',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint storage_assets_status_check check (
    status in ('uploading', 'processing', 'ready', 'failed', 'deleted')
  )
);

create table if not exists storage_asset_variants (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references storage_assets(id) on delete cascade,
  variant_key text not null,
  width int,
  height int,
  format text,
  size_bytes bigint not null default 0,
  storage_path text not null,
  public_url text,
  cdn_url text,
  created_at timestamptz not null default now(),
  unique (asset_id, variant_key)
);

create table if not exists edge_cache_purge_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade,
  provider text not null default 'vercel',
  cache_key text,
  url text,
  status text not null default 'pending',
  response jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),

  constraint edge_cache_purge_status_check check (
    status in ('pending', 'success', 'failed')
  )
);

create table if not exists analytics_events (
  id uuid not null default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  site_id uuid,
  post_id uuid,
  session_id text,
  visitor_id text,
  event_name text not null,
  path text,
  referrer text,
  source text,
  medium text,
  campaign text,
  country text,
  city text,
  device text,
  browser text,
  os text,
  ip_hash text,
  user_agent text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  primary key (id, created_at)
) partition by range (created_at);

create table if not exists analytics_events_default
partition of analytics_events default;

create table if not exists analytics_daily_rollups (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  site_id uuid,
  post_id uuid,
  date date not null,
  pageviews bigint not null default 0,
  visitors bigint not null default 0,
  sessions bigint not null default 0,
  countries jsonb not null default '{}'::jsonb,
  devices jsonb not null default '{}'::jsonb,
  browsers jsonb not null default '{}'::jsonb,
  referrers jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, site_id, post_id, date)
);

create table if not exists read_replica_health (
  id uuid primary key default gen_random_uuid(),
  replica_name text not null,
  status text not null default 'unknown',
  latency_ms int,
  checked_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

create or replace function create_analytics_month_partition(target_month date)
returns void as $$
declare
  start_date date;
  end_date date;
  table_name text;
begin
  start_date := date_trunc('month', target_month)::date;
  end_date := (start_date + interval '1 month')::date;
  table_name := 'analytics_events_' || to_char(start_date, 'YYYY_MM');

  execute format(
    'create table if not exists %I partition of analytics_events for values from (%L) to (%L)',
    table_name,
    start_date,
    end_date
  );

  execute format(
    'create index if not exists %I on %I (tenant_id, created_at desc)',
    table_name || '_tenant_created_idx',
    table_name
  );

  execute format(
    'create index if not exists %I on %I (tenant_id, event_name, created_at desc)',
    table_name || '_event_created_idx',
    table_name
  );

  execute format(
    'create index if not exists %I on %I (tenant_id, path, created_at desc)',
    table_name || '_path_created_idx',
    table_name
  );
end;
$$ language plpgsql;

select create_analytics_month_partition(now()::date);
select create_analytics_month_partition((now() + interval '1 month')::date);
select create_analytics_month_partition((now() + interval '2 months')::date);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_app_settings_updated_at on app_settings;
create trigger trg_app_settings_updated_at
before update on app_settings
for each row execute function set_updated_at();

drop trigger if exists trg_tenant_limits_updated_at on tenant_limits;
create trigger trg_tenant_limits_updated_at
before update on tenant_limits
for each row execute function set_updated_at();

drop trigger if exists trg_cache_entries_updated_at on cache_entries;
create trigger trg_cache_entries_updated_at
before update on cache_entries
for each row execute function set_updated_at();

drop trigger if exists trg_jobs_updated_at on jobs;
create trigger trg_jobs_updated_at
before update on jobs
for each row execute function set_updated_at();

drop trigger if exists trg_storage_buckets_updated_at on storage_buckets;
create trigger trg_storage_buckets_updated_at
before update on storage_buckets
for each row execute function set_updated_at();

drop trigger if exists trg_storage_assets_updated_at on storage_assets;
create trigger trg_storage_assets_updated_at
before update on storage_assets
for each row execute function set_updated_at();

drop trigger if exists trg_analytics_daily_rollups_updated_at on analytics_daily_rollups;
create trigger trg_analytics_daily_rollups_updated_at
before update on analytics_daily_rollups
for each row execute function set_updated_at();

create index if not exists idx_cache_entries_tenant_namespace on cache_entries(tenant_id, namespace);
create index if not exists idx_cache_entries_expires_at on cache_entries(expires_at);
create index if not exists idx_jobs_queue_status_priority on jobs(queue_name, status, priority asc, run_after asc);
create index if not exists idx_jobs_tenant_created on jobs(tenant_id, created_at desc);
create index if not exists idx_jobs_locked on jobs(status, locked_at);
create index if not exists idx_storage_assets_tenant_created on storage_assets(tenant_id, created_at desc);
create index if not exists idx_storage_assets_tenant_status on storage_assets(tenant_id, status);
create index if not exists idx_storage_assets_mime_type on storage_assets(mime_type);
create index if not exists idx_storage_variants_asset on storage_asset_variants(asset_id);
create index if not exists idx_analytics_daily_tenant_date on analytics_daily_rollups(tenant_id, date desc);
create index if not exists idx_edge_cache_purge_tenant_status on edge_cache_purge_logs(tenant_id, status);

insert into app_settings (key, value, scope)
values
('platform.scaling', '{"readReplica":true,"cache":true,"queue":true,"worker":true,"cdn":true,"analyticsPartition":true}', 'global'),
('platform.version', '{"name":"TriSaaS","stage":"foundation"}', 'global')
on conflict (key) do update
set value = excluded.value, updated_at = now();

insert into tenant_limits (
  tenant_id,
  max_posts,
  max_media_mb,
  max_members,
  max_domains,
  max_ai_requests_monthly,
  max_analytics_events_monthly,
  allow_custom_domain,
  allow_team,
  allow_ai,
  allow_payment,
  allow_api_access
)
select
  id,
  10000,
  102400,
  100,
  100,
  100000,
  100000000,
  true,
  true,
  true,
  true,
  true
from tenants
on conflict (tenant_id) do update
set
  max_posts = excluded.max_posts,
  max_media_mb = excluded.max_media_mb,
  max_members = excluded.max_members,
  max_domains = excluded.max_domains,
  max_ai_requests_monthly = excluded.max_ai_requests_monthly,
  max_analytics_events_monthly = excluded.max_analytics_events_monthly,
  allow_custom_domain = excluded.allow_custom_domain,
  allow_team = excluded.allow_team,
  allow_ai = excluded.allow_ai,
  allow_payment = excluded.allow_payment,
  allow_api_access = excluded.allow_api_access,
  updated_at = now();

create or replace view v_scaling_infra_overview as
select
  (select count(*) from app_settings) as app_settings_count,
  (select count(*) from tenant_limits) as tenant_limits_count,
  (select count(*) from cache_entries) as cache_entries_count,
  (select count(*) from job_queues) as job_queues_count,
  (select count(*) from jobs) as jobs_count,
  (select count(*) from storage_buckets) as storage_buckets_count,
  (select count(*) from storage_assets) as storage_assets_count,
  (select count(*) from analytics_daily_rollups) as analytics_rollups_count,
  (select count(*) from read_replica_health) as read_replica_health_count;
