create extension if not exists pgcrypto;

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants(id) on delete cascade,
  uploader_id uuid null,
  bucket text not null default 'media',
  path text not null,
  url text not null,
  filename text not null,
  original_filename text,
  mime_type text,
  size_bytes bigint not null default 0,
  kind text not null default 'image',
  alt_text text,
  caption text,
  folder text not null default 'root',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz null
);

create index if not exists media_assets_tenant_idx
on public.media_assets(tenant_id);

create index if not exists media_assets_tenant_created_idx
on public.media_assets(tenant_id, created_at desc);

create index if not exists media_assets_kind_idx
on public.media_assets(kind);

create index if not exists media_assets_deleted_idx
on public.media_assets(deleted_at);

create unique index if not exists media_assets_tenant_path_unique
on public.media_assets(tenant_id, path)
where deleted_at is null;

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists media_assets_set_updated_at on public.media_assets;

create trigger media_assets_set_updated_at
before update on public.media_assets
for each row execute function public.set_updated_at();
