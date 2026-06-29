create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

create table if not exists public.tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  plan_code text not null default 'free',
  plan_status text not null default 'active',
  billing_status text not null default 'free',
  trial_ends_at timestamptz,
  subscription_ends_at timestamptz,
  settings jsonb not null default '{}'::jsonb,
  limits jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create unique index if not exists tenants_slug_uidx
on public.tenants(slug)
where deleted_at is null;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  role text not null default 'member',
  status text not null default 'active',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists profiles_tenant_idx
on public.profiles(tenant_id);

create index if not exists profiles_email_idx
on public.profiles(email);

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
add column if not exists published_at timestamptz;

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

create index if not exists posts_tenant_status_idx
on public.posts(tenant_id, status, updated_at desc);

create index if not exists posts_tenant_slug_idx
on public.posts(tenant_id, slug);

create index if not exists posts_content_type_idx
on public.posts(content_type);

create index if not exists posts_deleted_idx
on public.posts(deleted_at);

create index if not exists posts_search_idx
on public.posts using gin(search_text);

create table if not exists public.post_revisions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants(id) on delete cascade,
  post_id uuid references public.posts(id) on delete cascade,
  editor_id uuid references public.profiles(id) on delete set null,
  version_no int not null default 1,
  title text,
  slug text,
  excerpt text,
  content text,
  status text,
  snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists post_revisions_post_idx
on public.post_revisions(post_id, version_no desc);

create table if not exists public.post_categories (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants(id) on delete cascade,
  name text not null,
  slug text not null,
  description text,
  parent_id uuid references public.post_categories(id) on delete set null,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists post_categories_tenant_idx
on public.post_categories(tenant_id, slug);

create table if not exists public.post_tags (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants(id) on delete cascade,
  name text not null,
  slug text not null,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists post_tags_tenant_idx
on public.post_tags(tenant_id, slug);

create table if not exists public.post_category_map (
  post_id uuid references public.posts(id) on delete cascade,
  category_id uuid references public.post_categories(id) on delete cascade,
  primary key (post_id, category_id)
);

create table if not exists public.post_tag_map (
  post_id uuid references public.posts(id) on delete cascade,
  tag_id uuid references public.post_tags(id) on delete cascade,
  primary key (post_id, tag_id)
);

create table if not exists public.post_seo (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants(id) on delete cascade,
  post_id uuid references public.posts(id) on delete cascade,
  meta_title text,
  meta_description text,
  canonical_url text,
  og_title text,
  og_description text,
  og_image_url text,
  twitter_title text,
  twitter_description text,
  twitter_image_url text,
  schema_json jsonb not null default '{}'::jsonb,
  focus_keyword text,
  seo_score int not null default 0,
  indexable boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists post_seo_post_uidx
on public.post_seo(post_id);

create table if not exists public.content_routes (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants(id) on delete cascade,
  post_id uuid references public.posts(id) on delete cascade,
  path text not null,
  route_type text not null default 'content',
  status_code int not null default 200,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists content_routes_tenant_path_idx
on public.content_routes(tenant_id, path);

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants(id) on delete cascade,
  uploader_id uuid references public.profiles(id) on delete set null,
  bucket text not null default 'media',
  path text not null,
  public_url text,
  file_name text,
  mime_type text,
  file_size bigint not null default 0,
  width int,
  height int,
  alt_text text,
  caption text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists media_assets_tenant_idx
on public.media_assets(tenant_id, created_at desc);

create table if not exists public.domains (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants(id) on delete cascade,
  domain text not null,
  type text not null default 'custom',
  status text not null default 'pending',
  is_primary boolean not null default false,
  ssl_status text not null default 'pending',
  verification_token text,
  verified_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists domains_tenant_idx
on public.domains(tenant_id, domain);

create unique index if not exists domains_domain_uidx
on public.domains(domain)
where deleted_at is null;

create table if not exists public.templates (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants(id) on delete cascade,
  name text not null,
  slug text not null,
  template_type text not null default 'page',
  config jsonb not null default '{}'::jsonb,
  html text,
  css text,
  js text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists templates_tenant_idx
on public.templates(tenant_id, template_type, slug);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants(id) on delete cascade,
  provider text not null default 'stripe',
  provider_payment_id text,
  amount bigint not null default 0,
  currency text not null default 'IDR',
  status text not null default 'pending',
  plan_code text,
  raw_payload jsonb not null default '{}'::jsonb,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists payments_tenant_idx
on public.payments(tenant_id, created_at desc);

create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  before_data jsonb,
  after_data jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists admin_audit_logs_tenant_idx
on public.admin_audit_logs(tenant_id, created_at desc);

create table if not exists public.worker_jobs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants(id) on delete cascade,
  job_type text not null,
  status text not null default 'queued',
  priority int not null default 5,
  payload jsonb not null default '{}'::jsonb,
  result jsonb,
  error text,
  attempts int not null default 0,
  run_at timestamptz not null default now(),
  locked_at timestamptz,
  locked_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists worker_jobs_queue_idx
on public.worker_jobs(status, priority, run_at);

create table if not exists public.analytics_events (
  id uuid not null default gen_random_uuid(),
  tenant_id uuid,
  post_id uuid,
  event_name text not null,
  visitor_id text,
  session_id text,
  path text,
  referrer text,
  country text,
  device text,
  browser text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists analytics_events_tenant_time_idx
on public.analytics_events(tenant_id, created_at desc);

create index if not exists analytics_events_post_time_idx
on public.analytics_events(post_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists tenants_set_updated_at on public.tenants;
create trigger tenants_set_updated_at
before update on public.tenants
for each row execute function public.set_updated_at();

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists posts_set_updated_at on public.posts;
create trigger posts_set_updated_at
before update on public.posts
for each row execute function public.set_updated_at();

drop trigger if exists templates_set_updated_at on public.templates;
create trigger templates_set_updated_at
before update on public.templates
for each row execute function public.set_updated_at();

insert into public.tenants (name, slug, plan_code, plan_status)
values ('Default Workspace', 'default', 'free', 'active')
on conflict do nothing;

update public.posts
set tenant_id = (
  select id from public.tenants where slug = 'default' limit 1
)
where tenant_id is null;

update public.posts
set search_text = to_tsvector(
  'simple',
  coalesce(title, '') || ' ' || coalesce(excerpt, '') || ' ' || coalesce(content, '')
)
where search_text is null;

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
