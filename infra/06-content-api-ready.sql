create extension if not exists pgcrypto;

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid null,
  content_type text not null default 'post',
  title text not null,
  slug text not null,
  excerpt text null,
  content text null,
  status text not null default 'draft',
  featured_image_url text null,
  meta_title text null,
  meta_description text null,
  canonical_url text null,
  schema_json jsonb null default '{}'::jsonb,
  word_count int not null default 0,
  reading_time int not null default 0,
  view_count bigint not null default 0,
  published_at timestamptz null,
  archived_at timestamptz null,
  deleted_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.posts add column if not exists tenant_id uuid null;
alter table public.posts add column if not exists content_type text not null default 'post';
alter table public.posts add column if not exists title text not null default 'Untitled';
alter table public.posts add column if not exists slug text not null default 'untitled';
alter table public.posts add column if not exists excerpt text null;
alter table public.posts add column if not exists content text null;
alter table public.posts add column if not exists status text not null default 'draft';
alter table public.posts add column if not exists featured_image_url text null;
alter table public.posts add column if not exists meta_title text null;
alter table public.posts add column if not exists meta_description text null;
alter table public.posts add column if not exists canonical_url text null;
alter table public.posts add column if not exists schema_json jsonb null default '{}'::jsonb;
alter table public.posts add column if not exists word_count int not null default 0;
alter table public.posts add column if not exists reading_time int not null default 0;
alter table public.posts add column if not exists view_count bigint not null default 0;
alter table public.posts add column if not exists published_at timestamptz null;
alter table public.posts add column if not exists archived_at timestamptz null;
alter table public.posts add column if not exists deleted_at timestamptz null;
alter table public.posts add column if not exists created_at timestamptz not null default now();
alter table public.posts add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
    and table_name = 'posts'
    and column_name = 'user_id'
  ) then
    alter table public.posts alter column user_id drop not null;
  end if;
end $$;

create index if not exists posts_tenant_type_status_idx
on public.posts (tenant_id, content_type, status);

create index if not exists posts_slug_idx
on public.posts (slug);

create index if not exists posts_published_at_idx
on public.posts (published_at desc);

create index if not exists posts_deleted_at_idx
on public.posts (deleted_at);

create or replace view public.admin_content_list as
select
  p.id,
  p.tenant_id,
  p.content_type,
  p.title,
  p.slug,
  p.excerpt,
  p.status,
  p.featured_image_url,
  p.view_count,
  p.published_at,
  p.archived_at,
  p.deleted_at,
  p.created_at,
  p.updated_at
from public.posts p
where p.deleted_at is null
order by p.updated_at desc;
