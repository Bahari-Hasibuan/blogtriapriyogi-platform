create table if not exists ai_requests (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade,
  profile_id uuid references profiles(id) on delete set null,
  tool_name text not null,
  input jsonb not null default '{}',
  output jsonb not null default '{}',
  token_count int not null default 0,
  cost_amount numeric(12,4) not null default 0,
  status text not null default 'success',
  error_message text,
  created_at timestamptz not null default now()
);

create table if not exists seo_audits (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  post_id uuid references posts(id) on delete cascade,
  score int not null default 0,
  issues jsonb not null default '[]',
  suggestions jsonb not null default '[]',
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists automations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  trigger_type text not null,
  trigger_config jsonb not null default '{}',
  action_type text not null,
  action_config jsonb not null default '{}',
  status text not null default 'active',
  last_run_at timestamptz,
  next_run_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists automation_runs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  automation_id uuid references automations(id) on delete cascade,
  status text not null default 'running',
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  logs jsonb not null default '[]',
  error_message text
);

create index if not exists idx_ai_requests_tenant_time on ai_requests(tenant_id, created_at desc);
create index if not exists idx_seo_audits_post_time on seo_audits(post_id, created_at desc);
create index if not exists idx_automations_tenant_status on automations(tenant_id, status);
create index if not exists idx_automations_next_run on automations(status, next_run_at);
create index if not exists idx_automation_runs_tenant_time on automation_runs(tenant_id, started_at desc);

drop trigger if exists automations_set_updated_at on automations;
create trigger automations_set_updated_at
before update on automations
for each row execute function set_updated_at();
