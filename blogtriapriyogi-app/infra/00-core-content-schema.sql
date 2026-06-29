create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid()
);

alter table public.profiles add column if not exists auth_user_id uuid;
alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists role text not null default 'user';
alter table public.profiles add column if not exists status text not null default 'active';
alter table public.profiles add column if not exists created_at timestamptz not null default now();
alter table public.profiles add column if not exists updated_at timestamptz not null default now();

create table if not exists public.tenants (
  id uuid primary key default gen_random_uuid()
);

alter table public.tenants add column if not exists owner_profile_id uuid;
alter table public.tenants add column if not exists name text;
alter table public.tenants add column if not exists slug text;
alter table public.tenants add column if not exists plan_code text not null default 'free';
alter table public.tenants add column if not exists plan_status text not null default 'active';
alter table public.tenants add column if not exists billing_status text not null default 'free';
alter table public.tenants add column if not exists trial_ends_at timestamptz;
alter table public.tenants add column if not exists subscription_ends_at timestamptz;
alter table public.tenants add column if not exists custom_domain text;
alter table public.tenants add column if not exists default_locale text not null default 'id';
alter table public.tenants add column if not exists timezone text not null default 'Asia/Jakarta';
alter table public.tenants add column if not exists settings jsonb not null default '{}';
alter table public.tenants add column if not exists limits jsonb not null default '{}';
alter table public.tenants add column if not exists created_at timestamptz not null default now();
alter table public.tenants add column if not exists updated_at timestamptz not null default now();
alter table public.tenants add column if not exists deleted_at timestamptz;

create unique index if not exists tenants_slug_unique_idx
on public.tenants (lower(slug))
where deleted_at is null;

insert into public.profiles (
  id,
  email,
  full_name,
  role,
  status
)
values (
  '00000000-0000-4000-8000-000000000001',
  'owner@local.test',
  'Owner Local',
  'owner',
  'active'
)
on conflict (id) do update set updated_at = now();

insert into public.tenants (
  id,
  owner_profile_id,
  name,
  slug,
  plan_code,
  plan_status,
  billing_status
)
values (
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000001',
  'Default Workspace',
  'default',
  'free',
  'active',
  'free'
)
on conflict (id) do update set updated_at = now();

create table if not exists public.tenant_members (
  tenant_id uuid not null,
  profile_id uuid not null,
  role text not null default 'member',
  status text not null default 'active',
  permissions jsonb not null default '{}',
  invited_by uuid,
  joined_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (tenant_id, profile_id)
);

create table if not exists public.media_folders (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  parent_id uuid,
  name text not null,
  slug text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid()
);

alter table public.media_assets add column if not exists tenant_id uuid;
alter table public.media_assets add column if not exists folder_id uuid;
alter table public.media_assets add column if not exists uploader_id uuid;
alter table public.media_assets add column if not exists storage_bucket text;
alter table public.media_assets add column if not exists storage_path text;
alter table public.media_assets add column if not exists public_url text;
alter table public.media_assets add column if not exists file_name text;
alter table public.media_assets add column if not exists mime_type text;
alter table public.media_assets add column if not exists size_bytes bigint not null default 0;
alter table public.media_assets add column if not exists width integer;
alter table public.media_assets add column if not exists height integer;
alter table public.media_assets add column if not exists alt_text text;
alter table public.media_assets add column if not exists caption text;
alter table public.media_assets add column if not exists metadata jsonb not null default '{}';
alter table public.media_assets add column if not exists created_at timestamptz not null default now();
alter table public.media_assets add column if not exists updated_at timestamptz not null default now();
alter table public.media_assets add column if not exists deleted_at timestamptz;

update public.media_assets
set tenant_id = '00000000-0000-4000-8000-000000000001'
where tenant_id is null;

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid()
);

