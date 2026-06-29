create table if not exists media_folders (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  parent_id uuid references media_folders(id) on delete cascade,
  name text not null,
  path text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, path)
);

create table if not exists media_assets (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  folder_id uuid references media_folders(id) on delete set null,
  uploaded_by uuid references profiles(id) on delete set null,
  provider text not null default 'supabase',
  bucket text not null default 'media',
  object_path text not null,
  public_url text,
  cdn_url text,
  filename text not null,
  mime_type text not null,
  size_bytes bigint not null default 0,
  width int,
  height int,
  duration_seconds numeric,
  alt_text text,
  caption text,
  blurhash text,
  checksum text,
  status text not null default 'active',
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, object_path)
);

create table if not exists media_usages (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  media_id uuid not null references media_assets(id) on delete cascade,
  entity_type text not null,
  entity_id uuid not null,
  usage_context text,
  created_at timestamptz not null default now()
);

create table if not exists upload_sessions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  profile_id uuid references profiles(id) on delete set null,
  provider text not null default 'supabase',
  bucket text not null default 'media',
  object_path text not null,
  status text not null default 'pending',
  expires_at timestamptz not null default now() + interval '1 hour',
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists idx_media_folders_tenant on media_folders(tenant_id);
create index if not exists idx_media_assets_tenant_created on media_assets(tenant_id, created_at desc);
create index if not exists idx_media_assets_mime on media_assets(tenant_id, mime_type);
create index if not exists idx_media_assets_filename_trgm on media_assets using gin(filename gin_trgm_ops);
create index if not exists idx_media_usages_entity on media_usages(tenant_id, entity_type, entity_id);
create index if not exists idx_upload_sessions_tenant_status on upload_sessions(tenant_id, status);

drop trigger if exists media_folders_set_updated_at on media_folders;
create trigger media_folders_set_updated_at
before update on media_folders
for each row execute function set_updated_at();

drop trigger if exists media_assets_set_updated_at on media_assets;
create trigger media_assets_set_updated_at
before update on media_assets
for each row execute function set_updated_at();
