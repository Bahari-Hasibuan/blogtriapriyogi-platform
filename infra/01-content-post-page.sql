create extension if not exists pgcrypto;

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants(id) on delete cascade,

  content_type text not null default 'post',
  title text not null,
  slug text not null,
  excerpt text,
  content text,
  cover_image_url text,

  status text not null default 'draft',
  visibility text not null default 'public',

  author_id uuid references public.profiles(id) on delete set null,
  published_at timestamptz,
  scheduled_at timestamptz,
  archived_at timestamptz,
  deleted_at timestamptz,

  word_count int default 0,
  reading_time int default 0,
  view_count bigint default 0,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint posts_content_type_check check (content_type in ('post', 'page')),
  constraint posts_status_check check (status in ('draft', 'published', 'scheduled', 'archived', 'deleted')),
  constraint posts_visibility_check check (visibility in ('public', 'private', 'password'))
);

create unique index if not exists posts_tenant_slug_unique
on public.posts(tenant_id, slug)
where deleted_at is null;

create index if not exists posts_tenant_status_idx
on public.posts(tenant_id, status);

create index if not exists posts_tenant_type_idx
on public.posts(tenant_id, content_type);

create index if not exists posts_published_at_idx
on public.posts(published_at desc);

create table if not exists public.post_revisions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.posts(id) on delete cascade,
  tenant_id uuid references public.tenants(id) on delete cascade,

  title text,
  excerpt text,
  content text,
  status text,
  editor_id uuid references public.profiles(id) on delete set null,

  created_at timestamptz not null default now()
);

create index if not exists post_revisions_post_idx
on public.post_revisions(post_id, created_at desc);

create table if not exists public.post_categories (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants(id) on delete cascade,

  name text not null,
  slug text not null,
  description text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists post_categories_tenant_slug_unique
on public.post_categories(tenant_id, slug);

create table if not exists public.post_tags (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants(id) on delete cascade,

  name text not null,
  slug text not null,

  created_at timestamptz not null default now()
);

create unique index if not exists post_tags_tenant_slug_unique
on public.post_tags(tenant_id, slug);

create table if not exists public.post_category_map (
  post_id uuid references public.posts(id) on delete cascade,
  category_id uuid references public.post_categories(id) on delete cascade,
  tenant_id uuid references public.tenants(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, category_id)
);

create table if not exists public.post_tag_map (
  post_id uuid references public.posts(id) on delete cascade,
  tag_id uuid references public.post_tags(id) on delete cascade,
  tenant_id uuid references public.tenants(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, tag_id)
);

create table if not exists public.post_seo (
  id uuid primary key default gen_random_uuid(),
  post_id uuid unique references public.posts(id) on delete cascade,
  tenant_id uuid references public.tenants(id) on delete cascade,

  meta_title text,
  meta_description text,
  canonical_url text,
  og_title text,
  og_description text,
  og_image_url text,
  focus_keyword text,
  robots text default 'index,follow',
  schema_json jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.post_blocks (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.posts(id) on delete cascade,
  tenant_id uuid references public.tenants(id) on delete cascade,

  block_type text not null,
  sort_order int not null default 0,
  data jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists post_blocks_post_order_idx
on public.post_blocks(post_id, sort_order);

create table if not exists public.content_routes (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants(id) on delete cascade,
  post_id uuid references public.posts(id) on delete cascade,

  path text not null,
  route_type text not null default 'post',
  status text not null default 'active',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists content_routes_tenant_path_unique
on public.content_routes(tenant_id, path);

create table if not exists public.post_redirects (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants(id) on delete cascade,

  from_path text not null,
  to_path text not null,
  status_code int not null default 301,

  created_at timestamptz not null default now()
);

create unique index if not exists post_redirects_tenant_from_path_unique
on public.post_redirects(tenant_id, from_path);

create or replace view public.admin_content_overview as
select
  t.id as tenant_id,
  t.slug as tenant_slug,
  t.name as tenant_name,
  count(p.id) filter (where p.deleted_at is null) as total_content,
  count(p.id) filter (where p.content_type = 'post' and p.deleted_at is null) as total_posts,
  count(p.id) filter (where p.content_type = 'page' and p.deleted_at is null) as total_pages,
  count(p.id) filter (where p.status = 'published' and p.deleted_at is null) as published_count,
  count(p.id) filter (where p.status = 'draft' and p.deleted_at is null) as draft_count,
  count(p.id) filter (where p.status = 'archived' and p.deleted_at is null) as archived_count,
  max(p.updated_at) as last_content_update
from public.tenants t
left join public.posts p on p.tenant_id = t.id
group by t.id, t.slug, t.name;
