create table if not exists media_assets (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade,
  uploader_id uuid references profiles(id) on delete set null,
  file_name text not null,
  file_url text not null,
  storage_bucket text default 'media',
  storage_path text,
  mime_type text,
  size_bytes bigint default 0,
  width int,
  height int,
  alt_text text,
  caption text,
  folder text default 'uploads',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists media_assets_tenant_idx on media_assets(tenant_id);
create index if not exists media_assets_folder_idx on media_assets(folder);
create index if not exists media_assets_created_idx on media_assets(created_at desc);

create table if not exists domains (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  domain text not null unique,
  type text not null default 'subdomain',
  status text not null default 'pending',
  verification_type text default 'TXT',
  verification_name text,
  verification_value text,
  target_type text default 'CNAME',
  target_name text,
  target_value text,
  ssl_status text default 'pending',
  last_checked_at timestamptz,
  verified_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists domains_tenant_idx on domains(tenant_id);
create index if not exists domains_status_idx on domains(status);
create index if not exists domains_domain_idx on domains(domain);