alter table public.posts add column if not exists tenant_id uuid;
alter table public.posts add column if not exists author_id uuid;
alter table public.posts add column if not exists content_type text not null default 'post';
alter table public.posts add column if not exists title text;
alter table public.posts add column if not exists slug text;
alter table public.posts add column if not exists excerpt text;
alter table public.posts add column if not exists content text;
alter table public.posts add column if not exists content_json jsonb not null default '{}';
alter table public.posts add column if not exists status text not null default 'draft';
alter table public.posts add column if not exists visibility text not null default 'public';
alter table public.posts add column if not exists password_hash text;
alter table public.posts add column if not exists canonical_url text;
alter table public.posts add column if not exists language text not null default 'id';
alter table public.posts add column if not exists template_id uuid;
alter table public.posts add column if not exists cover_media_id uuid;
alter table public.posts add column if not exists featured boolean not null default false;
alter table public.posts add column if not exists allow_comments boolean not null default true;
alter table public.posts add column if not exists view_count bigint not null default 0;
alter table public.posts add column if not exists word_count integer not null default 0;
alter table public.posts add column if not exists reading_time integer not null default 0;
alter table public.posts add column if not exists published_at timestamptz;
alter table public.posts add column if not exists scheduled_at timestamptz;
alter table public.posts add column if not exists archived_at timestamptz;
alter table public.posts add column if not exists deleted_at timestamptz;
alter table public.posts add column if not exists created_at timestamptz not null default now();
alter table public.posts add column if not exists updated_at timestamptz not null default now();

update public.posts
set tenant_id = '00000000-0000-4000-8000-000000000001'
where tenant_id is null;

update public.posts
set content_type = 'post'
where content_type is null;

update public.posts
set status = 'draft'
where status is null;

update public.posts
set slug = lower(regexp_replace(coalesce(title, 'untitled') || '-' || left(id::text, 8), '[^a-zA-Z0-9]+', '-', 'g'))
where slug is null or slug = '';

update public.posts
set title = 'Untitled'
where title is null or title = '';

create unique index if not exists posts_tenant_type_slug_unique_idx
on public.posts (tenant_id, content_type, lower(slug))
where deleted_at is null;

create index if not exists posts_tenant_status_idx
on public.posts (tenant_id, status);

create index if not exists posts_tenant_type_status_idx
on public.posts (tenant_id, content_type, status);

create index if not exists posts_published_at_idx
on public.posts (tenant_id, published_at desc)
where status = 'published' and deleted_at is null;

create index if not exists posts_search_idx
on public.posts
using gin (
  to_tsvector(
    'simple',
    coalesce(title, '') || ' ' || coalesce(excerpt, '') || ' ' || coalesce(content, '')
  )
);

create table if not exists public.post_revisions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  post_id uuid not null,
  editor_id uuid,
  version integer not null default 1,
  title text,
  slug text,
  excerpt text,
  content text,
  content_json jsonb not null default '{}',
  status text,
  change_note text,
  created_at timestamptz not null default now()
);

create index if not exists post_revisions_post_idx
on public.post_revisions (post_id, version desc);

