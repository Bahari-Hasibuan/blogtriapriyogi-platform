create table if not exists analytics_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade,
  post_id uuid references posts(id) on delete set null,
  event_name text not null,
  path text,
  referrer text,
  country text,
  city text,
  device text,
  browser text,
  os text,
  ip_hash text,
  user_agent text,
  session_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists analytics_events_tenant_time_idx on analytics_events(tenant_id, created_at desc);
create index if not exists analytics_events_post_idx on analytics_events(post_id);
create index if not exists analytics_events_name_idx on analytics_events(event_name);
create index if not exists analytics_events_path_idx on analytics_events(path);

create table if not exists analytics_daily (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade,
  post_id uuid references posts(id) on delete cascade,
  day date not null,
  views bigint not null default 0,
  visitors bigint not null default 0,
  clicks bigint not null default 0,
  reads bigint not null default 0,
  avg_read_time int not null default 0,
  bounce_count bigint not null default 0,
  created_at timestamptz not null default now(),
  unique (tenant_id, post_id, day)
);

create index if not exists analytics_daily_tenant_day_idx on analytics_daily(tenant_id, day desc);
create index if not exists analytics_daily_post_day_idx on analytics_daily(post_id, day desc);
