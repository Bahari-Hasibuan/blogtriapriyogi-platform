create extension if not exists pgcrypto;

create table if not exists public.tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Personal',
  slug text not null unique default 'personal',
  plan_code text not null default 'free',
  plan_status text not null default 'active',
  billing_status text not null default 'free',
  trial_ends_at timestamptz,
  subscription_ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.tenants (name, slug)
values ('Personal', 'personal')
on conflict (slug) do nothing;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants(id) on delete cascade,
  auth_user_id uuid,
  email text,
  full_name text,
  role text not null default 'owner',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants(id) on delete cascade,
  author_id uuid references public.profiles(id) on delete set null,
  content_type text not null default 'post',
  title text not null default 'Untitled',
  slug text not null,
  excerpt text,
  content text,
  body text,
  html text,
  cover_media_id uuid,
  status text not null default 'draft',
  visibility text not null default 'public',
  password_hash text,
  published_at timestamptz,
  scheduled_at timestamptz,
  archived_at timestamptz,
  deleted_at timestamptz,
  seo_title text,
  seo_description text,
  canonical_url text,
  og_title text,
  og_description text,
  og_image text,
  reading_time integer not null default 0,
  word_count integer not null default 0,
  view_count bigint not null default 0,
  like_count bigint not null default 0,
  comment_count bigint not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pages (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants(id) on delete cascade,
  author_id uuid references public.profiles(id) on delete set null,
  content_type text not null default 'page',
  title text not null default 'Untitled',
  slug text not null,
  excerpt text,
  content text,
  body text,
  html text,
  cover_media_id uuid,
  status text not null default 'draft',
  visibility text not null default 'public',
  published_at timestamptz,
  scheduled_at timestamptz,
  archived_at timestamptz,
  deleted_at timestamptz,
  seo_title text,
  seo_description text,
  canonical_url text,
  og_title text,
  og_description text,
  og_image text,
  sort_order integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.posts add column if not exists tenant_id uuid references public.tenants(id) on delete cascade;
alter table public.posts add column if not exists author_id uuid references public.profiles(id) on delete set null;
alter table public.posts add column if not exists content_type text not null default 'post';
alter table public.posts add column if not exists excerpt text;
alter table public.posts add column if not exists content text;
alter table public.posts add column if not exists body text;
alter table public.posts add column if not exists html text;
alter table public.posts add column if not exists status text not null default 'draft';
alter table public.posts add column if not exists visibility text not null default 'public';
alter table public.posts add column if not exists published_at timestamptz;
alter table public.posts add column if not exists scheduled_at timestamptz;
alter table public.posts add column if not exists archived_at timestamptz;
alter table public.posts add column if not exists deleted_at timestamptz;
alter table public.posts add column if not exists updated_at timestamptz not null default now();
alter table public.posts add column if not exists seo_title text;
alter table public.posts add column if not exists seo_description text;
alter table public.posts add column if not exists canonical_url text;
alter table public.posts add column if not exists og_title text;
alter table public.posts add column if not exists og_description text;
alter table public.posts add column if not exists og_image text;
alter table public.posts add column if not exists metadata jsonb not null default '{}'::jsonb;
alter table public.posts add column if not exists settings jsonb not null default '{}'::jsonb;

update public.posts
set tenant_id = (select id from public.tenants where slug = 'personal' limit 1)
where tenant_id is null;

create table if not exists public.post_categories (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants(id) on delete cascade,
  name text not null,
  slug text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.post_tags (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants(id) on delete cascade,
  name text not null,
  slug text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.post_tag_map (
  post_id uuid references public.posts(id) on delete cascade,
  tag_id uuid references public.post_tags(id) on delete cascade,
  primary key (post_id, tag_id)
);

create table if not exists public.post_category_map (
  post_id uuid references public.posts(id) on delete cascade,
  category_id uuid references public.post_categories(id) on delete cascade,
  primary key (post_id, category_id)
);

create table if not exists public.post_revisions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants(id) on delete cascade,
  post_id uuid references public.posts(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  title text,
  slug text,
  excerpt text,
  content text,
  body text,
  html text,
  status text,
  change_note text,
  created_at timestamptz not null default now()
);

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

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants(id) on delete cascade,
  uploader_id uuid references public.profiles(id) on delete set null,
  file_name text not null,
  file_path text not null,
  file_url text,
  mime_type text,
  size_bytes bigint not null default 0,
  width integer,
  height integer,
  alt_text text,
  caption text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.domains (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants(id) on delete cascade,
  domain text not null unique,
  type text not null default 'custom',
  status text not null default 'pending',
  verification_token text not null default encode(gen_random_bytes(16), 'hex'),
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.analytics_events (
  id bigserial,
  tenant_id uuid,
  post_id uuid,
  page_id uuid,
  event_name text not null,
  path text,
  referrer text,
  country text,
  device text,
  browser text,
  ip_hash text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.templates (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants(id) on delete cascade,
  name text not null,
  slug text not null,
  type text not null default 'site',
  config jsonb not null default '{}'::jsonb,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants(id) on delete cascade,
  provider text not null default 'stripe',
  provider_customer_id text,
  provider_subscription_id text,
  provider_payment_id text,
  amount bigint not null default 0,
  currency text not null default 'idr',
  status text not null default 'pending',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists posts_tenant_status_idx on public.posts(tenant_id, status);
create index if not exists posts_tenant_slug_idx on public.posts(tenant_id, slug);
create index if not exists posts_published_idx on public.posts(tenant_id, published_at desc) where status = 'published' and deleted_at is null;
create index if not exists posts_search_idx on public.posts using gin(to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(excerpt,'') || ' ' || coalesce(content,'') || ' ' || coalesce(body,'')));

create index if not exists pages_tenant_status_idx on public.pages(tenant_id, status);
create index if not exists pages_tenant_slug_idx on public.pages(tenant_id, slug);

create index if not exists media_assets_tenant_idx on public.media_assets(tenant_id, created_at desc);
create index if not exists domains_tenant_idx on public.domains(tenant_id);
create index if not exists analytics_events_tenant_time_idx on public.analytics_events(tenant_id, created_at desc);
create index if not exists templates_tenant_idx on public.templates(tenant_id, type, is_active);
create index if not exists payments_tenant_idx on public.payments(tenant_id, created_at desc);
create index if not exists admin_audit_logs_tenant_idx on public.admin_audit_logs(tenant_id, created_at desc);

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

drop trigger if exists posts_set_updated_at on public.posts;
create trigger posts_set_updated_at
before update on public.posts
for each row execute function public.set_updated_at();

drop trigger if exists pages_set_updated_at on public.pages;
create trigger pages_set_updated_at
before update on public.pages
for each row execute function public.set_updated_at();

drop trigger if exists media_assets_set_updated_at on public.media_assets;
create trigger media_assets_set_updated_at
before update on public.media_assets
for each row execute function public.set_updated_at();

drop trigger if exists domains_set_updated_at on public.domains;
create trigger domains_set_updated_at
before update on public.domains
for each row execute function public.set_updated_at();

drop trigger if exists templates_set_updated_at on public.templates;
create trigger templates_set_updated_at
before update on public.templates
for each row execute function public.set_updated_at();

drop trigger if exists payments_set_updated_at on public.payments;
create trigger payments_set_updated_at
before update on public.payments
for each row execute function public.set_updated_at();

create or replace view public.admin_content_overview as
select
  p.id,
  p.tenant_id,
  p.author_id,
  'post'::text as entity_type,
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
  p.seo_title,
  p.seo_description,
  p.view_count,
  p.like_count,
  p.comment_count
from public.posts p
union all
select
  pg.id,
  pg.tenant_id,
  pg.author_id,
  'page'::text as entity_type,
  pg.content_type,
  pg.title,
  pg.slug,
  pg.excerpt,
  pg.status,
  pg.visibility,
  pg.published_at,
  pg.scheduled_at,
  pg.archived_at,
  pg.deleted_at,
  pg.created_at,
  pg.updated_at,
  pg.seo_title,
  pg.seo_description,
  0::bigint as view_count,
  0::bigint as like_count,
  0::bigint as comment_count
from public.pages pg;

create or replace view public.platform_admin_overview as
select
  (select count(*) from public.tenants) as tenants_count,
  (select count(*) from public.posts) as posts_count,
  (select count(*) from public.pages) as pages_count,
  (select count(*) from public.media_assets) as media_count,
  (select count(*) from public.domains) as domains_count,
  (select count(*) from public.analytics_events) as analytics_events_count,
  (select count(*) from public.templates) as templates_count,
  (select count(*) from public.payments) as payments_count,
  (select count(*) from public.profiles) as users_count;