create table if not exists public.post_categories (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  name text not null,
  slug text not null,
  description text,
  parent_id uuid,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists post_categories_tenant_slug_unique_idx
on public.post_categories (tenant_id, lower(slug));

create table if not exists public.post_tags (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  name text not null,
  slug text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists post_tags_tenant_slug_unique_idx
on public.post_tags (tenant_id, lower(slug));

create table if not exists public.post_category_links (
  post_id uuid not null,
  category_id uuid not null,
  tenant_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (post_id, category_id)
);

create table if not exists public.post_tag_links (
  post_id uuid not null,
  tag_id uuid not null,
  tenant_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (post_id, tag_id)
);

create table if not exists public.post_seo (
  post_id uuid primary key,
  tenant_id uuid not null,
  meta_title text,
  meta_description text,
  focus_keyword text,
  og_title text,
  og_description text,
  og_image text,
  twitter_title text,
  twitter_description text,
  twitter_image text,
  robots text not null default 'index,follow',
  schema_json jsonb not null default '{}',
  seo_score integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.post_blocks (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  post_id uuid not null,
  block_type text not null,
  sort_order integer not null default 0,
  data jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists post_blocks_post_sort_idx
on public.post_blocks (post_id, sort_order);

create table if not exists public.content_routes (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  content_id uuid not null,
  route_type text not null default 'post',
  path text not null,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists content_routes_tenant_path_unique_idx
on public.content_routes (tenant_id, lower(path))
where status = 'active';

create table if not exists public.post_redirects (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  old_path text not null,
  new_path text not null,
  code integer not null default 301,
  active boolean not null default true,
  hit_count bigint not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.post_comments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  post_id uuid not null,
  parent_id uuid,
  author_name text,
  author_email text,
  author_url text,
  body text not null,
  status text not null default 'pending',
  ip_hash text,
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists post_comments_post_status_idx
on public.post_comments (post_id, status, created_at desc);

create table if not exists public.post_daily_stats (
  tenant_id uuid not null,
  post_id uuid not null,
  day date not null,
  views bigint not null default 0,
  visitors bigint not null default 0,
  likes bigint not null default 0,
  shares bigint not null default 0,
  comments bigint not null default 0,
  primary key (tenant_id, post_id, day)
);

create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid,
  profile_id uuid,
  action text not null,
  entity_type text,
  entity_id uuid,
  before_data jsonb,
  after_data jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists admin_audit_logs_tenant_created_idx
on public.admin_audit_logs (tenant_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists tenants_set_updated_at on public.tenants;
create trigger tenants_set_updated_at
before update on public.tenants
for each row execute function public.set_updated_at();

drop trigger if exists posts_set_updated_at on public.posts;
create trigger posts_set_updated_at
before update on public.posts
for each row execute function public.set_updated_at();

drop trigger if exists media_assets_set_updated_at on public.media_assets;
create trigger media_assets_set_updated_at
before update on public.media_assets
for each row execute function public.set_updated_at();

drop trigger if exists post_categories_set_updated_at on public.post_categories;
create trigger post_categories_set_updated_at
before update on public.post_categories
for each row execute function public.set_updated_at();

drop trigger if exists post_tags_set_updated_at on public.post_tags;
create trigger post_tags_set_updated_at
before update on public.post_tags
for each row execute function public.set_updated_at();

drop trigger if exists post_seo_set_updated_at on public.post_seo;
create trigger post_seo_set_updated_at
before update on public.post_seo
for each row execute function public.set_updated_at();

drop trigger if exists post_blocks_set_updated_at on public.post_blocks;
create trigger post_blocks_set_updated_at
before update on public.post_blocks
for each row execute function public.set_updated_at();

drop trigger if exists content_routes_set_updated_at on public.content_routes;
create trigger content_routes_set_updated_at
before update on public.content_routes
for each row execute function public.set_updated_at();

create or replace view public.admin_content_overview as
select
  p.id,
  p.tenant_id,
  t.slug as tenant_slug,
  p.author_id,
  p.content_type,
  p.title,
  p.slug,
  p.excerpt,
  p.status,
  p.visibility,
  p.language,
  p.featured,
  p.allow_comments,
  p.view_count,
  p.word_count,
  p.reading_time,
  p.published_at,
  p.scheduled_at,
  p.archived_at,
  p.deleted_at,
  p.created_at,
  p.updated_at,
  s.meta_title,
  s.meta_description,
  s.focus_keyword,
  s.robots,
  s.seo_score,
  jsonb_build_object(
    'id', m.id,
    'url', m.public_url,
    'alt', m.alt_text,
    'width', m.width,
    'height', m.height
  ) as cover
from public.posts p
left join public.tenants t on t.id = p.tenant_id
left join public.post_seo s on s.post_id = p.id
left join public.media_assets m on m.id = p.cover_media_id
where p.deleted_at is null;

insert into public.tenant_members (
  tenant_id,
  profile_id,
  role,
  status,
  permissions,
  joined_at
)
values (
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000001',
  'owner',
  'active',
  '{"all":true}'::jsonb,
  now()
)
on conflict (tenant_id, profile_id) do update
set role = 'owner',
    status = 'active',
    updated_at = now();

insert into public.post_seo (
  post_id,
  tenant_id,
  meta_title,
  meta_description
)
select
  p.id,
  p.tenant_id,
  p.title,
  p.excerpt
from public.posts p
left join public.post_seo s on s.post_id = p.id
where s.post_id is null;

insert into public.content_routes (
  tenant_id,
  content_id,
  route_type,
  path,
  status
)
select
  p.tenant_id,
  p.id,
  p.content_type,
  case
    when p.content_type = 'page' then '/' || p.slug
    else '/blog/' || p.slug
  end,
  'active'
from public.posts p
where p.deleted_at is null
on conflict do nothing;
