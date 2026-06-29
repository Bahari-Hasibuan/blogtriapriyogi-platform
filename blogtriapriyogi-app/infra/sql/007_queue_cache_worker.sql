create table if not exists worker_jobs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade,
  queue text not null default 'default',
  type text not null,
  payload jsonb not null default '{}',
  status text not null default 'queued',
  priority int not null default 0,
  attempts int not null default 0,
  max_attempts int not null default 5,
  run_at timestamptz not null default now(),
  locked_by text,
  locked_at timestamptz,
  error_message text,
  result jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists cache_entries (
  key text primary key,
  tenant_id uuid references tenants(id) on delete cascade,
  value jsonb not null,
  tags text[] not null default '{}',
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists cdn_purge_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade,
  provider text not null default 'vercel',
  urls text[] not null default '{}',
  tags text[] not null default '{}',
  status text not null default 'queued',
  response jsonb,
  created_at timestamptz not null default now(),
  processed_at timestamptz
);

create or replace function enqueue_worker_job(
  p_tenant_id uuid,
  p_type text,
  p_payload jsonb default '{}',
  p_queue text default 'default',
  p_priority int default 0,
  p_run_at timestamptz default now()
)
returns uuid as $$
declare
  new_id uuid;
begin
  insert into worker_jobs (tenant_id, type, payload, queue, priority, run_at)
  values (p_tenant_id, p_type, p_payload, p_queue, p_priority, p_run_at)
  returning id into new_id;

  return new_id;
end;
$$ language plpgsql;

create index if not exists idx_worker_jobs_status_run on worker_jobs(status, run_at, priority desc);
create index if not exists idx_worker_jobs_tenant_status on worker_jobs(tenant_id, status);
create index if not exists idx_worker_jobs_queue_status on worker_jobs(queue, status, run_at);
create index if not exists idx_cache_entries_tenant on cache_entries(tenant_id);
create index if not exists idx_cache_entries_expires on cache_entries(expires_at);
create index if not exists idx_cdn_purge_status on cdn_purge_events(status, created_at);

drop trigger if exists worker_jobs_set_updated_at on worker_jobs;
create trigger worker_jobs_set_updated_at
before update on worker_jobs
for each row execute function set_updated_at();

drop trigger if exists cache_entries_set_updated_at on cache_entries;
create trigger cache_entries_set_updated_at
before update on cache_entries
for each row execute function set_updated_at();
