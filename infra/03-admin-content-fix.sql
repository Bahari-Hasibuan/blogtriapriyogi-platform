create extension if not exists pgcrypto;

alter table if exists public.posts
  add column if not exists deleted_at timestamptz,
  add column if not exists updated_at timestamptz default now(),
  add column if not exists archived_at timestamptz,
  add column if not exists visibility text not null default 'public',
  add column if not exists featured_image_url text,
  add column if not exists author_id uuid,
  add column if not exists seo_score int not null default 0;

create index if not exists posts_tenant_type_status_idx
on public.posts(tenant_id, content_type, status);

create index if not exists posts_tenant_slug_idx
on public.posts(tenant_id, slug);

create index if not exists posts_published_at_idx
on public.posts(published_at desc);

create index if not exists posts_deleted_at_idx
on public.posts(deleted_at);

create or replace view public.admin_content_overview as
select
  t.id as tenant_id,
  t.slug as tenant_slug,
  count(p.id) filter (where p.deleted_at is null) as total_content,
  count(p.id) filter (where p.content_type = 'post' and p.deleted_at is null) as total_posts,
  count(p.id) filter (where p.content_type = 'page' and p.deleted_at is null) as total_pages,
  count(p.id) filter (where p.status = 'published' and p.deleted_at is null) as published_count,
  count(p.id) filter (where p.status = 'draft' and p.deleted_at is null) as draft_count,
  count(p.id) filter (where p.status = 'archived' and p.deleted_at is null) as archived_count,
  count(p.id) filter (where p.deleted_at is not null) as deleted_count,
  max(p.updated_at) as last_content_update
from public.tenants t
left join public.posts p on p.tenant_id = t.id
group by t.id, t.slug;
