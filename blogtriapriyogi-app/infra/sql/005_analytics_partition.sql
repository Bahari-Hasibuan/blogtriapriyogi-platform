create table if not exists analytics_events (
  id uuid not null default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  site_id uuid references sites(id) on delete cascade,
  post_id uuid references posts(id) on delete set null,
  session_id text,
  visitor_id text,
  event_name text not null,
  path text,
  referrer text,
  country text,
  region text,
  city text,
  device_type text,
  browser text,
  os text,
  ip_hash text,
  user_agent text,
  metadata jsonb not null default '{}',
  event_at timestamptz not null default now(),
  primary key (id, event_at)
) partition by range (event_at);

create table if not exists analytics_events_default
partition of analytics_events default;

do $$
declare
  m date := date_trunc('month', now())::date;
  start_date date;
  end_date date;
  part_name text;
  i int;
begin
  for i in -1..6 loop
    start_date := (m + (i || ' month')::interval)::date;
    end_date := (start_date + interval '1 month')::date;
    part_name := 'analytics_events_' || to_char(start_date, 'YYYY_MM');

    execute format(
      'create table if not exists %I partition of analytics_events for values from (%L) to (%L)',
      part_name,
      start_date,
      end_date
    );
  end loop;
end $$;

create table if not exists analytics_daily_rollups (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  site_id uuid references sites(id) on delete cascade,
  rollup_date date not null,
  pageviews bigint not null default 0,
  visitors bigint not null default 0,
  sessions bigint not null default 0,
  countries jsonb not null default '{}',
  referrers jsonb not null default '{}',
  devices jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, site_id, rollup_date)
);

create table if not exists post_daily_rollups (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  post_id uuid not null references posts(id) on delete cascade,
  rollup_date date not null,
  views bigint not null default 0,
  visitors bigint not null default 0,
  avg_read_seconds numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, post_id, rollup_date)
);

create index if not exists idx_analytics_events_tenant_time on analytics_events(tenant_id, event_at desc);
create index if not exists idx_analytics_events_site_time on analytics_events(site_id, event_at desc);
create index if not exists idx_analytics_events_post_time on analytics_events(post_id, event_at desc);
create index if not exists idx_analytics_events_event_name on analytics_events(tenant_id, event_name, event_at desc);
create index if not exists idx_analytics_daily_tenant_date on analytics_daily_rollups(tenant_id, rollup_date desc);
create index if not exists idx_post_daily_tenant_date on post_daily_rollups(tenant_id, rollup_date desc);

drop trigger if exists analytics_daily_rollups_set_updated_at on analytics_daily_rollups;
create trigger analytics_daily_rollups_set_updated_at
before update on analytics_daily_rollups
for each row execute function set_updated_at();

drop trigger if exists post_daily_rollups_set_updated_at on post_daily_rollups;
create trigger post_daily_rollups_set_updated_at
before update on post_daily_rollups
for each row execute function set_updated_at();
