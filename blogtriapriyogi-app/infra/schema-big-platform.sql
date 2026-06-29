create extension if not exists pgcrypto;

create table if not exists tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Personal',
  slug text not null unique,
  plan text not null default 'free',
  status text not null default 'active',
  owner_id uuid,
  logo_url text,
  favicon_url text,
  primary_color text default '#7c3aed',
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists admin_roles (
  id uuid primary key default gen_random_uuid(),
  role_key text not null unique,
  name text not null,
  level int not null default 1,
  permissions jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

insert into admin_roles (role_key, name, level, permissions)
values
('owner', 'Owner', 100, '{"all": true}'::jsonb),
('admin', 'Admin', 80, '{"manage": true}'::jsonb),
('editor', 'Editor', 50, '{"posts": true, "media": true, "seo": true}'::jsonb),
('writer', 'Writer', 30, '{"posts": true}'::jsonb),
('viewer', 'Viewer', 10, '{"read": true}'::jsonb)
on conflict (role_key) do nothing;

create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,
  tenant_id uuid references tenants(id) on delete set null,
  full_name text,
  email text,
  avatar_url text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists user_roles (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  role_key text not null references admin_roles(role_key),
  created_at timestamptz not null default now(),
  unique (tenant_id, profile_id, role_key)
);

insert into tenants (name, slug, plan, status)
values ('TriApriyogi Studio', 'triapriyogi', 'pro', 'active')
on conflict (slug) do nothing;

create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade,
  author_id uuid references profiles(id) on delete set null,
  title text not null default 'Untitled',
  slug text not null,
  excerpt text,
  content text,
  content_json jsonb not null default '{}'::jsonb,
  cover_image_url text,
  status text not null default 'draft',
  visibility text not null default 'public',
  seo_title text,
  seo_description text,
  seo_keywords text[],
  canonical_url text,
  reading_time int default 0,
  view_count bigint not null default 0,
  published_at timestamptz,
  scheduled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table posts add column if not exists tenant_id uuid references tenants(id) on delete cascade;
alter table posts add column if not exists author_id uuid references profiles(id) on delete set null;
alter table posts add column if not exists content text;
alter table posts add column if not exists content_json jsonb not null default '{}'::jsonb;
alter table posts add column if not exists cover_image_url text;
alter table posts add column if not exists visibility text not null default 'public';
alter table posts add column if not exists seo_title text;
alter table posts add column if not exists seo_description text;
alter table posts add column if not exists seo_keywords text[];
alter table posts add column if not exists canonical_url text;
alter table posts add column if not exists reading_time int default 0;
alter table posts add column if not exists view_count bigint not null default 0;
alter table posts add column if not exists scheduled_at timestamptz;
alter table posts add column if not exists updated_at timestamptz not null default now();

create unique index if not exists posts_tenant_slug_unique
on posts (tenant_id, slug)
where tenant_id is not null;

create index if not exists posts_status_idx on posts(status);
create index if not exists posts_published_at_idx on posts(published_at desc);
create index if not exists posts_tenant_idx on posts(tenant_id);

update posts
set tenant_id = (select id from tenants where slug = 'triapriyogi' limit 1)
where tenant_id is null;

create table if not exists post_revisions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts(id) on delete cascade,
  profile_id uuid references profiles(id) on delete set null,
  title text,
  content text,
  content_json jsonb not null default '{}'::jsonb,
  change_note text,
  created_at timestamptz not null default now()
);

create table if not exists post_tags (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade,
  name text not null,
  slug text not null,
  created_at timestamptz not null default now(),
  unique (tenant_id, slug)
);

create table if not exists post_tag_links (
  post_id uuid not null references posts(id) on delete cascade,
  tag_id uuid not null references post_tags(id) on delete cascade,
  primary key (post_id, tag_id)
);

