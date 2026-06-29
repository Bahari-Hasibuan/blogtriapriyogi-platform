create table if not exists ai_tool_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade,
  profile_id uuid references profiles(id) on delete set null,
  tool_name text not null,
  input jsonb not null default '{}'::jsonb,
  output jsonb not null default '{}'::jsonb,
  token_usage int default 0,
  status text not null default 'success',
  created_at timestamptz not null default now()
);

create table if not exists seo_audits (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade,
  post_id uuid references posts(id) on delete cascade,
  score int default 0,
  issues jsonb not null default '[]'::jsonb,
  suggestions jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade,
  profile_id uuid references profiles(id) on delete set null,
  action text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists ai_tool_logs_tenant_idx on ai_tool_logs(tenant_id, created_at desc);
create index if not exists seo_audits_post_idx on seo_audits(post_id);
create index if not exists admin_audit_logs_tenant_idx on admin_audit_logs(tenant_id, created_at desc);
