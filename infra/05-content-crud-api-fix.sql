create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

alter table public.posts
add column if not exists tenant_id uuid references public.tenants(id) on delete cascade;

alter table public.posts
add column if not exists author_id uuid references public.profiles(id) on delete set null;

alter table public.posts
add column if not exists content_type text not null default 'post';

alter table public.posts
add column if not exists visibility text not null default 'public';

alter table public.posts
add column if not exists featured_image_id uuid;

alter table public.posts
add column if not exists language text not null default 'id';

alter table public.posts
add column if not exists template_key text;

alter table public.posts
add column if not exists reading_time int not null default 0;

alter table public.posts
add column if not exists word_count int not null default 0;

alter table public.posts
add column if not exists scheduled_at timestamptz;

alter table public.posts
add column if not exists archived_at timestamptz;

alter table public.posts
add column if not exists deleted_at timestamptz;

alter table public.posts
add column if not exists metadata jsonb not null default '{}'::jsonb;

alter table public.posts
add column if not exists search_text tsvector;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'posts'
      and column_name = 'user_id'
  ) then
    execute 'alter table public.posts alter column user_id drop not null';
  end if;
end $$;

insert into public.tenants (name, slug, plan_code, plan_status)
values ('Default Workspace', 'default', 'free', 'active')
on conflict do nothing;

insert into public.profiles (tenant_id, email, full_name, role, status)
select t.id, 'admin@local.test', 'System Admin', 'owner', 'active'
from public.tenants t
where t.slug = 'default'
and not exists (
  select 1
  from public.profiles p
  where p.tenant_id = t.id
  and p.email = 'admin@local.test'
);

update public.posts
set tenant_id = (
  select id from public.tenants where slug = 'default' limit 1
)
where tenant_id is null;

update public.posts
set author_id = (
  select id from public.profiles where email = 'admin@local.test' limit 1
)
where author_id is null;

update public.posts
set search_text = to_tsvector(
  'simple',
  coalesce(title, '') || ' ' || coalesce(excerpt, '') || ' ' || coalesce(content, '')
);

create index if not exists posts_tenant_status_updated_idx
on public.posts(tenant_id, status, updated_at desc);

create index if not exists posts_tenant_slug_content_idx
on public.posts(tenant_id, slug, content_type);

create index if not exists posts_search_text_idx
on public.posts using gin(search_text);

create or replace view public.admin_content_list as
select
  p.id,
  p.tenant_id,
  t.slug as tenant_slug,
  p.content_type,
  p.title,
  p.slug,
  p.excerpt,
  p.status,
  p.visibility,
  p.published_at,
  p.scheduled_at,
  p.archived_at,
  p.deleted_at,
  p.created_at,
  p.updated_at,
  p.word_count,
  p.reading_time
from public.posts p
join public.tenants t on t.id = p.tenant_id
where p.deleted_at is null;