create table if not exists media_assets (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade,
  uploader_id uuid references profiles(id) on delete set null,
  file_name text not null,
  file_url text not null,
  mime_type text,
  size_bytes bigint default 0,
  width int,
  height int,
  alt_text text,
  folder text default 'uploads',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists media_assets_tenant_idx on media_assets(tenant_id);
create index if not exists media_assets_folder_idx on media_assets(folder);

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
  last_checked_at timestamptz,
  verified_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists domains_tenant_idx on domains(tenant_id);
create index if not exists domains_status_idx on domains(status);

create table if not exists analytics_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade,
  post_id uuid references posts(id) on delete set null,
  event_name text not null,
  path text,
  referrer text,
  country text,
  device text,
  browser text,
  os text,
  ip_hash text,
  user_agent text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists analytics_events_tenant_time_idx on analytics_events(tenant_id, created_at desc);
create index if not exists analytics_events_post_idx on analytics_events(post_id);

create table if not exists analytics_daily (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade,
  post_id uuid references posts(id) on delete cascade,
  day date not null,
  views bigint not null default 0,
  visitors bigint not null default 0,
  clicks bigint not null default 0,
  reads bigint not null default 0,
  created_at timestamptz not null default now(),
  unique (tenant_id, post_id, day)
);

create table if not exists templates (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade,
  name text not null,
  slug text not null,
  type text not null default 'site',
  status text not null default 'draft',
  theme jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, slug)
);

create table if not exists template_pages (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references templates(id) on delete cascade,
  title text not null,
  path text not null,
  layout jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (template_id, path)
);

create table if not exists template_blocks (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references template_pages(id) on delete cascade,
  block_type text not null,
  sort_order int not null default 0,
  settings jsonb not null default '{}'::jsonb,
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists payment_plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  price_monthly int not null default 0,
  price_yearly int not null default 0,
  currency text not null default 'IDR',
  features jsonb not null default '[]'::jsonb,
  limits jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

insert into payment_plans (name, slug, price_monthly, price_yearly, features, limits)
values
('Gratis', 'free', 0, 0, '["1 blog", "basic editor", "subdomain"]'::jsonb, '{"posts": 20, "storage_mb": 100}'::jsonb),
('Pro', 'pro', 59000, 590000, '["unlimited posts", "AI tools", "SEO center", "custom domain"]'::jsonb, '{"posts": 1000, "storage_mb": 5000}'::jsonb),
('Bisnis', 'business', 149000, 1490000, '["team access", "advanced analytics", "template builder", "priority support"]'::jsonb, '{"posts": 10000, "storage_mb": 50000}'::jsonb)
on conflict (slug) do nothing;

create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  plan_id uuid references payment_plans(id) on delete set null,
  status text not null default 'active',
  started_at timestamptz not null default now(),
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at timestamptz,
  provider text,
  provider_subscription_id text,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  subscription_id uuid references subscriptions(id) on delete set null,
  invoice_number text unique,
  amount int not null default 0,
  currency text not null default 'IDR',
  status text not null default 'draft',
  due_at timestamptz,
  paid_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  invoice_id uuid references invoices(id) on delete set null,
  provider text,
  provider_payment_id text,
  amount int not null default 0,
  currency text not null default 'IDR',
  status text not null default 'pending',
  paid_at timestamptz,
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists ai_tool_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade,
  profile_id uuid references profiles(id) on delete set null,
  tool_name text not null,
  input jsonb not null default '{}'::jsonb,
  output jsonb not null default '{}'::jsonb,
  token_usage int default 0,
  status text not null default 'success',
  created_at timestamptz not null default now()
);

create table if not exists seo_audits (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade,
  post_id uuid references posts(id) on delete cascade,
  score int default 0,
  issues jsonb not null default '[]'::jsonb,
  suggestions jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade,
  profile_id uuid references profiles(id) on delete set null,
  action text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists tenants_set_updated_at on tenants;
create trigger tenants_set_updated_at
before update on tenants
for each row execute function set_updated_at();

drop trigger if exists posts_set_updated_at on posts;
create trigger posts_set_updated_at
before update on posts
for each row execute function set_updated_at();

drop trigger if exists templates_set_updated_at on templates;
create trigger templates_set_updated_at
before update on templates
for each row execute function set_updated_at();

drop trigger if exists template_pages_set_updated_at on template_pages;
create trigger template_pages_set_updated_at
before update on template_pages
for each row execute function set_updated_at();

create or replace view platform_admin_overview as
select
  (select count(*) from tenants) as tenants_count,
  (select count(*) from posts) as posts_count,
  (select count(*) from media_assets) as media_count,
  (select count(*) from domains) as domains_count,
  (select count(*) from analytics_events) as analytics_events_count,
  (select count(*) from templates) as templates_count,
  (select count(*) from payments) as payments_count,
  (select count(*) from user_roles) as user_roles_count;

